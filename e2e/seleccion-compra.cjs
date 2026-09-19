// El agente se entera de lo que el cliente MARCA TOCANDO la pantalla, y las acciones nuevas ("eliminame la película", "cambiame el horario")
// limpian lo correcto. La pantalla le manda al agente una FOTO de lo marcado (solo ids) por el WebSocket ({type:'contexto', v, compra}), con la
// version de la ultima tanda de acciones del servidor que ya aplico (para que el agente descarte una foto vieja). No usa el modelo de lenguaje
// (inyecta lo que mandaria el servidor) y no escribe nada en la base compartida.
// Uso: SILENCIO_WAV=/ruta/silencio.wav node e2e/seleccion-compra.cjs
const { chromium } = require('playwright-core');

const EDGE = process.env.EDGE_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const BASE = process.env.BASE_URL || 'http://localhost:3000';
const API = process.env.BACKEND_URL || 'http://localhost:3333/api';
const SILENCIO = process.env.SILENCIO_WAV;
if (!SILENCIO) throw new Error('Falta SILENCIO_WAV (ruta a un WAV de silencio, ver e2e/README.md)');
const NOMBRE = process.env.NOMBRE || 'Hebert Suárez burgos';

const resultados = [];
function verificar(nombre, ok, detalle = '') {
  resultados.push(ok);
  console.log(`   ${ok ? 'OK   ' : 'FALLO'} ${nombre}${detalle ? '  -> ' + detalle : ''}`);
}

const login = async (nombre, rol) => {
  const r = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre, rol }) });
  return (await r.json()).access_token;
};

async function abrir(browser, token) {
  const ctx = await browser.newContext({ viewport: { width: 1500, height: 900 }, permissions: ['microphone'] });
  await ctx.addInitScript((t) => {
    localStorage.setItem('lumen_token', t);
    window.__ev = [];
    window.__enviados = [];
    const WS = window.WebSocket;
    window.WebSocket = function (...a) {
      const w = new WS(...a);
      w.addEventListener('message', (e) => { if (typeof e.data === 'string') { try { window.__ev.push(JSON.parse(e.data)); } catch { /* ignorar */ } } });
      const enviar = w.send.bind(w);
      w.send = (d) => { if (typeof d === 'string') { try { window.__enviados.push(JSON.parse(d)); } catch { /* ignorar */ } } return enviar(d); };
      return w;
    };
    window.WebSocket.prototype = WS.prototype;
    Object.assign(window.WebSocket, { CONNECTING: 0, OPEN: 1, CLOSING: 2, CLOSED: 3 });
  }, token);
  const page = await ctx.newPage();
  const errores = [];
  page.on('pageerror', (e) => errores.push('PAGEERROR ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('404')) errores.push(m.text()); });
  return { ctx, page, errores };
}

const contextos = (page) => page.evaluate(() => window.__enviados.filter((m) => m.type === 'contexto'));
const ultimo = async (page) => (await contextos(page)).slice(-1)[0];
/** Espera una foto que cumpla la condicion (se pasa como texto: corre en el navegador). */
const esperarFoto = (page, condicion, timeout = 8000) =>
  page.waitForFunction((cuerpo) => window.__enviados.filter((m) => m.type === 'contexto').some(new Function('m', `return (${cuerpo})`)), condicion, { timeout }).then(() => true).catch(() => false);

(async () => {
  const browser = await chromium.launch({
    executablePath: EDGE, headless: true,
    args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream', `--use-file-for-fake-audio-capture=${SILENCIO}`, '--autoplay-policy=no-user-gesture-required'],
  });

  console.log('== 1) Al abrirse la conversacion la pantalla le cuenta al agente lo que tiene marcado (nada) ==');
  const { page, errores } = await abrir(browser, await login(NOMBRE, 'cliente'));
  await page.goto(BASE + '/cartelera', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /Voz \+ UI Din/ }).first().click({ timeout: 8000 });
  await page.waitForFunction(() => window.__ev.some((e) => e.type === 'ready'), null, { timeout: 20000 });
  verificar('manda una foto vacia con la version 0', await esperarFoto(page, 'm.v === 0 && m.compra.idPelicula === null && m.compra.idFuncion === null'), JSON.stringify(await ultimo(page)));
  const primera = (await contextos(page))[0];
  verificar('la foto lleva solo ids (nada de titulos, precios ni URLs)', !!primera && Object.keys(primera.compra).sort().join() === 'asientos,dulceria,idFuncion,idPelicula');

  console.log('\n== 2) Marcar TOCANDO un horario de la cartelera: el agente se entera ==');
  const horario = page.getByRole('button', { name: /^\d{2}:\d{2}$/ }).first();
  await horario.waitFor({ timeout: 15000 });
  await horario.click();
  const seMarco = await esperarFoto(page, 'm.compra.idPelicula !== null && m.compra.idFuncion !== null', 15000);
  const tocada = await ultimo(page);
  verificar('tras tocar un horario llega una foto con la pelicula y la funcion', seMarco, JSON.stringify(tocada?.compra));
  verificar('esa foto es de la version 0 (el servidor todavia no le mando acciones)', tocada?.v === 0);

  console.log('\n== 3) Acciones del servidor: la foto lleva la version que ya se aplico ==');
  const aplicar = (acciones, v) => page.evaluate(({ a, ver }) => window.__lumen.aplicarUi(a, ver), { a: acciones, ver: v });
  await aplicar([{ tipo: 'compra.candybar', items: [{ id: '3', nombre: 'Combo Pareja', descripcion: '', precio: 65, imagenUrl: '', cantidad: 2 }] }], 7);
  verificar('despues de aplicar la version 7 la foto trae v=7 y la dulceria', await esperarFoto(page, 'm.v === 7 && m.compra.dulceria.length === 1 && m.compra.dulceria[0].idProducto === 3 && m.compra.dulceria[0].cantidad === 2'), JSON.stringify((await ultimo(page))?.compra?.dulceria));

  console.log('\n== 4) "Cambiame el horario": se suelta la funcion y la pelicula se queda ==');
  await aplicar([{ tipo: 'compra.quitar_funcion' }], 8);
  const sinFuncion = await esperarFoto(page, 'm.v === 8 && m.compra.idPelicula !== null && m.compra.idFuncion === null && m.compra.asientos.length === 0');
  verificar('la foto v=8 conserva la pelicula, no tiene funcion ni asientos', sinFuncion, JSON.stringify((await ultimo(page))?.compra));
  verificar('la dulceria sigue', ((await ultimo(page))?.compra?.dulceria || []).length === 1);

  console.log('\n== 5) "Eliminame la pelicula seleccionada": sale la pelicula y todo lo que depende de ella; la dulceria se queda ==');
  await aplicar([{ tipo: 'compra.quitar_pelicula' }], 9);
  const sinPelicula = await esperarFoto(page, 'm.v === 9 && m.compra.idPelicula === null && m.compra.idFuncion === null');
  verificar('la foto v=9 no tiene pelicula ni funcion', sinPelicula, JSON.stringify((await ultimo(page))?.compra));
  verificar('la dulceria sigue en el carrito', ((await ultimo(page))?.compra?.dulceria || []).length === 1);
  const estado = await page.evaluate(() => JSON.parse(sessionStorage.getItem('lumen_cine_state') || '{}'));
  verificar('el estado de la app quedo sin pelicula, funcion ni butacas', !estado.peliculaSeleccionada && !estado.funcionSeleccionada && (estado.butacasSeleccionadas || []).length === 0);
  verificar('y la dulceria sigue en la app', (estado.candyBarSeleccionado || []).length === 1);

  console.log('\n== 6) Una compra ya PAGADA no cuenta: no se "resucita" como compra nueva ==');
  await aplicar([{ tipo: 'compra.completada', venta: null }], 10);
  verificar('con la compra completada la foto va vacia aunque la dulceria siga en pantalla',
    await esperarFoto(page, 'm.v === 10 && m.compra.idPelicula === null && m.compra.dulceria.length === 0'), JSON.stringify((await ultimo(page))?.compra));

  console.log('\n== 7) Cada cambio se manda una vez (no una lluvia de mensajes) ==');
  const cuantas = (await contextos(page)).length;
  await page.waitForTimeout(1500);
  verificar('sin cambios no se manda nada', (await contextos(page)).length === cuantas, `${cuantas} fotos en total`);

  verificar('sin errores de consola ni excepciones', errores.length === 0, errores.join(' | ').slice(0, 300));

  console.log('\n== 8) El administrador no manda fotos de compra ==');
  const admin = await abrir(browser, await login('Admin Lumen', 'administrador'));
  await admin.page.goto(BASE + '/admin/console', { waitUntil: 'networkidle' });
  await admin.page.waitForFunction(() => window.__lumen);
  await admin.page.evaluate(() => window.__lumen.setModo('hibrido'));
  await admin.page.waitForFunction(() => window.__ev.some((e) => e.type === 'ready'), null, { timeout: 20000 });
  await admin.page.waitForTimeout(1500);
  verificar('la consola de administrador no manda ninguna foto', (await contextos(admin.page)).length === 0);

  await browser.close();
  const fallos = resultados.filter((r) => !r).length;
  console.log(fallos ? `\n${fallos} FALLOS` : '\nTODO BIEN');
  process.exit(fallos ? 1 : 0);
})();

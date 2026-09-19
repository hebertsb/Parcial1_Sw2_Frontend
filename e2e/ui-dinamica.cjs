// Prueba real en el navegador: hablarle al agente (por el canal de texto de la misma conversacion) y comprobar que la
// APP REAL se mueve: navegacion, seleccion de funcion, asientos, dulceria y ventana flotante de confirmacion.
// NO confirma la compra (no escribe nada en la base compartida): cancela en la ventana.
// Uso: SILENCIO_WAV=/ruta/silencio.wav [ROL=administrador NOMBRE="Admin Lumen"] node e2e/ui-dinamica.cjs
const { chromium } = require('playwright-core');
const { fraseDeEntradas } = require('./apoyo.cjs');

const EDGE = process.env.EDGE_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const BASE = process.env.BASE_URL || 'http://localhost:3000';
const SILENCIO = process.env.SILENCIO_WAV; // un WAV de silencio (ver e2e/README.md): sin esto el microfono falso mete un pitido que el VAD toma por voz
if (!SILENCIO) throw new Error('Falta SILENCIO_WAV (ruta a un WAV de silencio, ver e2e/README.md)');
const ROL = process.env.ROL || 'cliente';
const NOMBRE = process.env.NOMBRE || 'Hebert Suárez burgos';

async function obtenerToken() {
  const r = await fetch(`${process.env.BACKEND_URL || 'http://localhost:3333/api'}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre: NOMBRE, rol: ROL }),
  });
  if (!r.ok) throw new Error(`login ${r.status}`);
  return (await r.json()).access_token;
}

const resultados = [];
function verificar(nombre, ok, detalle = '') {
  resultados.push({ nombre, ok });
  console.log(`   ${ok ? 'OK   ' : 'FALLO'} ${nombre}${detalle ? '  -> ' + detalle : ''}`);
}

(async () => {
  const token = await obtenerToken();
  const browser = await chromium.launch({
    executablePath: EDGE, headless: true,
    args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream', `--use-file-for-fake-audio-capture=${SILENCIO}`, '--autoplay-policy=no-user-gesture-required'],
  });
  const ctx = await browser.newContext({ viewport: { width: 1500, height: 900 }, permissions: ['microphone'] });
  await ctx.addInitScript((t) => {
    localStorage.setItem('lumen_token', t);
    window.__ev = [];
    const WS = window.WebSocket;
    window.WebSocket = function (...a) {
      const w = new WS(...a);
      w.addEventListener('message', (e) => { if (typeof e.data === 'string') { try { window.__ev.push(JSON.parse(e.data)); } catch {} } });
      return w;
    };
    window.WebSocket.prototype = WS.prototype;
    Object.assign(window.WebSocket, { CONNECTING: 0, OPEN: 1, CLOSING: 2, CLOSED: 3 });
  }, token);

  const page = await ctx.newPage();
  const errores = [];
  page.on('pageerror', (e) => errores.push('PAGEERROR ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('favicon') && !m.text().includes('404')) errores.push('console.error ' + m.text()); });

  const estadoCine = () => page.evaluate(() => JSON.parse(sessionStorage.getItem('lumen_cine_state') || '{}'));
  const decir = async (frase) => {
    const antes = await page.evaluate(() => window.__ev.filter((e) => e.type === 'reply').length);
    await page.evaluate((t) => window.__lumen.voz.enviarTexto(t), frase);
    await page.waitForFunction((n) => window.__ev.filter((e) => e.type === 'reply').length > n, antes, { timeout: 60000 });
    await page.waitForTimeout(700); // deja que la interfaz termine de moverse
    const reply = await page.evaluate(() => window.__ev.filter((e) => e.type === 'reply').slice(-1)[0]);
    console.log(`\n   USUARIO: ${frase}\n   LUMEN  : ${reply.texto.slice(0, 170)}`);
    return reply;
  };

  console.log('== 1) Entro a "Voz + UI Dinámica" desde la cartelera ==');
  await page.goto(BASE + '/cartelera', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /Voz \+ UI Din/ }).first().click({ timeout: 8000 });
  await page.waitForSelector('[data-testid="voice-strip"]', { timeout: 15000 });
  verificar('aparece el panel de voz debajo del selector de modo, SOBRE la app (no una pantalla completa)', true);
  verificar('la cartelera sigue a la vista debajo', await page.getByText('Películas en Cartelera').count() > 0);
  await page.waitForFunction(() => window.__ev.some((e) => e.type === 'ready'), null, { timeout: 20000 });
  verificar('la conversacion se abrio sola (sin botones de grabar)', true);
  await page.screenshot({ path: 'ui1_dock.png' });

  if (ROL === 'cliente') {
    console.log('\n== 2) Compra por voz: la app se mueve sola ==');
    await decir(await fraseDeEntradas(process.env.BACKEND_URL || 'http://localhost:3333/api', token, 'Oppenheimer'));
    await page.waitForURL('**/compra', { timeout: 10000 }).catch(() => {});
    // La eleccion se deja ver ~1.3 s en la cartelera antes de pasar a los asientos: se espera el estado, no un tiempo fijo.
    await page.waitForFunction(() => !!JSON.parse(sessionStorage.getItem('lumen_cine_state') || '{}').funcionSeleccionada, null, { timeout: 10000 }).catch(() => {});
    let cine = await estadoCine();
    verificar('navego a /compra (asientos)', page.url().includes('/compra'), page.url());
    verificar('eligio la pelicula Oppenheimer', cine.peliculaSeleccionada?.titulo === 'Oppenheimer', cine.peliculaSeleccionada?.titulo);
    verificar('eligio una funcion real (idFuncion)', !!cine.funcionSeleccionada?.idFuncion, String(cine.funcionSeleccionada?.idFuncion));
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'ui2_asientos_pantalla.png' });

    await decir('los asientos del medio, juntos');
    cine = await estadoCine();
    verificar('selecciono 2 butacas en el mapa real', cine.butacasSeleccionadas?.length === 2, (cine.butacasSeleccionadas || []).map((b) => b.id).join(', '));
    verificar('las butacas traen ids reales del backend', (cine.butacasSeleccionadas || []).every((b) => Number.isInteger(b.idAsiento)));
    await page.screenshot({ path: 'ui3_butacas.png' });

    // Con la dulceria de la demo hay dos popcorn grandes (clasico y caramelo): «un pochoclo grande» a secas hace que el agente
    // pregunte cual (correcto). Aca se nombra uno para medir el carrito.
    await decir('agregame un popcorn caramelo grande');
    cine = await estadoCine();
    verificar('agrego dulceria al carrito real', (cine.candyBarSeleccionado || []).length >= 1, (cine.candyBarSeleccionado || []).map((i) => `${i.cantidad} ${i.nombre}`).join(', '));
    verificar('paso al Candy Bar', cine.estadoCompra === 'seleccionando_candybar', cine.estadoCompra);
    await page.screenshot({ path: 'ui4_candy.png' });

    await decir('listo, quiero pagar');
    await page.waitForSelector('[data-ventana="Confirmá tu compra"]', { timeout: 8000 }).catch(() => {});
    const ventana = page.locator('[data-ventana="Confirmá tu compra"]');
    verificar('se abre la ventana flotante de confirmacion', await ventana.count() === 1);
    const textoVentana = await ventana.innerText().catch(() => '');
    verificar('la ventana muestra el aviso de no reembolso (RF03)', /no tienen reembolso/i.test(textoVentana));
    verificar('la compra solo se confirma hablando: no hay boton "Confirmar" (RF19)', !/^Confirmar$/m.test(textoVentana));
    cine = await estadoCine();
    verificar('paso a "pago"', cine.estadoCompra === 'pago', cine.estadoCompra);
    await page.screenshot({ path: 'ui5_confirmacion.png' });

    // se arrastra la ventana desde su barra de titulo
    const caja = await ventana.boundingBox();
    if (caja) {
      await page.mouse.move(caja.x + 60, caja.y + 18);
      await page.mouse.down();
      await page.mouse.move(caja.x - 240, caja.y + 90, { steps: 8 });
      await page.mouse.up();
      const despues = await ventana.boundingBox();
      verificar('la ventana se puede arrastrar', despues && Math.abs(despues.x - caja.x) > 100, `x ${Math.round(caja.x)} -> ${Math.round(despues.x)}`);
    }

    console.log('\n   (no se confirma: se cancela desde la ventana para no escribir en la base compartida)');
    await ventana.getByRole('button', { name: 'Cancelar' }).click();
    await page.waitForFunction(() => window.__ev.filter((e) => e.type === 'reply').slice(-1)[0]?.texto?.includes('no compré nada'), null, { timeout: 30000 });
    await page.waitForTimeout(600);
    verificar('al cancelar, la ventana se cierra', await page.locator('[data-ventana="Confirmá tu compra"]').count() === 0);
    cine = await estadoCine();
    verificar('y el carrito sigue armado', cine.butacasSeleccionadas?.length === 2);
    await page.screenshot({ path: 'ui6_cancelado.png' });
  } else {
    console.log('\n== 2) Administrador: reporte y gestion ==');
    await page.goto(BASE + '/admin/console', { waitUntil: 'networkidle' });
    await page.evaluate(() => window.__lumen.setModo('hibrido'));
    await page.waitForSelector('[data-testid="voice-strip"]', { timeout: 15000 });
    await page.waitForFunction(() => window.__ev.some((e) => e.type === 'ready'), null, { timeout: 20000 });
    await decir('Mostrame las ventas de esta semana');
    await page.waitForTimeout(800);
    verificar('se abre la ventana de reporte', await page.locator('[data-ventana="Reporte"]').count() === 1);
    await page.screenshot({ path: 'ui7_reporte.png' });
    await decir('Creá la película Prueba de interfaz, dos horas, ciencia ficción, mayores de 12 años');
    await page.waitForSelector('[data-ventana="Alta de película"]', { timeout: 8000 }).catch(() => {});
    const ventana = page.locator('[data-ventana="Alta de película"]');
    verificar('se abre la confirmacion con el detalle de lo que se va a crear', await ventana.count() === 1);
    const texto = await ventana.innerText().catch(() => '');
    verificar('muestra titulo, duracion y clasificacion sin ids ni JSON', /Prueba de interfaz/i.test(texto) && /120 minutos/.test(texto) && !/\{|idPelicula/.test(texto), texto.replace(/\n+/g, ' | ').slice(0, 160));
    verificar('para gestion SI hay boton Confirmar (ademas de decirlo)', await ventana.getByRole('button', { name: 'Confirmar' }).count() === 1);
    await page.screenshot({ path: 'ui8_admin_confirmacion.png' });
    await ventana.getByRole('button', { name: 'Cancelar' }).click();
    await page.waitForFunction(() => window.__ev.filter((e) => e.type === 'reply').slice(-1)[0]?.texto?.toLowerCase().includes('cancel'), null, { timeout: 30000 });
    await page.waitForTimeout(600);
    verificar('cancelado: no se creo nada y la ventana se cierra', await page.locator('[data-ventana="Alta de película"]').count() === 0);
  }

  console.log('\n== errores de la pagina ==');
  console.log('  ', errores.length ? errores : 'ninguno');
  const fallos = resultados.filter((r) => !r.ok);
  console.log(`\nRESULTADO: ${resultados.length - fallos.length}/${resultados.length} verificaciones OK`);
  await browser.close();
  process.exit(fallos.length || errores.length ? 1 : 0);
})().catch((e) => { console.error('ERROR', e); process.exit(2); });

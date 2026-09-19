// Consola de administrador: la MISMA interfaz de voz que la app de cliente (selector de modo, panel debajo, estado real del
// microfono, hora y latencia reales) y el agente SEÑALA la fila que acaba de crear o cambiar. No usa el modelo de lenguaje
// (inyecta la accion que mandaria el servidor, con ids reales de la base) y no escribe nada en la base compartida.
// Uso: SILENCIO_WAV=/ruta/silencio.wav node e2e/admin-interfaz.cjs
const { chromium } = require('playwright-core');

const EDGE = process.env.EDGE_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const BASE = process.env.BASE_URL || 'http://localhost:3000';
const API = process.env.BACKEND_URL || 'http://localhost:3333/api';
const SILENCIO = process.env.SILENCIO_WAV;
if (!SILENCIO) throw new Error('Falta SILENCIO_WAV (ruta a un WAV de silencio, ver e2e/README.md)');
const NOMBRE = process.env.NOMBRE || 'Admin Lumen';

const resultados = [];
function verificar(nombre, ok, detalle = '') {
  resultados.push(ok);
  console.log(`   ${ok ? 'OK   ' : 'FALLO'} ${nombre}${detalle ? '  -> ' + detalle : ''}`);
}

(async () => {
  const login = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre: NOMBRE, rol: 'administrador' }) });
  const token = (await login.json()).access_token;
  const get = async (ruta) => (await fetch(`${API}${ruta}`, { headers: { Authorization: `Bearer ${token}` } })).json();
  const [peliculas, funciones, precios] = await Promise.all([get('/peliculas'), get('/funciones'), get('/precios')]);
  const pelicula = peliculas.find((p) => p.estado === 'activa');
  const funcion = funciones[0];
  const precio = precios[0];

  const browser = await chromium.launch({
    executablePath: EDGE, headless: true,
    args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream', `--use-file-for-fake-audio-capture=${SILENCIO}`, '--autoplay-policy=no-user-gesture-required'],
  });
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 }, permissions: ['microphone'] });
  await ctx.addInitScript((t) => {
    localStorage.setItem('lumen_token', t);
    sessionStorage.setItem('lumen_admin_tab', JSON.stringify('voz')); // la pestaña vieja "Asistente de Voz": ya no existe, no debe dejar la pantalla en blanco
    window.__ev = [];
    const WS = window.WebSocket;
    window.WebSocket = function (...a) {
      const w = new WS(...a);
      w.addEventListener('message', (e) => { if (typeof e.data === 'string') { try { window.__ev.push(JSON.parse(e.data)); } catch { /* ignorar */ } } });
      return w;
    };
    window.WebSocket.prototype = WS.prototype;
    Object.assign(window.WebSocket, { CONNECTING: 0, OPEN: 1, CLOSING: 2, CLOSED: 3 });
  }, token);

  const page = await ctx.newPage();
  const errores = [];
  page.on('pageerror', (e) => errores.push('PAGEERROR ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('404')) errores.push(m.text()); });

  const textoDe = async (id) => (await page.getByTestId(id).innerText().catch(() => ''));
  const minutosDe = (t) => { const m = /(\d{1,2}):(\d{2})/.exec(t); return m ? Number(m[1]) * 60 + Number(m[2]) : NaN; };
  const cercaDeAhora = (t) => { const n = new Date(); const d = Math.abs(minutosDe(t) - (n.getHours() * 60 + n.getMinutes())); return Math.min(d, 1440 - d) <= 1; };
  const aplicar = (acciones) => page.evaluate((a) => window.__lumen.aplicarUi(a), acciones);
  const resaltadas = () => page.locator('[data-fila-resaltada="true"]');

  console.log('== 1) La consola abre limpia y con el mismo selector de modo que la app de cliente ==');
  await page.goto(BASE + '/admin/console', { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-testid="mode-switcher"]', { timeout: 15000 });
  const cuerpo = await page.evaluate(() => document.body.innerText);
  verificar('no queda la pantalla en blanco con una pestaña guardada que ya no existe', /Reportes de Ventas/i.test(cuerpo));
  verificar('hay selector de modo (Táctil / Voz + UI Dinámica / Solo Voz)', (await page.getByRole('button', { name: /Modo Táctil/ }).count()) === 1 && (await page.getByRole('button', { name: /Voz \+ UI Din/ }).count()) === 1 && (await page.getByRole('button', { name: /Solo Voz/ }).count()) === 1);
  verificar('ya no existe la pestaña "Asistente de Voz (RF18)" (ni el rotulo RF18 en la navegacion)', !/Asistente de Voz/i.test(cuerpo) && !/RF18/.test(await page.locator('aside').innerText() + await page.locator('header').innerText()));
  const estadoTactil = await textoDe('estado-conexion');
  verificar('en Táctil el micrófono figura APAGADO', /mic apagado/i.test(estadoTactil) && !/mic activo/i.test(estadoTactil), estadoTactil.replace(/\s+/g, ' '));
  const reloj = await textoDe('reloj-sistema');
  verificar('la hora es la REAL del sistema', cercaDeAhora(reloj), `reloj: ${reloj}`);
  verificar('no hay panel de voz ni panel flotante', (await page.getByTestId('voice-strip').count()) === 0 && (await page.getByTestId('voice-dock').count()) === 0);
  await page.screenshot({ path: 'admin1_tactil.png' });

  console.log('\n== 2) "Voz + UI Dinámica": el panel queda debajo del selector, como en el cliente ==');
  await page.getByRole('button', { name: /Voz \+ UI Din/ }).click();
  await page.waitForSelector('[data-testid="voice-strip"]', { timeout: 15000 });
  await page.waitForFunction(() => window.__ev.some((e) => e.type === 'ready'), null, { timeout: 20000 });
  const selector = await page.getByTestId('mode-switcher').boundingBox();
  const panel = await page.getByTestId('voice-strip').boundingBox();
  const ancho = await page.evaluate(() => document.documentElement.clientWidth);
  verificar('el panel esta DEBAJO del selector y pegado a el (una sola franja)', !!selector && !!panel && Math.abs(panel.y - (selector.y + selector.height)) <= 2, selector && panel ? `selector termina en y=${Math.round(selector.y + selector.height)}, panel empieza en y=${Math.round(panel.y)}` : '');
  verificar('ocupa todo el ancho del contenido (al lado del menu lateral)', !!panel && panel.x >= 280 && panel.x + panel.width >= ancho - 2, panel ? `x=${Math.round(panel.x)}, ancho=${Math.round(panel.width)} de ${ancho}` : '');
  verificar('al pasar a voz el micrófono SE ACTIVA ("Mic activo")', /mic activo/i.test(await textoDe('estado-conexion')), (await textoDe('estado-conexion')).replace(/\s+/g, ' '));
  verificar('muestra "Pipeline generativo WebSocket activo" sin "RF18"', /pipeline generativo websocket activo/i.test(await textoDe('pipeline-estado')) && !/RF18/i.test(await textoDe('mode-switcher')));
  await page.waitForSelector('[data-testid="latencia-voz"]', { timeout: 12000 }).catch(() => {});
  const ms = Number((/Latencia: (\d+) ms/i.exec(await textoDe('latencia-voz')) || [])[1]);
  verificar('muestra la latencia REAL hacia el agente', ms >= 1 && ms < 1000, `${ms} ms`);
  verificar('la tarjeta del agente ofrece lo que puede pedir un administrador', /reporte de ventas/i.test(await textoDe('strip-respuesta-vacio')), (await textoDe('strip-respuesta-vacio')).slice(0, 90));
  verificar('ya no hay panel flotante abajo', (await page.getByTestId('voice-dock').count()) === 0);
  await page.screenshot({ path: 'admin2_hibrido.png' });

  console.log('\n== 3) El agente SEÑALA la fila que acaba de crear o cambiar ==');
  if (pelicula) {
    await aplicar([{ tipo: 'admin.abrir_tab', tab: 'cartelera' }, { tipo: 'admin.resaltar', tab: 'cartelera', entidad: 'pelicula', id: pelicula.idPelicula }]);
    await page.waitForSelector('[data-fila-resaltada="true"]', { timeout: 15000 }).catch(() => {});
    const fila = await resaltadas().first().innerText().catch(() => '');
    verificar('pelicula: la fila resaltada es la de esa pelicula', (await resaltadas().count()) === 1 && fila.includes(pelicula.titulo), fila.replace(/\s+/g, ' ').slice(0, 80));
    await page.waitForTimeout(1200); // que termine el desplazamiento suave antes de sacar la foto
    await page.screenshot({ path: 'admin3_fila_pelicula.png' });
  }
  if (funcion) {
    await aplicar([{ tipo: 'admin.resaltar', tab: 'cartelera', entidad: 'funcion', id: funcion.idFuncion }]);
    await page.waitForSelector('[data-fila-resaltada="true"]', { timeout: 15000 }).catch(() => {});
    const fila = await resaltadas().first().innerText().catch(() => '');
    verificar('funcion: cambia sola a la sub-pestaña "Funciones" y resalta esa funcion', (await resaltadas().count()) === 1 && fila.includes(funcion.fecha), fila.replace(/\s+/g, ' ').slice(0, 90));
  }
  if (precio) {
    await aplicar([{ tipo: 'admin.abrir_tab', tab: 'promos' }, { tipo: 'admin.resaltar', tab: 'promos', entidad: 'precio', id: precio.idPrecio }]);
    await page.waitForSelector('[data-fila-resaltada="true"]', { timeout: 15000 }).catch(() => {});
    verificar('precio: en "Precios & Promos" se resalta ese precio', (await resaltadas().count()) === 1);
  }
  await page.waitForTimeout(13000);
  verificar('lo resaltado se apaga solo a los ~12 s', (await resaltadas().count()) === 0);

  console.log('\n== 4) La ventana de reporte usa nombres legibles y muestra el periodo consultado ==');
  await aplicar([{ tipo: 'ventana.abrir', ventana: 'reporte', datos: { tipo_reporte: 'por_pelicula', periodo: 'Esta semana', reporte: [{ idPelicula: 1, titulo: 'Prueba', totalVentas: 2, montoTotal: '70.00', cantidadEntradas: 2 }] } }]);
  await page.waitForSelector('[data-ventana="Reporte"]', { timeout: 8000 });
  const ventanaReporte = await page.locator('[data-ventana="Reporte"]').innerText();
  verificar('titula el reporte ("Ventas por película") y muestra el periodo ("Esta semana")', /Ventas por película/i.test(ventanaReporte) && /Esta semana/i.test(ventanaReporte), ventanaReporte.replace(/\s+/g, ' ').slice(0, 90));
  verificar('usa nombres legibles (Ventas, Monto, Entradas), no los del codigo ni los ids', /Monto \(Bs\)/i.test(ventanaReporte) && /Entradas/i.test(ventanaReporte) && !/totalVentas|montoTotal|cantidadEntradas|idPelicula/.test(ventanaReporte));
  await page.screenshot({ path: 'admin4_reporte.png' });

  console.log('\n== 5) Volver a Táctil apaga el micrófono y limpia la interfaz ==');
  await page.getByRole('button', { name: /Modo Táctil/ }).click();
  await page.waitForTimeout(600);
  const estadoFinal = await textoDe('estado-conexion');
  verificar('el panel desaparece y el micrófono figura apagado', (await page.getByTestId('voice-strip').count()) === 0 && /mic apagado/i.test(estadoFinal) && (await page.getByTestId('latencia-voz').count()) === 0, estadoFinal.replace(/\s+/g, ' '));

  console.log('\nerrores de la pagina:', errores.length ? errores : 'ninguno');
  verificar('sin errores en consola', errores.length === 0);
  const ok = resultados.every(Boolean);
  console.log(`\nRESULTADO: ${resultados.filter(Boolean).length}/${resultados.length} verificaciones OK`);
  await browser.close();
  process.exit(ok ? 0 : 1);
})().catch((e) => { console.error('ERROR', e); process.exit(2); });

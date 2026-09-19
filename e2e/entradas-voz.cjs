// Uso: SILENCIO_WAV=/ruta/silencio.wav node e2e/entradas-voz.cjs
// Los otros caminos que llevan a la voz (Home, barra inferior, salir de Solo Voz) despues del refactor del proveedor.
const { chromium } = require('playwright-core');
const EDGE = process.env.EDGE_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const BASE = process.env.BASE_URL || 'http://localhost:3000';
const API = process.env.BACKEND_URL || 'http://localhost:3333/api';
const SILENCIO = process.env.SILENCIO_WAV;
if (!SILENCIO) throw new Error('Falta SILENCIO_WAV (ruta a un WAV de silencio, ver e2e/README.md)');

(async () => {
  const r = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre: 'Hebert Suárez burgos', rol: 'cliente' }) });
  const token = (await r.json()).access_token;
  const browser = await chromium.launch({ executablePath: EDGE, headless: true, args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream', `--use-file-for-fake-audio-capture=${SILENCIO}`] });
  const ctx = await browser.newContext({ viewport: { width: 1500, height: 900 }, permissions: ['microphone'] });
  await ctx.addInitScript((t) => {
    localStorage.setItem('lumen_token', t);
    window.__ev = [];
    const WS = window.WebSocket;
    window.WebSocket = function (...a) { const w = new WS(...a); w.addEventListener('message', (e) => { if (typeof e.data === 'string') { try { window.__ev.push(JSON.parse(e.data)); } catch {} } }); return w; };
    window.WebSocket.prototype = WS.prototype;
    Object.assign(window.WebSocket, { CONNECTING: 0, OPEN: 1, CLOSING: 2, CLOSED: 3 });
  }, token);
  const page = await ctx.newPage();
  const errores = [];
  page.on('pageerror', (e) => errores.push('PAGEERROR ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('404')) errores.push(m.text()); });

  const ok = [];
  const v = (n, c, d = '') => { ok.push(c); console.log(`   ${c ? 'OK   ' : 'FALLO'} ${n}${d ? '  -> ' + d : ''}`); };
  const modo = () => page.evaluate(() => window.__lumen?.modo);
  const listo = () => page.evaluate(() => window.__ev.some((e) => e.type === 'ready'));

  console.log('== A) Home -> portal "Habla con Lumen AI" ==');
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  const portal = page.getByText(/Habla con Lumen AI/i).first();
  v('el portal esta en el Home', await portal.count() > 0);
  await portal.click({ timeout: 8000 });
  await page.waitForURL('**/voz', { timeout: 8000 }).catch(() => {});
  await page.waitForFunction(() => window.__ev.some((e) => e.type === 'ready'), null, { timeout: 20000 }).catch(() => {});
  v('lleva a /voz', page.url().endsWith('/voz'), page.url());
  v('el modo es "voz" y la conversacion abrio sola', (await modo()) === 'voz' && (await listo()));
  v('se ve la pantalla de voz pura (RF16)', await page.getByText(/Canal de Voz Bidireccional/i).count() > 0);

  console.log('\n== B) Solo Voz: mantener presionado "Modo Táctil" para salir ==');
  const salir = page.getByRole('button', { name: /Cambiar a pantalla táctil/i });
  const caja = await salir.boundingBox();
  await page.mouse.move(caja.x + caja.width / 2, caja.y + caja.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(1500);
  await page.mouse.up();
  await page.waitForURL(/\/(cartelera|compra)$/, { timeout: 6000 }).catch(() => {});
  v('sale de /voz', !page.url().endsWith('/voz'), page.url());
  v('el modo vuelve a tactil (el microfono se cierra)', (await modo()) === 'tactil');
  const streamsActivos = await page.evaluate(async () => (await navigator.mediaDevices.enumerateDevices()).length >= 0);
  const estado = await page.evaluate(() => window.__lumen.voz.estado);
  v('la conversacion se cerro', estado === 'apagada', estado);

  console.log('\n== C) Cartelera -> "Voz + UI Dinámica" -> cambio a "Solo Voz" sin cortar la sesion ==');
  await page.goto(BASE + '/cartelera', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /Voz \+ UI Din/ }).first().click();
  await page.waitForSelector('[data-testid="voice-strip"]', { timeout: 15000 });
  await page.waitForFunction(() => window.__ev.filter((e) => e.type === 'ready').length >= 1, null, { timeout: 20000 });
  const listosAntes = await page.evaluate(() => window.__ev.filter((e) => e.type === 'ready').length);
  await page.getByRole('button', { name: /Solo Voz/ }).first().click();
  await page.waitForURL('**/voz', { timeout: 8000 });
  await page.waitForTimeout(1500);
  const listosDespues = await page.evaluate(() => window.__ev.filter((e) => e.type === 'ready').length);
  v('pasar de hibrido a solo voz NO reabre la conversacion (misma sesion)', listosDespues === listosAntes, `ready: ${listosAntes} -> ${listosDespues}`);
  v('sigue activa', (await page.evaluate(() => window.__lumen.voz.activa)) === true);

  console.log('\n== D) Elegir "Modo Táctil" en el selector cierra el panel de voz y el micrófono ==');
  await page.goto(BASE + '/cartelera', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /Voz \+ UI Din/ }).first().click();
  await page.waitForSelector('[data-testid="voice-strip"]', { timeout: 15000 });
  await page.getByRole('button', { name: /Modo Táctil/ }).click(); // el panel no tiene boton propio para cerrarse: se usa el selector
  await page.waitForTimeout(600);
  v('el panel de voz desaparece', await page.locator('[data-testid="voice-strip"]').count() === 0);
  v('modo tactil y mic cerrado', (await modo()) === 'tactil' && (await page.evaluate(() => window.__lumen.voz.estado)) === 'apagada');

  console.log('\n== E) Sin sesion iniciada, la voz pide login ==');
  const ctx2 = await browser.newContext({ viewport: { width: 1500, height: 900 }, permissions: ['microphone'] });
  const p2 = await ctx2.newPage();
  await p2.goto(BASE + '/cartelera', { waitUntil: 'networkidle' });
  await p2.getByRole('button', { name: /Voz \+ UI Din/ }).first().click();
  await p2.waitForTimeout(1000);
  v('redirige a /login (la voz exige cuenta)', p2.url().includes('/login'), p2.url());

  console.log('\nerrores:', errores.length ? errores : 'ninguno');
  console.log(`RESULTADO: ${ok.filter(Boolean).length}/${ok.length}`);
  await browser.close();
  process.exit(ok.every(Boolean) && !errores.length ? 0 : 1);
})().catch((e) => { console.error('ERROR', e); process.exit(2); });

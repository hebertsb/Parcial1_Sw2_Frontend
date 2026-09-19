// Voz + UI Dinamica: se ve lo que hace el agente MIENTRAS habla, sin cambiar a "Solo Voz".
// Comprueba, en un navegador real y con el backend real:
//   1. Al entrar a "Voz + UI Dinamica" se sigue viendo la app (no aparece la pantalla de Solo Voz) y la barra inferior
//      no ofrece pasar a Solo Voz.
//   2. "Mostrame la cartelera": la pantalla va sola a la cartelera y muestra las peliculas.
//   3. "Quiero entradas para X": la tarjeta de X se RESALTA y su horario se marca ANTES de saltar a los asientos
//      (se mide el orden en el tiempo), y despues la pantalla pasa a los asientos con la funcion elegida.
//   4. Si el usuario ya esta en los asientos y solo cambia la funcion, no lo saca de ahi.
// NO confirma nada (no escribe en la base compartida).
// Uso: SILENCIO_WAV=/ruta/silencio.wav node e2e/dinamica-visible.cjs
const { chromium } = require('playwright-core');

const EDGE = process.env.EDGE_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const BASE = process.env.BASE_URL || 'http://localhost:3000';
const API = process.env.BACKEND_URL || 'http://localhost:3333/api';
const SILENCIO = process.env.SILENCIO_WAV;
if (!SILENCIO) throw new Error('Falta SILENCIO_WAV (ruta a un WAV de silencio, ver e2e/README.md)');
const NOMBRE = process.env.NOMBRE || 'Hebert Suárez burgos';
const PELICULA = process.env.PELICULA || 'Oppenheimer';

const resultados = [];
function verificar(nombre, ok, detalle = '') {
  resultados.push(ok);
  console.log(`   ${ok ? 'OK   ' : 'FALLO'} ${nombre}${detalle ? '  -> ' + detalle : ''}`);
}

(async () => {
  const login = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre: NOMBRE, rol: 'cliente' }) });
  const token = (await login.json()).access_token;
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
      w.addEventListener('message', (e) => { if (typeof e.data === 'string') { try { window.__ev.push(JSON.parse(e.data)); } catch { /* ignorar */ } } });
      return w;
    };
    window.WebSocket.prototype = WS.prototype;
    Object.assign(window.WebSocket, { CONNECTING: 0, OPEN: 1, CLOSING: 2, CLOSED: 3 });
    // Linea de tiempo de lo que ve el usuario: cada vez que cambia la ruta o lo resaltado, con su instante.
    window.__linea = [];
    const inicio = performance.now();
    const marca = (que) => window.__linea.push({ t: Math.round(performance.now() - inicio), que });
    let ruta = '', peliculaR = false, funcionR = false;
    setInterval(() => {
      if (location.pathname !== ruta) { ruta = location.pathname; marca(`ruta ${ruta}`); }
      const p = !!document.querySelector('[data-pelicula-resaltada="true"]');
      const f = !!document.querySelector('[data-funcion-resaltada="true"]');
      if (p !== peliculaR) { peliculaR = p; marca(p ? 'pelicula resaltada' : 'pelicula sin resaltar'); }
      if (f !== funcionR) { funcionR = f; marca(f ? 'horario resaltado' : 'horario sin resaltar'); }
    }, 40);
  }, token);

  const page = await ctx.newPage();
  const errores = [];
  page.on('pageerror', (e) => errores.push('PAGEERROR ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('404')) errores.push(m.text()); });

  const decir = async (frase) => {
    const antes = await page.evaluate(() => window.__ev.filter((e) => e.type === 'reply').length);
    await page.evaluate((t) => window.__lumen.voz.enviarTexto(t), frase);
    await page.waitForFunction((n) => window.__ev.filter((e) => e.type === 'reply').length > n, antes, { timeout: 60000 });
    const reply = await page.evaluate(() => window.__ev.filter((e) => e.type === 'reply').slice(-1)[0]);
    console.log(`\n   USUARIO: ${frase}\n   LUMEN  : ${reply.texto.slice(0, 150)}`);
  };
  const pantalla = async () => (await page.evaluate(() => document.body.innerText));

  console.log('== 1) Entro a "Voz + UI Dinámica" desde el INICIO ==');
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /Voz \+ UI Din/ }).first().click({ timeout: 8000 });
  await page.waitForSelector('[data-testid="voice-dock"]', { timeout: 15000 });
  await page.waitForFunction(() => window.__ev.some((e) => e.type === 'ready'), null, { timeout: 20000 });
  let texto = await pantalla();
  verificar('NO aparece la pantalla de Solo Voz', !/Canal de Voz Bidireccional/i.test(texto) && !page.url().endsWith('/voz'), page.url());
  verificar('se sigue viendo el Inicio de la app', /LUMEN/i.test(texto) && page.url().replace(BASE, '') === '/');
  verificar('la barra inferior NO ofrece pasar a Solo Voz mientras esta activo Voz + UI', (await page.getByText('Cambiar a Modo Voz Lumina').count()) === 0 && (await page.getByTestId('voz-ui-activa').count()) === 1);
  await page.screenshot({ path: 'dv1_inicio_con_asistente.png' });

  console.log('\n== 2) "Mostrame la cartelera": la pantalla va sola a la cartelera ==');
  await decir('Mostrame la cartelera');
  await page.waitForURL('**/cartelera', { timeout: 10000 }).catch(() => {});
  await page.waitForSelector('.movie-card', { timeout: 15000 }).catch(() => {});
  verificar('navego a /cartelera sin que nadie toque nada', page.url().endsWith('/cartelera'), page.url());
  verificar('se ven las peliculas', (await page.locator('.movie-card').count()) > 0, `${await page.locator('.movie-card').count()} tarjetas`);
  verificar('sigue el asistente flotando (no cambio a Solo Voz)', (await page.getByTestId('voice-dock').count()) === 1 && !/Canal de Voz Bidireccional/i.test(await pantalla()));
  await page.screenshot({ path: 'dv2_cartelera.png' });

  console.log(`\n== 3) "Quiero entradas para ${PELICULA}": se VE la eleccion y despues pasa a los asientos ==`);
  await page.evaluate(() => { window.__linea.length = 0; });
  const capturaResaltado = page.waitForSelector('[data-pelicula-resaltada="true"]', { timeout: 30000 }).then(async () => { await page.waitForTimeout(250); await page.screenshot({ path: 'dv3_pelicula_resaltada.png' }); });
  await decir(`Quiero dos entradas para ${PELICULA}`);
  await capturaResaltado.catch(() => {});
  await page.waitForURL('**/compra', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(600);
  const linea = await page.evaluate(() => window.__linea);
  console.log('   linea de tiempo de lo que se ve:', linea.map((l) => `${l.t}ms ${l.que}`).join(' | '));
  const t = (que) => linea.find((l) => l.que === que)?.t;
  const tPelicula = t('pelicula resaltada');
  const tHorario = t('horario resaltado');
  const tAsientos = t('ruta /compra');
  verificar('la tarjeta de la pelicula se resalta', tPelicula !== undefined);
  verificar('el horario elegido se marca', tHorario !== undefined);
  verificar('se ve el resaltado ANTES de saltar a los asientos', tPelicula !== undefined && tAsientos !== undefined && tPelicula < tAsientos && (tAsientos - tPelicula) >= 900, tPelicula !== undefined && tAsientos !== undefined ? `se ve ${tAsientos - tPelicula} ms antes de pasar` : '');
  const cine = await page.evaluate(() => JSON.parse(sessionStorage.getItem('lumen_cine_state') || '{}'));
  verificar('despues quedo en los asientos con la funcion elegida', page.url().endsWith('/compra') && cine.peliculaSeleccionada?.titulo === PELICULA && !!cine.funcionSeleccionada?.idFuncion, `${cine.peliculaSeleccionada?.titulo} funcion ${cine.funcionSeleccionada?.idFuncion}`);
  await page.screenshot({ path: 'dv4_asientos.png' });

  console.log('\n== 4) Ya en los asientos, cambiar de funcion NO lo saca de ahi ==');
  await page.evaluate(({ id, f }) => window.__lumen.aplicarUi([{ tipo: 'cartelera.mostrar', ids: [id], idFuncion: f, pausa_ms: 1300, omitir_en_compra: true }]), { id: cine.peliculaSeleccionada.idPelicula, f: cine.funcionSeleccionada.idFuncion });
  await page.waitForTimeout(1800);
  verificar('se queda en /compra (no vuelve a la cartelera)', page.url().endsWith('/compra'), page.url());

  console.log('\n== 5) "Mostrame la cartelera" desde los asientos: vuelve sola ==');
  await decir('Mostrame la cartelera');
  await page.waitForURL('**/cartelera', { timeout: 10000 }).catch(() => {});
  verificar('vuelve a la cartelera', page.url().endsWith('/cartelera'), page.url());

  console.log('\n== 6) Lo resaltado se apaga solo ==');
  await page.evaluate(({ id }) => window.__lumen.aplicarUi([{ tipo: 'cartelera.mostrar', ids: [id] }]), { id: cine.peliculaSeleccionada.idPelicula });
  await page.waitForSelector('[data-pelicula-resaltada="true"]', { timeout: 5000 }).catch(() => {});
  verificar('se resalta la pelicula que se señala', (await page.locator('[data-pelicula-resaltada="true"]').count()) === 1);
  await page.waitForTimeout(13000);
  verificar('a los ~12 s se apaga solo', (await page.locator('[data-pelicula-resaltada="true"]').count()) === 0);

  console.log('\nerrores de la pagina:', errores.length ? errores : 'ninguno');
  verificar('sin errores en consola', errores.length === 0);
  const ok = resultados.every(Boolean);
  console.log(`\nRESULTADO: ${resultados.filter(Boolean).length}/${resultados.length} verificaciones OK`);
  await browser.close();
  process.exit(ok ? 0 : 1);
})().catch((e) => { console.error('ERROR', e); process.exit(2); });

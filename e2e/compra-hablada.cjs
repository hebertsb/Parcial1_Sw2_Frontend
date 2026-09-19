// La compra ENTERA por voz, con audio real: cuatro frases habladas (Piper) entran por el microfono falso y se comprueba
// que la app real quedo en el estado correcto. Es la prueba mas cercana a la demo. NO confirma la compra: se queda en el
// resumen (ventana de confirmacion abierta), asi que no escribe nada en la base compartida.
// Uso: WAV=/ruta/compra.wav node e2e/compra-hablada.cjs
// El WAV: docker exec back_agent python tests/manual/generar_wav.py "Quiero dos entradas para Oppenheimer mañana a la una y media de la tarde||Los asientos del medio, juntos||Agregame un popcorn caramelo grande||Listo, quiero pagar" tests/manual/out/compra.wav
// OJO: depende de los datos de la base. Con la cartelera de la demo (scripts/poblar_base_de_datos.py) cada película tiene varias funciones y el
// agente PREGUNTA a cuál ir si no se le dice día y hora: la primera frase tiene que nombrar una función que exista (mirá la cartelera). Y
// «un pochoclo grande» a secas coincide con dos productos (clásico y caramelo): el agente pregunta cuál, así que se nombra uno.
const { chromium } = require('playwright-core');

const EDGE = process.env.EDGE_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const BASE = process.env.BASE_URL || 'http://localhost:3000';
const API = process.env.BACKEND_URL || 'http://localhost:3333/api';
const WAV = process.env.WAV;
if (!WAV) throw new Error('Falta WAV (ver el comentario de arriba)');
const NOMBRE = process.env.NOMBRE || 'Hebert Suárez burgos';
const FRASES = Number(process.env.FRASES || 4);

(async () => {
  const login = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre: NOMBRE, rol: 'cliente' }) });
  const token = (await login.json()).access_token;
  const browser = await chromium.launch({
    executablePath: EDGE, headless: true,
    args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream', `--use-file-for-fake-audio-capture=${WAV}%noloop`, '--autoplay-policy=no-user-gesture-required'],
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
  }, token);

  const page = await ctx.newPage();
  const errores = [];
  page.on('pageerror', (e) => errores.push('PAGEERROR ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('404')) errores.push(m.text()); });

  await page.goto(BASE + '/cartelera', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /Voz \+ UI Din/ }).first().click({ timeout: 8000 });
  console.log('Entre a "Voz + UI Dinámica"; el microfono falso va a "decir" las frases solo.\n');

  await page.waitForFunction((n) => window.__ev.filter((e) => e.type === 'reply').length >= n, FRASES, { timeout: 150000 }).catch(() => {});
  await page.waitForTimeout(1500);

  const ev = await page.evaluate(() => window.__ev);
  const turnos = [];
  let actual = null;
  for (const e of ev) {
    if (e.type === 'transcript') { actual = { dijo: e.text }; turnos.push(actual); }
    if (e.type === 'reply' && actual) actual.respondio = e.texto;
    if (e.type === 'metrics' && actual) actual.primerAudioMs = e.primer_audio_ms;
  }
  turnos.forEach((t, i) => console.log(`${i + 1}. USUARIO: ${t.dijo}\n   LUMEN  : ${(t.respondio || '(sin respuesta)').slice(0, 150)}${t.primerAudioMs ? `   [${t.primerAudioMs} ms al primer audio]` : ''}\n`));

  const cine = await page.evaluate(() => JSON.parse(sessionStorage.getItem('lumen_cine_state') || '{}'));
  const ventana = await page.locator('[data-ventana="Confirmá tu compra"]').count();
  const resumen = ev.filter((e) => e.type === 'reply').slice(-1)[0];
  // Latencia real: la del servicio de voz (medida en el navegador) y lo que tardo la ultima respuesta hablada (medido por el servidor).
  const pill = await page.getByTestId('latencia-voz').innerText().catch(() => '');
  const cabecera = await page.getByTestId('estado-conexion').innerText().catch(() => '');
  const verificaciones = [
    ['la cabecera dice "Mic activo" mientras se habla', /mic activo/i.test(cabecera)],
    ['muestra la latencia real y lo que tardo la respuesta hablada (medida por el servidor)', /Latencia: \d+ ms/i.test(pill) && /Respuesta: \d+,\d s/i.test(pill)],
    ['entendio las 4 frases', turnos.length >= FRASES],
    ['eligio Oppenheimer y una funcion real', cine.peliculaSeleccionada?.titulo === 'Oppenheimer' && !!cine.funcionSeleccionada?.idFuncion],
    ['selecciono 2 butacas reales', cine.butacasSeleccionadas?.length === 2 && cine.butacasSeleccionadas.every((b) => Number.isInteger(b.idAsiento))],
    ['agrego dulceria', (cine.candyBarSeleccionado || []).length >= 1],
    ['llego al resumen con el aviso de no reembolso', /no tienen reembolso/i.test(resumen?.texto || '')],
    ['la ventana flotante de confirmacion esta abierta', ventana === 1],
    ['la compra NO se ejecuto (sigue esperando el "confirmo")', cine.estadoCompra === 'pago' && !cine.ventaCreada],
    ['sin errores en la consola', errores.length === 0],
  ];
  console.log('Estado de la app:', JSON.stringify({ pelicula: cine.peliculaSeleccionada?.titulo, butacas: (cine.butacasSeleccionadas || []).map((b) => b.id), dulceria: (cine.candyBarSeleccionado || []).map((i) => `${i.cantidad} ${i.nombre}`), paso: cine.estadoCompra }));
  await page.screenshot({ path: 'compra_hablada.png' });
  let ok = true;
  for (const [nombre, cumple] of verificaciones) { console.log(`   ${cumple ? 'OK   ' : 'FALLO'} ${nombre}`); ok = ok && cumple; }
  if (errores.length) console.log('errores:', errores);
  console.log(`\nRESULTADO: ${ok ? 'OK' : 'FALLO'}`);
  await browser.close();
  process.exit(ok ? 0 : 1);
})().catch((e) => { console.error('ERROR', e); process.exit(2); });

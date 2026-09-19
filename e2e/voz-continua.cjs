// Prueba real en el navegador de la conversacion continua: microfono falso con un WAV, SIN tocar botones de grabar.
// Uso: WAV=/ruta/cartelera.wav [ROL=cliente NOMBRE="..."] [PANTALLA="Solo Voz"|"Voz + UI"] [MODO=barge] node e2e/voz-continua.cjs
// El WAV se arma con: docker exec back_agent python tests/manual/generar_wav.py "Qué películas hay en cartelera" tests/manual/out/cartelera.wav
// (para MODO=barge: dos frases separadas por ||, ver e2e/README.md)
const { chromium } = require('playwright-core');

const EDGE = process.env.EDGE_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const BASE = process.env.BASE_URL || 'http://localhost:3000';
const WAV = process.env.WAV;
const ROL = process.env.ROL || 'cliente';
const NOMBRE = process.env.NOMBRE || 'Hebert Suárez burgos';
const PANTALLA = process.env.PANTALLA || 'Solo Voz';
const ESPERA_S = Number(process.env.ESPERA_S || 40);

async function obtenerToken() {
  const r = await fetch(`${process.env.BACKEND_URL || 'http://localhost:3333/api'}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre: NOMBRE, rol: ROL }),
  });
  if (!r.ok) throw new Error(`login ${r.status}: ${await r.text()}`);
  return (await r.json()).access_token;
}

(async () => {
  const token = await obtenerToken();
  const browser = await chromium.launch({
    executablePath: EDGE,
    headless: true,
    args: [
      '--use-fake-device-for-media-stream',
      '--use-fake-ui-for-media-stream',
      `--use-file-for-fake-audio-capture=${WAV}%noloop`,
      '--autoplay-policy=no-user-gesture-required',
    ],
  });
  const ctx = await browser.newContext({ viewport: { width: 1500, height: 900 }, permissions: ['microphone'] });
  await ctx.addInitScript((t) => {
    localStorage.setItem('lumen_token', t);
    // Instrumentacion: eventos del servidor y audio que el navegador realmente agenda para reproducir.
    window.__ev = [];
    window.__audio = { fuentes: 0, segundos: 0 };
    const inicio = performance.now();
    const orig = AudioBufferSourceNode.prototype.start;
    AudioBufferSourceNode.prototype.start = function (...a) {
      window.__audio.fuentes++;
      window.__audio.segundos += this.buffer ? this.buffer.duration : 0;
      return orig.apply(this, a);
    };
    const WS = window.WebSocket;
    window.WebSocket = function (...args) {
      const w = new WS(...args);
      w.addEventListener('message', (e) => {
        if (typeof e.data === 'string') {
          const d = JSON.parse(e.data);
          window.__ev.push({ t: (performance.now() - inicio) / 1000, ...d });
        }
      });
      return w;
    };
    window.WebSocket.prototype = WS.prototype;
    Object.assign(window.WebSocket, { CONNECTING: 0, OPEN: 1, CLOSING: 2, CLOSED: 3 });
  }, token);

  const page = await ctx.newPage();
  const errores = [];
  page.on('pageerror', (e) => errores.push('PAGEERROR ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errores.push('console.error ' + m.text()); });
  page.on('response', (r) => { if (r.status() >= 400) errores.push(`HTTP ${r.status()} ${r.url()}`); });

  await page.goto(BASE + '/cartelera', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: new RegExp(PANTALLA.replace('+', '\\+')) }).first().click({ timeout: 8000 });
  console.log(`[1] entre a "${PANTALLA}" (rol ${ROL}) y NO toque ningun boton de grabar`);

  const BARGE = process.env.MODO === 'barge';
  const limite = Date.now() + ESPERA_S * 1000;
  let listo = false;
  while (Date.now() < limite) {
    const ev = await page.evaluate(() => window.__ev);
    const respuestas = ev.filter((e) => e.type === 'reply').length;
    const estados = ev.filter((e) => e.type === 'state');
    const enReposo = estados.length && estados[estados.length - 1].value === 'escuchando';
    // normal: una respuesta y el agente termino de hablar; barge: dos respuestas (la de la interrupcion tambien)
    if (respuestas >= (BARGE ? 2 : 1) && enReposo) { listo = true; break; }
    await page.waitForTimeout(250);
  }

  const ev = await page.evaluate(() => window.__ev);
  const audio = await page.evaluate(() => window.__audio);
  console.log('\n[2] linea de tiempo de eventos del servidor:');
  for (const e of ev) {
    const { t, type, ...resto } = e;
    const txt = JSON.stringify(resto).slice(0, 150);
    console.log(`     ${t.toFixed(2).padStart(6)}s  ${type.padEnd(11)} ${txt}`);
  }
  const transcript = ev.find((e) => e.type === 'transcript');
  const reply = ev.find((e) => e.type === 'reply');
  console.log('\n[3] el agente entendio:', transcript ? JSON.stringify(transcript.text) : 'NADA');
  console.log('[3] y respondio      :', reply ? JSON.stringify(reply.texto).slice(0, 200) : 'NADA');
  console.log(`[4] audio agendado en el navegador: ${audio.fuentes} frases, ${audio.segundos.toFixed(1)} s`);

  const textoPantalla = await page.evaluate(() => document.body.innerText);
  console.log('[5] la pantalla muestra el texto entendido:', transcript ? textoPantalla.includes(transcript.text.replace(/[¿?]/g, '').trim().slice(0, 15)) : false);
  console.log('[5] la pantalla muestra la respuesta     :', reply ? textoPantalla.includes(reply.texto.slice(0, 20)) : false);
  await page.screenshot({ path: 'voz_continua.png' });
  console.log('[6] errores JS:', errores.length ? errores : 'ninguno');
  let ok = listo && transcript && reply && audio.fuentes > 0;
  if (BARGE) {
    const transcripciones = ev.filter((e) => e.type === 'transcript').map((e) => e.text);
    const interrumpido = ev.some((e) => e.type === 'interrupted');
    console.log('[7] transcripciones:', JSON.stringify(transcripciones));
    console.log('[7] el agente fue interrumpido (evento interrupted):', interrumpido);
    const t = ev.filter((e) => e.type === 'interrupted')[0];
    const habla = ev.filter((e) => e.type === 'state' && e.value === 'hablando')[0];
    if (t && habla) console.log(`[7] hablo ${((t.t - habla.t)).toFixed(1)} s antes de que lo cortaran (la respuesta completa dura ~10 s)`);
    console.log(`[7] audio agendado en total: ${audio.segundos.toFixed(1)} s`);
    ok = ok && interrumpido && transcripciones.length >= 2;
  }
  console.log(`\nRESULTADO: ${ok ? 'OK' : 'FALLO'}`);
  await browser.close();
  process.exit(ok ? 0 : 1);
})().catch((e) => { console.error('ERROR', e); process.exit(2); });

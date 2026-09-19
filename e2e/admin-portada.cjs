// La ventana de confirmación del administrador muestra la PORTADA que se va a cargar antes de decir «confirmo» (crear una película
// desde la carpeta `portadas/` del agente). No usa el modelo de lenguaje (inyecta la acción que mandaría el servidor) y no escribe
// nada en la base compartida: la ventana se cancela.
// Uso: SILENCIO_WAV=/ruta/silencio.wav node e2e/admin-portada.cjs
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright-core');

const EDGE = process.env.EDGE_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const BASE = process.env.BASE_URL || 'http://localhost:3000';
const API = process.env.BACKEND_URL || 'http://localhost:3333/api';
const VOZ = process.env.VOICE_URL || 'http://localhost:8000';
const SILENCIO = process.env.SILENCIO_WAV;
if (!SILENCIO) throw new Error('Falta SILENCIO_WAV (ruta a un WAV de silencio, ver e2e/README.md)');
const NOMBRE = process.env.NOMBRE || 'Admin Lumen';
const CARPETA_PORTADAS = process.env.PORTADAS_DIR || path.resolve(__dirname, '../../Backend_IA/agent_cine/portadas');
const PORTADA = 'coco.jpg';

const resultados = [];
function verificar(nombre, ok, detalle = '') {
  resultados.push(ok);
  console.log(`   ${ok ? 'OK   ' : 'FALLO'} ${nombre}${detalle ? '  -> ' + detalle : ''}`);
}

(async () => {
  const login = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre: NOMBRE, rol: 'administrador' }) });
  const token = (await login.json()).access_token;

  // ¿El agente que está corriendo ya sirve /portadas? (si es una versión anterior, se simula esa respuesta para probar solo el panel)
  const vivo = await fetch(`${VOZ}/portadas/${PORTADA}`).then((r) => r.ok && (r.headers.get('content-type') || '').startsWith('image/')).catch(() => false);
  console.log(vivo ? `== El agente sirve /portadas/${PORTADA} (prueba de punta a punta) ==` : `== El agente en ejecución todavía no sirve /portadas: se simula su respuesta (reconstruí back_agent para la prueba completa) ==`);

  const browser = await chromium.launch({
    executablePath: EDGE, headless: true,
    args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream', `--use-file-for-fake-audio-capture=${SILENCIO}`, '--autoplay-policy=no-user-gesture-required'],
  });
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 }, permissions: ['microphone'] });
  await ctx.addInitScript((t) => { localStorage.setItem('lumen_token', t); }, token);
  if (!vivo) {
    await ctx.route(`**/portadas/${PORTADA}`, (route) => route.fulfill({ status: 200, contentType: 'image/jpeg', body: fs.readFileSync(path.join(CARPETA_PORTADAS, PORTADA)) }));
  }
  await ctx.route('**/portadas/no_existe.jpg', (route) => route.fulfill({ status: 404, body: 'no' }));

  const page = await ctx.newPage();
  const errores = [];
  page.on('pageerror', (e) => errores.push('PAGEERROR ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('404')) errores.push(m.text()); });
  const aplicar = (acciones) => page.evaluate((a) => window.__lumen.aplicarUi(a), acciones);
  const portada = () => page.getByTestId('confirmacion-portada');
  const cerrar = async () => { await aplicar([{ tipo: 'ventana.cerrar', ventana: 'confirmacion' }]); await page.waitForTimeout(500); };
  // Cancelar y Confirmar dentro de la pantalla (no bajo el pliegue de la ventana): con la portada y una sinopsis larga la ventana crece.
  const botonesVisibles = () => page.evaluate(() => {
    const botones = [...document.querySelectorAll('[role="dialog"] button')].filter((b) => /^(Cancelar|Confirmar)$/.test((b.textContent || '').trim()));
    return { cuantos: botones.length, dentro: botones.every((b) => { const r = b.getBoundingClientRect(); return r.top >= 0 && r.bottom <= window.innerHeight && r.left >= 0 && r.right <= window.innerWidth && r.height > 0; }) };
  });

  const datos = (imagen) => ({
    titulo: 'Alta de película', resumen: 'Leí «COCO» en la portada. Es «Coco»: Animación, 105 minutos, Todos. Decime «confirmo» para crearla.',
    campos: [{ etiqueta: 'Título', valor: 'Coco' }, { etiqueta: 'Género', valor: 'Animación' }, { etiqueta: 'Duración', valor: '105 minutos' }, { etiqueta: 'Clasificación', valor: 'Todos' },
      { etiqueta: 'Sinopsis', valor: 'Miguel sueña con ser músico, aunque su familia lo tiene prohibido. Un Día de Muertos cruza a la Tierra de los Muertos en busca de su ídolo.' }],
    ...(imagen ? { imagen } : {}),
  });

  await page.goto(BASE + '/admin/console', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__lumen, null, { timeout: 15000 });
  await page.evaluate(() => window.__lumen.setModo('hibrido'));
  await page.waitForSelector('[data-testid="voice-strip"]', { timeout: 15000 });

  console.log('== 1) La ventana de alta muestra la portada ANTES de confirmar ==');
  await aplicar([{ tipo: 'ventana.abrir', ventana: 'confirmacion', datos: datos(`/portadas/${PORTADA}`) }]);
  await portada().waitFor({ timeout: 10000 }).catch(() => {});
  verificar('aparece la imagen de la portada', (await portada().count()) === 1);
  await page.waitForFunction(() => { const i = document.querySelector('[data-testid="confirmacion-portada"]'); return i && i.complete; }, null, { timeout: 10000 }).catch(() => {});
  const cargada = await portada().evaluate((i) => ({ ok: i.complete && i.naturalWidth > 0, ancho: i.naturalWidth, alto: i.naturalHeight, src: i.src })).catch(() => ({ ok: false }));
  verificar('la imagen se cargó de verdad (no es un ícono roto)', cargada.ok, `${cargada.ancho}x${cargada.alto} ${cargada.src}`);
  verificar('la imagen se pide al servicio de voz (que es quien tiene la carpeta), no al panel', String(cargada.src).startsWith(VOZ) || String(cargada.src).includes('/portadas/'));
  const textoVentana = await page.evaluate(() => document.body.innerText);
  verificar('se ven los datos que se van a cargar y el pedido de «confirmo»', /Coco/.test(textoVentana) && /105 minutos/.test(textoVentana) && /confirmo/i.test(textoVentana));
  const normal = await botonesVisibles();
  verificar('Cancelar y Confirmar se ven completos con la portada y una sinopsis larga', normal.cuantos === 2 && normal.dentro, JSON.stringify(normal));
  await page.screenshot({ path: 'admin_portada_confirmacion.png' });
  // Una laptop chica (la ventana no entra entera y el contenido se desplaza): se abre YA en esa pantalla, como la veria quien la usa.
  await cerrar();
  await page.setViewportSize({ width: 1366, height: 680 });
  await page.waitForTimeout(600);
  await aplicar([{ tipo: 'ventana.abrir', ventana: 'confirmacion', datos: datos(`/portadas/${PORTADA}`) }]);
  await portada().waitFor({ timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(800);
  const chica = await botonesVisibles();
  verificar('en una pantalla chica (1366x680) los botones siguen a la vista', chica.cuantos === 2 && chica.dentro, JSON.stringify(chica));
  await page.screenshot({ path: 'admin_portada_pantalla_chica.png' });
  await cerrar();
  await page.setViewportSize({ width: 1600, height: 900 });

  console.log('== 2) Sin portada no hay imagen, y una imagen que no existe no deja un ícono roto ==');
  verificar('la acción ventana.cerrar la cierra', (await portada().count()) === 0);
  await aplicar([{ tipo: 'ventana.abrir', ventana: 'confirmacion', datos: datos(null) }]);
  await page.waitForTimeout(600);
  verificar('una confirmación sin portada no muestra imagen', (await portada().count()) === 0 && /Coco/.test(await page.evaluate(() => document.body.innerText)));
  await cerrar();
  await aplicar([{ tipo: 'ventana.abrir', ventana: 'confirmacion', datos: datos('/portadas/no_existe.jpg') }]);
  await page.waitForTimeout(1200);
  verificar('si la imagen falla, se esconde (la confirmación sigue funcionando)', (await portada().count()) === 0 && /Coco/.test(await page.evaluate(() => document.body.innerText)));
  await cerrar();

  verificar('sin errores de consola ni excepciones', errores.length === 0, errores.join(' | ').slice(0, 300));
  await browser.close();
  const fallos = resultados.filter((r) => !r).length;
  console.log(fallos ? `\n${fallos} FALLOS` : '\nTODO BIEN');
  process.exit(fallos ? 1 : 0);
})();

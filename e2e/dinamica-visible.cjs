// Voz + UI Dinamica: se ve lo que hace el agente MIENTRAS habla, sin cambiar a "Solo Voz".
// Comprueba, en un navegador real y con el backend real:
//   1. Al entrar a "Voz + UI Dinamica" se sigue viendo la app (no aparece la pantalla de Solo Voz), el panel de voz queda
//      DEBAJO del selector de modo (no flotando abajo) y la barra inferior no ofrece pasar a Solo Voz.
//   2. "Mostrame la cartelera": la pantalla va sola a la cartelera y muestra las peliculas; el panel muestra lo que se
//      entendio y lo que contesta, y al terminar de hablar VUELVE SOLO a "escuchando" (sin la respuesta vieja).
//   3. "Quiero entradas para X": la tarjeta de X se RESALTA y su horario se marca ANTES de saltar a los asientos
//      (se mide el orden en el tiempo), y despues la pantalla pasa a los asientos con la funcion elegida.
//   4. Si el usuario ya esta en los asientos y solo cambia la funcion, no lo saca de ahi.
//   7. Las ventanas flotantes se abren debajo del panel, la de confirmacion se cierra al completarse la compra y el
//      ticket no queda flotando al salir de la compra.
//   8. Un error de UN turno ("no pude procesar la frase") se muestra y se va solo; no queda pegado.
// NO confirma nada (no escribe en la base compartida): los pasos 7 y 8 inyectan acciones/eventos en el navegador.
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
      window.__ws = w; // para inyectar eventos del servidor desde la prueba (ver el paso 8)
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

  console.log('== 0) Sin compra en curso la pantalla queda limpia: el modo se cambia SOLO con el selector de arriba ==');
  await page.goto(BASE + '/cartelera', { waitUntil: 'networkidle' });
  verificar('no hay barra inferior (no hay compra en curso)', (await page.getByTestId('barra-compra').count()) === 0);
  verificar('no hay "Llamar Asistente" ni "Cambiar a Modo Voz Lumina" (el selector de arriba ya cambia de modo)', (await page.getByText('Llamar Asistente').count()) === 0 && (await page.getByText('Cambiar a Modo Voz Lumina').count()) === 0);

  console.log('\n== 1) Entro a "Voz + UI Dinámica" desde el INICIO ==');
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /Voz \+ UI Din/ }).first().click({ timeout: 8000 });
  await page.waitForSelector('[data-testid="voice-strip"]', { timeout: 15000 });
  await page.waitForFunction(() => window.__ev.some((e) => e.type === 'ready'), null, { timeout: 20000 });
  let texto = await pantalla();
  verificar('NO aparece la pantalla de Solo Voz', !/Canal de Voz Bidireccional/i.test(texto) && !page.url().endsWith('/voz'), page.url());
  verificar('se sigue viendo el Inicio de la app', /LUMEN/i.test(texto) && page.url().replace(BASE, '') === '/');
  verificar('sigue sin haber barra inferior ni botones de cambio de modo abajo', (await page.getByTestId('barra-compra').count()) === 0 && (await page.getByText('Llamar Asistente').count()) === 0 && (await page.getByText('Cambiar a Modo Voz Lumina').count()) === 0);
  const selector = await page.getByTestId('mode-switcher').boundingBox();
  const panel = await page.getByTestId('voice-strip').boundingBox();
  const ancho = await page.evaluate(() => document.documentElement.clientWidth);
  verificar('el panel de voz queda DEBAJO del selector de modo', !!selector && !!panel && panel.y >= selector.y + selector.height - 2, selector && panel ? `selector termina en y=${Math.round(selector.y + selector.height)}, panel empieza en y=${Math.round(panel.y)}` : '');
  verificar('es UNA sola franja pegada al selector: sin huecos y de borde a borde', !!selector && !!panel && Math.abs(panel.y - (selector.y + selector.height)) <= 2 && panel.x <= 1 && panel.width >= ancho - 2, panel ? `x=${Math.round(panel.x)}, ancho=${Math.round(panel.width)} de ${ancho}` : '');
  verificar('no hay un panel flotante abajo (es uno solo, arriba)', (await page.getByTestId('voice-dock').count()) === 0);
  verificar('recien abierto muestra "escuchando" y los textos en blanco', /Escucha/i.test(await page.getByTestId('strip-estado').innerText()) && (await page.getByTestId('strip-transcript-vacio').count()) === 1 && (await page.getByTestId('strip-respuesta-vacio').count()) === 1);
  await page.screenshot({ path: 'dv1_inicio_con_asistente.png' });

  console.log('\n== 2) "Mostrame la cartelera": la pantalla va sola a la cartelera ==');
  await decir('Mostrame la cartelera');
  await page.waitForURL('**/cartelera', { timeout: 10000 }).catch(() => {});
  const tTarjetas = Date.now();
  const llegaron = await page.waitForFunction(() => document.querySelectorAll('.movie-card').length > 0, null, { timeout: 20000 }).then(() => true).catch(() => false);
  verificar('navego a /cartelera sin que nadie toque nada', page.url().endsWith('/cartelera'), page.url());
  verificar('se ven las peliculas', llegaron, `${await page.locator('.movie-card').count()} tarjetas, ${Date.now() - tTarjetas} ms despues de navegar`);
  verificar('sigue el panel de voz arriba (no cambio a Solo Voz)', (await page.getByTestId('voice-strip').count()) === 1 && !/Canal de Voz Bidireccional/i.test(await pantalla()));
  verificar('mientras responde muestra lo que se le entendio y lo que contesta', (await page.getByTestId('strip-transcript').innerText()).includes('cartelera') && (await page.getByTestId('strip-respuesta').count()) === 1);
  await page.screenshot({ path: 'dv2_cartelera.png' });
  // Cuando el agente termina de hablar el panel vuelve solo a "escuchando": no se queda con la respuesta de la accion anterior.
  await page.waitForSelector('[data-testid="strip-respuesta-vacio"]', { timeout: 40000 }).catch(() => {});
  verificar('al terminar de hablar el panel VUELVE SOLO a "escuchando" (sin la respuesta vieja)', (await page.getByTestId('strip-respuesta-vacio').count()) === 1 && (await page.getByTestId('strip-transcript-vacio').count()) === 1 && /Escucha/i.test(await page.getByTestId('strip-estado').innerText()));

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
  verificar('ahora SI hay barra inferior (hay compra en curso) y es solo el resumen y el boton de avanzar', (await page.getByTestId('barra-compra').count()) === 1 && (await page.getByTestId('barra-compra').innerText()).includes('Ir al Candy Bar') && (await page.getByText('Llamar Asistente').count()) === 0 && (await page.getByText('Cambiar a Modo Voz Lumina').count()) === 0);
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

  console.log('\n== 7) Ventanas flotantes: debajo del panel de voz y sin dejar cosas viejas ==');
  const abrirConfirmacion = { tipo: 'ventana.abrir', ventana: 'confirmacion', datos: { titulo: 'Confirmá tu compra', resumen: '2 entradas para Prueba, asientos C4 y C5', total: 70, metodoPago: 'efectivo', aviso: 'Recordá que las entradas no tienen reembolso.' } };
  await page.evaluate((a) => window.__lumen.aplicarUi([a]), abrirConfirmacion);
  await page.waitForSelector('[data-ventana="Confirmá tu compra"]', { timeout: 5000 });
  const panelAbajo = await page.getByTestId('voice-strip').boundingBox();
  const ventana = await page.locator('[data-ventana="Confirmá tu compra"]').boundingBox();
  verificar('la ventana se abre DEBAJO del panel de voz (no tapa el selector ni lo que se dice)', !!ventana && !!panelAbajo && ventana.y >= panelAbajo.y + panelAbajo.height, ventana && panelAbajo ? `ventana y=${Math.round(ventana.y)}, panel termina en ${Math.round(panelAbajo.y + panelAbajo.height)}` : '');
  verificar('la ventana entra en pantalla (no se sale por abajo)', !!ventana && ventana.y + ventana.height <= 900, ventana ? `termina en ${Math.round(ventana.y + ventana.height)} de 900` : '');
  await page.screenshot({ path: 'dv5_ventana_confirmacion.png' });
  // El servidor de esta prueba puede no mandar el cierre (ya lo manda el codigo nuevo): la pantalla igual lo resuelve sola.
  const ticket = { tipo: 'ventana.abrir', ventana: 'ticket', datos: { venta: { idVenta: 999, total: '70.00' }, pelicula: 'Prueba', funcion: null, sala: 'Sala de prueba', asientos: ['C4', 'C5'], dulceria: [] } };
  await page.evaluate((t) => window.__lumen.aplicarUi([{ tipo: 'compra.completada', venta: null }, t]), ticket);
  await page.waitForSelector('[data-ventana="Entrada digital"]', { timeout: 5000 });
  await page.waitForTimeout(400);
  verificar('al completarse la compra la confirmacion ("Deci confirmo") se CIERRA sola', (await page.locator('[data-ventana="Confirmá tu compra"]').count()) === 0);
  verificar('y queda la entrada digital a la vista', (await page.locator('[data-ventana="Entrada digital"]').count()) === 1);
  verificar('la barra inferior desaparece: ya no hay nada que "Confirmar y Pagar"', (await page.getByTestId('barra-compra').count()) === 0);
  await page.screenshot({ path: 'dv6_ticket_sin_confirmacion.png' });
  await page.evaluate(() => window.__lumen.aplicarUi([{ tipo: 'navegar', destino: 'cartelera' }]));
  await page.waitForTimeout(600);
  verificar('al salir de la compra el ticket no queda flotando sobre la cartelera', (await page.locator('[data-ventana="Entrada digital"]').count()) === 0 && page.url().endsWith('/cartelera'), page.url());

  console.log('\n== 8) Un error de un turno se muestra y se va solo ==');
  await page.evaluate(() => {
    const emitir = (o) => window.__ws.dispatchEvent(new MessageEvent('message', { data: JSON.stringify(o) }));
    emitir({ type: 'transcript', text: 'Quiero juntos en el medio' });
    emitir({ type: 'error', message: 'Ocurrió un error procesando la frase.' });
    emitir({ type: 'state', value: 'escuchando' });
  });
  await page.waitForTimeout(300);
  verificar('se ve lo que se dijo y el error de ese turno', (await page.getByTestId('strip-transcript').innerText()).includes('juntos en el medio') && /error procesando/i.test(await page.getByTestId('strip-error').innerText().catch(() => '')));
  await page.screenshot({ path: 'dv7_error_de_turno.png' });
  await page.waitForSelector('[data-testid="strip-error"]', { state: 'detached', timeout: 8000 }).catch(() => {});
  verificar('pasado un momento el panel vuelve a "escuchando" y el error no queda pegado', (await page.getByTestId('strip-error').count()) === 0 && (await page.getByTestId('strip-transcript-vacio').count()) === 1 && (await page.getByTestId('strip-respuesta-vacio').count()) === 1);

  console.log('\nerrores de la pagina:', errores.length ? errores : 'ninguno');
  verificar('sin errores en consola', errores.length === 0);
  const ok = resultados.every(Boolean);
  console.log(`\nRESULTADO: ${resultados.filter(Boolean).length}/${resultados.length} verificaciones OK`);
  await browser.close();
  process.exit(ok ? 0 : 1);
})().catch((e) => { console.error('ERROR', e); process.exit(2); });

// Los filtros de la cartelera que mueve el agente de voz (día, SALA y TURNO): la pantalla real los aplica en los mismos chips que se tocan a mano y muestra
// las mismas películas que el agente dice. No usa el modelo (inyecta las acciones que mandaría el servidor) y no escribe nada en la base compartida.
// Uso: SILENCIO_WAV=/ruta/silencio.wav node e2e/cartelera-filtros.cjs      (ver e2e/README.md)
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

(async () => {
  const login = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre: NOMBRE, rol: 'cliente' }) });
  const token = (await login.json()).access_token;

  // Lo que DEBERIA verse, calculado aparte con las mismas reglas de la cartelera: funciones programadas que todavia no empezaron.
  const [peliculas, funciones] = await Promise.all([fetch(`${API}/peliculas`).then((r) => r.json()), fetch(`${API}/funciones`).then((r) => r.json())]);
  const ahora = new Date();
  const futuras = funciones.filter((f) => f.estado === 'programada' && f.horaInicio && f.idSala && f.sala && new Date(`${f.fecha}T${f.horaInicio}`) >= ahora);
  const activas = peliculas.filter((p) => p.estado === 'activa');
  const franjaDe = (h) => (h < '15:00:00' ? 'mañana' : h < '19:00:00' ? 'tarde' : 'noche');
  const esperadas = ({ sala = null, franja = null, dia = null }) => {
    if (!sala && !franja && !dia) return activas.length;
    const ids = new Set(futuras.filter((f) => (!dia || f.fecha === dia) && (!sala || f.sala.tipo === sala) && (!franja || franjaDe(f.horaInicio) === franja)).map((f) => f.idPelicula));
    return activas.filter((p) => ids.has(p.idPelicula)).length;
  };
  const tipos = [...new Set(futuras.map((f) => f.sala.tipo).filter(Boolean))].sort();
  console.log(`   (datos reales: ${activas.length} películas activas, ${futuras.length} funciones futuras, salas: ${tipos.join(', ')})`);
  const sala = tipos.includes('VIP') ? 'VIP' : tipos[tipos.length - 1];
  const otraSala = tipos.find((t) => t !== sala);

  const browser = await chromium.launch({
    executablePath: EDGE, headless: true,
    args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream', `--use-file-for-fake-audio-capture=${SILENCIO}`, '--autoplay-policy=no-user-gesture-required'],
  });
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 }, permissions: ['microphone'] });
  await ctx.addInitScript((t) => localStorage.setItem('lumen_token', t), token);
  const page = await ctx.newPage();
  const errores = [];
  page.on('pageerror', (e) => errores.push('PAGEERROR ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('favicon') && !m.text().includes('404')) errores.push('console.error ' + m.text()); });

  await page.goto(`${BASE}/cartelera`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__lumen, null, { timeout: 20000 });
  await page.evaluate(() => window.__lumen.setModo('hibrido'));           // las acciones del agente solo se aplican con pantalla (Voz + UI Dinámica)
  await page.waitForFunction(() => /mostrando \d+ t/i.test(document.body.innerText), null, { timeout: 20000 });   // el texto lleva `uppercase`: innerText lo devuelve en mayúsculas

  const aplicar = (acciones) => page.evaluate((a) => window.__lumen.aplicarUi(a), acciones);
  const filtrar = (f) => aplicar([{ tipo: 'cartelera.filtrar', busqueda: null, dia: null, sala: null, franja: null, ...f }]);
  const titulos = () => page.evaluate(() => Number((document.body.innerText.match(/mostrando (\d+) t/i) || [])[1]));
  // El chip activo de una fila de filtros ("Sala:" u "Horario:"): el de fondo primario.
  const chipActivo = (rotulo) => page.evaluate((r) => {
    const span = [...document.querySelectorAll('span')].find((s) => s.textContent.trim() === r);
    const fila = span && span.parentElement;
    const activo = fila && [...fila.querySelectorAll('button')].find((b) => /(^| )bg-primary( |$)/.test(b.className));
    return activo ? activo.textContent.replace(/\s+/g, ' ').trim() : null;
  }, rotulo);
  const asentar = () => page.waitForTimeout(500);

  console.log('\n1) Sin filtros: "Todas" y "Todos" activos, todas las películas');
  verificar('sala = Todas', /Todas/.test((await chipActivo('Sala:')) || ''));
  verificar('horario = Todos', /Todos/.test((await chipActivo('Horario:')) || ''));
  verificar('muestra todas las películas activas', (await titulos()) === esperadas({}), `${await titulos()} de ${esperadas({})}`);

  console.log(`\n2) El agente filtra por SALA (${sala})`);
  await filtrar({ sala });
  await asentar();
  verificar(`el chip de sala pasa a ${sala}`, ((await chipActivo('Sala:')) || '').includes(sala), await chipActivo('Sala:'));
  verificar('el horario sigue en Todos', /Todos/.test((await chipActivo('Horario:')) || ''));
  verificar('muestra las mismas películas que dice el agente', (await titulos()) === esperadas({ sala }), `${await titulos()} vs ${esperadas({ sala })}`);

  console.log('\n3) …y por TURNO (noche): los dos filtros juntos');
  await filtrar({ sala, franja: 'noche' });
  await asentar();
  verificar('sala sigue en ' + sala, ((await chipActivo('Sala:')) || '').includes(sala));
  verificar('el chip de horario pasa a Noche', /Noche/.test((await chipActivo('Horario:')) || ''), await chipActivo('Horario:'));
  verificar('cuenta igual que el agente', (await titulos()) === esperadas({ sala, franja: 'noche' }), `${await titulos()} vs ${esperadas({ sala, franja: 'noche' })}`);

  if (otraSala) {
    console.log(`\n4) Cambiar de sala (${otraSala}) con el turno puesto: se manda el filtro COMPLETO`);
    await filtrar({ sala: otraSala, franja: 'noche' });
    await asentar();
    verificar('el chip de sala cambia', ((await chipActivo('Sala:')) || '').includes(otraSala), await chipActivo('Sala:'));
    verificar('cuenta igual que el agente', (await titulos()) === esperadas({ sala: otraSala, franja: 'noche' }), `${await titulos()} vs ${esperadas({ sala: otraSala, franja: 'noche' })}`);
  }

  console.log('\n5) "Todas las salas": lo que no viaja se quita, el turno se queda');
  await filtrar({ franja: 'noche' });
  await asentar();
  verificar('sala vuelve a Todas', /Todas/.test((await chipActivo('Sala:')) || ''), await chipActivo('Sala:'));
  verificar('el turno sigue en Noche', /Noche/.test((await chipActivo('Horario:')) || ''));

  console.log('\n6) "Sin filtros"');
  await filtrar({});
  await asentar();
  verificar('sala = Todas y horario = Todos', /Todas/.test((await chipActivo('Sala:')) || '') && /Todos/.test((await chipActivo('Horario:')) || ''));
  verificar('vuelven todas las películas', (await titulos()) === esperadas({}), `${await titulos()}`);

  console.log('\n7) Elegir una película en la compra: "mostrar" limpia los filtros y el filtro de sala viaja DESPUÉS (así se ven solo los horarios de esa sala)');
  const idPelicula = futuras.find((f) => f.sala.tipo === sala)?.idPelicula;
  await aplicar([{ tipo: 'cartelera.mostrar', ids: [idPelicula] }, { tipo: 'cartelera.filtrar', busqueda: null, dia: null, sala, franja: null }]);
  await asentar();
  verificar('queda filtrada por la sala elegida', ((await chipActivo('Sala:')) || '').includes(sala), await chipActivo('Sala:'));
  verificar('la película sigue a la vista', await page.evaluate((id) => !!document.getElementById(`pelicula-${id}`), idPelicula));

  console.log('\n8) Lo que se toca a mano sigue funcionando después de que el agente filtró');
  await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.replace(/\s+/g, ' ').trim().endsWith('Todas'))?.click());
  await asentar();
  verificar('tocar "Todas" quita la sala', /Todas/.test((await chipActivo('Sala:')) || ''), await chipActivo('Sala:'));
  await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => /Tarde/.test(b.textContent))?.click());
  await asentar();
  verificar('tocar "Tarde" filtra por turno', /Tarde/.test((await chipActivo('Horario:')) || ''), await chipActivo('Horario:'));

  verificar('sin errores en la consola ni excepciones en la página', errores.length === 0, errores.slice(0, 3).join(' | '));
  await browser.close();

  const fallos = resultados.filter((r) => !r).length;
  console.log(`\n${fallos === 0 ? 'TODO OK' : `${fallos} FALLO(S)`} (${resultados.length} comprobaciones)`);
  process.exit(fallos === 0 ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(2); });

// "Mis compras" muestra SOLO lo que compró quien tiene la sesión abierta. Abre la pantalla real con la sesión de cada usuario (dos clientes y un
// administrador) y compara lo que se dibuja contra la base: ninguna compra ajena, ninguna propia que falte, y la pantalla pide
// `/ventas/mis-compras` (no `/ventas`, que a un administrador le devuelve las de todos). Solo lee: no crea ni cambia nada.
// Uso: node e2e/mis-compras.cjs      (necesita el backend con `GET /ventas/mis-compras`: reconstruir la imagen si es viejo)
const { chromium } = require('playwright-core');

const EDGE = process.env.EDGE_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const BASE = process.env.BASE_URL || 'http://localhost:3000';
const API = process.env.BACKEND_URL || 'http://localhost:3333/api';
const CLIENTES = (process.env.CLIENTES || 'Hebert Suárez burgos,Luis Fernando').split(',');
const ADMIN = process.env.ADMIN || 'Admin Lumen';

const resultados = [];
function verificar(nombre, ok, detalle = '') {
  resultados.push(ok);
  console.log(`   ${ok ? 'OK   ' : 'FALLO'} ${nombre}${detalle ? '  -> ' + detalle : ''}`);
}

const login = async (nombre, rol) => {
  const r = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre, rol }) });
  const cuerpo = await r.json();
  if (!cuerpo.access_token) throw new Error(`No se pudo iniciar sesión como ${nombre} (${rol}): ${JSON.stringify(cuerpo)}`);
  return cuerpo.access_token;
};
const idDelToken = (t) => JSON.parse(Buffer.from(t.split('.')[1], 'base64url').toString()).sub;
const api = async (ruta, token) => (await fetch(API + ruta, { headers: { Authorization: `Bearer ${token}` } })).json();

/** Abre "Mis compras" con esa sesión y devuelve los números de compra dibujados, las rutas de ventas que pidió y los errores de consola. */
async function abrirMisCompras(browser, token) {
  const ctx = await browser.newContext({ viewport: { width: 1300, height: 900 } });
  await ctx.addInitScript((t) => localStorage.setItem('lumen_token', t), token);
  const page = await ctx.newPage();
  const errores = [];
  const pedidas = [];
  page.on('pageerror', (e) => errores.push('PAGEERROR ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('404')) errores.push(m.text()); });
  page.on('request', (rq) => { const u = new URL(rq.url()); if (u.pathname.startsWith('/api/ventas')) pedidas.push(u.pathname.replace('/api', '')); });
  await page.goto(BASE + '/mis-compras', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !document.body.innerText.includes('Cargando tus compras'), null, { timeout: 15000 });
  const textos = await page.locator('span', { hasText: /^Compra #\d+/ }).allInnerTexts();
  const ids = textos.map((t) => Number(t.match(/#(\d+)/)[1]));
  const vacio = await page.getByText('Todavía no compraste ninguna entrada.').count();
  // La fila sigue abriéndose con el mouse y con el teclado, y «Boleto» abre su ventana sin abrir la fila.
  let interaccion = null;
  const filas = page.locator('[role="button"][aria-expanded]');
  if (await filas.count()) {
    const primera = filas.first();
    await primera.click();
    const conMouse = await page.getByText('Asientos', { exact: true }).first().waitFor({ timeout: 8000 }).then(() => true).catch(() => false);
    await primera.press('Enter');
    const cerroConEnter = (await primera.getAttribute('aria-expanded')) === 'false';
    await primera.press('Space');
    const abrioConEspacio = (await primera.getAttribute('aria-expanded')) === 'true';
    await primera.press('Space');
    await primera.getByRole('button', { name: /Boleto/ }).click();
    const boleto = await page.getByText(/Boleto|Imprimir/i).count();
    const filaSigueCerrada = (await primera.getAttribute('aria-expanded')) === 'false';
    interaccion = { conMouse, cerroConEnter, abrioConEspacio, boleto: boleto > 0, filaSigueCerrada };
  }
  await ctx.close();
  return { ids, pedidas, errores, vacio, interaccion };
}

(async () => {
  const tokenAdmin = await login(ADMIN, 'administrador');
  const todas = await api('/ventas', tokenAdmin); // la verdad: todas las ventas con su dueño
  const dueño = new Map(todas.map((v) => [v.idVenta, v.idUsuarioCliente]));
  const browser = await chromium.launch({ executablePath: EDGE, headless: true });

  for (const nombre of CLIENTES) {
    const token = await login(nombre, 'cliente');
    const yo = idDelToken(token);
    const propias = todas.filter((v) => v.idUsuarioCliente === yo).map((v) => v.idVenta).sort((a, b) => a - b);
    console.log(`\n== Cliente «${nombre}» (id ${yo}) — la base dice que compró ${propias.length} ==`);
    const { ids, pedidas, errores, vacio, interaccion } = await abrirMisCompras(browser, token);
    const ajenas = ids.filter((id) => dueño.get(id) !== yo);
    verificar('pide /ventas/mis-compras y no el listado general', pedidas.includes('/ventas/mis-compras') && !pedidas.includes('/ventas'), pedidas.join(', '));
    verificar('no aparece ninguna compra de otra persona', ajenas.length === 0, ajenas.length ? 'ajenas: ' + ajenas.join(', ') : `${ids.length} compras, todas suyas`);
    verificar('aparecen todas las suyas (ni una de más ni una de menos)', JSON.stringify([...ids].sort((a, b) => a - b)) === JSON.stringify(propias), `dibujadas ${ids.length} / en la base ${propias.length}`);
    if (propias.length === 0) verificar('sin compras propias muestra el aviso vacío', vacio === 1);
    if (interaccion) {
      verificar('la fila se abre con el mouse y muestra los asientos', interaccion.conMouse);
      verificar('la fila se cierra con Enter y se abre con Espacio', interaccion.cerroConEnter && interaccion.abrioConEspacio, JSON.stringify(interaccion));
      verificar('«Boleto» abre su ventana sin abrir la fila', interaccion.boleto && interaccion.filaSigueCerrada, JSON.stringify(interaccion));
    }
    verificar('sin errores en la consola (ni botón dentro de botón)', errores.length === 0, errores.join(' | '));
  }

  console.log(`\n== Administrador «${ADMIN}» (id ${idDelToken(tokenAdmin)}) — hay ${todas.length} ventas en total, pero "Mis compras" es solo lo suyo ==`);
  const idAdmin = idDelToken(tokenAdmin);
  const propiasAdmin = todas.filter((v) => v.idUsuarioCliente === idAdmin).map((v) => v.idVenta);
  const a = await abrirMisCompras(browser, tokenAdmin);
  verificar('no le vuelca las ventas de todos', a.ids.length === propiasAdmin.length, `dibujadas ${a.ids.length} / suyas ${propiasAdmin.length} / total ${todas.length}`);
  verificar('no aparece ninguna compra ajena', a.ids.every((id) => dueño.get(id) === idAdmin));
  if (propiasAdmin.length === 0) verificar('sin compras propias muestra el aviso vacío', a.vacio === 1);
  verificar('sin errores en la consola', a.errores.length === 0, a.errores.join(' | '));

  await browser.close();
  const fallos = resultados.filter((r) => !r).length;
  console.log(`\n${fallos === 0 ? 'TODO OK' : fallos + ' FALLO(S)'} — ${resultados.length} comprobaciones`);
  process.exit(fallos === 0 ? 0 : 1);
})().catch((e) => { console.error('ERROR', e); process.exit(1); });

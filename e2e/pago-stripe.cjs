// El pago de la compra (tarjeta con Stripe y efectivo), en un navegador real, SIN backend ni Stripe reales: la API del backend se simula con
// `page.route` y Stripe.js se reemplaza por una version de mentira que emula los tres campos de tarjeta y sus eventos (change / focus / ready).
// Sirve para probar TODO lo que es nuestro: el orden de las llamadas, que la venta se cree una sola vez aunque haya reintentos, que el navegador
// verifique con el servidor, la tarjeta virtual que gira con el CVV, y lo que la pantalla le cuenta al agente de voz (que nunca lleva la tarjeta).
// Lo que NO puede probar es a Stripe de verdad (iframes, 3D Secure, moneda BOB): eso se prueba con las claves reales (ver el README del backend).
//
// Uso:  SILENCIO_WAV=/ruta/silencio.wav node e2e/pago-stripe.cjs
// No escribe nada en la base compartida (todo el backend es simulado). Necesita el frontend corriendo (BASE_URL, por defecto el 3000).
const { chromium } = require('playwright-core');

const EDGE = process.env.EDGE_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const BASE = process.env.BASE_URL || 'http://localhost:3000';
const SILENCIO = process.env.SILENCIO_WAV;
const API = 'http://localhost:3333/api'; // es lo que usa el frontend por defecto (VITE_API_URL)
const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' };
const TARJETA = '4242424242424242';

// ------------------------------------------------------------------------------------------------ Stripe.js de mentira

const STRIPE_DE_MENTIRA = `
(function () {
  const estado = (window.__stripeStub = { confirmaciones: [], modo: 'ok' });
  const luhn = (n) => { let s = 0, alt = false; for (let i = n.length - 1; i >= 0; i--) { let d = +n[i]; if (alt) { d *= 2; if (d > 9) d -= 9; } s += d; alt = !alt; } return s % 10 === 0; };
  const marca = (n) => (n.startsWith('4') ? 'visa' : /^5[1-5]/.test(n) ? 'mastercard' : /^3[47]/.test(n) ? 'amex' : 'unknown');
  function crearElemento(tipo, opciones) {
    const manejadores = {};
    const emitir = (ev, datos) => (manejadores[ev] || []).forEach((f) => f(datos));
    let entrada = null;
    const el = {
      mount(nodo) {
        entrada = document.createElement('input');
        entrada.setAttribute('data-stripe-stub', tipo);
        entrada.placeholder = (opciones && opciones.placeholder) || '';
        entrada.style.cssText = 'width:100%;background:transparent;color:#fff;border:0;outline:0;font-size:17px';
        nodo.appendChild(entrada);
        entrada.addEventListener('focus', () => emitir('focus', { elementType: tipo }));
        entrada.addEventListener('blur', () => emitir('blur', { elementType: tipo }));
        entrada.addEventListener('input', () => {
          const d = entrada.value.replace(/\\D/g, '');
          const cambio = { elementType: tipo, empty: d.length === 0, complete: false, error: undefined };
          if (tipo === 'cardNumber') {
            cambio.brand = marca(d);
            cambio.complete = d.length === 16 && luhn(d);
            if (d.length === 16 && !cambio.complete) cambio.error = { type: 'validation_error', code: 'invalid_number', message: 'Tu número de tarjeta no es válido.' };
          } else if (tipo === 'cardExpiry') {
            const mes = +d.slice(0, 2), anio = +d.slice(2, 4);
            cambio.complete = d.length === 4 && mes >= 1 && mes <= 12 && anio >= 26;
            if (d.length === 4 && !cambio.complete) cambio.error = { type: 'validation_error', code: 'invalid_expiry_year_past', message: 'El año de vencimiento de tu tarjeta ya pasó.' };
          } else {
            cambio.complete = d.length >= 3;
          }
          emitir('change', cambio);
        });
        setTimeout(() => emitir('ready', el), 0);
      },
      on(ev, f) { (manejadores[ev] = manejadores[ev] || []).push(f); return el; },
      off(ev, f) { manejadores[ev] = (manejadores[ev] || []).filter((g) => g !== f); return el; },
      update() {}, clear() { if (entrada) entrada.value = ''; }, blur() { if (entrada) entrada.blur(); }, focus() { if (entrada) entrada.focus(); },
      unmount() { if (entrada) entrada.remove(); }, destroy() { if (entrada) entrada.remove(); },
    };
    return el;
  }
  window.Stripe = function () {
    const creados = {};
    return {
      elements() {
        return {
          create(tipo, op) { const e = crearElemento(tipo, op); creados[tipo] = e; return e; },
          // Como el Stripe.js real, acepta el tipo ('cardNumber') o el componente de React (que trae __elementType).
          getElement(t) { const tipo = typeof t === 'string' ? t : t && t.__elementType; return creados[tipo] || null; },
          update() {}, fetchUpdates() { return Promise.resolve({}); },
        };
      },
      createToken() {}, createPaymentMethod() {},
      confirmCardPayment(secreto, datos) {
        estado.confirmaciones.push({ secreto, nombre: datos && datos.payment_method && datos.payment_method.billing_details && datos.payment_method.billing_details.name });
        if (estado.modo === 'rechazada') return Promise.resolve({ error: { type: 'card_error', code: 'card_declined', message: 'Tu tarjeta fue rechazada.' } });
        return Promise.resolve({ paymentIntent: { status: 'succeeded', id: 'pi_stub' } });
      },
    };
  };
})();`;

// ------------------------------------------------------------------------------------------------ mundo simulado

const jwt = (payload) => `${Buffer.from('{"alg":"none"}').toString('base64url')}.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.firma`;
const TOKEN = jwt({ sub: 5, nombre: 'Hebert Suárez', rol: 'cliente', exp: Math.floor(Date.now() / 1000) + 3600 });

const PELICULA = { idPelicula: 1, titulo: 'Oppenheimer', genero: 'Drama', duracionMin: 180, clasificacion: '+12 Años', estado: 'activa', posterUrl: null, sinopsis: null };
const FUNCION = { idFuncion: 12, idPelicula: 1, idSala: 1, idPrecio: 1, fecha: '2026-09-21', horaInicio: '20:30:00', horaFin: '23:30:00', tiempoLimpiezaMin: 15, estado: 'programada' };
const SALA = { idSala: 1, nombre: 'Sala 1', tipo: 'Estándar' };
const BUTACAS = ['D3', 'D4'].map((id, i) => ({ id, idAsiento: 133 + i, fila: 'D', columna: 3 + i, estado: 'seleccionada', precio: 35 }));
const ESTADO_INICIAL = (paso) => ({
  peliculas: [PELICULA], peliculaSeleccionada: PELICULA, horarioSeleccionado: '20:30', funcionSeleccionada: FUNCION, salaSeleccionada: SALA,
  disponibilidad: [], cargandoDisponibilidad: false, precioUnitario: '35.00', butacasSeleccionadas: BUTACAS, candyBarSeleccionado: [],
  estadoCompra: paso, ventaCreada: null, ventaPendiente: null,
});
const VENTA_BASE = { idUsuarioCliente: 5, idFuncion: 12, idPromocion: null, fechaHora: '2026-09-20T10:00:00', subtotal: '70.00', descuentoAplicado: '0.00', total: '70.00', confirmacionNoReembolso: true, confirmacionVerbalCheck: false, tipoRegistro: 'manual', estado: 'pendiente_pago', metodoPagoElegido: null, fechaPago: null, idPagoActivo: null };
const VENTA_POR_VOZ = { ...VENTA_BASE, idVenta: 55, confirmacionVerbalCheck: true, tipoRegistro: 'voz' };

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

function crearMundo(opciones = {}) {
  return { stripe: opciones.stripe !== false, iniciar409: false, retrasoMs: 350, ventas: 0, pagos: 0, venta: opciones.venta || null, llamadas: [], ws: { mensajes: [], enviar: null } };
}

function backendSimulado(mundo) {
  return async (route) => {
    const req = route.request();
    const ruta = new URL(req.url()).pathname.replace(/^\/api/, '');
    const metodo = req.method();
    if (metodo === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS });
    let cuerpo = null;
    try { cuerpo = req.postDataJSON(); } catch { /* sin cuerpo */ }
    mundo.llamadas.push({ metodo, ruta, cuerpo });
    const responder = (datos, status = 200) => route.fulfill({ status, headers: { ...CORS, 'content-type': 'application/json' }, body: JSON.stringify(datos) });

    if (metodo === 'GET' && ruta === '/pagos/config') {
      return responder({ stripe: mundo.stripe ? { habilitado: true, clavePublicable: 'pk_test_stub123', moneda: 'bob' } : { habilitado: false, clavePublicable: '', moneda: 'bob' } });
    }
    if (metodo === 'POST' && ruta === '/ventas') {
      await dormir(150);
      mundo.ventas += 1;
      mundo.venta = { ...VENTA_BASE, idVenta: 900 + mundo.ventas, tipoRegistro: cuerpo.tipoRegistro };
      return responder(mundo.venta, 201);
    }
    if (metodo === 'POST' && ruta === '/pagos/stripe/iniciar') {
      await dormir(mundo.retrasoMs);
      if (mundo.iniciar409) return responder({ message: `La venta ${cuerpo.idVenta} no está pendiente de pago (estado actual: cancelada).`, code: 'CONFLICT' }, 409);
      mundo.pagos += 1;
      return responder({ idPago: 500 + mundo.pagos, idVenta: cuerpo.idVenta, clientSecret: `pi_${mundo.pagos}_secret_x`, monto: '70.00', moneda: 'BOB' }, 201);
    }
    const verificar = ruta.match(/^\/pagos\/(\d+)\/verificar$/);
    if (metodo === 'POST' && verificar) {
      mundo.venta = { ...mundo.venta, estado: 'pagada', metodoPagoElegido: 'stripe', fechaPago: '2026-09-20T10:05:00', idPagoActivo: Number(verificar[1]) };
      return responder({ estado: 'exitoso', venta: mundo.venta, mensaje: null }, 201);
    }
    if (metodo === 'POST' && ruta === '/pagos') {
      mundo.venta = { ...mundo.venta, estado: 'pagada', metodoPagoElegido: cuerpo.metodo, fechaPago: '2026-09-20T10:05:00' };
      return responder(mundo.venta, 201);
    }
    if (metodo === 'POST' && /^\/pagos\/venta\/\d+\/cancelar$/.test(ruta)) {
      mundo.venta = { ...mundo.venta, estado: 'cancelada' };
      return responder(mundo.venta, 201);
    }
    if (metodo === 'GET' && /^\/precios\/\d+$/.test(ruta)) return responder({ idPrecio: 1, valor: '35.00' });
    if (metodo === 'GET' && /^\/salas\/\d+$/.test(ruta)) return responder(SALA);
    return responder(metodo === 'GET' ? [] : {});
  };
}

// ------------------------------------------------------------------------------------------------ armado de cada escenario

async function nuevaPagina(browser, mundo, { paso = 'pago', ruta = '/compra', conVoz = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1500, height: 1000 }, permissions: ['microphone'] });
  await ctx.addInitScript(([token, estado]) => {
    localStorage.setItem('lumen_token', token);
    sessionStorage.setItem('lumen_cine_state', JSON.stringify(estado));
  }, [TOKEN, ESTADO_INICIAL(paso)]);
  await ctx.route(`${API}/**`, backendSimulado(mundo));
  await ctx.route('https://js.stripe.com/**', (r) => r.fulfill({ status: 200, contentType: 'application/javascript', body: STRIPE_DE_MENTIRA }));
  const page = await ctx.newPage();
  const errores = [];
  page.on('pageerror', (e) => errores.push(`PAGEERROR ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error' && !/404|fonts\.g|ERR_INTERNET|net::/.test(m.text())) errores.push(m.text()); });
  if (conVoz) {
    // El agente de voz simulado: contesta el hello con "ready", guarda todo lo que le manda la pantalla y puede empujarle eventos.
    await page.routeWebSocket(/\/ws\/voz/, (ws) => {
      mundo.ws.enviar = (evento) => ws.send(JSON.stringify(evento));
      ws.onMessage((mensaje) => {
        if (typeof mensaje !== 'string') return; // el audio del microfono
        const dato = JSON.parse(mensaje);
        mundo.ws.mensajes.push(dato);
        if (dato.type === 'hello') ws.send(JSON.stringify({ type: 'ready', sesion_id: 'e2e', vad: { silencio_fin_ms: 700, umbral: 0.5 } }));
      });
    });
  }
  await page.goto(BASE + ruta, { waitUntil: 'domcontentloaded' });
  return { ctx, page, errores };
}

/** Con CAPTURAS=/carpeta guarda una imagen de la pantalla en los momentos clave (para revisar el diseño a ojo). */
const captura = async (page, nombre) => {
  if (process.env.CAPTURAS) await page.screenshot({ path: `${process.env.CAPTURAS}/${nombre}.png` });
};

const estadoCine = (page) => page.evaluate(() => JSON.parse(sessionStorage.getItem('lumen_cine_state') || '{}'));
const stub = (page) => page.evaluate(() => window.__stripeStub);
const campo = (page, tipo) => page.locator(`[data-stripe-stub="${tipo}"]`);

async function llenarTarjeta(page, { numero = TARJETA, vence = '1230', cvc = '123' } = {}) {
  await campo(page, 'cardNumber').fill(numero);
  await campo(page, 'cardExpiry').fill(vence);
  await campo(page, 'cardCvc').fill(cvc);
}

// ------------------------------------------------------------------------------------------------ verificaciones

const resultados = [];
const verificar = (escenario, texto, ok, detalle = '') => resultados.push({ escenario, texto, ok: !!ok, detalle });
const llamadasA = (mundo, metodo, ruta) => mundo.llamadas.filter((l) => l.metodo === metodo && (ruta instanceof RegExp ? ruta.test(l.ruta) : l.ruta === ruta));

async function tactilTarjetaAprobada(browser) {
  const E = 'Táctil · tarjeta aprobada';
  const mundo = crearMundo();
  const { ctx, page, errores } = await nuevaPagina(browser, mundo);
  await page.getByTestId('seccion-pago').waitFor({ timeout: 20000 });
  await campo(page, 'cardNumber').waitFor({ timeout: 10000 });

  verificar(E, 'el formulario de tarjeta está a la vista y el método por defecto es Tarjeta', (await page.getByTestId('pago-metodo-tarjeta').getAttribute('aria-checked')) === 'true');
  verificar(E, 'el modo prueba se avisa (clave pk_test_)', (await page.getByTestId('pago-modo-prueba').count()) === 1);
  verificar(E, 'el titular sale del nombre de la sesión, en mayúsculas, y ya está en la tarjeta', (await page.getByTestId('tarjeta-titular').innerText()) === 'HEBERT SUÁREZ');
  verificar(E, 'el total es el de las butacas', /70\.00/.test(await page.getByTestId('pago-total').innerText()));
  verificar(E, 'el botón de la barra de abajo no está: el cobro se hace con el botón del formulario', (await page.getByTestId('barra-pago-estado').count()) === 1 && (await page.getByText('Ir al Candy Bar').count()) === 0);
  verificar(E, 'sin datos ni aceptar la política de no reembolso el botón Pagar está deshabilitado', await page.getByTestId('pago-boton').isDisabled());
  await captura(page, '1-formulario-vacio');

  await campo(page, 'cardNumber').fill(TARJETA);
  verificar(E, 'al completar el número los puntos de la tarjeta quedan "completo" y aparece la marca (visa)', (await page.getByTestId('tarjeta-numero').getAttribute('data-estado')) === 'completo' && /visa/i.test(await page.getByTestId('pago-campo-numero').innerText()));
  verificar(E, 'y el cursor pasa solo al vencimiento', await page.evaluate(() => document.activeElement && document.activeElement.getAttribute('data-stripe-stub') === 'cardExpiry'));
  await captura(page, '2-numero-completo');
  await campo(page, 'cardExpiry').fill('1230');
  await page.waitForTimeout(900); // termina el giro de la tarjeta antes de la captura
  await captura(page, '3-reverso-cvv');
  verificar(E, 'al pasar al CVV la tarjeta se da vuelta', await page.evaluate(() => document.activeElement && document.activeElement.getAttribute('data-stripe-stub') === 'cardCvc') && (await page.getByTestId('tarjeta-virtual').getAttribute('data-volteada')) === 'si');
  await campo(page, 'cardCvc').fill('123');
  await page.getByText('Detalles del pago').click(); // saca el foco del CVV (no se hace click en la esquina cortada del marco: ahi no hay nada)
  await page.waitForTimeout(200);
  verificar(E, 'al salir del CVV la tarjeta vuelve al frente', (await page.getByTestId('tarjeta-virtual').getAttribute('data-volteada')) === 'no');
  await page.getByTestId('pago-girar').click();
  verificar(E, 'el botón "Ver reverso" también la gira', (await page.getByTestId('tarjeta-virtual').getAttribute('data-volteada')) === 'si');
  await page.getByTestId('pago-girar').click();
  verificar(E, 'con todo completo pero SIN aceptar el no reembolso, Pagar sigue deshabilitado (RF03 real, ya no fijo en true)', await page.getByTestId('pago-boton').isDisabled());

  await page.getByTestId('pago-acepta-noreembolso').check();
  verificar(E, 'aceptado el no reembolso y con todo completo, Pagar se habilita', await page.getByTestId('pago-boton').isEnabled());
  await page.getByTestId('pago-boton').click();
  await page.getByTestId('pago-procesando').waitFor({ timeout: 5000 });
  await captura(page, '4-procesando');
  verificar(E, 'se ve "Procesando transacción segura…" mientras se cobra', /procesando transacción segura/i.test(await page.getByTestId('pago-procesando').innerText())); // innerText respeta el uppercase del CSS
  verificar(E, 'y la barra de abajo también lo muestra', /Procesando pago/.test(await page.getByTestId('barra-pago-estado').innerText()));
  await page.getByTestId('pago-exito').waitFor({ timeout: 10000 });
  await page.waitForTimeout(500);
  await captura(page, '5-pago-exitoso');
  verificar(E, 'al aprobarse: "¡Pago exitoso!" y la tarjeta se vuelve verde con el check', /Pago exitoso/.test(await page.getByTestId('pago-exito').innerText()) && (await page.locator('[data-testid="tarjeta-virtual"] .text-tertiary').count()) >= 1);
  await page.getByText('¡Compra Confirmada con Éxito!').waitFor({ timeout: 10000 });

  const cine = await estadoCine(page);
  verificar(E, 'termina en la vista de compra confirmada con la venta PAGADA que devolvió el servidor', cine.estadoCompra === 'completado' && cine.ventaCreada?.estado === 'pagada' && cine.ventaCreada?.metodoPagoElegido === 'stripe');
  verificar(E, 'y ya no queda ninguna venta reservada esperando pago', cine.ventaPendiente === null);
  const orden = mundo.llamadas.filter((l) => l.metodo === 'POST').map((l) => l.ruta.replace(/\d+/g, 'N'));
  verificar(E, 'las llamadas van en orden: crear venta → iniciar cobro → verificar con el servidor', JSON.stringify(orden) === JSON.stringify(['/ventas', '/pagos/stripe/iniciar', '/pagos/N/verificar']), JSON.stringify(orden));
  const venta = llamadasA(mundo, 'POST', '/ventas')[0]?.cuerpo;
  verificar(E, 'la venta se crea con la aceptación del no reembolso, registro "manual" y los asientos reales', venta?.confirmacionNoReembolso === true && venta?.tipoRegistro === 'manual' && JSON.stringify(venta?.idAsientos) === '[133,134]', JSON.stringify(venta));
  const confirmaciones = (await stub(page)).confirmaciones;
  verificar(E, 'Stripe confirma con el clientSecret que dio el servidor y el nombre del titular', confirmaciones.length === 1 && confirmaciones[0].secreto === 'pi_1_secret_x' && confirmaciones[0].nombre === 'HEBERT SUÁREZ', JSON.stringify(confirmaciones));
  const todo = JSON.stringify(mundo.llamadas) + JSON.stringify(cine);
  verificar(E, 'el número de la tarjeta NO viaja al backend ni queda en el estado de la app', !todo.includes(TARJETA) && !todo.includes('4242'));
  verificar(E, 'sin errores en la consola', errores.length === 0, errores.join(' | '));
  await ctx.close();
}

async function tactilRechazoYReintento(browser) {
  const E = 'Táctil · rechazo y reintento';
  const mundo = crearMundo();
  const { ctx, page, errores } = await nuevaPagina(browser, mundo);
  await campo(page, 'cardNumber').waitFor({ timeout: 20000 });
  await page.evaluate(() => { window.__stripeStub.modo = 'rechazada'; });
  await llenarTarjeta(page);
  await page.getByTestId('pago-acepta-noreembolso').check();
  await page.getByTestId('pago-boton').click();
  await page.getByTestId('pago-error').waitFor({ timeout: 10000 });
  verificar(E, 'una tarjeta rechazada muestra el motivo de Stripe y deja corregir', /Tu tarjeta fue rechazada/.test(await page.getByTestId('pago-error').innerText()) && (await page.getByTestId('pago-boton').isEnabled()));
  let cine = await estadoCine(page);
  verificar(E, 'la venta queda RESERVADA (pendiente de pago), no se pierde ni se da por pagada', cine.ventaPendiente?.venta?.idVenta === 901 && cine.ventaCreada === null && cine.estadoCompra === 'pago');
  verificar(E, 'y no queda en "procesando"', (await page.getByTestId('seccion-pago').getAttribute('data-fase')) === 'editando');

  await page.evaluate(() => { window.__stripeStub.modo = 'ok'; });
  await page.getByTestId('pago-boton').click();
  await page.getByText('¡Compra Confirmada con Éxito!').waitFor({ timeout: 15000 });
  verificar(E, 'al reintentar NO se crea otra venta (una sola compra) y se inicia un cobro nuevo', mundo.ventas === 1 && llamadasA(mundo, 'POST', '/pagos/stripe/iniciar').length === 2, `ventas=${mundo.ventas}`);
  verificar(E, 'y el reintento usa la misma venta', llamadasA(mundo, 'POST', '/pagos/stripe/iniciar').every((l) => l.cuerpo.idVenta === 901));
  cine = await estadoCine(page);
  verificar(E, 'termina pagada', cine.ventaCreada?.estado === 'pagada');
  verificar(E, 'sin errores en la consola', errores.length === 0, errores.join(' | '));
  await ctx.close();
}

async function tactilEfectivo(browser) {
  const E = 'Táctil · efectivo';
  const mundo = crearMundo();
  const { ctx, page, errores } = await nuevaPagina(browser, mundo);
  await page.getByTestId('seccion-pago').waitFor({ timeout: 20000 });
  await page.getByTestId('pago-metodo-efectivo').click();
  await captura(page, '6-efectivo');
  verificar(E, 'sin tarjeta no hay campos de tarjeta ni tarjeta virtual: se ve el panel de efectivo', (await campo(page, 'cardNumber').count()) === 0 && (await page.getByTestId('tarjeta-virtual').count()) === 0 && /Pago en efectivo/.test(await page.getByTestId('seccion-pago').innerText()));
  verificar(E, 'igual hay que aceptar el no reembolso', await page.getByTestId('pago-boton').isDisabled());
  await page.getByTestId('pago-acepta-noreembolso').check();
  await page.getByTestId('pago-boton').click();
  await page.getByText('¡Compra Confirmada con Éxito!').waitFor({ timeout: 15000 });
  const orden = mundo.llamadas.filter((l) => l.metodo === 'POST').map((l) => `${l.ruta}${l.cuerpo?.metodo ? ':' + l.cuerpo.metodo : ''}`);
  verificar(E, 'crea la venta y la paga como efectivo (sin tocar Stripe)', JSON.stringify(orden) === JSON.stringify(['/ventas', '/pagos:efectivo']), JSON.stringify(orden));
  const cine = await estadoCine(page);
  verificar(E, 'termina pagada como efectivo', cine.ventaCreada?.estado === 'pagada' && cine.ventaCreada?.metodoPagoElegido === 'efectivo');
  verificar(E, 'sin errores en la consola', errores.length === 0, errores.join(' | '));
  await ctx.close();
}

async function sinStripeSoloEfectivo(browser) {
  const E = 'Sin Stripe configurado';
  const mundo = crearMundo({ stripe: false });
  const { ctx, page, errores } = await nuevaPagina(browser, mundo);
  await page.getByTestId('seccion-pago').waitFor({ timeout: 20000 });
  verificar(E, 'la tarjeta queda deshabilitada y el método es Efectivo', (await page.getByTestId('pago-metodo-tarjeta').isDisabled()) && (await page.getByTestId('pago-metodo-efectivo').getAttribute('aria-checked')) === 'true');
  verificar(E, 'no se carga Stripe ni se muestran campos de tarjeta', (await campo(page, 'cardNumber').count()) === 0);
  verificar(E, 'sin errores en la consola', errores.length === 0, errores.join(' | '));
  await ctx.close();
}

async function reservaVencida(browser) {
  const E = 'Reserva vencida';
  const mundo = crearMundo();
  mundo.iniciar409 = true;
  const { ctx, page } = await nuevaPagina(browser, mundo);
  await campo(page, 'cardNumber').waitFor({ timeout: 20000 });
  await llenarTarjeta(page);
  await page.getByTestId('pago-acepta-noreembolso').check();
  await page.getByTestId('pago-boton').click();
  await page.getByTestId('pago-error').waitFor({ timeout: 10000 });
  verificar(E, 'si el servidor dice que la venta ya no está pendiente se avisa que la reserva venció', /reserva venció/.test(await page.getByTestId('pago-error').innerText()));
  verificar(E, 'y se suelta la venta pendiente (no se sigue intentando cobrar algo que ya no existe)', (await estadoCine(page)).ventaPendiente === null);
  await ctx.close();
}

async function vozGuiada(browser) {
  const E = 'Voz · pago guiado';
  const mundo = crearMundo({ venta: VENTA_POR_VOZ });
  const { ctx, page, errores } = await nuevaPagina(browser, mundo, { paso: 'seleccionando_asientos', ruta: '/cartelera', conVoz: true });
  await page.waitForFunction(() => window.__lumen, null, { timeout: 20000 });
  await page.evaluate(() => window.__lumen.setModo('hibrido'));
  await page.waitForFunction(() => true);
  const esperar = (fn, ms = 15000) => { const fin = Date.now() + ms; return (async () => { while (Date.now() < fin) { if (fn()) return true; await dormir(100); } return false; })(); };

  verificar(E, 'al abrir la conversación con pantalla, se le avisa al agente que HAY pantalla (puede ofrecer tarjeta)', await esperar(() => mundo.ws.mensajes.some((m) => m.type === 'pantalla' && m.disponible === true)));

  // El agente creó la venta con el "confirmo" dicho y abre el formulario.
  mundo.ws.enviar({ type: 'ui_action', acciones: [{ tipo: 'pago.abrir', venta: VENTA_POR_VOZ }], v: 1 });
  await page.getByTestId('pago-guia-voz').waitFor({ timeout: 15000 });
  await campo(page, 'cardNumber').waitFor({ timeout: 10000 });
  verificar(E, 'la pantalla va sola al paso de pago y muestra el formulario con "Lumen te guía por voz"', page.url().endsWith('/compra'));
  verificar(E, 'no pide aceptar el no reembolso otra vez: ya se aceptó por voz', (await page.getByTestId('pago-acepta-noreembolso').count()) === 0 && /Aceptaste por voz/.test(await page.getByTestId('seccion-pago').innerText()));
  verificar(E, 'y el botón Pagar espera los datos de la tarjeta', await page.getByTestId('pago-boton').isDisabled());
  const cine0 = await estadoCine(page);
  verificar(E, 'la venta reservada por el agente queda como pendiente (con su huella)', cine0.ventaPendiente?.venta?.idVenta === 55 && typeof cine0.ventaPendiente?.firma === 'string');

  await captura(page, '7-voz-guia-inicio');
  await campo(page, 'cardNumber').fill(TARJETA);
  await captura(page, '8-voz-guia-vencimiento');
  await campo(page, 'cardExpiry').fill('1230');
  await campo(page, 'cardCvc').fill('123');
  await dormir(600);
  const fotos = mundo.ws.mensajes.filter((m) => m.type === 'pago_campos');
  const ultima = fotos[fotos.length - 1];
  verificar(E, 'la pantalla le cuenta al agente cómo va cada campo (solo estados) y el último dice que está todo completo', !!ultima && ultima.idVenta === 55 && ['numero', 'vencimiento', 'cvc'].every((c) => ultima.campos[c]?.completo === true), JSON.stringify(ultima));
  verificar(E, 'los estados son solo completo / vacio / error: nada de lo escrito', fotos.every((f) => JSON.stringify(Object.keys(f.campos)) === '["numero","vencimiento","cvc"]' && Object.values(f.campos).every((c) => JSON.stringify(Object.keys(c).sort()) === '["completo","error","vacio"]')));
  verificar(E, 'el número de la tarjeta NO viaja al agente por ningún mensaje', !JSON.stringify(mundo.ws.mensajes).includes('4242'));
  verificar(E, 'se manda una foto por cambio de estado, no una por tecla (se juntan)', fotos.length <= 5, `fotos=${fotos.length}`);

  // "pagar": el agente le pide a la pantalla que envíe el cobro.
  mundo.ws.enviar({ type: 'ui_action', acciones: [{ tipo: 'pago.enviar' }], v: 2 });
  await page.getByTestId('pago-exito').waitFor({ timeout: 15000 });
  verificar(E, 'con "pagar" se cobra SIN crear otra venta: usa la que reservó el agente', mundo.ventas === 0 && llamadasA(mundo, 'POST', '/pagos/stripe/iniciar')[0]?.cuerpo?.idVenta === 55);
  const antes = mundo.ws.mensajes.filter((m) => m.type === 'pago_evento').length;
  verificar(E, 'el agente NO recibe el "confirmado" durante la pausa de "Pago exitoso" (primero se ve, después se dice gracias)', antes === 0);
  await esperar(() => mundo.ws.mensajes.some((m) => m.type === 'pago_evento'), 8000);
  const evento = mundo.ws.mensajes.find((m) => m.type === 'pago_evento');
  verificar(E, 'después le avisa al agente que el pago terminó (él lo verifica con el backend antes de decir gracias)', evento?.evento === 'confirmado' && evento?.idVenta === 55, JSON.stringify(evento));
  const cine = await estadoCine(page);
  verificar(E, 'la pantalla ya tiene la venta pagada que confirmó el servidor', cine.ventaCreada?.estado === 'pagada' && cine.ventaPendiente === null && cine.estadoCompra === 'completado');
  // El agente verifica y manda cerrar: compra.completada + entrada digital.
  mundo.ws.enviar({ type: 'ui_action', acciones: [{ tipo: 'ventana.cerrar', ventana: 'confirmacion' }, { tipo: 'compra.completada', venta: mundo.venta }], v: 3 });
  await page.getByText('¡Compra Confirmada con Éxito!').waitFor({ timeout: 10000 });
  verificar(E, 'la pantalla vuelve a donde está la IA: compra confirmada con el panel de voz activo', (await page.getByTestId('voice-strip').count()) >= 1);
  verificar(E, 'sin errores en la consola', errores.length === 0, errores.join(' | '));
  await ctx.close();
}

async function vozCancelar(browser) {
  const E = 'Voz · cancelar el pago';
  const mundo = crearMundo({ venta: VENTA_POR_VOZ });
  const { ctx, page } = await nuevaPagina(browser, mundo, { paso: 'seleccionando_asientos', ruta: '/cartelera', conVoz: true });
  await page.waitForFunction(() => window.__lumen, null, { timeout: 20000 });
  await page.evaluate(() => window.__lumen.setModo('hibrido'));
  await dormir(1500);
  mundo.ws.enviar({ type: 'ui_action', acciones: [{ tipo: 'pago.abrir', venta: VENTA_POR_VOZ }], v: 1 });
  await page.getByTestId('pago-guia-voz').waitFor({ timeout: 15000 });
  mundo.ws.enviar({ type: 'ui_action', acciones: [{ tipo: 'pago.cancelar' }], v: 2 });
  await page.getByTestId('pago-info').waitFor({ timeout: 10000 });
  verificar(E, 'con "cancelar" se cancela la venta en el servidor (libera los asientos)', llamadasA(mundo, 'POST', /^\/pagos\/venta\/55\/cancelar$/).length === 1);
  await dormir(400);
  const evento = mundo.ws.mensajes.find((m) => m.type === 'pago_evento');
  verificar(E, 'y recién entonces le avisa al agente que quedó cancelado', evento?.evento === 'cancelado' && evento?.idVenta === 55, JSON.stringify(evento));
  verificar(E, 'se queda en el pago (el agente dice cómo seguir) y ya no hay venta reservada', (await estadoCine(page)).ventaPendiente === null && page.url().endsWith('/compra'));
  await ctx.close();
}

async function soloVozSinPantalla(browser) {
  const E = 'Solo Voz';
  const mundo = crearMundo();
  const { ctx, page } = await nuevaPagina(browser, mundo, { paso: 'seleccionando_asientos', ruta: '/cartelera', conVoz: true });
  await page.waitForFunction(() => window.__lumen, null, { timeout: 20000 });
  await page.evaluate(() => window.__lumen.setModo('voz'));
  const fin = Date.now() + 15000;
  while (Date.now() < fin && !mundo.ws.mensajes.some((m) => m.type === 'pantalla')) await dormir(100);
  verificar(E, 'en Solo Voz se le avisa al agente que NO hay pantalla (solo ofrece efectivo)', mundo.ws.mensajes.some((m) => m.type === 'pantalla' && m.disponible === false), JSON.stringify(mundo.ws.mensajes.filter((m) => m.type === 'pantalla')));
  await ctx.close();
}

(async () => {
  const args = ['--autoplay-policy=no-user-gesture-required', '--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'];
  if (SILENCIO) args.push(`--use-file-for-fake-audio-capture=${SILENCIO}`);
  const browser = await chromium.launch({ executablePath: EDGE, headless: true, args });
  const escenarios = [tactilTarjetaAprobada, tactilRechazoYReintento, tactilEfectivo, sinStripeSoloEfectivo, reservaVencida, vozGuiada, vozCancelar, soloVozSinPantalla];
  for (const escenario of escenarios) {
    try {
      await escenario(browser);
    } catch (error) {
      verificar(escenario.name, `el escenario terminó sin excepciones`, false, String(error).slice(0, 300));
    }
  }
  await browser.close();

  let actual = '';
  for (const r of resultados) {
    if (r.escenario !== actual) { actual = r.escenario; console.log(`\n== ${actual}`); }
    console.log(`  ${r.ok ? 'OK   ' : 'FALLO'} ${r.texto}${!r.ok && r.detalle ? `\n         → ${r.detalle}` : ''}`);
  }
  const fallos = resultados.filter((r) => !r.ok);
  console.log(`\n${resultados.length - fallos.length}/${resultados.length} verificaciones OK${fallos.length ? ` — ${fallos.length} FALLARON` : ''}`);
  process.exit(fallos.length ? 1 : 0);
})();

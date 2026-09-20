import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CardCvcElement, CardExpiryElement, CardNumberElement, Elements, ElementsConsumer } from '@stripe/react-stripe-js';
import type { Stripe, StripeElements } from '@stripe/stripe-js';
import { useCine } from '../../controllers/CineContext';
import { useAuth } from '../../controllers/AuthContext';
import { useUiControl } from '../../core/ui/UiControlContext';
import { useVozSesion } from '../../core/voice/VoiceSessionProvider';
import { crearVenta } from '../../api/ventas.api';
import { cancelarVentaPendiente, crearPago, iniciarPagoStripe, verificarPagoStripe } from '../../api/pagos.api';
import { ApiError } from '../../api/client';
import { firmaDeCompra } from '../../core/pagos/firmaCompra';
import { stripePara, useConfigPagos } from '../../core/pagos/useConfigPagos';
import { CAMPOS_TARJETA, CAMPOS_VACIOS, type CampoTarjeta, type CamposTarjeta, type EventoPago } from '../../core/types/pago.types';
import type { Venta } from '../../core/types/venta.types';
import { MarcoBiselado } from './MarcoBiselado';
import { TarjetaVirtual } from './TarjetaVirtual';
import { ESTILO_CAMPO_STRIPE, FUENTES_STRIPE } from './estilosStripe';

const TARJETA_DE_PRUEBA = '4242 4242 4242 4242';
/** Cuánto se ve la tarjeta en verde con "Pago exitoso" antes de volver a la pantalla de la compra (y de que el agente lo diga). */
const PAUSA_EXITO_MS = 1900;

const esperar = (ms: number) => new Promise<void>((resolver) => setTimeout(resolver, ms));

/** Un pago que no se pudo completar, con el motivo listo para mostrarse (y, si la voz lo guía, para decirse). */
class PagoFallido extends Error {
  constructor(
    public readonly evento: Exclude<EventoPago, 'confirmado' | 'cancelado'>,
    mensaje: string,
  ) {
    super(mensaje);
  }
}

type Metodo = 'tarjeta' | 'efectivo';
type Fase = 'editando' | 'procesando' | 'exito';
interface Aviso {
  tipo: 'error' | 'info';
  texto: string;
}

// ------------------------------------------------------------------------------------------------ piezas

const CampoVidrio = ({
  etiqueta,
  icono,
  enfocado,
  guia,
  error,
  children,
  derecha,
  testId,
}: {
  etiqueta: string;
  icono: string;
  enfocado: boolean;
  /** Es el campo que la voz está pidiendo ahora. */
  guia: boolean;
  error: string | null;
  children: ReactNode;
  derecha?: ReactNode;
  testId: string;
}) => (
  <div className="flex flex-col gap-space-2xs" data-testid={testId}>
    <span className="font-label-code text-label-code uppercase tracking-[0.2em] text-on-surface-variant/80">{etiqueta}</span>
    <div
      className={`relative flex h-14 items-center gap-space-sm rounded-xl border bg-white/[0.04] px-space-md backdrop-blur-md transition-all duration-300 ${
        error
          ? 'border-error/70 shadow-[0_0_0_3px_rgba(255,180,171,0.12)]'
          : enfocado
            ? 'border-primary-container shadow-[0_0_0_3px_rgba(245,158,11,0.2)]'
            : guia
              ? 'border-primary/70 shadow-[0_0_22px_rgba(245,158,11,0.28)] animate-pulse'
              : 'border-white/10 hover:border-white/25'
      }`}
    >
      <span className={`material-symbols-outlined text-[20px] transition-colors ${enfocado || guia ? 'text-primary' : 'text-on-surface-variant'}`}>{icono}</span>
      <div className="min-w-0 flex-1">{children}</div>
      {derecha}
    </div>
    <div className="min-h-4 font-body-sm text-[12px] leading-4 text-error">{error}</div>
  </div>
);

const InsigniaSeguridad = ({ icono, texto }: { icono: string; texto: string }) => (
  <span className="inline-flex items-center gap-1.5 font-label-code text-[10.5px] uppercase tracking-wider text-on-surface-variant/70">
    <span className="material-symbols-outlined text-[15px] text-tertiary">{icono}</span>
    {texto}
  </span>
);

const EsqueletoPago = () => (
  <div className="grid gap-space-lg lg:grid-cols-2" aria-busy="true">
    <div className="aspect-[1.586] w-full max-w-[380px] animate-pulse rounded-2xl bg-white/5" />
    <div className="flex flex-col gap-space-md">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-14 animate-pulse rounded-xl bg-white/5" />
      ))}
    </div>
  </div>
);

// ------------------------------------------------------------------------------------------------ carga

/**
 * Pantalla de pago (paso "pago" de la compra). Sirve para dos caminos que terminan en el mismo formulario:
 *  - táctil: el cliente elige tarjeta o efectivo, acepta la política de no reembolso y toca "Pagar";
 *  - por voz: el agente ya creó la venta (RF19) y guía al cliente campo por campo; "pagar" lo dice o lo toca.
 * La tarjeta se paga con los campos seguros de Stripe (nunca pasan por esta app ni por el agente) y la venta solo queda pagada
 * cuando el SERVIDOR confirma con Stripe. Sin claves de Stripe en el backend queda solo el efectivo.
 */
export const SeccionPago = () => {
  const config = useConfigPagos();
  const clave = config.stripe?.clavePublicable ?? null;
  const stripePromise = useMemo(() => (clave ? stripePara(clave) : null), [clave]);

  if (config.cargando) return <EsqueletoPago />;
  if (!clave || !stripePromise) {
    return <PagoInterno stripe={null} elements={null} tarjetaHabilitada={false} modoPrueba={false} />;
  }
  return (
    <Elements stripe={stripePromise} options={{ locale: 'es', fonts: FUENTES_STRIPE }}>
      <ElementsConsumer>
        {({ stripe, elements }) => <PagoInterno stripe={stripe} elements={elements} tarjetaHabilitada modoPrueba={clave.startsWith('pk_test_')} />}
      </ElementsConsumer>
    </Elements>
  );
};

// ------------------------------------------------------------------------------------------------ pago

interface PagoInternoProps {
  stripe: Stripe | null;
  elements: StripeElements | null;
  tarjetaHabilitada: boolean;
  modoPrueba: boolean;
}

interface CambioCampo {
  complete: boolean;
  empty: boolean;
  error?: { code: string; message: string } | undefined;
}

const PagoInterno = ({ stripe, elements, tarjetaHabilitada, modoPrueba }: PagoInternoProps) => {
  const { state, dispatch } = useCine();
  const { usuario, token } = useAuth();
  const control = useUiControl();
  const { voz } = useVozSesion();

  // La venta pendiente SOLO vale si corresponde a lo que se ve ahora (mismas butacas y dulcería): si no, se cancela y se crea otra al pagar.
  const firmaActual = firmaDeCompra(state);
  const vigente = state.ventaPendiente && state.ventaPendiente.firma === firmaActual ? state.ventaPendiente : null;
  const porVoz = vigente?.venta.tipoRegistro === 'voz';

  const totalLocal =
    state.butacasSeleccionadas.reduce((acc, b) => acc + b.precio, 0) + state.candyBarSeleccionado.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
  // Con la venta ya creada manda su total real (incluye descuentos de promociones que solo calcula el backend).
  const total = vigente ? Number(vigente.venta.total) : totalLocal;

  const [metodo, setMetodo] = useState<Metodo>(tarjetaHabilitada ? 'tarjeta' : 'efectivo');
  const [acepta, setAcepta] = useState(false);
  const [titular, setTitular] = useState((usuario?.nombre ?? '').toUpperCase().slice(0, 26));
  const [campos, setCampos] = useState<CamposTarjeta>(CAMPOS_VACIOS);
  const [avisosCampo, setAvisosCampo] = useState<Record<CampoTarjeta, string | null>>({ numero: null, vencimiento: null, cvc: null });
  const [marca, setMarca] = useState('unknown');
  const [enfocado, setEnfocado] = useState<CampoTarjeta | null>(null);
  const [titularEnfocado, setTitularEnfocado] = useState(false);
  const [reversoManual, setReversoManual] = useState(false);
  const [fase, setFase] = useState<Fase>('editando');
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [copiado, setCopiado] = useState(false);

  // Los pedidos asíncronos (voz, botón) tienen que ver SIEMPRE lo último: se leen por ref.
  const cineRef = useRef(state);
  cineRef.current = state;
  const camposRef = useRef(campos);
  camposRef.current = campos;
  const metodoRef = useRef(metodo);
  metodoRef.current = metodo;
  const aceptaRef = useRef(acepta);
  aceptaRef.current = acepta;
  const titularRef = useRef(titular);
  titularRef.current = titular;
  const enCurso = useRef(false);

  const aceptado = porVoz || acepta; // por voz ya se aceptó al decir "confirmo" (RF03/RF19)
  const volteada = fase !== 'exito' && (enfocado === 'cvc' || reversoManual);
  const campoGuia = porVoz && fase === 'editando' && metodo === 'tarjeta' ? (CAMPOS_TARJETA.find((c) => !campos[c].completo) ?? null) : null;

  // ---------------------------------------------------------------------------- lo que se le cuenta al agente

  const { activa: vozActiva, enviarPagoEvento, enviarPagoCampos } = voz;
  const avisarAlAgente = useCallback(
    (idVenta: number | null, evento: EventoPago, mensaje?: string) => {
      if (idVenta !== null && vozActiva) enviarPagoEvento(idVenta, evento, mensaje);
    },
    [vozActiva, enviarPagoEvento],
  );

  // Como va el formulario (solo el estado de cada campo, NUNCA lo escrito): con esto el agente guía "ahora la fecha, ahora el código".
  const idVentaVigente = vigente?.venta.idVenta ?? null;
  useEffect(() => {
    if (!porVoz || !vozActiva || idVentaVigente === null) return undefined;
    const id = setTimeout(() => enviarPagoCampos(idVentaVigente, campos), 250);
    return () => clearTimeout(id);
  }, [campos, porVoz, vozActiva, idVentaVigente, enviarPagoCampos]);

  // ---------------------------------------------------------------------------- crear la venta (una sola vez)

  const obtenerIdVenta = useCallback(async (): Promise<number> => {
    if (!token) throw new PagoFallido('error', 'Iniciá sesión para pagar.');
    const cine = cineRef.current;
    const firma = firmaDeCompra(cine);
    const pendiente = cine.ventaPendiente;
    if (pendiente && pendiente.firma === firma) return pendiente.venta.idVenta; // reintento tras un rechazo: no se crea otra venta

    if (pendiente) {
      // Cambió lo elegido desde que se reservó: esa venta ya no corresponde. Se cancela y se liberan sus asientos.
      await cancelarVentaPendiente(pendiente.venta.idVenta, token).catch(() => undefined);
      dispatch({ type: 'LIMPIAR_VENTA_PENDIENTE' });
    }
    if (!cine.funcionSeleccionada) throw new PagoFallido('error', 'No hay una función elegida.');
    const venta = await crearVenta(
      {
        idFuncion: cine.funcionSeleccionada.idFuncion,
        idAsientos: cine.butacasSeleccionadas.map((b) => b.idAsiento),
        tipoRegistro: 'manual',
        // RF03: se llega acá solo con la casilla de "no reembolso" marcada (ver `pagar`).
        confirmacionNoReembolso: true,
        confirmacionVerbalCheck: false,
        dulceria: cine.candyBarSeleccionado.map((item) => ({ idProducto: Number(item.id), cantidad: item.cantidad })),
      },
      token,
    );
    dispatch({ type: 'SET_VENTA_PENDIENTE', payload: { venta, firma } });
    return venta.idVenta;
  }, [token, dispatch]);

  // ---------------------------------------------------------------------------- cobrar con tarjeta (Stripe)

  const cobrarConTarjeta = useCallback(
    async (idVenta: number): Promise<Venta> => {
      if (!token || !stripe || !elements) throw new PagoFallido('error', 'El formulario seguro de Stripe todavía no cargó.');
      const inicio = await iniciarPagoStripe(idVenta, token).catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 409) {
          dispatch({ type: 'LIMPIAR_VENTA_PENDIENTE' });
          throw new PagoFallido('error', 'Tu reserva venció o ya no está disponible. Volvé a elegir tus asientos.');
        }
        throw error;
      });

      const numero = elements.getElement('cardNumber');
      if (!numero) throw new PagoFallido('error', 'No se encontró el campo del número de tarjeta.');
      const resultado = await stripe.confirmCardPayment(inicio.clientSecret, {
        payment_method: { card: numero, billing_details: { name: titularRef.current.trim() || undefined } },
      });
      if (resultado.error) {
        // Que el servidor también registre el rechazo (el webhook puede tardar); si esta consulta falla no importa.
        void verificarPagoStripe(inicio.idPago, token).catch(() => undefined);
        throw new PagoFallido('rechazado', resultado.error.message ?? 'La tarjeta fue rechazada.');
      }

      // Lo que dice el navegador no cuenta: el SERVIDOR le pregunta a Stripe y la venta solo queda pagada si Stripe lo confirmó.
      for (let intento = 0; intento < 6; intento += 1) {
        const verificacion = await verificarPagoStripe(inicio.idPago, token);
        if (verificacion.venta.estado === 'pagada') return verificacion.venta;
        if (verificacion.estado === 'fallido' || verificacion.estado === 'cancelado') {
          throw new PagoFallido('rechazado', verificacion.mensaje ?? 'El pago no se pudo completar.');
        }
        await esperar(1200);
      }
      throw new PagoFallido('error', 'Stripe todavía no confirmó el pago. Esperá unos segundos y volvé a tocar Pagar.');
    },
    [token, stripe, elements, dispatch],
  );

  // ---------------------------------------------------------------------------- pagar

  const pagar = useCallback(async () => {
    if (enCurso.current || !token) return;
    const pendiente = cineRef.current.ventaPendiente;
    const idVoz = pendiente && pendiente.firma === firmaDeCompra(cineRef.current) && pendiente.venta.tipoRegistro === 'voz' ? pendiente.venta.idVenta : null;

    if (idVoz === null && !aceptaRef.current) {
      setAviso({ tipo: 'error', texto: 'Para continuar tenés que aceptar que las entradas no tienen reembolso.' });
      return;
    }
    if (metodoRef.current === 'tarjeta') {
      if (!stripe || !elements) {
        setAviso({ tipo: 'error', texto: 'El formulario seguro de Stripe todavía no cargó. Esperá un momento.' });
        return;
      }
      if (!CAMPOS_TARJETA.every((c) => camposRef.current[c].completo)) {
        setAviso({ tipo: 'error', texto: 'Completá el número, el vencimiento y el código de seguridad de la tarjeta.' });
        return;
      }
    }

    enCurso.current = true;
    setFase('procesando');
    control.setPagando(true);
    setAviso(null);
    try {
      const idVenta = await obtenerIdVenta();
      const venta = metodoRef.current === 'efectivo' ? await crearPago(idVenta, 'efectivo', token) : await cobrarConTarjeta(idVenta);

      // Se ve la tarjeta en verde y "Pago exitoso" un momento; recién después se vuelve a la compra y el agente dice "gracias".
      setFase('exito');
      await esperar(PAUSA_EXITO_MS);
      dispatch({ type: 'SET_VENTA_CREADA', payload: venta });
      dispatch({ type: 'LIMPIAR_VENTA_PENDIENTE' });
      dispatch({ type: 'SET_ESTADO_COMPRA', payload: 'completado' });
      avisarAlAgente(idVoz, 'confirmado');
    } catch (error) {
      const mensaje = error instanceof PagoFallido || error instanceof ApiError ? error.message : 'No se pudo completar el pago. Intentá de nuevo.';
      setAviso({ tipo: 'error', texto: mensaje });
      setFase('editando');
      avisarAlAgente(idVoz ?? cineRef.current.ventaPendiente?.venta.idVenta ?? null, error instanceof PagoFallido ? error.evento : 'error', mensaje);
    } finally {
      enCurso.current = false;
      control.setPagando(false);
    }
  }, [token, stripe, elements, control, obtenerIdVenta, cobrarConTarjeta, dispatch, avisarAlAgente]);

  // ---------------------------------------------------------------------------- cancelar

  const cancelar = useCallback(
    async (origen: 'voz' | 'tactil') => {
      if (enCurso.current) return;
      const pendiente = cineRef.current.ventaPendiente;
      if (pendiente && token) {
        enCurso.current = true;
        try {
          await cancelarVentaPendiente(pendiente.venta.idVenta, token);
        } catch (error) {
          // Si ya estaba pagada (409) no se toca nada: se le dice tal cual.
          const texto = error instanceof ApiError ? error.message : 'No se pudo cancelar el pago.';
          setAviso({ tipo: 'error', texto });
          if (pendiente.venta.tipoRegistro === 'voz') avisarAlAgente(pendiente.venta.idVenta, 'error', texto);
          enCurso.current = false;
          return;
        }
        enCurso.current = false;
        dispatch({ type: 'LIMPIAR_VENTA_PENDIENTE' });
        if (pendiente.venta.tipoRegistro === 'voz') avisarAlAgente(pendiente.venta.idVenta, 'cancelado');
        setAviso({ tipo: 'info', texto: 'Cancelaste el pago. Tus asientos volvieron a quedar libres.' });
      }
      // Desde la pantalla (sin voz) "cancelar" también vuelve al paso anterior; por voz se queda acá y el agente dice cómo seguir.
      if (origen === 'tactil') dispatch({ type: 'SET_ESTADO_COMPRA', payload: 'seleccionando_candybar' });
    },
    [token, dispatch, avisarAlAgente],
  );

  // ---------------------------------------------------------------------------- pedidos de la voz o del botón de abajo

  const pagarRef = useRef(pagar);
  pagarRef.current = pagar;
  const cancelarRef = useRef(cancelar);
  cancelarRef.current = cancelar;
  const atendido = useRef(control.solicitudPago?.n ?? 0); // los pedidos anteriores a que se abriera esta pantalla no valen
  useEffect(() => {
    const solicitud = control.solicitudPago;
    if (!solicitud || solicitud.n <= atendido.current) return;
    atendido.current = solicitud.n;
    if (solicitud.accion === 'enviar') void pagarRef.current();
    else void cancelarRef.current('voz');
  }, [control.solicitudPago]);

  // ---------------------------------------------------------------------------- campos de tarjeta (Stripe)

  const alCambiar = useCallback(
    (campo: CampoTarjeta) => (evento: CambioCampo & { brand?: string }) => {
      setCampos((prev) => ({
        ...prev,
        // Solo un dato INVÁLIDO cuenta como error para la voz; "incompleto" es normal mientras se escribe.
        [campo]: { completo: evento.complete, vacio: evento.empty, error: evento.error && evento.error.code.startsWith('invalid') ? evento.error.message : null },
      }));
      setAvisosCampo((prev) => ({ ...prev, [campo]: evento.error?.message ?? null }));
      if (campo === 'numero' && evento.brand) setMarca(evento.brand);
      if (evento.complete && elements) {
        // Al terminar un campo, el cursor pasa al que sigue (Stripe ya lo hace; esto lo asegura también con la voz guiando).
        if (campo === 'numero') elements.getElement('cardExpiry')?.focus();
        if (campo === 'vencimiento') elements.getElement('cardCvc')?.focus();
      }
    },
    [elements],
  );

  const copiarTarjetaDePrueba = () => {
    void navigator.clipboard?.writeText(TARJETA_DE_PRUEBA.replaceAll(' ', '')).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2200);
    });
  };

  const opcionesCampo = (marcador: string) => ({ style: ESTILO_CAMPO_STRIPE, placeholder: marcador });
  const ocupado = fase !== 'editando';
  const pagoBloqueado = ocupado || !aceptado || (metodo === 'tarjeta' && !CAMPOS_TARJETA.every((c) => campos[c].completo));

  return (
    <div data-testid="seccion-pago" data-fase={fase} className="relative isolate overflow-hidden rounded-3xl">
      {/* Fondo: luz ámbar y cintas doradas, como el checkout de vidrio. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-[#07080b]">
        <div className="absolute -left-24 top-10 h-72 w-[130%] -rotate-12 bg-gradient-to-r from-transparent via-primary-container/25 to-transparent blur-2xl" />
        <div className="absolute -right-32 bottom-0 h-64 w-[120%] -rotate-12 bg-gradient-to-r from-transparent via-primary/15 to-transparent blur-3xl" />
        <svg className="absolute inset-0 h-full w-full opacity-40" viewBox="0 0 800 500" preserveAspectRatio="none">
          <defs>
            <linearGradient id="cinta" x1="0" x2="1">
              <stop offset="0" stopColor="#f59e0b" stopOpacity="0" />
              <stop offset="0.5" stopColor="#ffc174" stopOpacity="0.85" />
              <stop offset="1" stopColor="#f59e0b" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M-20 380 C 180 250, 330 470, 520 300 S 760 170, 840 210" fill="none" stroke="url(#cinta)" strokeWidth="1.2" />
          <path d="M-20 420 C 200 300, 360 500, 560 340 S 780 230, 840 260" fill="none" stroke="url(#cinta)" strokeWidth="0.8" />
          <path d="M-20 90 C 150 170, 320 20, 520 120 S 740 60, 840 110" fill="none" stroke="url(#cinta)" strokeWidth="0.8" />
        </svg>
      </div>

      <MarcoBiselado corte={32} className="w-full" claseInterior="p-space-lg md:p-space-xl">
        {/* Encabezado */}
        <div className="mb-space-lg flex flex-wrap items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-sm">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-container/15 text-primary ring-1 ring-primary-container/40">
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
            </span>
            <div className="flex flex-col leading-tight">
              <span className="font-headline-md text-headline-md tracking-tight text-on-surface">Pago seguro</span>
              <span className="font-label-code text-label-code uppercase tracking-[0.2em] text-on-surface-variant/70">Lumen Checkout</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-space-xs">
            {porVoz && (
              <span data-testid="pago-guia-voz" className="inline-flex items-center gap-1.5 rounded-full bg-primary-container/15 px-space-sm py-1 font-label-code text-label-code uppercase tracking-wider text-primary ring-1 ring-primary-container/40">
                <span className="material-symbols-outlined animate-pulse text-[16px]">graphic_eq</span>
                Lumen te guía por voz
              </span>
            )}
            <div role="radiogroup" aria-label="Método de pago" className="inline-flex rounded-full bg-white/[0.05] p-1 ring-1 ring-white/10">
              {(['tarjeta', 'efectivo'] as const).map((opcion) => {
                const activo = metodo === opcion;
                const deshabilitado = ocupado || (opcion === 'tarjeta' && !tarjetaHabilitada);
                return (
                  <button
                    key={opcion}
                    type="button"
                    role="radio"
                    aria-checked={activo}
                    disabled={deshabilitado}
                    data-testid={`pago-metodo-${opcion}`}
                    title={opcion === 'tarjeta' && !tarjetaHabilitada ? 'El pago con tarjeta no está disponible ahora (Stripe no está configurado).' : undefined}
                    onClick={() => setMetodo(opcion)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-space-md py-1.5 font-label-md text-label-md font-semibold transition-all ${
                      activo ? 'bg-primary-container text-on-primary-container shadow-[0_0_18px_rgba(245,158,11,0.4)]' : 'text-on-surface-variant hover:text-on-surface'
                    } disabled:cursor-not-allowed disabled:opacity-40`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{opcion === 'tarjeta' ? 'credit_card' : 'payments'}</span>
                    {opcion === 'tarjeta' ? 'Tarjeta' : 'Efectivo'}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid items-start gap-space-xl lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          {/* ----- izquierda: la tarjeta ----- */}
          <div className="flex flex-col items-center gap-space-md">
            {metodo === 'tarjeta' ? (
              <>
                <TarjetaVirtual titular={titular} marca={marca} numero={campos.numero} vencimiento={campos.vencimiento} cvc={campos.cvc} volteada={volteada} aprobada={fase === 'exito'} />
                <button
                  type="button"
                  data-testid="pago-girar"
                  onClick={() => setReversoManual((valor) => !valor)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.05] px-space-md py-1.5 font-label-md text-label-md text-on-surface-variant ring-1 ring-white/10 transition-colors hover:text-primary"
                >
                  <span className="material-symbols-outlined text-[18px]">flip</span>
                  {volteada ? 'Ver frente' : 'Ver reverso (CVV)'}
                </button>
              </>
            ) : (
              <div className="flex w-full max-w-[380px] flex-col items-center gap-space-md rounded-2xl bg-white/[0.04] p-space-xl text-center ring-1 ring-white/10">
                <span className="grid h-20 w-20 place-items-center rounded-full bg-primary-container/15 text-primary shadow-[0_0_40px_rgba(245,158,11,0.3)] ring-1 ring-primary-container/40">
                  <span className="material-symbols-outlined text-[42px]">{fase === 'exito' ? 'check_circle' : 'payments'}</span>
                </span>
                <span className="font-headline-sm text-headline-sm text-on-surface">Pago en efectivo</span>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Al confirmar, tu compra queda registrada y recibís tu entrada digital. Sin datos de tarjeta.</p>
              </div>
            )}
            <div className="flex flex-wrap items-center justify-center gap-x-space-md gap-y-1">
              <InsigniaSeguridad icono="lock" texto="Conexión cifrada TLS" />
              <InsigniaSeguridad icono="verified_user" texto="Procesado por Stripe · PCI-DSS nivel 1" />
            </div>
          </div>

          {/* ----- derecha: los datos ----- */}
          <div className="relative flex flex-col gap-space-xs">
            <div className="mb-space-2xs">
              <h2 className="font-headline-md text-headline-md tracking-tight text-on-surface">Detalles del pago</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant/80">
                {metodo === 'tarjeta' ? 'Los datos de tu tarjeta se escriben en campos seguros de Stripe.' : 'Confirmá los datos de tu compra para pagar en efectivo.'}
              </p>
            </div>

            {metodo === 'tarjeta' && (
              <>
                {modoPrueba && (
                  <div data-testid="pago-modo-prueba" className="mb-space-2xs flex flex-wrap items-center justify-between gap-space-xs rounded-xl bg-secondary/10 px-space-sm py-space-xs ring-1 ring-secondary/30">
                    <span className="font-label-code text-label-code uppercase tracking-wider text-secondary">Modo prueba · no se cobra dinero real</span>
                    <button type="button" onClick={copiarTarjetaDePrueba} className="inline-flex items-center gap-1 font-label-md text-label-md font-semibold text-secondary transition-colors hover:text-white">
                      <span className="material-symbols-outlined text-[16px]">{copiado ? 'check' : 'content_copy'}</span>
                      {copiado ? 'Copiada' : `Copiar ${TARJETA_DE_PRUEBA}`}
                    </button>
                  </div>
                )}

                <CampoVidrio etiqueta="Nombre del titular" icono="person" enfocado={titularEnfocado} guia={false} error={null} testId="pago-campo-titular">
                  <input
                    value={titular}
                    onChange={(e) => setTitular(e.target.value.toUpperCase().slice(0, 26))}
                    onFocus={() => setTitularEnfocado(true)}
                    onBlur={() => setTitularEnfocado(false)}
                    disabled={ocupado}
                    autoComplete="cc-name"
                    placeholder="COMO FIGURA EN LA TARJETA"
                    aria-label="Nombre del titular"
                    className="w-full bg-transparent font-label-md text-[16px] font-medium uppercase tracking-[0.08em] text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none"
                  />
                </CampoVidrio>

                <CampoVidrio
                  etiqueta="Número de tarjeta"
                  icono="credit_card"
                  enfocado={enfocado === 'numero'}
                  guia={campoGuia === 'numero'}
                  error={avisosCampo.numero}
                  testId="pago-campo-numero"
                  derecha={marca !== 'unknown' ? <span className="font-label-code text-[11px] font-bold uppercase tracking-widest text-primary">{marca}</span> : undefined}
                >
                  <CardNumberElement
                    options={{ ...opcionesCampo(TARJETA_DE_PRUEBA), showIcon: false }}
                    onChange={alCambiar('numero')}
                    onFocus={() => setEnfocado('numero')}
                    onBlur={() => setEnfocado((actual) => (actual === 'numero' ? null : actual))}
                    onReady={(campo) => campo.focus()}
                  />
                </CampoVidrio>

                <div className="grid grid-cols-2 gap-space-md">
                  <CampoVidrio etiqueta="Vencimiento" icono="calendar_month" enfocado={enfocado === 'vencimiento'} guia={campoGuia === 'vencimiento'} error={avisosCampo.vencimiento} testId="pago-campo-vencimiento">
                    <CardExpiryElement
                      options={opcionesCampo('MM / AA')}
                      onChange={alCambiar('vencimiento')}
                      onFocus={() => setEnfocado('vencimiento')}
                      onBlur={() => setEnfocado((actual) => (actual === 'vencimiento' ? null : actual))}
                    />
                  </CampoVidrio>
                  <CampoVidrio etiqueta="CVV / CVC" icono="lock" enfocado={enfocado === 'cvc'} guia={campoGuia === 'cvc'} error={avisosCampo.cvc} testId="pago-campo-cvc">
                    <CardCvcElement
                      options={opcionesCampo('•••')}
                      onChange={alCambiar('cvc')}
                      onFocus={() => setEnfocado('cvc')}
                      onBlur={() => setEnfocado((actual) => (actual === 'cvc' ? null : actual))}
                    />
                  </CampoVidrio>
                </div>
              </>
            )}

            {/* Total */}
            <div className="mt-space-2xs flex items-center justify-between rounded-xl bg-white/[0.04] px-space-md py-space-sm ring-1 ring-white/10">
              <span className="font-label-code text-label-code uppercase tracking-[0.2em] text-on-surface-variant/80">Total a pagar</span>
              <span data-testid="pago-total" className="font-headline-md text-headline-md font-bold text-primary">
                {total.toFixed(2)} <span className="text-[0.6em] font-semibold tracking-wider">Bs</span>
              </span>
            </div>

            {/* RF03: aceptación real de la política de no reembolso (por voz ya se aceptó al decir «confirmo»). */}
            {porVoz ? (
              <div className="flex items-center gap-space-xs rounded-xl bg-error-container/15 px-space-sm py-space-xs font-body-sm text-body-sm text-on-error-container ring-1 ring-error/20">
                <span className="material-symbols-outlined text-[18px] text-error">gpp_maybe</span>
                Aceptaste por voz que las entradas no tienen reembolso.
              </div>
            ) : (
              <label className="flex cursor-pointer items-start gap-space-sm rounded-xl bg-error-container/15 px-space-sm py-space-xs ring-1 ring-error/20 transition-colors hover:bg-error-container/25">
                <input
                  type="checkbox"
                  data-testid="pago-acepta-noreembolso"
                  checked={acepta}
                  disabled={ocupado}
                  onChange={(e) => setAcepta(e.target.checked)}
                  className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-[#f59e0b]"
                />
                <span className="font-body-sm text-body-sm text-on-error-container">
                  Entiendo que <strong className="text-on-surface">las entradas no tienen reembolso ni cambios</strong> una vez pagadas.
                </span>
              </label>
            )}

            <AnimatePresence>
              {aviso && (
                <motion.div
                  key={aviso.texto}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  role="alert"
                  data-testid={aviso.tipo === 'error' ? 'pago-error' : 'pago-info'}
                  className={`flex items-start gap-space-xs rounded-xl px-space-sm py-space-xs font-body-sm text-body-sm ring-1 ${
                    aviso.tipo === 'error' ? 'bg-error-container/30 text-on-error-container ring-error/30' : 'bg-secondary/10 text-secondary ring-secondary/30'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{aviso.tipo === 'error' ? 'error' : 'info'}</span>
                  {aviso.texto}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="button"
              data-testid="pago-boton"
              disabled={pagoBloqueado}
              onClick={() => void pagar()}
              className="group relative mt-space-xs flex h-touch-target-kiosk w-full items-center justify-center gap-space-sm overflow-hidden rounded-xl bg-gradient-to-r from-[#ffc174] via-[#f59e0b] to-[#d97706] font-headline-sm text-headline-sm font-extrabold uppercase tracking-[0.12em] text-[#2a1700] shadow-[0_12px_40px_-10px_rgba(245,158,11,0.65)] transition-all hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
            >
              <span className="absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/30 opacity-0 blur-md transition-all duration-700 group-hover:left-full group-hover:opacity-100" />
              <span className="relative">{metodo === 'tarjeta' ? `Pagar ${total.toFixed(2)} Bs` : 'Confirmar pago en efectivo'}</span>
              <span className="material-symbols-outlined relative text-[24px] transition-transform group-hover:translate-x-1">arrow_forward</span>
            </button>

            <button
              type="button"
              data-testid="pago-cancelar"
              disabled={ocupado}
              onClick={() => void cancelar('tactil')}
              className="mx-auto mt-space-2xs inline-flex items-center gap-1 font-label-md text-label-md text-on-surface-variant transition-colors hover:text-primary disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              {state.ventaPendiente ? 'Cancelar y liberar mis asientos' : 'Volver al Candy Bar'}
            </button>

            {/* Procesando / éxito, por encima del formulario. */}
            <AnimatePresence>
              {fase !== 'editando' && (
                <motion.div
                  key={fase}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  data-testid={fase === 'exito' ? 'pago-exito' : 'pago-procesando'}
                  className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-space-md rounded-2xl bg-[#07080b]/80 text-center backdrop-blur-md"
                >
                  {fase === 'exito' ? (
                    <>
                      <span className="material-symbols-outlined animate-[pop_0.5s_ease-out] text-[64px] text-tertiary drop-shadow-[0_0_18px_rgba(86,229,169,0.6)]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        check_circle
                      </span>
                      <div className="flex flex-col gap-1 px-space-md">
                        <span className="font-headline-md text-headline-md text-on-surface">¡Pago exitoso!</span>
                        <span className="font-body-md text-body-md text-on-surface-variant">Tu pago de {total.toFixed(2)} Bs se procesó de forma segura.</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[40px] text-primary">progress_activity</span>
                      <span className="font-label-lg text-label-lg uppercase tracking-[0.18em] text-on-surface">Procesando transacción segura…</span>
                      <span className="relative h-1 w-48 overflow-hidden rounded-full bg-white/10">
                        <span className="absolute inset-y-0 left-0 w-1/3 animate-[barrido_1.4s_ease-in-out_infinite] rounded-full bg-primary-container" />
                      </span>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </MarcoBiselado>
    </div>
  );
};

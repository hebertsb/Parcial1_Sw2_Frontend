import { useCine } from '../../controllers/CineContext';
import { useUiControl } from '../../core/ui/UiControlContext';

/**
 * Barra inferior de la compra: resumen de lo elegido (película, entradas, subtotal) y el botón para avanzar.
 * Solo aparece cuando hay una compra en curso. El cambio entre Táctil / Voz + UI Dinámica / Solo Voz se hace únicamente
 * con el selector de arriba (TopModeSwitcher): acá no se repite, y menos con botones que llevaban a otra pantalla.
 *
 * En el paso de pago NO hay botón de avanzar: el cobro (tarjeta con Stripe o efectivo) se hace con el botón "Pagar" del propio
 * formulario de pago (components/pagos/SeccionPago.tsx), que es también lo que activa la voz al decir «pagar».
 */
export const BottomHUD = () => {
  const { state, dispatch } = useCine();
  const { pagando } = useUiControl();

  const totalEntradas = state.butacasSeleccionadas.reduce((acc, b) => acc + b.precio, 0);
  const totalSnacks = state.candyBarSeleccionado.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  // Con la venta reservada manda su total real (incluye descuentos de promociones que solo calcula el backend).
  const total = state.ventaPendiente ? Number(state.ventaPendiente.venta.total) : totalEntradas + totalSnacks;

  const totalTickets = state.butacasSeleccionadas.length;
  const enPago = state.estadoCompra === 'pago';

  const handleNextStep = () => {
    if (!state.peliculaSeleccionada) return;

    if (state.estadoCompra === 'seleccionando_asientos') {
      if (totalTickets > 0) {
        dispatch({ type: 'SET_ESTADO_COMPRA', payload: 'seleccionando_candybar' });
      }
    } else if (state.estadoCompra === 'seleccionando_candybar') {
      dispatch({ type: 'SET_ESTADO_COMPRA', payload: 'pago' });
    }
  };

  const getNextStepText = () => {
    if (state.estadoCompra === 'seleccionando_asientos') return 'Ir al Candy Bar';
    return 'Continuar al Pago';
  };

  const isNextDisabled = state.estadoCompra === 'seleccionando_asientos' && totalTickets === 0;

  // Sin una compra en curso (o ya terminada: no queda nada que avanzar, y un "Confirmar y Pagar" sobrevivía a la compra
  // ya pagada) no hay nada que mostrar: la pantalla queda limpia (Layout.tsx tampoco reserva el espacio).
  if (!state.peliculaSeleccionada || state.estadoCompra === 'completado') return null;

  return (
    <aside data-testid="barra-compra" className="fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest/95 backdrop-blur-2xl shadow-[0_-8px_32px_rgba(0,0,0,0.8)] px-space-lg py-space-sm border-t border-surface-container">
      <div className="max-w-[1720px] mx-auto flex items-center justify-between gap-space-md">
        {/* Left: Selection Status Counter Display */}
        <div className="hidden lg:flex items-center gap-space-md px-space-lg py-space-xs rounded-xl bg-surface-container shadow-inner">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[22px]">movie</span>
            <div className="flex flex-col">
              <span className="font-label-code text-label-code text-on-surface-variant uppercase">Película activa</span>
              <span className="font-label-md text-label-md text-on-surface font-bold">{state.peliculaSeleccionada.titulo}</span>
            </div>
          </div>
          <div className="w-px h-8 bg-surface-variant"></div>
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-secondary text-[22px]">chair</span>
            <div className="flex flex-col">
              <span className="font-label-code text-label-code text-on-surface-variant uppercase">Selección</span>
              <span className="font-label-md text-label-md text-primary font-bold">{totalTickets} Entradas</span>
            </div>
          </div>
          <div className="w-px h-8 bg-surface-variant"></div>
          <div className="flex flex-col text-right">
            <span className="font-label-code text-label-code text-on-surface-variant uppercase">{enPago ? 'Total' : 'Subtotal'}</span>
            <span className="font-headline-sm text-headline-sm text-primary">{total.toFixed(2)} Bs</span>
          </div>
        </div>

        {/* Right: Main Tactile Action Button */}
        <div className="flex items-center gap-space-sm ml-auto">
          <button className="h-touch-target-kiosk px-space-md rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface flex items-center gap-space-xs font-label-lg text-label-lg transition-all relative">
            <span className="material-symbols-outlined text-[24px]">shopping_bag</span>
            <span className="w-6 h-6 rounded-full bg-primary text-on-primary font-bold flex items-center justify-center font-label-code text-label-code shadow-md">
              {totalTickets + state.candyBarSeleccionado.reduce((a, b) => a + b.cantidad, 0)}
            </span>
          </button>
          {enPago ? (
            <div data-testid="barra-pago-estado" className="h-touch-target-kiosk px-space-lg rounded-xl bg-surface-container flex items-center gap-space-xs font-label-lg text-label-lg text-on-surface-variant">
              <span className={`material-symbols-outlined text-[22px] ${pagando ? 'animate-spin text-primary' : 'text-tertiary'}`}>{pagando ? 'progress_activity' : 'lock'}</span>
              <span>{pagando ? 'Procesando pago…' : 'Completá el pago en el formulario'}</span>
            </div>
          ) : (
            <button
              onClick={handleNextStep}
              disabled={isNextDisabled}
              className={`h-touch-target-kiosk px-space-xl rounded-xl font-headline-sm text-headline-sm font-bold flex items-center justify-center gap-space-sm transition-transform ${isNextDisabled ? 'bg-surface-variant text-on-surface-variant opacity-50 cursor-not-allowed' : 'bg-primary-container text-on-primary-container shadow-xl shadow-primary/30 active:scale-95'}`}
            >
              <span>{getNextStepText()}</span>
              <span className="material-symbols-outlined text-[24px]">arrow_forward</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

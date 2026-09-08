import { useCine } from '../../controllers/CineContext';

interface BottomHUDProps {
  onVoiceMode: () => void;
}

export const BottomHUD = ({ onVoiceMode }: BottomHUDProps) => {
  const { state, dispatch } = useCine();

  const totalEntradas = state.butacasSeleccionadas.reduce((acc, b) => acc + b.precio, 0);
  const totalSnacks = state.candyBarSeleccionado.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  const total = totalEntradas + totalSnacks;
  
  const totalTickets = state.butacasSeleccionadas.length;

  const handleNextStep = () => {
    if (!state.peliculaSeleccionada) return;
    
    if (state.estadoCompra === 'seleccionando_asientos') {
      if (totalTickets > 0) {
        dispatch({ type: 'SET_ESTADO_COMPRA', payload: 'seleccionando_candybar' });
      }
    } else if (state.estadoCompra === 'seleccionando_candybar') {
      dispatch({ type: 'SET_ESTADO_COMPRA', payload: 'pago' });
    } else if (state.estadoCompra === 'pago') {
      dispatch({ type: 'SET_ESTADO_COMPRA', payload: 'completado' });
    }
  };

  const getNextStepText = () => {
    if (state.estadoCompra === 'seleccionando_asientos') return 'Ir al Candy Bar';
    if (state.estadoCompra === 'seleccionando_candybar') return 'Continuar al Pago';
    return 'Confirmar y Pagar';
  };

  const isNextDisabled = state.estadoCompra === 'seleccionando_asientos' && totalTickets === 0;

  return (
    <aside className="fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest/95 backdrop-blur-2xl shadow-[0_-8px_32px_rgba(0,0,0,0.8)] px-space-lg py-space-sm border-t border-surface-container">
      <div className="max-w-[1720px] mx-auto flex items-center justify-between gap-space-md">
        {/* Left: Mode Switcher & Kiosk Assistance */}
        <div className="flex items-center gap-space-sm">
          <button className="h-touch-target-kiosk px-space-md rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface flex items-center gap-space-xs font-label-lg text-label-lg transition-all active:scale-95 shadow-md">
            <span className="material-symbols-outlined text-primary text-[24px]">support_agent</span>
            <span className="hidden sm:inline">Llamar Asistente</span>
          </button>
          <button onClick={onVoiceMode} className="h-touch-target-kiosk px-space-md rounded-xl bg-secondary-container/20 hover:bg-secondary-container/30 text-secondary flex items-center gap-space-xs font-label-lg text-label-lg transition-all active:scale-95">
            <div className="w-3 h-3 rounded-full bg-secondary animate-ping"></div>
            <span className="material-symbols-outlined text-[22px]">mic</span>
            <span className="hidden md:inline">Cambiar a Modo Voz Lumina</span>
          </button>
        </div>

        {/* Center: Selection Status Counter Display */}
        {state.peliculaSeleccionada && (
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
              <span className="font-label-code text-label-code text-on-surface-variant uppercase">Subtotal</span>
              <span className="font-headline-sm text-headline-sm text-primary">{total.toFixed(2)} Bs</span>
            </div>
          </div>
        )}

        {/* Right: Main Tactile Action Button */}
        <div className="flex items-center gap-space-sm">
          {state.peliculaSeleccionada && (
            <button className="h-touch-target-kiosk px-space-md rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface flex items-center gap-space-xs font-label-lg text-label-lg transition-all relative">
              <span className="material-symbols-outlined text-[24px]">shopping_bag</span>
              <span className="w-6 h-6 rounded-full bg-primary text-on-primary font-bold flex items-center justify-center font-label-code text-label-code shadow-md">
                {totalTickets + state.candyBarSeleccionado.reduce((a, b) => a + b.cantidad, 0)}
              </span>
            </button>
          )}
          {state.peliculaSeleccionada && (
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

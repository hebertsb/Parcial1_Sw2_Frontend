import { useCine } from '../../controllers/CineContext';

interface TopModeSwitcherProps {
  mode: 'tactil' | 'hibrido' | 'voz';
  onChangeMode: (mode: 'tactil' | 'hibrido' | 'voz') => void;
}

export const TopModeSwitcher = ({ mode, onChangeMode }: TopModeSwitcherProps) => {
  const { state } = useCine();

  return (
    <div className="flex flex-col w-full z-20 sticky top-20 bg-surface-container-lowest">
      {/* Status Strip & Mode Toggle Anchor */}
      <div className="w-full px-space-lg py-space-sm flex flex-wrap items-center justify-between gap-space-md bg-surface-container-low/60 backdrop-blur-md">
        <div className="flex items-center gap-space-sm">
          <div className="flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-full bg-secondary-container/20 text-secondary">
            <span className="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
            <span className="font-label-code text-label-code uppercase tracking-wider">RF18 • Pipeline Generativo WebSocket Activo</span>
          </div>
          <span className="hidden md:inline font-label-code text-label-code text-on-surface-variant">• Latencia: 42ms (Edge Node Kiosk 04)</span>
        </div>
        
        {/* Toggle Mode Segmented Switch */}
        <div className="flex items-center bg-surface-container rounded-full p-1 shadow-md">
          <button 
            onClick={() => onChangeMode('tactil')}
            className={`px-space-md py-space-xs rounded-full font-label-md text-label-md transition-all flex items-center gap-space-2xs ${mode === 'tactil' ? 'bg-primary-container text-on-primary-container font-bold shadow-[0_0_16px_rgba(245,158,11,0.35)]' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            <span className="material-symbols-outlined text-[16px]">touch_app</span>
            <span>Modo Táctil</span>
          </button>
          <button 
            onClick={() => onChangeMode('hibrido')}
            className={`px-space-md py-space-xs rounded-full font-label-md text-label-md transition-all flex items-center gap-space-2xs ${mode === 'hibrido' ? 'bg-primary-container text-on-primary-container font-bold shadow-[0_0_16px_rgba(245,158,11,0.35)]' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
            <span>Voz + UI Dinámica</span>
          </button>
          <button 
            onClick={() => onChangeMode('voz')}
            className={`px-space-md py-space-xs rounded-full font-label-md text-label-md transition-all flex items-center gap-space-2xs ${mode === 'voz' ? 'bg-primary-container text-on-primary-container font-bold shadow-[0_0_16px_rgba(245,158,11,0.35)]' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            <span className="material-symbols-outlined text-[16px]">graphic_eq</span>
            <span>Solo Voz (Puro)</span>
          </button>
        </div>
      </div>

      {/* Real-Time Voice Processing Banner (RF18 Live Feed) - Only in Hybrid Mode */}
      {mode === 'hibrido' && (
        <section className="w-full px-space-lg py-space-md bg-surface-container-high/70 backdrop-blur-xl shadow-xl shrink-0">
          <div className="max-w-[1720px] mx-auto flex flex-col lg:flex-row items-stretch lg:items-center gap-space-lg justify-between">
            <div className="flex items-center gap-space-md">
              <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-surface-container-highest shadow-[0_0_24px_-4px_rgba(245,158,11,0.4)]">
                <div className="absolute inset-0 rounded-full bg-primary-container/20 animate-ping"></div>
                <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container shadow-[0_0_16px_rgba(245,158,11,0.6)]">
                  <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
                </div>
                <div className="absolute -top-1 right-0 w-3 h-3 rounded-full bg-tertiary shadow-[0_0_10px_rgba(86,229,169,0.9)]"></div>
              </div>
              <div className="flex flex-col gap-space-2xs">
                <div className="flex items-center gap-space-xs">
                  <span className="font-label-code text-label-code text-primary uppercase tracking-widest font-bold">Escucha Activa Kiosco</span>
                  <div className="flex items-center gap-1 h-3">
                    <span className="w-1 h-2 bg-primary-container rounded-full animate-bounce"></span>
                    <span className="w-1 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.15s" }}></span>
                    <span className="w-1 h-1 bg-secondary rounded-full animate-bounce" style={{ animationDelay: "0.3s" }}></span>
                    <span className="w-1 h-2.5 bg-primary-container rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                  </div>
                </div>
                <p className="font-body-md text-body-md text-on-surface italic font-medium">
                  “Quiero 2 entradas para {state.peliculaSeleccionada?.titulo || 'una película'} a las {state.horarioSeleccionado || '8:15'}”
                </p>
              </div>
            </div>
            <div className="flex-1 lg:max-w-2xl bg-surface-container-lowest/80 p-space-sm rounded-xl flex items-start gap-space-sm shadow-md">
              <div className="w-8 h-8 rounded-lg bg-secondary/15 flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-secondary text-[20px]">smart_toy</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-space-xs">
                  <span className="font-label-code text-label-code text-secondary font-bold uppercase tracking-wider">Agente Lumen AI (Voz)</span>
                  <span className="font-label-code text-label-code text-tertiary bg-tertiary/10 px-1.5 py-0.5 rounded">Autocompletado con éxito</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface">
                  “¡Excelente elección! Te he pre-seleccionado los mejores asientos. ¿Deseas confirmar o cambiarlos en la pantalla?”
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

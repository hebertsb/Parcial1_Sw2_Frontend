interface TopModeSwitcherProps {
  mode: 'tactil' | 'hibrido' | 'voz';
  onChangeMode: (mode: 'tactil' | 'hibrido' | 'voz') => void;
}

/**
 * Selector de modo de interaccion. "Voz + UI Dinamica" ya no tapa la pantalla con una capa propia: al activarlo, el
 * asistente (VoiceDock + ventanas, ver core/voice/VoiceSessionProvider.tsx) aparece SOBRE la app real, que el agente
 * va moviendo segun lo que se le pide.
 */
export const TopModeSwitcher = ({ mode, onChangeMode }: TopModeSwitcherProps) => {
  return (
    <div className="flex flex-col w-full z-20 sticky top-20 bg-surface-container-lowest">
      {/* Status Strip & Mode Toggle Anchor */}
      <div className="w-full px-space-lg py-space-sm flex flex-wrap items-center justify-between gap-space-md bg-surface-container-low/60 backdrop-blur-md">
        <div className="flex items-center gap-space-sm">
          <div className="flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-full bg-secondary-container/20 text-secondary">
            <span className="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
            <span className="font-label-code text-label-code uppercase tracking-wider">RF18 • UI Generativa por Voz</span>
          </div>
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
    </div>
  );
};

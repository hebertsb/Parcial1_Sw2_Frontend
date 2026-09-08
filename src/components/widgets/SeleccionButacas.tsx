import { useCine } from '../../controllers/CineContext';
import { Butaca } from '../../core/types/compra.types';

export const SeleccionButacas = () => {
  const { state, dispatch } = useCine();

  const handleToggleButaca = (fila: string, columna: number, isVip: boolean = false) => {
    const id = `${fila}${columna}`;
    const butaca: Butaca = {
      id,
      fila,
      columna,
      estado: 'disponible',
      precio: isVip ? 80 : 65
    };
    dispatch({ type: 'TOGGLE_BUTACA', payload: butaca });
  };

  const isSelected = (id: string) => {
    return state.butacasSeleccionadas.some(b => b.id === id);
  };

  // Helper function to render a standard seat
  const renderStandardSeat = (fila: string, col: number) => {
    const id = `${fila}${col}`;
    const selected = isSelected(id);
    return (
      <button
        key={id}
        onClick={() => handleToggleButaca(fila, col)}
        className={`w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center transition-all ${
          selected 
            ? 'bg-primary-container text-on-primary-container font-bold shadow-[0_0_20px_rgba(245,158,11,0.6)] scale-110'
            : 'bg-surface-container hover:bg-surface-bright text-on-surface-variant'
        }`}
      >
        {selected ? <span className="material-symbols-outlined text-[18px]">check</span> : col}
      </button>
    );
  };

  // Helper function to render a VIP seat
  const renderVipSeat = (fila: string, col: number) => {
    const id = `${fila}${col}`;
    const selected = isSelected(id);
    return (
      <button
        key={id}
        onClick={() => handleToggleButaca(fila, col, true)}
        className={`w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center transition-all group ${
          selected 
            ? 'bg-primary-container text-on-primary-container shadow-[0_0_20px_rgba(245,158,11,0.6)] scale-110'
            : 'bg-surface-container hover:bg-surface-container-highest text-tertiary'
        }`}
      >
        {selected ? <span className="material-symbols-outlined text-[18px]">check</span> : <span className="material-symbols-outlined text-[16px]">airline_seat_recline_extra</span>}
      </button>
    );
  };

  // Helper function to render a disabled seat
  const renderDisabledSeat = (id: string) => (
    <button key={id} className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-surface-container/40 text-on-surface-variant/30 flex items-center justify-center cursor-not-allowed" disabled>
      <span className="material-symbols-outlined text-[16px]">close</span>
    </button>
  );

  return (
    <div className="flex flex-col items-center relative overflow-hidden h-full">
      {/* Ambient Volumetric Cinema Light Rays Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-52 bg-gradient-to-b from-secondary/15 via-primary/5 to-transparent pointer-events-none blur-3xl"></div>
      
      {/* Curved IMAX Laser Screen Representation */}
      <div className="w-full flex flex-col items-center mb-space-2xl pt-space-xs relative z-10">
        <div className="w-11/12 max-w-2xl relative flex flex-col items-center">
          <svg className="w-full h-12 overflow-visible" fill="none" viewBox="0 0 700 60">
            <defs>
              <linearGradient id="imaxGlow" x1="0%" x2="100%" y1="0%" y2="0%">
                <stop offset="0%" stopColor="#111319" stopOpacity="0.1"></stop>
                <stop offset="25%" stopColor="#4cd7f6" stopOpacity="0.8"></stop>
                <stop offset="50%" stopColor="#ffc174" stopOpacity="1"></stop>
                <stop offset="75%" stopColor="#4cd7f6" stopOpacity="0.8"></stop>
                <stop offset="100%" stopColor="#111319" stopOpacity="0.1"></stop>
              </linearGradient>
            </defs>
            <path d="M 20 45 Q 350 5 680 45" fill="none" stroke="url(#imaxGlow)" strokeLinecap="round" strokeWidth="4"></path>
          </svg>
          <div className="mt-space-2xs flex items-center gap-space-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] text-secondary">videocam</span>
            <span className="font-label-code text-label-code tracking-widest uppercase text-secondary/80">Pantalla Curva IMAX Láser 4K HDR</span>
          </div>
        </div>
      </div>
      
      {/* Sound Cone & Optimal Vision Zone Marker */}
      <div className="flex items-center gap-space-xs mb-space-sm px-space-md py-space-2xs rounded-full bg-surface-container text-on-surface-variant font-label-code text-label-code uppercase tracking-wider">
        <span className="material-symbols-outlined text-primary text-[14px]">volume_up</span>
        <span>Zona Óptima Dolby Atmos • Filas E - G</span>
      </div>

      {/* Interactive Seating Map Matrix */}
      <div className="w-full overflow-x-auto pb-space-md flex flex-col items-center">
        <div className="min-w-[620px] flex flex-col gap-space-xs" id="seatingGrid">
          
          {/* Row A */}
          <div className="flex items-center justify-between gap-space-xs">
            <span className="w-6 text-center font-headline-sm text-label-md text-primary font-bold">A</span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {renderVipSeat('A', 1)} {renderVipSeat('A', 2)} <div className="w-4"></div>
              {renderVipSeat('A', 3)} {renderVipSeat('A', 4)} {renderVipSeat('A', 5)} {renderVipSeat('A', 6)} {renderVipSeat('A', 7)} {renderVipSeat('A', 8)} <div className="w-4"></div>
              {renderVipSeat('A', 9)} {renderVipSeat('A', 10)}
            </div>
            <span className="w-6 text-center font-headline-sm text-label-md text-primary font-bold">A</span>
          </div>

          {/* Row B */}
          <div className="flex items-center justify-between gap-space-xs">
            <span className="w-6 text-center font-headline-sm text-label-md text-primary font-bold">B</span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {renderDisabledSeat('B1')} {renderDisabledSeat('B2')} <div className="w-4"></div>
              {renderVipSeat('B', 3)} {renderVipSeat('B', 4)} {renderVipSeat('B', 5)} {renderVipSeat('B', 6)} {renderVipSeat('B', 7)} {renderVipSeat('B', 8)} <div className="w-4"></div>
              {renderVipSeat('B', 9)} {renderVipSeat('B', 10)}
            </div>
            <span className="w-6 text-center font-headline-sm text-label-md text-primary font-bold">B</span>
          </div>

          {/* Row C */}
          <div className="flex items-center justify-between gap-space-xs mt-1">
            <span className="w-6 text-center font-label-md text-label-md text-on-surface-variant font-bold">C</span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {renderStandardSeat('C', 1)} {renderStandardSeat('C', 2)} <div className="w-4"></div>
              {renderDisabledSeat('C3')} {renderDisabledSeat('C4')} {renderStandardSeat('C', 5)} {renderStandardSeat('C', 6)} {renderStandardSeat('C', 7)} {renderStandardSeat('C', 8)} <div className="w-4"></div>
              {renderStandardSeat('C', 9)} {renderStandardSeat('C', 10)}
            </div>
            <span className="w-6 text-center font-label-md text-label-md text-on-surface-variant font-bold">C</span>
          </div>

          {/* Row D */}
          <div className="flex items-center justify-between gap-space-xs">
            <span className="w-6 text-center font-label-md text-label-md text-on-surface-variant font-bold">D</span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {renderStandardSeat('D', 1)} {renderStandardSeat('D', 2)} <div className="w-4"></div>
              {renderStandardSeat('D', 3)} {renderStandardSeat('D', 4)} {renderStandardSeat('D', 5)} {renderStandardSeat('D', 6)} {renderStandardSeat('D', 7)} {renderStandardSeat('D', 8)} <div className="w-4"></div>
              {renderStandardSeat('D', 9)} {renderStandardSeat('D', 10)}
            </div>
            <span className="w-6 text-center font-label-md text-label-md text-on-surface-variant font-bold">D</span>
          </div>

          {/* Row E */}
          <div className="flex items-center justify-between gap-space-xs">
            <span className="w-6 text-center font-label-md text-label-md text-on-surface-variant font-bold">E</span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {renderStandardSeat('E', 1)} {renderStandardSeat('E', 2)} <div className="w-4"></div>
              {renderStandardSeat('E', 3)} {renderStandardSeat('E', 4)} {renderStandardSeat('E', 5)} {renderStandardSeat('E', 6)} {renderStandardSeat('E', 7)} {renderStandardSeat('E', 8)} <div className="w-4"></div>
              {renderStandardSeat('E', 9)} {renderStandardSeat('E', 10)}
            </div>
            <span className="w-6 text-center font-label-md text-label-md text-on-surface-variant font-bold">E</span>
          </div>

          {/* Row F */}
          <div className="flex items-center justify-between gap-space-xs bg-primary/5 py-1 rounded">
            <span className="w-6 text-center font-headline-sm text-label-md text-primary font-bold">F</span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {renderStandardSeat('F', 1)} {renderStandardSeat('F', 2)} <div className="w-4"></div>
              {renderStandardSeat('F', 3)} {renderStandardSeat('F', 4)} {renderStandardSeat('F', 5)} {renderStandardSeat('F', 6)} 
              {renderStandardSeat('F', 7)} {renderStandardSeat('F', 8)}
              <div className="w-4"></div>
              {renderStandardSeat('F', 9)} {renderStandardSeat('F', 10)}
            </div>
            <span className="w-6 text-center font-headline-sm text-label-md text-primary font-bold">F</span>
          </div>

          {/* Row G */}
          <div className="flex items-center justify-between gap-space-xs">
            <span className="w-6 text-center font-label-md text-label-md text-on-surface-variant font-bold">G</span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {renderStandardSeat('G', 1)} {renderStandardSeat('G', 2)} <div className="w-4"></div>
              {renderDisabledSeat('G3')} {renderStandardSeat('G', 4)} {renderStandardSeat('G', 5)} {renderStandardSeat('G', 6)} {renderStandardSeat('G', 7)} {renderStandardSeat('G', 8)} <div className="w-4"></div>
              {renderStandardSeat('G', 9)} {renderStandardSeat('G', 10)}
            </div>
            <span className="w-6 text-center font-label-md text-label-md text-on-surface-variant font-bold">G</span>
          </div>

          {/* Row H */}
          <div className="flex items-center justify-between gap-space-xs">
            <span className="w-6 text-center font-label-md text-label-md text-on-surface-variant font-bold">H</span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {renderStandardSeat('H', 1)} {renderStandardSeat('H', 2)} <div className="w-4"></div>
              {renderStandardSeat('H', 3)} {renderStandardSeat('H', 4)} {renderStandardSeat('H', 5)} {renderStandardSeat('H', 6)} {renderDisabledSeat('H7')} {renderDisabledSeat('H8')} <div className="w-4"></div>
              {renderStandardSeat('H', 9)} {renderStandardSeat('H', 10)}
            </div>
            <span className="w-6 text-center font-label-md text-label-md text-on-surface-variant font-bold">H</span>
          </div>

        </div>
      </div>

      {/* Seating Map Legend */}
      <div className="w-full mt-space-md pt-space-md bg-surface-container rounded-lg p-space-sm flex flex-wrap items-center justify-around gap-space-sm">
        <div className="flex items-center gap-space-2xs">
          <div className="w-4 h-4 rounded bg-surface-container-highest"></div>
          <span className="font-body-sm text-body-sm text-on-surface-variant">Disponible</span>
        </div>
        <div className="flex items-center gap-space-2xs">
          <div className="w-4 h-4 rounded bg-surface-container/40 flex items-center justify-center text-on-surface-variant/40">
            <span className="material-symbols-outlined text-[12px]">close</span>
          </div>
          <span className="font-body-sm text-body-sm text-on-surface-variant">Ocupado</span>
        </div>
        <div className="flex items-center gap-space-2xs">
          <div className="w-4 h-4 rounded bg-primary-container shadow-[0_0_10px_rgba(245,158,11,0.6)]"></div>
          <span className="font-body-sm text-body-sm text-primary font-bold">Tu Selección</span>
        </div>
        <div className="flex items-center gap-space-2xs">
          <div className="w-4 h-4 rounded bg-surface-container text-tertiary flex items-center justify-center">
            <span className="material-symbols-outlined text-[13px]">airline_seat_recline_extra</span>
          </div>
          <span className="font-body-sm text-body-sm text-tertiary">VIP Recliner Atmos</span>
        </div>
      </div>
      
      {/* Touch Help Hint */}
      <div className="mt-space-sm text-center">
        <span className="font-label-code text-label-code text-on-surface-variant/70 tracking-wider">Toca o mantén presionado sobre una butaca para ver ángulo de vista simulado</span>
      </div>
    </div>
  );
};

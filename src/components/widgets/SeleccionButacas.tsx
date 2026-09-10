import { useCine } from '../../controllers/CineContext';
import { Butaca } from '../../core/types/compra.types';
import { AsientoDisponibilidad } from '../../core/types/funcion.types';

export const SeleccionButacas = () => {
  const { state, dispatch } = useCine();

  const handleToggleButaca = (item: AsientoDisponibilidad) => {
    const butaca: Butaca = {
      id: `${item.asiento.fila}${item.asiento.numero}`,
      idAsiento: item.idAsiento,
      fila: item.asiento.fila,
      columna: item.asiento.numero,
      estado: 'disponible',
      // Precio real de la función (ProcesoCompra.tsx lo trae de GET /precios/:id según
      // funcion.idPrecio) — 0 solo en el caso raro de que la función no tenga precio
      // asignado, ahí el total recién se sabe al confirmar (POST /ventas).
      precio: state.precioUnitario ? Number(state.precioUnitario) : 0,
    };
    dispatch({ type: 'TOGGLE_BUTACA', payload: butaca });
  };

  const isSelected = (idAsiento: number) => {
    return state.butacasSeleccionadas.some(b => b.idAsiento === idAsiento);
  };

  const renderAsiento = (item: AsientoDisponibilidad) => {
    const disponible = item.estado === 'disponible';
    const selected = isSelected(item.idAsiento);

    if (!disponible) {
      return (
        <button
          key={item.idAsiento}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-surface-container/40 text-on-surface-variant/30 flex items-center justify-center cursor-not-allowed"
          disabled
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      );
    }

    return (
      <button
        key={item.idAsiento}
        onClick={() => handleToggleButaca(item)}
        className={`w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center transition-all ${
          selected
            ? 'bg-primary-container text-on-primary-container font-bold shadow-[0_0_20px_rgba(245,158,11,0.6)] scale-110'
            : 'bg-surface-container hover:bg-surface-bright text-on-surface-variant'
        }`}
      >
        {selected ? <span className="material-symbols-outlined text-[18px]">check</span> : item.asiento.numero}
      </button>
    );
  };

  const filas = new Map<string, AsientoDisponibilidad[]>();
  for (const item of state.disponibilidad) {
    const grupo = filas.get(item.asiento.fila) ?? [];
    grupo.push(item);
    filas.set(item.asiento.fila, grupo);
  }

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

      {/* Interactive Seating Map Matrix */}
      <div className="w-full overflow-x-auto pb-space-md flex flex-col items-center flex-grow">
        {state.cargandoDisponibilidad ? (
          <div className="flex flex-col items-center gap-space-sm text-on-surface-variant py-space-2xl">
            <span className="material-symbols-outlined text-[32px] animate-spin">progress_activity</span>
            <span className="font-label-md text-label-md">Cargando disponibilidad de butacas...</span>
          </div>
        ) : filas.size === 0 ? (
          <div className="flex flex-col items-center gap-space-sm text-on-surface-variant py-space-2xl">
            <span className="material-symbols-outlined text-[32px]">event_busy</span>
            <span className="font-label-md text-label-md">No hay butacas disponibles para mostrar todavía.</span>
          </div>
        ) : (
          <div className="min-w-[420px] flex flex-col gap-space-xs" id="seatingGrid">
            {Array.from(filas.entries()).map(([fila, asientos]) => (
              <div key={fila} className="flex items-center justify-between gap-space-xs">
                <span className="w-6 text-center font-label-md text-label-md text-on-surface-variant font-bold">{fila}</span>
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center">
                  {asientos.map(renderAsiento)}
                </div>
                <span className="w-6 text-center font-label-md text-label-md text-on-surface-variant font-bold">{fila}</span>
              </div>
            ))}
          </div>
        )}
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
      </div>

      {/* Touch Help Hint */}
      <div className="mt-space-sm text-center">
        <span className="font-label-code text-label-code text-on-surface-variant/70 tracking-wider">Toca una butaca disponible para seleccionarla</span>
      </div>
    </div>
  );
};

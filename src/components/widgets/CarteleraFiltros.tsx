interface CarteleraFiltrosProps {
  /** Fechas reales (`YYYY-MM-DD`) que tienen al menos una función programada, ordenadas. */
  diasDisponibles: string[];
  /** `null` = sin filtrar, muestra todos los días. */
  diaSeleccionado: string | null;
  onSeleccionarDia: (dia: string | null) => void;
}

const formatearDia = (fecha: string): string =>
  new Date(`${fecha}T00:00:00`).toLocaleDateString('es-BO', { day: 'numeric', month: 'short' });

/** El bloque "Experiencia" sigue decorativo (sin datos reales asociados) — fuera de este alcance. */
export const CarteleraFiltros = ({ diasDisponibles, diaSeleccionado, onSeleccionarDia }: CarteleraFiltrosProps) => (
  <div className="w-full px-space-lg py-space-sm">
    <div className="w-full bg-surface-container p-space-md rounded-2xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
      <div className="flex items-center gap-space-xs overflow-x-auto pb-1 lg:pb-0">
        <span className="font-label-code text-label-code text-on-surface-variant uppercase px-2">Día:</span>
        <button
          onClick={() => onSeleccionarDia(null)}
          className={`px-space-md py-space-xs rounded-full font-label-lg text-label-lg transition-all whitespace-nowrap ${diaSeleccionado === null ? 'bg-primary text-on-primary font-bold shadow-md shadow-primary/20' : 'bg-surface-container-high hover:bg-surface-bright text-on-surface'}`}
        >
          Todos
        </button>
        {diasDisponibles.length === 0 ? (
          <span className="font-body-sm text-body-sm text-on-surface-variant px-2">Sin funciones programadas</span>
        ) : (
          diasDisponibles.map((dia) => (
            <button
              key={dia}
              onClick={() => onSeleccionarDia(dia)}
              className={`px-space-md py-space-xs rounded-full font-label-lg text-label-lg transition-all whitespace-nowrap ${diaSeleccionado === dia ? 'bg-primary text-on-primary font-bold shadow-md shadow-primary/20' : 'bg-surface-container-high hover:bg-surface-bright text-on-surface'}`}
            >
              {formatearDia(dia)}
            </button>
          ))
        )}
      </div>
      <div className="flex items-center gap-space-xs overflow-x-auto pb-1 lg:pb-0">
        <span className="font-label-code text-label-code text-on-surface-variant uppercase px-2">Experiencia:</span>
        <button className="px-space-sm py-space-xs rounded-lg bg-surface-container-highest text-secondary font-label-md text-label-md font-semibold hover:bg-surface-bright transition-all whitespace-nowrap">⚡ IMAX Láser</button>
        <button className="px-space-sm py-space-xs rounded-lg bg-surface-container-highest text-primary font-label-md text-label-md font-semibold hover:bg-surface-bright transition-all whitespace-nowrap">👑 Sala VIP Atmos</button>
        <button className="px-space-sm py-space-xs rounded-lg bg-surface-container-highest text-tertiary font-label-md text-label-md font-semibold hover:bg-surface-bright transition-all whitespace-nowrap">💨 4DX Dinámica</button>
        <button className="px-space-sm py-space-xs rounded-lg bg-surface-container-highest text-on-surface-variant font-label-md text-label-md hover:bg-surface-bright transition-all whitespace-nowrap">MacroXE</button>
      </div>
      <div className="flex items-center gap-space-sm">
        <div className="relative flex-1 lg:w-64">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-[20px]">search</span>
          <input className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant font-body-sm text-body-sm outline-none shadow-inner" placeholder="Buscar título, sala o género..." type="text" />
        </div>
      </div>
    </div>
  </div>
);

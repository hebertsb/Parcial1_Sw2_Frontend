interface PaginacionProps {
  paginaActual: number;
  totalPaginas: number;
  totalItems: number;
  onCambiarPagina: (pagina: number) => void;
}

/** Paginación simple (anterior/siguiente + "página X de Y") para las tablas largas del admin. */
export const Paginacion = ({ paginaActual, totalPaginas, totalItems, onCambiarPagina }: PaginacionProps) => {
  if (totalPaginas <= 1) return null;

  return (
    <div className="flex items-center justify-between px-space-md py-space-sm">
      <span className="font-label-code text-label-code text-on-surface-variant">
        {totalItems} {totalItems === 1 ? 'resultado' : 'resultados'} · página {paginaActual} de {totalPaginas}
      </span>
      <div className="flex items-center gap-space-2xs">
        <button
          onClick={() => onCambiarPagina(paginaActual - 1)}
          disabled={paginaActual === 1}
          className="w-9 h-9 rounded-lg flex items-center justify-center bg-surface-container-high hover:bg-surface-variant text-on-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Página anterior"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
        </button>
        <button
          onClick={() => onCambiarPagina(paginaActual + 1)}
          disabled={paginaActual === totalPaginas}
          className="w-9 h-9 rounded-lg flex items-center justify-center bg-surface-container-high hover:bg-surface-variant text-on-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Página siguiente"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
        </button>
      </div>
    </div>
  );
};

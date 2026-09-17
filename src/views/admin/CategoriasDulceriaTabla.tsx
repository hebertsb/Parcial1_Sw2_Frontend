import type { CategoriaDulceria, ProductoDulceria } from '../../core/types/dulceria.types';

const TH = 'py-space-sm px-space-md text-left font-label-code text-label-code uppercase text-outline';
const TD = 'py-space-sm px-space-md font-body-sm text-body-sm text-on-surface';

interface CategoriasDulceriaTablaProps {
  categorias: CategoriaDulceria[];
  /** Todos los productos — para el badge "En uso" (mismo criterio que `DulceriaService.eliminarCategoria` en el backend). */
  productos: ProductoDulceria[];
  onEditar: (categoria: CategoriaDulceria) => void;
  onEliminar: (categoria: CategoriaDulceria) => void;
}

export const CategoriasDulceriaTabla = ({ categorias, productos, onEditar, onEliminar }: CategoriasDulceriaTablaProps) => (
  <div className="rounded-2xl bg-surface-container-low shadow-lg overflow-x-auto">
    <table className="w-full min-w-[640px]">
      <thead>
        <tr>
          <th className={TH}>Nombre</th>
          <th className={TH}>Orden</th>
          <th className={TH}>Icono</th>
          <th className={TH}>En uso</th>
          <th className={TH}>Acciones</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-surface-container">
        {categorias.length === 0 ? (
          <tr><td className={TD} colSpan={5}>No hay categorías creadas todavía.</td></tr>
        ) : (
          categorias.map((categoria) => {
            const enUso = productos.filter((p) => p.idCategoria === categoria.idCategoria).length;
            return (
              <tr key={categoria.idCategoria}>
                <td className={TD}>{categoria.nombre}</td>
                <td className={TD}>{categoria.ordenVisualizacion}</td>
                <td className={TD}>{categoria.icono ?? '—'}</td>
                <td className={TD}>
                  <span className={`px-space-xs py-0.5 rounded font-label-code text-label-code ${enUso > 0 ? 'bg-primary/10 text-primary' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                    {enUso > 0 ? `${enUso} producto(s)` : 'Sin uso'}
                  </span>
                </td>
                <td className={TD}>
                  <div className="flex items-center gap-space-2xs">
                    <button onClick={() => onEditar(categoria)} className="px-space-sm py-1 rounded bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-code text-label-code transition-colors">
                      Editar
                    </button>
                    <button onClick={() => onEliminar(categoria)} className="px-space-sm py-1 rounded bg-error-container/40 hover:bg-error-container text-on-error-container font-label-code text-label-code transition-colors">
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  </div>
);

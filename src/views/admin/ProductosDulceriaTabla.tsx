import type { CategoriaDulceria, ProductoDulceria } from '../../core/types/dulceria.types';

const TH = 'py-space-sm px-space-md text-left font-label-code text-label-code uppercase text-outline';
const TD = 'py-space-sm px-space-md font-body-sm text-body-sm text-on-surface';

interface ProductosDulceriaTablaProps {
  productos: ProductoDulceria[];
  categorias: CategoriaDulceria[];
  onEditar: (producto: ProductoDulceria) => void;
  onEliminar: (producto: ProductoDulceria) => void;
}

export const ProductosDulceriaTabla = ({ productos, categorias, onEditar, onEliminar }: ProductosDulceriaTablaProps) => (
  <div className="rounded-2xl bg-surface-container-low shadow-lg overflow-x-auto">
    <table className="w-full min-w-[840px]">
      <thead>
        <tr>
          <th className={TH}></th>
          <th className={TH}>Nombre</th>
          <th className={TH}>Categoría</th>
          <th className={TH}>Precio base (Bs)</th>
          <th className={TH}>Tipo</th>
          <th className={TH}>Estado</th>
          <th className={TH}>Acciones</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-surface-container">
        {productos.length === 0 ? (
          <tr><td className={TD} colSpan={7}>No hay productos creados todavía.</td></tr>
        ) : (
          productos.map((producto) => {
            const categoria = categorias.find((c) => c.idCategoria === producto.idCategoria);
            return (
              <tr key={producto.idProducto}>
                <td className={TD}>
                  {producto.imagenUrl ? (
                    <img src={producto.imagenUrl} alt="" className="w-12 h-12 object-cover rounded-lg shadow-sm" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-[20px]">fastfood</span>
                    </div>
                  )}
                </td>
                <td className={TD}>
                  <div className="flex flex-col">
                    <span className="font-bold">{producto.nombre}</span>
                    {producto.etiqueta && <span className="text-on-surface-variant">{producto.etiqueta}</span>}
                  </div>
                </td>
                <td className={TD}>{categoria?.nombre ?? `#${producto.idCategoria}`}</td>
                <td className={TD}>{Number(producto.precioBase).toFixed(2)}</td>
                <td className={TD}>{producto.tipo === 'combo' ? 'Combo' : 'Individual'}</td>
                <td className={TD}>
                  <span className={`px-space-xs py-0.5 rounded font-label-code text-label-code ${producto.disponible ? 'bg-tertiary/10 text-tertiary' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                    {producto.disponible ? 'Disponible' : 'No disponible'}
                  </span>
                </td>
                <td className={TD}>
                  <div className="flex items-center gap-space-2xs">
                    <button onClick={() => onEditar(producto)} className="px-space-sm py-1 rounded bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-code text-label-code transition-colors">
                      Editar
                    </button>
                    {producto.disponible && (
                      <button onClick={() => onEliminar(producto)} className="px-space-sm py-1 rounded bg-error-container/40 hover:bg-error-container text-on-error-container font-label-code text-label-code transition-colors">
                        Quitar del menú
                      </button>
                    )}
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

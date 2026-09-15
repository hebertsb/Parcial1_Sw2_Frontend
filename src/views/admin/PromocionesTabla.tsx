import type { Promocion } from '../../core/types/promocion.types';

const TH = 'py-space-sm px-space-md text-left font-label-code text-label-code uppercase text-outline';
const TD = 'py-space-sm px-space-md font-body-sm text-body-sm text-on-surface';

interface PromocionesTablaProps {
  promociones: Promocion[];
  onEditar: (promocion: Promocion) => void;
  onEliminar: (promocion: Promocion) => void;
  onAsociar: (promocion: Promocion) => void;
}

const valorLegible = (promocion: Promocion) =>
  promocion.tipoDescuento === 'porcentaje' ? `${Number(promocion.valor)}%` : `${Number(promocion.valor).toFixed(2)} Bs`;

export const PromocionesTabla = ({ promociones, onEditar, onEliminar, onAsociar }: PromocionesTablaProps) => (
  <div className="rounded-2xl bg-surface-container-low shadow-lg overflow-x-auto">
    <table className="w-full min-w-[760px]">
      <thead>
        <tr>
          <th className={TH}>Nombre</th>
          <th className={TH}>Descuento</th>
          <th className={TH}>Vigencia</th>
          <th className={TH}>Estado</th>
          <th className={TH}>Acciones</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-surface-container">
        {promociones.length === 0 ? (
          <tr><td className={TD} colSpan={5}>No hay promociones creadas todavía.</td></tr>
        ) : (
          promociones.map((promocion) => (
            <tr key={promocion.idPromocion}>
              <td className={TD}>
                <div className="flex flex-col">
                  <span className="font-bold">{promocion.nombre}</span>
                  {promocion.descripcion && <span className="text-on-surface-variant">{promocion.descripcion}</span>}
                </div>
              </td>
              <td className={TD}>{valorLegible(promocion)}</td>
              <td className={TD}>{promocion.fechaInicio} → {promocion.fechaFin}</td>
              <td className={TD}>
                <span className={`px-space-xs py-0.5 rounded font-label-code text-label-code ${promocion.activa ? 'bg-tertiary/10 text-tertiary' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                  {promocion.activa ? 'Activa' : 'Inactiva'}
                </span>
              </td>
              <td className={TD}>
                <div className="flex items-center gap-space-2xs flex-wrap">
                  <button onClick={() => onAsociar(promocion)} className="px-space-sm py-1 rounded bg-secondary-container/30 hover:bg-secondary-container/50 text-on-surface font-label-code text-label-code transition-colors">
                    Asociar a función
                  </button>
                  <button onClick={() => onEditar(promocion)} className="px-space-sm py-1 rounded bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-code text-label-code transition-colors">
                    Editar
                  </button>
                  <button onClick={() => onEliminar(promocion)} className="px-space-sm py-1 rounded bg-error-container/40 hover:bg-error-container text-on-error-container font-label-code text-label-code transition-colors">
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

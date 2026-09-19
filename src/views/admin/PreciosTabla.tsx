import { FilaAdmin } from './FilaAdmin';
import type { Precio } from '../../core/types/precio.types';
import type { Funcion } from '../../core/types/funcion.types';

const TH = 'py-space-sm px-space-md text-left font-label-code text-label-code uppercase text-outline';
const TD = 'py-space-sm px-space-md font-body-sm text-body-sm text-on-surface';

interface PreciosTablaProps {
  precios: Precio[];
  /** Todas las funciones (sin filtrar por estado) — mismo criterio que `PreciosService.eliminar` en el backend. */
  funciones: Funcion[];
  onEditar: (precio: Precio) => void;
  onEliminar: (precio: Precio) => void;
}

export const PreciosTabla = ({ precios, funciones, onEditar, onEliminar }: PreciosTablaProps) => (
  <div className="rounded-2xl bg-surface-container-low shadow-lg overflow-x-auto">
    <table className="w-full min-w-[640px]">
      <thead>
        <tr>
          <th className={TH}>Valor (Bs)</th>
          <th className={TH}>Vigente desde</th>
          <th className={TH}>Vigente hasta</th>
          <th className={TH}>En uso</th>
          <th className={TH}>Acciones</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-surface-container">
        {precios.length === 0 ? (
          <tr><td className={TD} colSpan={5}>No hay precios creados todavía.</td></tr>
        ) : (
          precios.map((precio) => {
            const enUso = funciones.filter((f) => f.idPrecio === precio.idPrecio).length;
            return (
            <FilaAdmin key={precio.idPrecio} entidad="precio" id={precio.idPrecio}>
              <td className={TD}>{Number(precio.valor).toFixed(2)}</td>
              <td className={TD}>{precio.vigenteDesde}</td>
              <td className={TD}>{precio.vigenteHasta ?? 'Sin límite'}</td>
              <td className={TD}>
                <span className={`px-space-xs py-0.5 rounded font-label-code text-label-code ${enUso > 0 ? 'bg-primary/10 text-primary' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                  {enUso > 0 ? `${enUso} función(es)` : 'Sin uso'}
                </span>
              </td>
              <td className={TD}>
                <div className="flex items-center gap-space-2xs">
                  <button onClick={() => onEditar(precio)} className="px-space-sm py-1 rounded bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-code text-label-code transition-colors">
                    Editar
                  </button>
                  <button onClick={() => onEliminar(precio)} className="px-space-sm py-1 rounded bg-error-container/40 hover:bg-error-container text-on-error-container font-label-code text-label-code transition-colors">
                    Eliminar
                  </button>
                </div>
              </td>
            </FilaAdmin>
            );
          })
        )}
      </tbody>
    </table>
  </div>
);

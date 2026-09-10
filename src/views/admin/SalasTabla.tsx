import type { Sala } from '../../core/types/sala.types';

const TH = 'py-space-sm px-space-md text-left font-label-code text-label-code uppercase text-outline';
const TD = 'py-space-sm px-space-md font-body-sm text-body-sm text-on-surface';

interface SalasTablaProps {
  salas: Sala[];
  onEditar: (sala: Sala) => void;
  onEliminar: (sala: Sala) => void;
}

export const SalasTabla = ({ salas, onEditar, onEliminar }: SalasTablaProps) => (
  <div className="rounded-2xl bg-surface-container-low shadow-lg overflow-x-auto">
    <table className="w-full min-w-[640px]">
      <thead>
        <tr>
          <th className={TH}>Nombre</th>
          <th className={TH}>Capacidad</th>
          <th className={TH}>Tipo</th>
          <th className={TH}>Limpieza (min)</th>
          <th className={TH}>Acciones</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-surface-container">
        {salas.length === 0 ? (
          <tr><td className={TD} colSpan={5}>No hay salas creadas todavía.</td></tr>
        ) : (
          salas.map((sala) => (
            <tr key={sala.idSala}>
              <td className={TD}>{sala.nombre}</td>
              <td className={TD}>{sala.capacidad}</td>
              <td className={TD}>{sala.tipo ?? '—'}</td>
              <td className={TD}>{sala.tiempoLimpiezaMin}</td>
              <td className={TD}>
                <div className="flex items-center gap-space-2xs">
                  <button onClick={() => onEditar(sala)} className="px-space-sm py-1 rounded bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-code text-label-code transition-colors">
                    Editar
                  </button>
                  <button onClick={() => onEliminar(sala)} className="px-space-sm py-1 rounded bg-error-container/40 hover:bg-error-container text-on-error-container font-label-code text-label-code transition-colors">
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

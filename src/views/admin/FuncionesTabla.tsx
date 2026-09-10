import type { Funcion } from '../../core/types/funcion.types';
import type { Pelicula } from '../../core/types/pelicula.types';
import type { Sala } from '../../core/types/sala.types';

const TH = 'py-space-sm px-space-md text-left font-label-code text-label-code uppercase text-outline';
const TD = 'py-space-sm px-space-md font-body-sm text-body-sm text-on-surface whitespace-nowrap';

interface FuncionesTablaProps {
  funciones: Funcion[];
  peliculas: Pelicula[];
  salas: Sala[];
  onEditar: (funcion: Funcion) => void;
  onCancelar: (funcion: Funcion) => void;
}

export const FuncionesTabla = ({ funciones, peliculas, salas, onEditar, onCancelar }: FuncionesTablaProps) => {
  const tituloDe = (idPelicula: number) => peliculas.find((p) => p.idPelicula === idPelicula)?.titulo ?? `#${idPelicula}`;
  const salaDe = (idSala: number) => salas.find((s) => s.idSala === idSala)?.nombre ?? `#${idSala}`;

  return (
    <div className="rounded-2xl bg-surface-container-low shadow-lg overflow-x-auto">
      <table className="w-full min-w-[720px]">
        <thead>
          <tr>
            <th className={TH}>Película</th>
            <th className={TH}>Sala</th>
            <th className={TH}>Fecha</th>
            <th className={TH}>Horario</th>
            <th className={TH}>Estado</th>
            <th className={TH}>Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-container">
          {funciones.length === 0 ? (
            <tr><td className={TD} colSpan={6}>No hay funciones creadas todavía.</td></tr>
          ) : (
            funciones.map((funcion) => (
              <tr key={funcion.idFuncion}>
                <td className={TD}>{tituloDe(funcion.idPelicula)}</td>
                <td className={TD}>{salaDe(funcion.idSala)}</td>
                <td className={TD}>{funcion.fecha}</td>
                <td className={TD}>{funcion.horaInicio.slice(0, 5)} - {funcion.horaFin.slice(0, 5)}</td>
                <td className={TD}>
                  <span className={`px-space-xs py-0.5 rounded-full font-label-code text-label-code uppercase ${funcion.estado === 'programada' ? 'bg-tertiary-container/30 text-tertiary' : 'bg-surface-container text-on-surface-variant'}`}>
                    {funcion.estado}
                  </span>
                </td>
                <td className={TD}>
                  {funcion.estado === 'programada' && (
                    <div className="flex items-center gap-space-2xs">
                      <button onClick={() => onEditar(funcion)} className="px-space-sm py-1 rounded bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-code text-label-code transition-colors">
                        Editar
                      </button>
                      <button onClick={() => onCancelar(funcion)} className="px-space-sm py-1 rounded bg-error-container/40 hover:bg-error-container text-on-error-container font-label-code text-label-code transition-colors">
                        Cancelar
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

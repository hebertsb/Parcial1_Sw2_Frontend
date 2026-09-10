import type { Pelicula } from '../../core/types/pelicula.types';
import { posterFor } from '../../core/posters';

const TH = 'py-space-sm px-space-md text-left font-label-code text-label-code uppercase text-outline';
const TD = 'py-space-sm px-space-md font-body-sm text-body-sm text-on-surface';

interface PeliculasTablaProps {
  peliculas: Pelicula[];
  onEditar: (pelicula: Pelicula) => void;
  onEliminar: (pelicula: Pelicula) => void;
}

export const PeliculasTabla = ({ peliculas, onEditar, onEliminar }: PeliculasTablaProps) => (
  <div className="rounded-2xl bg-surface-container-low shadow-lg overflow-x-auto">
    <table className="w-full min-w-[640px]">
      <thead>
        <tr>
          <th className={TH}>Poster</th>
          <th className={TH}>Título</th>
          <th className={TH}>Género</th>
          <th className={TH}>Duración</th>
          <th className={TH}>Clasificación</th>
          <th className={TH}>Acciones</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-surface-container">
        {peliculas.length === 0 ? (
          <tr><td className={TD} colSpan={6}>No hay películas activas todavía.</td></tr>
        ) : (
          peliculas.map((pelicula) => (
            <tr key={pelicula.idPelicula}>
              <td className={TD}>
                <div
                  className="w-10 h-14 rounded bg-cover bg-center bg-surface-container-highest"
                  style={{ backgroundImage: `url('${pelicula.posterUrl ?? posterFor(pelicula.idPelicula)}')` }}
                />
              </td>
              <td className={TD}>{pelicula.titulo}</td>
              <td className={TD}>{pelicula.genero ?? '—'}</td>
              <td className={TD}>{pelicula.duracionMin} min</td>
              <td className={TD}>{pelicula.clasificacion ?? '—'}</td>
              <td className={TD}>
                <div className="flex items-center gap-space-2xs">
                  <button onClick={() => onEditar(pelicula)} className="px-space-sm py-1 rounded bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-code text-label-code transition-colors">
                    Editar
                  </button>
                  <button onClick={() => onEliminar(pelicula)} className="px-space-sm py-1 rounded bg-error-container/40 hover:bg-error-container text-on-error-container font-label-code text-label-code transition-colors">
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

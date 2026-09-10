import { Pelicula } from '../../core/types/pelicula.types';
import { Funcion } from '../../core/types/funcion.types';
import { PeliculaCard } from './PeliculaCard';

interface CarteleraGridProps {
  cargando: boolean;
  error: string | null;
  peliculas: Pelicula[];
  funcionesPorPelicula: Map<number, Funcion[]>;
}

/** Muestra el catálogo real, o el estado que corresponda: error, cargando o vacío. La cartelera es pública — no requiere sesión (ver Cartelera.tsx). */
export const CarteleraGrid = ({ cargando, error, peliculas, funcionesPorPelicula }: CarteleraGridProps) => {
  if (error) {
    return (
      <div className="w-full px-space-lg py-space-2xl flex flex-col items-center gap-space-sm text-center">
        <span className="material-symbols-outlined text-[48px] text-error">error</span>
        <p className="font-headline-sm text-headline-sm text-error">{error}</p>
      </div>
    );
  }

  if (cargando) {
    return (
      <div className="w-full px-space-lg py-space-2xl flex flex-col items-center gap-space-sm text-center">
        <span className="material-symbols-outlined text-[32px] text-on-surface-variant animate-spin">progress_activity</span>
        <p className="font-label-md text-label-md text-on-surface-variant">Cargando cartelera...</p>
      </div>
    );
  }

  if (peliculas.length === 0) {
    return (
      <div className="w-full px-space-lg py-space-2xl text-center">
        <p className="font-label-md text-label-md text-on-surface-variant">No hay películas en cartelera todavía.</p>
      </div>
    );
  }

  return (
    <div className="w-full px-space-lg py-space-md grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-lg">
      {peliculas.map((pelicula) => (
        <PeliculaCard key={pelicula.idPelicula} pelicula={pelicula} funciones={funcionesPorPelicula.get(pelicula.idPelicula) ?? []} />
      ))}
    </div>
  );
};

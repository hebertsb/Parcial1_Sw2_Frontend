export type EstadoPelicula = 'activa' | 'inactiva';

/** Misma forma que `Backend/src/database/entities/pelicula.entity.ts`. `posterUrl` es una URL de Cloudinary o `null` (usar `posterFor(idPelicula)` de `src/core/posters.ts` como fallback). */
export interface Pelicula {
  idPelicula: number;
  titulo: string;
  genero: string | null;
  duracionMin: number;
  clasificacion: string | null;
  estado: EstadoPelicula;
  posterUrl: string | null;
  /** Descripción (2026-09-18). Opcional en el tipo para no romper quien arma una `Pelicula` a mano; el backend siempre la devuelve (`null` si no hay). */
  sinopsis?: string | null;
}

/** Body de `POST /peliculas` / `PATCH /peliculas/:id` — misma forma que `CrearPeliculaDto` del backend. */
export interface CrearPeliculaInput {
  titulo: string;
  genero?: string;
  duracionMin: number;
  clasificacion?: string;
  posterUrl?: string;
  sinopsis?: string;
}

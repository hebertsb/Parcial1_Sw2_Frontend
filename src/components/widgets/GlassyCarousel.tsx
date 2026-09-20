import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Pelicula } from "../../core/types/pelicula.types";
import { posterFor } from "../../core/posters";

export interface MovieCarouselItem {
  id?: number;
  titulo: string;
  subtitulo?: string;
  director: string;
  anio: number;
  genero: string;
  rating: string;
  posterUrl: string;
  youtubeId: string;
  sinopsis: string;
  peliculaReal?: Pelicula;
}

// Catálogo base con los trailers oficiales en alta definición, idéntico al del video de referencia
const MOVIES_PREVIEW: MovieCarouselItem[] = [
  {
    titulo: "Dune: Part Two",
    subtitulo: "Duna: Parte Dos",
    director: "Denis Villeneuve",
    anio: 2024,
    genero: "Epic Sci-Fi",
    rating: "8.8",
    posterUrl:
      "https://image.tmdb.org/t/p/w780/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
    youtubeId: "Way9Dexny3w",
    sinopsis:
      "Paul Atreides se une a Chani y a los Fremen mientras busca venganza contra los conspiradores que destruyeron a su familia.",
  },
  {
    titulo: "Blade Runner 2049",
    subtitulo: "Blade Runner 2049",
    director: "Denis Villeneuve",
    anio: 2017,
    genero: "Neo-Noir",
    rating: "8.0",
    posterUrl:
      "https://image.tmdb.org/t/p/w780/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
    youtubeId: "gCcx85zbxz4",
    sinopsis:
      "Treinta años después de los eventos de la primera película, un nuevo blade runner desentierra un secreto guardado durante mucho tiempo.",
  },
  {
    titulo: "Spider-Man: Spider-Verse",
    subtitulo: "Across the Spider-Verse",
    director: "Joaquim Dos Santos & Kemp Powers",
    anio: 2023,
    genero: "Animación / Acción",
    rating: "8.7",
    posterUrl:
      "https://image.tmdb.org/t/p/w780/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
    youtubeId: "cqGjhVJWtEg",
    sinopsis:
      "Miles Morales es catapultado a través del Multiverso, donde se encuentra con un equipo de Spider-People encargado de proteger su existencia.",
  },
  {
    titulo: "Oppenheimer",
    subtitulo: "Oppenheimer",
    director: "Christopher Nolan",
    anio: 2023,
    genero: "Historical Drama",
    rating: "8.9",
    posterUrl:
      "https://image.tmdb.org/t/p/w780/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    youtubeId: "uYPbbksJxIg",
    sinopsis:
      "La historia del científico J. Robert Oppenheimer y su liderazgo en el desarrollo de la bomba atómica en el Proyecto Manhattan.",
  },
  {
    titulo: "Interstellar",
    subtitulo: "Interestelar",
    director: "Christopher Nolan",
    anio: 2014,
    genero: "Epic Sci-Fi",
    rating: "8.7",
    posterUrl:
      "https://image.tmdb.org/t/p/w780/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    youtubeId: "zSWdZVtXT7E",
    sinopsis:
      "Un equipo de exploradores viaja a través de un agujero de gusano en el espacio en un intento por asegurar la supervivencia de la humanidad.",
  },
  {
    titulo: "El Viaje de Chihiro",
    subtitulo: "Spirited Away",
    director: "Hayao Miyazaki",
    anio: 2001,
    genero: "Anime Fantasy",
    rating: "8.6",
    posterUrl:
      "https://image.tmdb.org/t/p/w780/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",
    youtubeId: "ByXuk9QqQkk",
    sinopsis:
      "Chihiro entra a un mundo misterioso gobernado por dioses, espíritus y una bruja donde sus padres son transformados.",
  },
];

interface GlassyCarouselProps {
  peliculasCatalogo?: Pelicula[];
  onSeleccionarPelicula?: (pelicula: Pelicula) => void;
}

export const GlassyCarousel: React.FC<GlassyCarouselProps> = ({
  peliculasCatalogo = [],
  onSeleccionarPelicula,
}) => {
  const navigate = useNavigate();

  // Fusionamos los trailers con las películas activas del sistema para que "Comprar" funcione directo
  const [items, setItems] = useState<MovieCarouselItem[]>(() => {
    return MOVIES_PREVIEW.map((item) => {
      const encontrada = peliculasCatalogo.find((p) => {
        const t1 = p.titulo.toLowerCase();
        const t2 = item.titulo.toLowerCase();
        const t3 = (item.subtitulo ?? "").toLowerCase();
        return (
          t1.includes(t2) ||
          t2.includes(t1) ||
          (t3 && (t1.includes(t3) || t3.includes(t1)))
        );
      });
      return encontrada
        ? { ...item, id: encontrada.idPelicula, peliculaReal: encontrada }
        : item;
    });
  });

  useEffect(() => {
    if (peliculasCatalogo.length === 0) return;

    setItems((prevItems) => {
      // 1. Mapeamos los que ya tenemos
      const mapeados = prevItems.map((item) => {
        const encontrada = peliculasCatalogo.find((p) => {
          const t1 = p.titulo.toLowerCase();
          const t2 = item.titulo.toLowerCase();
          const t3 = (item.subtitulo ?? "").toLowerCase();
          return (
            t1.includes(t2) ||
            t2.includes(t1) ||
            (t3 && (t1.includes(t3) || t3.includes(t1)))
          );
        });
        return encontrada
          ? { ...item, id: encontrada.idPelicula, peliculaReal: encontrada }
          : item;
      });

      // 2. Si hay películas del backend que no están en la lista fija, las añadimos
      const extras: MovieCarouselItem[] = [];
      peliculasCatalogo.forEach((p) => {
        const yaEsta = mapeados.some(
          (m) => m.peliculaReal?.idPelicula === p.idPelicula,
        );
        if (!yaEsta) {
          extras.push({
            id: p.idPelicula,
            titulo: p.titulo,
            director: "Director Cinema",
            anio: 2026,
            genero: p.genero ?? "Estreno",
            rating: "8.5",
            posterUrl: p.posterUrl ?? posterFor(p.idPelicula),
            youtubeId: "Way9Dexny3w", // fallback a trailer cinemático
            sinopsis:
              p.sinopsis ??
              "Disfruta de este gran estreno en nuestras salas con tecnología láser y sonido envolvente.",
            peliculaReal: p,
          });
        }
      });

      return [...mapeados, ...extras];
    });
  }, [peliculasCatalogo]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedTrailer, setSelectedTrailer] =
    useState<MovieCarouselItem | null>(null);

  const total = items.length;

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Rotación automática cada 4.5 segundos si isPlaying está activo
  useEffect(() => {
    if (!isPlaying || selectedTrailer !== null) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 4500);
    return () => clearInterval(interval);
  }, [isPlaying, nextSlide, selectedTrailer]);

  // Soporte para teclado (Flechas izq/der y Escape para cerrar el modal)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedTrailer) {
        if (e.key === "Escape") setSelectedTrailer(null);
        return;
      }
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide, selectedTrailer]);

  // Gestión de arrastre / swipe
  const touchStartX = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX =
      "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    touchStartX.current = clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (touchStartX.current === null) return;
    const clientX =
      "changedTouches" in e
        ? e.changedTouches[0].clientX
        : (e as React.MouseEvent).clientX;
    const diff = clientX - touchStartX.current;
    if (diff > 50) prevSlide();
    else if (diff < -50) nextSlide();
    touchStartX.current = null;
  };

  const currentMovie = items[activeIndex] ?? items[0];

  const handleComprar = (item: MovieCarouselItem) => {
    if (item.peliculaReal && onSeleccionarPelicula) {
      onSeleccionarPelicula(item.peliculaReal);
    } else {
      const targetId = item.id ? `pelicula-${item.id}` : "grid-cartelera";
      const el =
        document.getElementById(targetId) ||
        document.getElementById("grid-cartelera");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        navigate("/cartelera");
      }
    }
  };

  return (
    <section className="relative w-full overflow-hidden py-space-xl flex flex-col items-center select-none">
      {/* Título de la sección estilo video original */}
      <div className="text-center mb-6 space-y-1 z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-label-code text-label-code uppercase tracking-widest font-bold mb-1">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          GLASSY CAROUSEL ANIMATION
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight uppercase font-display-hero">
          Estrenos &{" "}
          <span className="bg-gradient-to-r from-primary via-primary-fixed-dim to-secondary bg-clip-text text-transparent">
            Adelantos 3D
          </span>
        </h2>
        <p className="text-on-surface-variant font-body-sm text-sm max-w-lg mx-auto">
          Pasa el cursor o usa los controles inferiores para explorar los
          trailers oficiales en 4K antes de comprar.
        </p>
      </div>

      {/* Escenario 3D Cover Flow */}
      <div
        className="relative w-full h-[460px] md:h-[500px] flex items-center justify-center cursor-grab active:cursor-grabbing"
        style={{ perspective: "1100px", transformStyle: "preserve-3d" }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
      >
        {items.map((movie, index) => {
          let offset = (index - activeIndex + total) % total;
          if (offset > total / 2) offset -= total;

          const isCenter = offset === 0;
          const isVisible = Math.abs(offset) <= 2;

          // Calculamos la posición en 3D
          let translateX = offset * 240;
          let translateZ = -Math.abs(offset) * 70;
          let rotateY = -offset * 25;
          let scale = 1 - Math.abs(offset) * 0.15;
          let opacity = isCenter ? 1 : Math.abs(offset) === 1 ? 0.72 : 0.35;
          let zIndex = 30 - Math.abs(offset) * 10;

          // En pantallas pequeñas compactamos el desplazamiento
          if (typeof window !== "undefined" && window.innerWidth < 768) {
            translateX = offset * 150;
            scale = 1 - Math.abs(offset) * 0.2;
          }

          if (!isVisible) {
            opacity = 0;
            zIndex = 0;
          }

          return (
            <div
              key={`${movie.titulo}-${index}`}
              onClick={() => {
                if (!isCenter) setActiveIndex(index);
              }}
              style={{
                transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                zIndex,
                opacity,
                transition:
                  "transform 500ms cubic-bezier(0.25, 1, 0.5, 1), opacity 500ms ease",
              }}
              className={`absolute top-4 w-[240px] md:w-[280px] aspect-[2/3] rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer group transition-shadow duration-500 ${
                isCenter
                  ? "shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_40px_rgba(245,158,11,0.2)] ring-1 ring-white/30"
                  : "shadow-2xl hover:opacity-90 ring-1 ring-white/10"
              }`}
            >
              {/* Poster de fondo */}
              <div
                className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url('${movie.posterUrl}')` }}
              >
                {/* Degradados cinemáticos y brillo vítreo */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none"></div>

                {/* Badge de resolución / formato */}
                <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                  <span className="text-[10px] font-bold text-white tracking-widest uppercase">
                    4K HDR
                  </span>
                </div>

                {/* Botón Watch Trailer en el centro de la tarjeta activa */}
                {isCenter && (
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTrailer(movie);
                      }}
                      className="group/btn inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black/70 backdrop-blur-xl border border-white/30 text-white font-semibold text-sm shadow-[0_8px_25px_rgba(0,0,0,0.7)] hover:bg-primary hover:text-black hover:scale-105 transition-all duration-300 active:scale-95"
                    >
                      <span className="w-6 h-6 rounded-full bg-white/20 group-hover/btn:bg-black/20 flex items-center justify-center text-xs">
                        ▶
                      </span>
                      <span>Watch Trailer</span>
                    </button>
                  </div>
                )}

                {/* Información inferior de la tarjeta */}
                <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col justify-end text-left">
                  <h3 className="text-lg md:text-xl font-bold text-white tracking-tight truncate leading-snug">
                    {movie.titulo}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-white/75 mt-0.5">
                    <span>{movie.anio}</span>
                    <span>•</span>
                    <span className="truncate max-w-[120px]">
                      {movie.genero}
                    </span>
                    <span>•</span>
                    <span className="text-amber-400 font-bold flex items-center gap-0.5">
                      ★ {movie.rating}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reflejo / Sombra de piso difuminada */}
      <div className="w-[600px] max-w-full h-8 bg-gradient-to-b from-primary/10 to-transparent blur-2xl rounded-full -mt-4 pointer-events-none"></div>

      {/* Dock Flotante de Control (Bottom Glassy Media Bar) */}
      <div className="relative z-20 mt-6 w-full max-w-xl px-4">
        <div className="flex items-center justify-between gap-4 px-5 py-2.5 rounded-full bg-surface-container-lowest/85 backdrop-blur-2xl border border-white/15 shadow-[0_15px_35px_rgba(0,0,0,0.8)]">
          {/* Controles de Reproducción Izquierda */}
          <div className="flex items-center gap-2 text-white">
            <button
              onClick={prevSlide}
              title="Película Anterior"
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">
                skip_previous
              </span>
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              title={isPlaying ? "Pausar rotación" : "Reanudar rotación"}
              className="w-9 h-9 rounded-full bg-white/15 hover:bg-primary hover:text-black flex items-center justify-center text-white transition-all shadow-md active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">
                {isPlaying ? "pause" : "play_arrow"}
              </span>
            </button>
            <button
              onClick={nextSlide}
              title="Siguiente Película"
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">
                skip_next
              </span>
            </button>
          </div>

          {/* Miniatura y Título Central */}
          <div
            onClick={() => setSelectedTrailer(currentMovie)}
            className="flex items-center gap-3 min-w-0 px-2 py-1 rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
          >
            <img
              src={currentMovie.posterUrl}
              alt={currentMovie.titulo}
              className="w-7 h-9 rounded-md object-cover border border-white/20 shadow-sm shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-white truncate max-w-[140px] md:max-w-[180px]">
                {currentMovie.titulo}
              </span>
              <span className="text-[10px] text-on-surface-variant truncate max-w-[140px]">
                {currentMovie.genero} • {currentMovie.anio}
              </span>
            </div>
          </div>

          {/* Controles Derecha */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? "Silenciado" : "Sonido activado"}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isMuted ? "volume_off" : "volume_up"}
              </span>
            </button>
            <button
              onClick={() => setSelectedTrailer(currentMovie)}
              title="Ver Adelanto en Pantalla Completa"
              className="px-3 py-1.5 rounded-full bg-secondary/20 hover:bg-secondary text-secondary hover:text-black font-label-code text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[15px]">
                smart_display
              </span>
              <span className="hidden sm:inline">Adelanto</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Adelanto / Trailer (Idéntico a 00:02 - 00:04 del video) */}
      {selectedTrailer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/85 backdrop-blur-xl animate-fadeIn"
          onClick={() => setSelectedTrailer(null)}
        >
          <div
            className="relative w-full max-w-4xl bg-gradient-to-b from-surface-container-high/90 to-surface-container-lowest/95 backdrop-blur-2xl border border-white/20 rounded-3xl overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.95)] flex flex-col transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera Superior del Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-error animate-ping"></span>
                <span className="font-label-code text-xs font-bold tracking-widest text-white uppercase">
                  TRAILER • 4K HDR
                </span>
                <span className="text-white/30 hidden sm:inline">•</span>
                <span className="text-xs text-white/70 font-medium hidden sm:inline truncate max-w-xs">
                  {selectedTrailer.titulo}
                </span>
              </div>
              <button
                onClick={() => setSelectedTrailer(null)}
                className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 text-white text-xs font-semibold tracking-wider transition-all"
              >
                <span>✕</span>
                <span>Cerrar</span>
              </button>
            </div>

            {/* Reproductor de Video 16:9 */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${selectedTrailer.youtubeId}?autoplay=1&rel=0&modestbranding=1&mute=${isMuted ? 1 : 0}`}
                title={`${selectedTrailer.titulo} Official Trailer`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            {/* Pie de Información del Trailer */}
            <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-surface-container-lowest/90">
              <div className="space-y-1 max-w-xl">
                <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight font-headline-lg">
                  {selectedTrailer.titulo}
                </h3>
                <p className="text-sm text-secondary font-medium">
                  Dirigida por {selectedTrailer.director}
                </p>
                <div className="flex items-center gap-3 text-xs text-white/70 pt-1">
                  <span className="px-2 py-0.5 rounded bg-white/10 font-mono font-bold">
                    {selectedTrailer.anio}
                  </span>
                  <span>•</span>
                  <span>{selectedTrailer.genero}</span>
                  <span>•</span>
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    ★ {selectedTrailer.rating} IMDB
                  </span>
                </div>
              </div>

              {/* Botón de Acción para Comprar */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  onClick={() => {
                    const t = selectedTrailer;
                    setSelectedTrailer(null);
                    handleComprar(t);
                  }}
                  className="w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-container text-on-primary-container font-headline-sm text-sm font-bold flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(245,158,11,0.4)] hover:scale-105 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    confirmation_number
                  </span>
                  <span>Comprar Entradas</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

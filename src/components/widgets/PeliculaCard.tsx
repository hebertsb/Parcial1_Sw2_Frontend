import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pelicula } from '../../core/types/pelicula.types';
import { Funcion } from '../../core/types/funcion.types';
import { useCine } from '../../controllers/CineContext';
import { posterFor } from '../../core/posters';
import { useUiControl } from '../../core/ui/UiControlContext';

interface PeliculaCardProps {
  pelicula: Pelicula;
  /** Funciones futuras reales de esta película, ya filtradas/ordenadas por Cartelera.tsx. */
  funciones: Funcion[];
}

export const PeliculaCard = ({ pelicula, funciones }: PeliculaCardProps) => {
  const { dispatch } = useCine();
  const navigate = useNavigate();
  // Lo que el agente de voz esta señalando ("Quiero entradas para X", "a las 8"): la tarjeta se resalta, se centra en
  // pantalla y, si ya eligio el horario, ese boton late. Se apaga solo (ver UiControlContext).
  const { resaltado } = useUiControl();
  const tarjetaRef = useRef<HTMLDivElement | null>(null);
  const señalada = !!resaltado?.ids.includes(pelicula.idPelicula);
  useEffect(() => {
    if (señalada) tarjetaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [señalada, resaltado?.n]);

  const handleSeleccionar = (funcion: Funcion) => {
    dispatch({ type: 'SELECCIONAR_PELICULA', payload: { pelicula, horario: funcion.horaInicio } });
    dispatch({ type: 'SET_FUNCION_SELECCIONADA', payload: funcion });
    navigate('/compra');
  };

  return (
    <div
      ref={tarjetaRef}
      data-pelicula-resaltada={señalada ? 'true' : undefined}
      className={`movie-card group relative flex flex-col bg-surface-container rounded-2xl overflow-hidden shadow-xl hover:-translate-y-1 transition-all duration-500 ${señalada ? 'ring-2 ring-primary scale-[1.03] shadow-[0_0_48px_rgba(245,158,11,0.55)] z-10' : ''}`}
    >

      <div className="relative aspect-[2/3] w-full bg-surface-container-low overflow-hidden">
        <div
          className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url('${pelicula.posterUrl ?? posterFor(pelicula.idPelicula)}')` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-transparent to-black/40"></div>
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-space-2xs">
          <span className="px-2 py-0.5 rounded bg-surface-container-highest/90 text-on-surface-variant font-label-code text-label-code">
            {pelicula.clasificacion ?? 'Sin clasificar'}
          </span>
          <span className="px-2 py-0.5 rounded bg-surface-container-highest/90 text-on-surface-variant font-label-code text-label-code">
            {pelicula.duracionMin} Min
          </span>
        </div>
      </div>
      {/* Details */}
      <div className="p-space-md flex flex-col flex-1 justify-between gap-space-md">
        <div className="flex flex-col gap-1">
          <h3 className="font-headline-md text-headline-md text-on-surface group-hover:text-primary transition-colors truncate">{pelicula.titulo}</h3>
          <div className="flex items-center gap-2 pt-1">
            <span className="font-label-code text-label-code text-secondary">{pelicula.genero ?? 'Género no especificado'}</span>
          </div>
        </div>
        {/* Showtime Pills */}
        <div className="flex flex-col gap-space-xs bg-surface-container-low p-space-sm rounded-xl">
          <div className="flex items-center justify-between gap-space-xs">
            <span className="text-label-code font-label-code text-on-surface-variant">HORARIOS</span>
            {señalada && (
              <span className="px-space-sm py-space-2xs rounded-full bg-primary text-on-primary font-label-code text-label-code font-bold uppercase tracking-wider animate-pulse">
                Señalada por Lumen
              </span>
            )}
          </div>
          {funciones.length === 0 ? (
            <span className="py-2 text-center font-body-sm text-body-sm text-on-surface-variant">Sin funciones programadas</span>
          ) : (
            <div className="grid grid-cols-3 gap-space-2xs">
              {funciones.map((funcion) => (
                <button
                  key={funcion.idFuncion}
                  onClick={() => handleSeleccionar(funcion)}
                  data-funcion-resaltada={resaltado?.idFuncion === funcion.idFuncion ? 'true' : undefined}
                  className={`py-2 rounded-lg text-center font-headline-sm text-label-lg transition-all duration-300 ${resaltado?.idFuncion === funcion.idFuncion ? 'bg-primary text-on-primary ring-4 ring-primary/50 scale-110 shadow-lg animate-pulse' : 'bg-surface-container-high hover:bg-primary hover:text-on-primary'}`}
                >
                  {funcion.horaInicio.slice(0, 5)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

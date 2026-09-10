import { useNavigate } from 'react-router-dom';
import { Pelicula } from '../../core/types/pelicula.types';
import { useCine } from '../../controllers/CineContext';

export const PeliculaCard = ({ pelicula }: { pelicula: Pelicula }) => {
  const { dispatch } = useCine();
  const navigate = useNavigate();

  const handleSeleccionar = (horario: string, isVip: boolean = false) => {
    dispatch({ type: 'SELECCIONAR_PELICULA', payload: { pelicula, horario } });
    navigate('/compra');
  };

  return (
    <div className="movie-card group flex flex-col bg-surface-container rounded-2xl overflow-hidden shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="relative aspect-[2/3] w-full bg-surface-container-low overflow-hidden">
        <div className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{backgroundImage: `url('${pelicula.posterUrl}')`}}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-transparent to-black/40"></div>
        {/* Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="px-space-xs py-1 rounded bg-black/60 backdrop-blur-md text-primary font-label-code text-label-code uppercase font-bold">
            PREMIUM
          </span>
          <span className="flex items-center gap-1 px-space-xs py-1 rounded bg-black/60 backdrop-blur-md text-on-surface font-label-code text-label-code">
            <span className="material-symbols-outlined text-primary text-[14px]" style={{fontVariationSettings: "'FILL' 1"}}>star</span> 9.0
          </span>
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-space-2xs">
          <span className="px-2 py-0.5 rounded bg-surface-container-highest/90 text-on-surface-variant font-label-code text-label-code">{pelicula.clasificacion}</span>
          <span className="px-2 py-0.5 rounded bg-surface-container-highest/90 text-on-surface-variant font-label-code text-label-code">{pelicula.duracionMinutos} Min</span>
        </div>
      </div>
      {/* Details */}
      <div className="p-space-md flex flex-col flex-1 justify-between gap-space-md">
        <div className="flex flex-col gap-1">
          <h3 className="font-headline-md text-headline-md text-on-surface group-hover:text-primary transition-colors truncate">{pelicula.titulo}</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">{pelicula.sinopsis}</p>
          <div className="flex items-center gap-2 pt-1">
            <span className="font-label-code text-label-code text-secondary">{pelicula.genero}</span>
          </div>
        </div>
        {/* Showtime Pills & Price */}
        <div className="flex flex-col gap-space-xs bg-surface-container-low p-space-sm rounded-xl">
          <div className="flex items-center justify-between text-label-code font-label-code text-on-surface-variant">
            <span>HORARIOS HOY</span>
            <span className="text-primary font-bold">65 Bs / 80 Bs VIP</span>
          </div>
          <div className="grid grid-cols-3 gap-space-2xs">
            {pelicula.horarios.map((horario, index) => {
              const isVip = index === 1; // Arbitrary VIP logic for UI representation
              return (
                <button
                  key={horario}
                  onClick={() => handleSeleccionar(horario, isVip)}
                  className={`py-2 rounded-lg text-center font-headline-sm text-label-lg transition-colors ${
                    isVip 
                      ? 'bg-primary-container text-on-primary-container font-bold shadow-md'
                      : 'bg-surface-container-high hover:bg-primary hover:text-on-primary'
                  }`}
                >
                  {horario}
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-between text-label-code font-label-code text-on-surface-variant pt-1">
            <span>Sala Premium</span>
            <span className="text-tertiary">Butacas libres</span>
          </div>
        </div>
      </div>
    </div>
  );
};

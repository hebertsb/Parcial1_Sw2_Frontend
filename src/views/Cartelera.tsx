import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCine } from '../controllers/CineContext';
import { PeliculaCard } from '../components/widgets/PeliculaCard';
import { Pelicula } from '../core/types/pelicula.types';

const MOCK_PELICULAS: Pelicula[] = [
  {
    id: '1',
    titulo: 'Oppenheimer',
    sinopsis: 'Historia del físico J. Robert Oppenheimer y su rol en el Proyecto Manhattan que alteró la historia humana.',
    posterUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqKJAHKMk2UrBZxP-Q2Oe8t1ByJbEN0aj8n1-cEh-Zh2XZ-QQeovFwzMA_7Fy9YCg702os4PGj8E1M0bN3jgy3Iip349uC-mvILF7TXvJUJRHXsvg-ra-G9-JyxoCoBq-OdGs8RfJwXFdVwV3ER0-Ojmya7JN3eR1vC6ijBCCFC1fDyt_LcU9PK_LXahPRtQ7L1-xxBf258bdExlV_DZnPUFahs5EdFBZibNcPoLKUHotD06rhGWpO6w',
    duracionMinutos: 180,
    clasificacion: '+16 Años',
    genero: 'Drama Histórico',
    horarios: ['16:00', '19:45', '23:00']
  },
  {
    id: '2',
    titulo: 'Spider-Man: Beyond',
    sinopsis: 'Miles Morales viaja a través del multiverso desafiando las leyes canónicas de la Sociedad Arácnida.',
    posterUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAoSaJow42RXnlL9NO45KLL2-1nWag1KjqkvePsaZarrDK6jTQRAudG7VG4_I6q0pXeB7KT5RQX9WfYHXpfUdIJR6TvQB1QpsXOalCzLvtBLvzRJIObXWVHgjn5UGtLfnG3pRnVac4jou7Ni41etAoy6vBUT5luybCcjwKs10lGIHLIuo293-jB_ycipjctz0YZgtDEs0deepZfCEC44PaDsWY8r1vW9qnzv_AJAUray-ryiVTAH9ILug',
    duracionMinutos: 140,
    clasificacion: 'TEPT Todos',
    genero: 'Animación • Acción',
    horarios: ['15:15', '18:20', '21:10']
  },
  {
    id: '3',
    titulo: 'El Viaje de Chihiro',
    sinopsis: 'Edición 4K conmemorativa. Chihiro entra en un mundo mágico de espíritus para salvar a sus padres.',
    posterUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYry0C1IcnL4Ltv4OFETHIWyBkrHbvpjPXzDqTucsL10WlZMB4PgNlS_t7pTaYCy1sOUOBFLVd_O-f2nM4xHy-UHQ_pZKSUp1sS0O9lEw_8A3YqsWBR8Kov0D9vIWj6DqHGGsDHKbPwvBoNaLDIbnMU5nveCOou1dosTK5hb72iD2ZHVaeaLN3o-TGU35nEmafISH2D4Kl7K0eJB32cjynfenu7fZhPpREt4Oegiws7QCrf5knifSgCg',
    duracionMinutos: 125,
    clasificacion: 'Todo Público',
    genero: 'Ghibli Clásico',
    horarios: ['14:30', '17:40', '20:30']
  },
  {
    id: '4',
    titulo: 'Blade Runner 2049',
    sinopsis: 'Treinta años después de los eventos del primer film, un nuevo blade runner descubre un secreto enterrado.',
    posterUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCz9gT6ZQ8Y8b-AyeZPc3ZPaTL4cgKdqq_7U2KzuJFz2zJQSwlhH6l4T3RS72t2o0h-Fh67VDg71TYs9vwlVIowLIxALu4vnZurMs6vo9bG8_o6bfFh0bpgi4RaDElYLTRtzOYiel9cZNQTXpRRBIeE6DUupXywfGaCtQthq1K21K6HOTPwnL7FVD3mf3n58PA5wmzPt-8-nT-Q-hhSwpTz0nN8gWJuEY6jW10pO7TFUKhNIVwRbYE5ZA',
    duracionMinutos: 164,
    clasificacion: '+16 Años',
    genero: 'Cyberpunk Neo-Noir',
    horarios: ['18:00', '21:30', '23:45']
  }
];

export const Cartelera = () => {
  const { state, dispatch } = useCine();
  const navigate = useNavigate();

  useEffect(() => {
    if (state.peliculas.length === 0) {
      dispatch({ type: 'SET_PELICULAS', payload: MOCK_PELICULAS });
    }
  }, [dispatch, state.peliculas.length]);

  const selectHeroMovie = () => {
    const movie: Pelicula = {
      id: 'hero-dune',
      titulo: 'Duna: Parte Dos',
      sinopsis: 'Paul Atreides se une a Chani y a los Fremen mientras busca venganza contra los conspiradores que destruyeron a su familia. Ante una elección entre el amor de su vida y el destino del universo, Paul debe prevenir un futuro terrible.',
      posterUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCo6z4UdTfATjr6Eqlu1pEZvmT0DwoX5B0qZ96XgQKe9VMJQ706-cHHeQd7-lotLmFcptZsLDzeeI9xzCqc9nYssjD_vJXtiUpX8_vy9_VClazA7swJiklxwsHzOZresTirl8XAyHk9WmFESbZubvPdm-pGQREFD15VGe5voLGhA3bqD5uYEZRRq5M3BPUW13w0C_HNGiRCnqH2gfpNNbwyrdiA4uTvXeWrbeSuv-B037tgKPPRbv0LEA',
      duracionMinutos: 166,
      clasificacion: '+14 Años',
      genero: 'Sci-Fi • Aventura Épica',
      horarios: ['17:30', '20:15', '22:45']
    };
    dispatch({ type: 'SELECCIONAR_PELICULA', payload: { pelicula: movie, horario: '20:15' } });
    navigate('/compra');
  };

  return (
    <div className="max-w-[1720px] mx-auto w-full px-space-xl lg:px-space-2xl py-space-xl flex-grow flex flex-col">
    <div className="flex-grow flex flex-col pb-32">
      {/* TOP AMBIENT PROJECTION LAYER */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-12 right-10 w-80 h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* HERO SECTION: CINEMATIC MASTER FEATURED ('Dune: Parte Dos') */}
        <div className="relative w-full px-space-lg pt-space-lg pb-space-xl">
          <div className="relative rounded-2xl overflow-hidden bg-surface-container-low shadow-2xl">
            {/* Background Img with Volumetric Scrim */}
            <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA-1OsQfVdC4dE8rYUZC26FxuP6iCNGGRNMjSEI1dqGHL3J7SHY2v3qHSIjWxTvM8xxIxI7uEC1ihx-IONehJyHdY_Tb54myuuMxQJyE0WqXcofrtPXt7k5T2bLM7UBkCrqcQS6oUgMuggkDKfH59w6XU6dIJ2RW49PFfOOuuVk-hC10ycOXFOrV8HAHo7kVpYU5tpls5vJghAJPBdQumpF-nDP3UG-8znnnnUr2e-h0IAJTfPsG7rOqg')"}}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/80 to-surface-container-lowest/20"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-surface-container-lowest via-surface-container-lowest/70 to-transparent"></div>

            {/* Content Overlay */}
            <div className="relative z-10 p-space-lg lg:p-space-2xl flex flex-col lg:flex-row items-start lg:items-end justify-between gap-space-xl">
              <div className="max-w-3xl flex flex-col gap-space-md">
                <div className="flex flex-wrap items-center gap-space-xs">
                  <span className="px-space-sm py-space-2xs rounded-full bg-primary-container text-on-primary-container font-label-code text-label-code uppercase tracking-wider font-bold shadow-md">Exclusivo IMAX Láser</span>
                  <span className="flex items-center gap-1 px-space-sm py-space-2xs rounded-full bg-surface-container-highest text-primary font-label-code text-label-code uppercase">
                    <span className="material-symbols-outlined text-[15px]" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                    9.2 / 10 • Metacritic Verified
                  </span>
                  <span className="px-space-sm py-space-2xs rounded-full bg-surface-container text-on-surface-variant font-label-code text-label-code uppercase">+14 Años • 166 Min</span>
                  <span className="px-space-sm py-space-2xs rounded-full bg-surface-container text-secondary font-label-code text-label-code uppercase">Sci-Fi • Aventura Épica</span>
                </div>

                <div className="flex flex-col gap-space-2xs">
                  <span className="font-label-code text-label-code tracking-widest text-primary uppercase">Estreno Global Recomendado</span>
                  <h1 className="font-display-hero text-display-hero text-on-surface tracking-tight leading-none uppercase drop-shadow-md">
                    DUNA: <span className="text-primary font-light">PARTE DOS</span>
                  </h1>
                </div>

                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl line-clamp-3 leading-relaxed">
                  Paul Atreides se une a Chani y a los Fremen mientras busca venganza contra los conspiradores que destruyeron a su familia. Ante una elección entre el amor de su vida y el destino del universo, Paul debe prevenir un futuro terrible.
                </p>

                <div className="flex items-center gap-space-lg pt-space-xs">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-secondary text-[22px]">aspect_ratio</span>
                    <span className="font-label-md text-label-md text-on-surface font-semibold">Aspecto 1.43:1 Expandido</span>
                  </div>
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-primary text-[22px]">volume_up</span>
                    <span className="font-label-md text-label-md text-on-surface font-semibold">Dolby Atmos 128 Ch</span>
                  </div>
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-tertiary text-[22px]">chair</span>
                    <span className="font-label-md text-label-md text-on-surface font-semibold">Butacas Zero-G D-BOX</span>
                  </div>
                </div>
              </div>

              {/* Schedule Selector Card */}
              <div className="w-full lg:w-auto bg-surface-container/90 backdrop-blur-xl p-space-lg rounded-2xl flex flex-col gap-space-md shadow-2xl min-w-[340px]">
                <div className="flex items-center justify-between">
                  <span className="font-headline-sm text-headline-sm text-on-surface">Horarios Disponibles</span>
                  <span className="px-space-xs py-1 rounded bg-secondary-container/20 text-secondary font-label-code text-label-code uppercase">Sala Atmos VIP 1</span>
                </div>
                <div className="grid grid-cols-3 gap-space-xs">
                  <button className="p-space-sm rounded-xl bg-surface-container-high hover:bg-surface-bright flex flex-col items-center gap-1 transition-all text-center">
                    <span className="font-headline-sm text-headline-sm text-on-surface">17:30</span>
                    <span className="font-label-code text-label-code text-on-surface-variant">IMAX 3D Sub</span>
                    <span className="font-label-md text-label-md text-primary font-bold">80 Bs</span>
                  </button>
                  <button className="p-space-sm rounded-xl bg-primary-container text-on-primary-container shadow-lg shadow-primary/20 flex flex-col items-center gap-1 transition-all text-center">
                    <span className="font-headline-sm text-headline-sm text-on-primary-container font-bold">20:15</span>
                    <span className="font-label-code text-label-code text-on-primary-container font-bold">Láser VIP Sub</span>
                    <span className="font-label-md text-label-md text-on-primary-container font-extrabold">80 Bs</span>
                  </button>
                  <button className="p-space-sm rounded-xl bg-surface-container-high hover:bg-surface-bright flex flex-col items-center gap-1 transition-all text-center">
                    <span className="font-headline-sm text-headline-sm text-on-surface">22:45</span>
                    <span className="font-label-code text-label-code text-on-surface-variant">4DX Atmos Sub</span>
                    <span className="font-label-md text-label-md text-primary font-bold">75 Bs</span>
                  </button>
                </div>
                <div className="flex items-center gap-space-xs pt-space-2xs">
                  <button onClick={selectHeroMovie} className="w-full h-14 rounded-xl bg-primary hover:bg-primary-fixed text-on-primary font-headline-sm text-headline-sm flex items-center justify-center gap-space-xs shadow-lg shadow-primary/30 transition-transform active:scale-95">
                    <span className="material-symbols-outlined text-[24px]">confirmation_number</span>
                    <span>Elegir Butacas</span>
                  </button>
                  <button className="h-14 w-14 rounded-xl bg-surface-container-highest hover:bg-surface-bright text-on-surface flex items-center justify-center transition-transform active:scale-95">
                    <span className="material-symbols-outlined text-[26px]">smart_display</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* INTERACTIVE FILTER DOCK */}
      <div className="w-full px-space-lg py-space-sm">
        <div className="w-full bg-surface-container p-space-md rounded-2xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-xs overflow-x-auto pb-1 lg:pb-0">
            <span className="font-label-code text-label-code text-on-surface-variant uppercase px-2">Día:</span>
            <button className="px-space-md py-space-xs rounded-full bg-primary text-on-primary font-label-lg text-label-lg font-bold shadow-md shadow-primary/20 transition-all whitespace-nowrap">Hoy (24 Oct)</button>
            <button className="px-space-md py-space-xs rounded-full bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-lg text-label-lg transition-all whitespace-nowrap">Mañana (25 Oct)</button>
            <button className="px-space-md py-space-xs rounded-full bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-lg text-label-lg transition-all whitespace-nowrap">Sábado & Domingo</button>
          </div>
          <div className="flex items-center gap-space-xs overflow-x-auto pb-1 lg:pb-0">
            <span className="font-label-code text-label-code text-on-surface-variant uppercase px-2">Experiencia:</span>
            <button className="px-space-sm py-space-xs rounded-lg bg-surface-container-highest text-secondary font-label-md text-label-md font-semibold hover:bg-surface-bright transition-all whitespace-nowrap">⚡ IMAX Láser</button>
            <button className="px-space-sm py-space-xs rounded-lg bg-surface-container-highest text-primary font-label-md text-label-md font-semibold hover:bg-surface-bright transition-all whitespace-nowrap">👑 Sala VIP Atmos</button>
            <button className="px-space-sm py-space-xs rounded-lg bg-surface-container-highest text-tertiary font-label-md text-label-md font-semibold hover:bg-surface-bright transition-all whitespace-nowrap">💨 4DX Dinámica</button>
            <button className="px-space-sm py-space-xs rounded-lg bg-surface-container-highest text-on-surface-variant font-label-md text-label-md hover:bg-surface-bright transition-all whitespace-nowrap">MacroXE</button>
          </div>
          <div className="flex items-center gap-space-sm">
            <div className="relative flex-1 lg:w-64">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-[20px]">search</span>
              <input className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant font-body-sm text-body-sm outline-none shadow-inner" placeholder="Buscar título, sala o género..." type="text" />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-space-lg pt-space-lg flex items-end justify-between">
        <div>
          <div className="flex items-center gap-space-xs">
            <div className="w-2 h-6 rounded-full bg-primary"></div>
            <span className="font-label-code text-label-code text-primary uppercase tracking-wider font-bold">Catálogo En Exhibición</span>
          </div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Películas en Cartelera Hoy</h2>
        </div>
        <div className="flex items-center gap-space-xs">
          <span className="font-label-code text-label-code text-on-surface-variant uppercase">Mostrando 4 Títulos Premium</span>
        </div>
      </div>

      <div className="w-full px-space-lg py-space-md grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-lg">
        {state.peliculas.map(pelicula => (
          <PeliculaCard key={pelicula.id} pelicula={pelicula} />
        ))}
      </div>

      {/* SECTION: KIOSK EXCLUSIVE PROMOS */}
      <div className="w-full px-space-lg py-space-md grid grid-cols-1 lg:grid-cols-3 gap-space-lg">
        <div className="p-space-lg rounded-2xl bg-surface-container-low flex items-start gap-space-md">
          <div className="w-12 h-12 rounded-xl bg-secondary-container/20 text-secondary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[28px]">spatial_audio_off</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-headline-sm text-headline-sm text-on-surface">Acústica Espacial Dolby Atmos</span>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Calibración hiper-precisa con 64 canales independientes de audio inmersivo que se desplaza alrededor tuyo.</p>
          </div>
        </div>
        <div className="p-space-lg rounded-2xl bg-surface-container-low flex items-start gap-space-md">
          <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[28px]">airline_seat_recline_extra</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-headline-sm text-headline-sm text-on-surface">Butacas Reclinables VIP Lounge</span>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Tapicería de cuero genuino, servicio directo a butaca y soporte ergonómico Zero Gravity para máximo confort.</p>
          </div>
        </div>
        <div className="p-space-lg rounded-2xl bg-error-container/20 flex items-start gap-space-md">
          <div className="w-12 h-12 rounded-xl bg-error-container text-on-error-container flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[28px]">verified_user</span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-space-2xs">
              <span className="font-headline-sm text-headline-sm text-error">Política Estricta Kiosco</span>
              <span className="px-2 py-0.5 rounded bg-error text-on-error font-label-code text-label-code font-bold">AVISO</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-error-container">
              Entradas no reembolsables una vez procesado el cobro. Verifique sala, formato, horario e idioma antes de confirmar en el datáfono.
            </p>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

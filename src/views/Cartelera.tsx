import { useEffect, useState } from 'react';
import { useAuth } from '../controllers/AuthContext';
import { useCine } from '../controllers/CineContext';
import { CarteleraFiltros } from '../components/widgets/CarteleraFiltros';
import { CarteleraGrid } from '../components/widgets/CarteleraGrid';
import { CarteleraPromos } from '../components/widgets/CarteleraPromos';
import { listarPeliculas } from '../api/peliculas.api';
import { listarFunciones } from '../api/funciones.api';
import { Funcion } from '../core/types/funcion.types';

export const Cartelera = () => {
  const { state, dispatch } = useCine();
  const { token } = useAuth();
  const [funcionesPorPelicula, setFuncionesPorPelicula] = useState<Map<number, Funcion[]>>(new Map());
  const [diasDisponibles, setDiasDisponibles] = useState<string[]>([]);
  const [diaSeleccionado, setDiaSeleccionado] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // GET /peliculas y GET /funciones son rutas públicas (@Public() en el backend) —
    // la cartelera se puede ver sin haber iniciado sesión, solo comprar exige cuenta
    // (eso ya lo gatea ProcesoCompra.tsx). `token` es opcional acá a propósito.
    let cancelado = false;
    (async () => {
      setCargando(true);
      setError(null);
      try {
        const [peliculas, funciones] = await Promise.all([listarPeliculas(token), listarFunciones(token)]);
        if (cancelado) return;

        const ahora = new Date();
        const futuras = funciones
          .filter((f) => f.estado === 'programada' && new Date(`${f.fecha}T${f.horaInicio}`) >= ahora)
          .sort((a, b) => `${a.fecha}${a.horaInicio}`.localeCompare(`${b.fecha}${b.horaInicio}`));

        const agrupadas = new Map<number, Funcion[]>();
        futuras.forEach((funcion) => {
          const lista = agrupadas.get(funcion.idPelicula) ?? [];
          lista.push(funcion);
          agrupadas.set(funcion.idPelicula, lista);
        });

        setFuncionesPorPelicula(agrupadas);
        setDiasDisponibles(Array.from(new Set(futuras.map((f) => f.fecha))).sort());
        // El backend hace soft-delete (estado='inactiva'), no borrado físico — GET
        // /peliculas devuelve también las inactivas, así que se filtran acá.
        dispatch({ type: 'SET_PELICULAS', payload: peliculas.filter((p) => p.estado === 'activa') });
      } catch (err) {
        if (!cancelado) {
          console.error('No se pudo cargar la cartelera real.', err);
          setError('No se pudo cargar la cartelera. Intentá de nuevo más tarde.');
        }
      } finally {
        if (!cancelado) setCargando(false);
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [token, dispatch]);

  const funcionesFiltradasPorDia = diaSeleccionado
    ? new Map(
        Array.from(funcionesPorPelicula.entries()).map(([idPelicula, lista]) => [
          idPelicula,
          lista.filter((f) => f.fecha === diaSeleccionado),
        ]),
      )
    : funcionesPorPelicula;

  return (
    <div className="max-w-[1720px] mx-auto w-full px-space-xl lg:px-space-2xl py-space-xl flex-grow flex flex-col">
    <div className="flex-grow flex flex-col pb-32">
      {/* TOP AMBIENT PROJECTION LAYER */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-12 right-10 w-80 h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      <CarteleraFiltros diasDisponibles={diasDisponibles} diaSeleccionado={diaSeleccionado} onSeleccionarDia={setDiaSeleccionado} />

      <div className="w-full px-space-lg pt-space-lg flex items-end justify-between">
        <div>
          <div className="flex items-center gap-space-xs">
            <div className="w-2 h-6 rounded-full bg-primary"></div>
            <span className="font-label-code text-label-code text-primary uppercase tracking-wider font-bold">Catálogo En Exhibición</span>
          </div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Películas en Cartelera</h2>
        </div>
        <div className="flex items-center gap-space-xs">
          <span className="font-label-code text-label-code text-on-surface-variant uppercase">
            {state.peliculas.length > 0 ? `Mostrando ${state.peliculas.length} Títulos` : ''}
          </span>
        </div>
      </div>

      <CarteleraGrid cargando={cargando} error={error} peliculas={state.peliculas} funcionesPorPelicula={funcionesFiltradasPorDia} />

      <CarteleraPromos />
    </div>
    </div>
  );
};

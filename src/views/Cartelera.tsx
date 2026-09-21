import { useEffect, useState } from "react";
import { useAuth } from "../controllers/AuthContext";
import { useCine } from "../controllers/CineContext";
import { useUiControl } from "../core/ui/UiControlContext";
import { CarteleraFiltros } from "../components/widgets/CarteleraFiltros";
import { CarteleraGrid } from "../components/widgets/CarteleraGrid";
import { CarteleraPromos } from "../components/widgets/CarteleraPromos";
import { GlassyCarousel } from "../components/widgets/GlassyCarousel";
import { listarPeliculas } from "../api/peliculas.api";
import { listarFunciones } from "../api/funciones.api";
import { Funcion } from "../core/types/funcion.types";

export type FranjaHoraria = "mañana" | "tarde" | "noche";

/** mañana < 15:00, tarde 15:00–19:00, noche >= 19:00. `horaInicio` es `HH:mm:ss`, comparable como string. */
const franjaDeHora = (horaInicio: string): FranjaHoraria => {
  if (horaInicio < "15:00:00") return "mañana";
  if (horaInicio < "19:00:00") return "tarde";
  return "noche";
};

export const Cartelera = () => {
  const { state, dispatch } = useCine();
  const { token } = useAuth();
  const [funcionesPorPelicula, setFuncionesPorPelicula] = useState<
    Map<number, Funcion[]>
  >(new Map());
  const [diasDisponibles, setDiasDisponibles] = useState<string[]>([]);
  const [diaSeleccionado, setDiaSeleccionado] = useState<string | null>(null);
  const [tiposSala, setTiposSala] = useState<{ tipo: string; cantidad: number }[]>([]);
  const [tipoSalaSeleccionado, setTipoSalaSeleccionado] = useState<string | null>(null);
  const [franjaSeleccionada, setFranjaSeleccionada] = useState<FranjaHoraria | null>(null);
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Filtro que puede pedir el agente de voz ("mostrame las de Spider-Man"); el dia tambien se sigue eligiendo a mano.
  const { filtroCartelera, filtrarCartelera } = useUiControl();
  // El del agente de voz manda si está activo; si no, se usa lo que el usuario tipeó a mano en el buscador.
  const busqueda =
    filtroCartelera?.busqueda?.toLowerCase() ??
    (textoBusqueda.trim() ? textoBusqueda.trim().toLowerCase() : null);
  useEffect(() => {
    if (filtroCartelera) setDiaSeleccionado(filtroCartelera.dia);
  }, [filtroCartelera]);

  useEffect(() => {
    // GET /peliculas y GET /funciones son rutas públicas (@Public() en el backend) —
    // la cartelera se puede ver sin haber iniciado sesión, solo comprar exige cuenta
    // (eso ya lo gatea ProcesoCompra.tsx). `token` es opcional acá a propósito.
    let cancelado = false;
    (async () => {
      setCargando(true);
      setError(null);
      try {
        const [peliculas, funciones] = await Promise.all([
          listarPeliculas(token),
          listarFunciones(token),
        ]);
        if (cancelado) return;

        const ahora = new Date();
        const futuras = funciones
          .filter(
            (f) =>
              f.estado === "programada" &&
              // Defensivo: una función sin horario o sin sala (dato incompleto/corrupto)
              // no se puede comprar — no tiene sentido mostrarla en la cartelera.
              !!f.horaInicio &&
              !!f.idSala &&
              !!f.sala &&
              new Date(`${f.fecha}T${f.horaInicio}`) >= ahora,
          )
          .sort((a, b) =>
            `${a.fecha}${a.horaInicio}`.localeCompare(
              `${b.fecha}${b.horaInicio}`,
            ),
          );

        const agrupadas = new Map<number, Funcion[]>();
        futuras.forEach((funcion) => {
          const lista = agrupadas.get(funcion.idPelicula) ?? [];
          lista.push(funcion);
          agrupadas.set(funcion.idPelicula, lista);
        });

        setFuncionesPorPelicula(agrupadas);
        setDiasDisponibles(
          Array.from(new Set(futuras.map((f) => f.fecha))).sort(),
        );
        const conteoTipos = new Map<string, number>();
        futuras.forEach((f) => {
          if (!f.sala?.tipo) return;
          conteoTipos.set(f.sala.tipo, (conteoTipos.get(f.sala.tipo) ?? 0) + 1);
        });
        setTiposSala(
          Array.from(conteoTipos.entries())
            .map(([tipo, cantidad]) => ({ tipo, cantidad }))
            .sort((a, b) => a.tipo.localeCompare(b.tipo)),
        );
        // El backend hace soft-delete (estado='inactiva'), no borrado físico — GET
        // /peliculas devuelve también las inactivas, así que se filtran acá.
        dispatch({
          type: "SET_PELICULAS",
          payload: peliculas.filter((p) => p.estado === "activa"),
        });
      } catch (err) {
        if (!cancelado) {
          console.error("No se pudo cargar la cartelera real.", err);
          setError(
            "No se pudo cargar la cartelera. Intentá de nuevo más tarde.",
          );
        }
      } finally {
        if (!cancelado) setCargando(false);
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [token, dispatch]);

  const funcionesFiltradas = new Map(
    Array.from(funcionesPorPelicula.entries()).map(([idPelicula, lista]) => [
      idPelicula,
      lista.filter(
        (f) =>
          (!diaSeleccionado || f.fecha === diaSeleccionado) &&
          (!tipoSalaSeleccionado || f.sala?.tipo === tipoSalaSeleccionado) &&
          (!franjaSeleccionada || franjaDeHora(f.horaInicio) === franjaSeleccionada),
      ),
    ]),
  );

  const hayFiltroDeFuncionActivo =
    !!diaSeleccionado || !!tipoSalaSeleccionado || !!franjaSeleccionada;

  const peliculasVisibles = state.peliculas.filter((p) => {
    if (busqueda) {
      const coincide =
        p.titulo.toLowerCase().includes(busqueda) ||
        (p.genero ?? "").toLowerCase().includes(busqueda);
      if (!coincide) return false;
    }
    // Con día/sala/horario filtrados, una película sin ninguna función que
    // encaje no aporta nada mostrada vacía — mejor ocultarla directamente.
    // Sin filtros activos se sigue mostrando "Sin funciones programadas".
    if (hayFiltroDeFuncionActivo) {
      return (funcionesFiltradas.get(p.idPelicula)?.length ?? 0) > 0;
    }
    return true;
  });

  return (
    <div className="max-w-[1720px] mx-auto w-full px-space-xl lg:px-space-2xl py-space-xl flex-grow flex flex-col">
      <div className="flex-grow flex flex-col pb-32">
        {/* TOP AMBIENT PROJECTION LAYER */}
        <div className="relative w-full overflow-hidden">
          <div className="absolute -top-32 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute top-12 right-10 w-80 h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        {/* 3D Glassy Carousel de Estrenos & Trailers (Replica del video WhatsApp) */}
        <GlassyCarousel
          peliculasCatalogo={state.peliculas}
          onSeleccionarPelicula={(p) => {
            // Si el usuario elige comprar desde el carrusel, scrolleamos al horario de esa pelicula
            const el =
              document.getElementById(`pelicula-${p.idPelicula}`) ||
              document.getElementById("grid-cartelera");
            if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
          }}
        />

        <div id="grid-cartelera" className="pt-space-md">
          <CarteleraFiltros
            diasDisponibles={diasDisponibles}
            diaSeleccionado={diaSeleccionado}
            onSeleccionarDia={setDiaSeleccionado}
            tiposSala={tiposSala}
            tipoSalaSeleccionado={tipoSalaSeleccionado}
            onSeleccionarTipoSala={setTipoSalaSeleccionado}
            franjaSeleccionada={franjaSeleccionada}
            onSeleccionarFranja={setFranjaSeleccionada}
            textoBusqueda={textoBusqueda}
            onCambiarTextoBusqueda={setTextoBusqueda}
          />
        </div>

        <div className="w-full px-space-lg pt-space-lg flex items-end justify-between">
          <div>
            <div className="flex items-center gap-space-xs">
              <div className="w-2 h-6 rounded-full bg-primary"></div>
              <span className="font-label-code text-label-code text-primary uppercase tracking-wider font-bold">
                Catálogo En Exhibición
              </span>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              Películas en Cartelera
            </h2>
          </div>
          <div className="flex items-center gap-space-xs">
            <span className="font-label-code text-label-code text-on-surface-variant uppercase">
              {state.peliculas.length > 0
                ? `Mostrando ${peliculasVisibles.length} Títulos`
                : ""}
            </span>
            {filtroCartelera?.busqueda && (
              <button
                onClick={() => filtrarCartelera({ busqueda: null, dia: null })}
                className="flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-full bg-secondary-container/30 text-secondary font-label-code text-label-code uppercase tracking-wider hover:bg-secondary-container/50 transition-colors"
                title="Quitar el filtro"
              >
                Filtro: «{filtroCartelera?.busqueda}»
                <span className="material-symbols-outlined text-[14px]">
                  close
                </span>
              </button>
            )}
          </div>
        </div>

        <CarteleraGrid
          cargando={cargando}
          error={error}
          peliculas={peliculasVisibles}
          funcionesPorPelicula={funcionesFiltradas}
          mostrarTipoSala={tipoSalaSeleccionado === null}
          hayFiltroActivo={hayFiltroDeFuncionActivo}
        />

        <CarteleraPromos />
      </div>
    </div>
  );
};

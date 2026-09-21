import { useEffect, useState } from 'react';
import { crearFuncion, actualizarFuncion, cancelarFuncion } from '../../api/funciones.api';
import { crearPrecio } from '../../api/precios.api';
import { mensajeDeError } from '../../core/mensajesError';
import type { Funcion, CrearFuncionInput } from '../../core/types/funcion.types';
import type { Pelicula } from '../../core/types/pelicula.types';
import type { Sala } from '../../core/types/sala.types';
import type { Precio } from '../../core/types/precio.types';
import { FuncionesTabla } from './FuncionesTabla';
import { FuncionForm } from './FuncionForm';
import { Modal } from '../../components/widgets/Modal';
import { Paginacion } from '../../components/widgets/Paginacion';

const FUNCIONES_POR_PAGINA = 8;

interface FuncionesPanelProps {
  token: string;
  peliculas: Pelicula[];
  salas: Sala[];
  precios: Precio[];
  funciones: Funcion[];
  cargando: boolean;
  onCambio: () => Promise<void>;
}

/** Extraído de `AdminCartelera.tsx` al agregar el sub-tab de Películas — mismo comportamiento de antes. */
export const FuncionesPanel = ({ token, peliculas, salas, precios, funciones, cargando, onCambio }: FuncionesPanelProps) => {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [funcionEditando, setFuncionEditando] = useState<Funcion | undefined>(undefined);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);
  // Con 300+ funciones cargadas la tabla se volvía un muro de canceladas mezcladas
  // con programadas — se ocultan por defecto y quedan un click atrás si hacen falta.
  const [mostrarCanceladas, setMostrarCanceladas] = useState(false);
  const [pagina, setPagina] = useState(1);

  const funcionesVisibles = mostrarCanceladas ? funciones : funciones.filter((f) => f.estado === 'programada');
  const totalPaginas = Math.max(1, Math.ceil(funcionesVisibles.length / FUNCIONES_POR_PAGINA));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const funcionesPagina = funcionesVisibles.slice(
    (paginaSegura - 1) * FUNCIONES_POR_PAGINA,
    paginaSegura * FUNCIONES_POR_PAGINA,
  );

  // Cambiar el filtro (o que la lista se achique al cancelar algo) puede dejar la
  // página actual vacía — se vuelve a la 1 en vez de mostrar una página en blanco.
  useEffect(() => {
    setPagina(1);
  }, [mostrarCanceladas]);

  const handleNuevo = () => {
    setFuncionEditando(undefined);
    setErrorForm(null);
    setMostrarForm(true);
  };

  const handleEditar = (funcion: Funcion) => {
    setFuncionEditando(funcion);
    setErrorForm(null);
    setMostrarForm(true);
  };

  const handleCancelarFuncion = async (funcion: Funcion) => {
    if (!window.confirm(`¿Cancelar la función del ${funcion.fecha} ${funcion.horaInicio.slice(0, 5)}?`)) return;
    try {
      await cancelarFuncion(funcion.idFuncion, token);
      await onCambio();
    } catch (err) {
      console.error('No se pudo cancelar la función.', err);
    }
  };

  /**
   * Atajo desde `FuncionForm` (ver comentario ahí) — crea el precio ya mismo (vigente
   * desde hoy, sin expiración) y dispara `onCambio()` en segundo plano para que
   * "Precios & Promos" también lo vea reflejado, sin bloquear al admin que solo
   * quiere seguir completando la función.
   */
  const handleCrearPrecioRapido = async (valor: number) => {
    const hoy = new Date().toISOString().slice(0, 10);
    const nuevo = await crearPrecio({ valor, vigenteDesde: hoy }, token);
    void onCambio();
    return nuevo;
  };

  const handleGuardar = async (input: CrearFuncionInput) => {
    setGuardando(true);
    setErrorForm(null);
    try {
      if (funcionEditando) {
        await actualizarFuncion(funcionEditando.idFuncion, input, token);
      } else {
        await crearFuncion(input, token);
      }
      setMostrarForm(false);
      await onCambio();
    } catch (err) {
      setErrorForm(mensajeDeError(err, 'No se pudo guardar la función.'));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="flex flex-col gap-space-lg">
      <div className="flex items-center justify-between gap-space-md">
        <label className="flex items-center gap-space-2xs font-label-md text-label-md text-on-surface-variant cursor-pointer">
          <input
            type="checkbox"
            checked={mostrarCanceladas}
            onChange={(e) => setMostrarCanceladas(e.target.checked)}
            className="w-4 h-4 accent-primary"
          />
          Mostrar canceladas
        </label>
        <button
          onClick={handleNuevo}
          disabled={cargando}
          className="px-space-lg py-space-sm rounded-xl bg-primary text-on-primary font-label-lg text-label-lg hover:bg-primary-container transition-all flex items-center gap-space-xs disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>Nueva función
        </button>
      </div>

      {(salas.length === 0 || precios.length === 0) && !cargando && (
        <p className="font-body-sm text-body-sm text-error">
          Hace falta al menos una sala y un precio cargados para crear funciones (ver pestañas "Configuración Salas" / "Precios & Promos").
        </p>
      )}

      {mostrarForm && (
        <Modal titulo={funcionEditando ? 'Editar función' : 'Nueva función'} onCerrar={() => setMostrarForm(false)}>
          <FuncionForm
            peliculas={peliculas}
            salas={salas}
            precios={precios}
            funciones={funciones}
            funcion={funcionEditando}
            guardando={guardando}
            error={errorForm}
            onGuardar={handleGuardar}
            onCancelar={() => setMostrarForm(false)}
            onCrearPrecioRapido={handleCrearPrecioRapido}
          />
        </Modal>
      )}

      {cargando ? (
        <p className="font-label-md text-label-md text-on-surface-variant">Cargando funciones...</p>
      ) : !mostrarCanceladas && funciones.length > 0 && funcionesVisibles.length === 0 ? (
        <p className="font-label-md text-label-md text-on-surface-variant">
          Todas las funciones cargadas están canceladas — activá "Mostrar canceladas" para verlas.
        </p>
      ) : (
        <>
          <FuncionesTabla funciones={funcionesPagina} peliculas={peliculas} salas={salas} onEditar={handleEditar} onCancelar={handleCancelarFuncion} />
          <Paginacion
            paginaActual={paginaSegura}
            totalPaginas={totalPaginas}
            totalItems={funcionesVisibles.length}
            onCambiarPagina={setPagina}
          />
        </>
      )}
    </div>
  );
};

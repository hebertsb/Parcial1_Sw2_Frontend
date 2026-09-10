import { useEffect, useState } from 'react';
import { useAuth } from '../../controllers/AuthContext';
import { listarSalas, crearSala, actualizarSala, eliminarSala } from '../../api/salas.api';
import { ApiError } from '../../api/client';
import type { Sala, CrearSalaInput } from '../../core/types/sala.types';
import { SalasTabla } from './SalasTabla';
import { SalaForm } from './SalaForm';

/** Configuración de salas (dominio de Luis Ángel, `GET/POST/PATCH/DELETE /salas`). La capacidad se fija al crear — `ActualizarSalaDto` la prohíbe en el backend, ver SalaForm.tsx. */
export const AdminSalas = () => {
  const { token } = useAuth();
  const [salas, setSalas] = useState<Sala[]>([]);
  const [cargando, setCargando] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [salaEditando, setSalaEditando] = useState<Sala | undefined>(undefined);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const cargarSalas = async () => {
    if (!token) return;
    setCargando(true);
    try {
      setSalas(await listarSalas(token));
    } catch (err) {
      console.error('No se pudieron cargar las salas.', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void cargarSalas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleNuevo = () => {
    setSalaEditando(undefined);
    setErrorForm(null);
    setMostrarForm(true);
  };

  const handleEditar = (sala: Sala) => {
    setSalaEditando(sala);
    setErrorForm(null);
    setMostrarForm(true);
  };

  const handleEliminar = async (sala: Sala) => {
    if (!token) return;
    if (!window.confirm(`¿Eliminar "${sala.nombre}"? Se rechaza si tiene funciones asociadas (cualquier estado o fecha).`)) return;
    try {
      await eliminarSala(sala.idSala, token);
      await cargarSalas();
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : 'No se pudo eliminar la sala.');
    }
  };

  const handleGuardar = async (input: CrearSalaInput) => {
    if (!token) return;
    setGuardando(true);
    setErrorForm(null);
    try {
      if (salaEditando) {
        // ActualizarSalaDto no admite capacidad/asientosPorFila — se mandan solo estos 3.
        await actualizarSala(salaEditando.idSala, { nombre: input.nombre, tipo: input.tipo, tiempoLimpiezaMin: input.tiempoLimpiezaMin }, token);
      } else {
        await crearSala(input, token);
      }
      setMostrarForm(false);
      await cargarSalas();
    } catch (err) {
      setErrorForm(err instanceof ApiError ? err.message : 'No se pudo guardar la sala.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="p-space-xl flex flex-col gap-space-lg">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-space-2xs">
          <span className="px-space-xs py-0.5 rounded bg-primary/10 text-primary font-label-code text-label-code uppercase tracking-wider w-fit">Datos reales</span>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Configuración de Salas</h1>
        </div>
        {!mostrarForm && (
          <button
            onClick={handleNuevo}
            disabled={cargando}
            className="px-space-lg py-space-sm rounded-xl bg-primary text-on-primary font-label-lg text-label-lg hover:bg-primary-container transition-all flex items-center gap-space-xs disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>Nueva sala
          </button>
        )}
      </div>

      {mostrarForm && (
        <SalaForm sala={salaEditando} guardando={guardando} error={errorForm} onGuardar={handleGuardar} onCancelar={() => setMostrarForm(false)} />
      )}

      {cargando ? (
        <p className="font-label-md text-label-md text-on-surface-variant">Cargando salas...</p>
      ) : (
        <SalasTabla salas={salas} onEditar={handleEditar} onEliminar={handleEliminar} />
      )}
    </div>
  );
};

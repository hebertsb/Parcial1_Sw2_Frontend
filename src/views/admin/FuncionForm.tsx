import { useEffect, useState, type FormEvent } from 'react';
import { ApiError } from '../../api/client';
import type { Funcion, CrearFuncionInput } from '../../core/types/funcion.types';
import type { Pelicula } from '../../core/types/pelicula.types';
import type { Sala } from '../../core/types/sala.types';
import type { Precio } from '../../core/types/precio.types';

const CAMPO = 'h-11 px-space-sm rounded-lg bg-surface-container text-on-surface font-body-sm text-body-sm outline-none shadow-inner w-full';
const LABEL = 'font-label-md text-label-md text-outline';

interface FuncionFormProps {
  peliculas: Pelicula[];
  salas: Sala[];
  precios: Precio[];
  /** Si viene, el form edita esta función; si no, crea una nueva. */
  funcion?: Funcion;
  guardando: boolean;
  error: string | null;
  onGuardar: (input: CrearFuncionInput) => void;
  onCancelar: () => void;
  /**
   * Atajo (2026-09-16): crea un precio nuevo (`vigenteDesde` = hoy, sin expiración) SIN
   * salir de este form — antes había que ir a la pestaña "Precios & Promos" primero. El
   * catálogo `precios` no se elimina (sigue permitiendo reusar un mismo precio en varias
   * funciones y actualizarlo en un solo lugar); esto solo evita el viaje de ida y vuelta
   * cuando el admin quiere un precio nuevo y puntual para esta función.
   */
  onCrearPrecioRapido: (valor: number) => Promise<Precio>;
}

export const FuncionForm = ({ peliculas, salas, precios, funcion, guardando, error, onGuardar, onCancelar, onCrearPrecioRapido }: FuncionFormProps) => {
  const [idPelicula, setIdPelicula] = useState(funcion?.idPelicula ?? peliculas[0]?.idPelicula ?? 0);
  const [idSala, setIdSala] = useState(funcion?.idSala ?? salas[0]?.idSala ?? 0);
  const [idPrecio, setIdPrecio] = useState(funcion?.idPrecio ?? precios[0]?.idPrecio ?? 0);
  const [fecha, setFecha] = useState(funcion?.fecha ?? '');
  const [horaInicio, setHoraInicio] = useState(funcion?.horaInicio.slice(0, 5) ?? '');
  const [horaFin, setHoraFin] = useState(funcion?.horaFin.slice(0, 5) ?? '');

  const [precioRecienCreado, setPrecioRecienCreado] = useState<Precio | null>(null);
  const [creandoPrecio, setCreandoPrecio] = useState(false);
  const [nuevoValorPrecio, setNuevoValorPrecio] = useState(0);
  const [guardandoPrecio, setGuardandoPrecio] = useState(false);
  const [errorPrecio, setErrorPrecio] = useState<string | null>(null);
  const [avisoPrecio, setAvisoPrecio] = useState<string | null>(null);

  const opcionesPrecios =
    precioRecienCreado && !precios.some((p) => p.idPrecio === precioRecienCreado.idPrecio)
      ? [...precios, precioRecienCreado]
      : precios;

  /**
   * Antes de crear, busca si YA existe un precio con ese mismo valor vigente hoy —
   * si lo hay, lo reusa (ni siquiera llama al backend) en vez de crear una fila
   * duplicada en `precios`. Solo crea de verdad cuando no hay ningún match.
   */
  const buscarPrecioVigenteExistente = (valor: number): Precio | undefined => {
    const hoy = new Date().toISOString().slice(0, 10);
    const valorTexto = valor.toFixed(2);
    return opcionesPrecios.find(
      (p) =>
        Number(p.valor).toFixed(2) === valorTexto &&
        p.vigenteDesde <= hoy &&
        (!p.vigenteHasta || hoy <= p.vigenteHasta),
    );
  };

  const handleCrearPrecioRapido = async () => {
    setErrorPrecio(null);
    setAvisoPrecio(null);

    const existente = buscarPrecioVigenteExistente(nuevoValorPrecio);
    if (existente) {
      setIdPrecio(existente.idPrecio);
      setCreandoPrecio(false);
      setAvisoPrecio(`Ya existía un precio de ${Number(existente.valor).toFixed(2)} Bs vigente — se usó ese en vez de crear uno nuevo.`);
      return;
    }

    setGuardandoPrecio(true);
    try {
      const nuevo = await onCrearPrecioRapido(nuevoValorPrecio);
      setPrecioRecienCreado(nuevo);
      setIdPrecio(nuevo.idPrecio);
      setCreandoPrecio(false);
    } catch (err) {
      setErrorPrecio(err instanceof ApiError ? err.message : 'No se pudo crear el precio.');
    } finally {
      setGuardandoPrecio(false);
    }
  };

  // Si el form se abre (o el usuario hace clic muy rápido) antes de que terminen de
  // cargar películas/salas/precios, el `useState` de arriba inicializa en 0 y se queda
  // pegado ahí para siempre — un `select` controlado no se re-sincroniza solo cuando le
  // cambian las opciones. Estos efectos completan la selección apenas los datos llegan,
  // sin pisar nada si el usuario ya eligió algo (o si está editando una función real).
  useEffect(() => {
    if (!funcion && idPelicula === 0 && peliculas[0]) setIdPelicula(peliculas[0].idPelicula);
  }, [peliculas, funcion, idPelicula]);
  useEffect(() => {
    if (!funcion && idSala === 0 && salas[0]) setIdSala(salas[0].idSala);
  }, [salas, funcion, idSala]);
  useEffect(() => {
    if (!funcion && idPrecio === 0 && precios[0]) setIdPrecio(precios[0].idPrecio);
  }, [precios, funcion, idPrecio]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onGuardar({ idPelicula, idSala, idPrecio: idPrecio || undefined, fecha, horaInicio, horaFin });
  };

  return (
    <form onSubmit={handleSubmit} className="p-space-lg rounded-2xl bg-surface-container-low shadow-lg flex flex-col gap-space-md">
      <h2 className="font-headline-sm text-headline-sm text-on-surface">{funcion ? 'Editar función' : 'Nueva función'}</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
        <label className="flex flex-col gap-space-2xs">
          <span className={LABEL}>Película</span>
          <select value={idPelicula} onChange={(e) => setIdPelicula(Number(e.target.value))} className={CAMPO} required>
            {peliculas.map((p) => <option key={p.idPelicula} value={p.idPelicula}>{p.titulo}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-space-2xs">
          <span className={LABEL}>Sala</span>
          <select value={idSala} onChange={(e) => setIdSala(Number(e.target.value))} className={CAMPO} required>
            {salas.map((s) => <option key={s.idSala} value={s.idSala}>{s.nombre}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-space-2xs">
          <span className={LABEL}>Precio</span>
          {!creandoPrecio ? (
            <div className="flex items-center gap-space-2xs">
              <select value={idPrecio} onChange={(e) => setIdPrecio(Number(e.target.value))} className={CAMPO}>
                {opcionesPrecios.map((p) => <option key={p.idPrecio} value={p.idPrecio}>{Number(p.valor).toFixed(2)} Bs</option>)}
              </select>
              <button
                type="button"
                onClick={() => setCreandoPrecio(true)}
                title="Crear un precio nuevo sin salir de este formulario"
                className="shrink-0 h-11 px-space-sm rounded-lg bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-code text-label-code transition-colors"
              >
                + Nuevo
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-space-2xs">
              <input
                type="number"
                min={0.01}
                step={0.01}
                value={nuevoValorPrecio}
                onChange={(e) => setNuevoValorPrecio(Number(e.target.value))}
                placeholder="Valor en Bs"
                className={CAMPO}
                autoFocus
              />
              <button
                type="button"
                onClick={() => void handleCrearPrecioRapido()}
                disabled={guardandoPrecio || nuevoValorPrecio <= 0}
                className="shrink-0 h-11 px-space-sm rounded-lg bg-primary text-on-primary font-label-code text-label-code hover:bg-primary-container transition-colors disabled:opacity-50"
              >
                {guardandoPrecio ? '...' : 'Crear y usar'}
              </button>
              <button
                type="button"
                onClick={() => { setCreandoPrecio(false); setErrorPrecio(null); }}
                className="shrink-0 h-11 px-space-sm rounded-lg bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-code text-label-code transition-colors"
              >
                Cancelar
              </button>
            </div>
          )}
          {errorPrecio && <span className="font-body-sm text-body-sm text-error">{errorPrecio}</span>}
          {avisoPrecio && <span className="font-body-sm text-body-sm text-tertiary">{avisoPrecio}</span>}
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Se crea vigente desde hoy, sin fecha de expiración — para ajustar eso, editalo después en "Precios & Promos".
          </span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
        <label className="flex flex-col gap-space-2xs">
          <span className={LABEL}>Fecha</span>
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className={CAMPO} required />
        </label>
        <label className="flex flex-col gap-space-2xs">
          <span className={LABEL}>Hora inicio</span>
          <input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} className={CAMPO} required />
        </label>
        <label className="flex flex-col gap-space-2xs">
          <span className={LABEL}>Hora fin</span>
          <input type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} className={CAMPO} required />
        </label>
      </div>

      {error && <p className="font-body-sm text-body-sm text-error">{error}</p>}

      <div className="flex items-center gap-space-sm">
        <button type="submit" disabled={guardando || peliculas.length === 0 || salas.length === 0} className="px-space-lg py-space-sm rounded-xl bg-primary text-on-primary font-label-lg text-label-lg hover:bg-primary-container transition-all disabled:opacity-50">
          {guardando ? 'Guardando...' : 'Guardar'}
        </button>
        <button type="button" onClick={onCancelar} className="px-space-lg py-space-sm rounded-xl bg-surface-container-high text-on-surface font-label-lg text-label-lg hover:bg-surface-variant transition-all">
          Cancelar
        </button>
      </div>
    </form>
  );
};

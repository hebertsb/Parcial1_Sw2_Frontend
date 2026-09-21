import { useState } from 'react';
import { asociarPromocionAFuncion } from '../../api/promociones.api';
import { ApiError } from '../../api/client';
import { AvisoValidacion } from '../../components/widgets/AvisoValidacion';
import type { Promocion } from '../../core/types/promocion.types';
import type { Funcion } from '../../core/types/funcion.types';
import type { Pelicula } from '../../core/types/pelicula.types';

interface AsociarFuncionFormProps {
  token: string;
  promocion: Promocion;
  funciones: Funcion[];
  peliculas: Pelicula[];
  onCancelar: () => void;
}

const tituloDe = (peliculas: Pelicula[], idPelicula: number) =>
  peliculas.find((p) => p.idPelicula === idPelicula)?.titulo ?? `Película #${idPelicula}`;

/** `POST /promociones/:id/funciones/:idFuncion` — el backend no expone un GET para listar asociaciones existentes, así que este form solo confirma el POST (201 = creada), sin mostrar historial. */
export const AsociarFuncionForm = ({ token, promocion, funciones, peliculas, onCancelar }: AsociarFuncionFormProps) => {
  const [idFuncion, setIdFuncion] = useState<number | ''>('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  // `PromocionesService.getAplicable` (usado al cobrar) solo considera promos activas
  // y vigentes ESE día — asociar la promo a una función fuera de [fechaInicio, fechaFin]
  // no es un error de la API (no hay ninguna regla que lo impida), pero el descuento
  // nunca se va a aplicar en esa función. Se avisa para que no quede así por accidente.
  const funcionSeleccionada = funciones.find((f) => f.idFuncion === idFuncion);
  const fueraDeVigencia =
    !!funcionSeleccionada && (funcionSeleccionada.fecha < promocion.fechaInicio || funcionSeleccionada.fecha > promocion.fechaFin);

  const handleAsociar = async () => {
    if (!idFuncion) return;
    setGuardando(true);
    setError(null);
    try {
      await asociarPromocionAFuncion(promocion.idPromocion, idFuncion, token);
      setExito(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo asociar la promoción a esa función.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="p-space-md rounded-xl bg-surface-container shadow-inner flex flex-col gap-space-sm">
      <p className="font-label-md text-label-md text-on-surface">
        Asociar <span className="font-bold text-primary">{promocion.nombre}</span> a una función:
      </p>

      {exito ? (
        <p className="font-body-sm text-body-sm text-tertiary">Asociada correctamente.</p>
      ) : (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-space-sm">
          <select
            value={idFuncion}
            onChange={(e) => setIdFuncion(e.target.value ? Number(e.target.value) : '')}
            className="h-11 px-space-sm rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm outline-none flex-1"
          >
            <option value="">Elegí una función...</option>
            {funciones.map((f) => (
              <option key={f.idFuncion} value={f.idFuncion}>
                {tituloDe(peliculas, f.idPelicula)} — {f.fecha} {f.horaInicio.slice(0, 5)}
              </option>
            ))}
          </select>
          <button onClick={handleAsociar} disabled={!idFuncion || guardando} className="px-space-md py-space-xs rounded-lg bg-primary text-on-primary font-label-md text-label-md disabled:opacity-50">
            {guardando ? 'Asociando...' : 'Asociar'}
          </button>
        </div>
      )}

      {!exito && fueraDeVigencia && funcionSeleccionada && (
        <AvisoValidacion>
          Esta función es del {funcionSeleccionada.fecha}, fuera de la vigencia de la promoción ({promocion.fechaInicio} al{' '}
          {promocion.fechaFin}) — se puede asociar, pero el descuento no se va a aplicar hasta que ajustes esas fechas.
        </AvisoValidacion>
      )}

      {error && <p className="font-body-sm text-body-sm text-error">{error}</p>}

      <button onClick={onCancelar} className="self-start font-label-code text-label-code text-on-surface-variant hover:text-on-surface underline">
        Cerrar
      </button>
    </div>
  );
};

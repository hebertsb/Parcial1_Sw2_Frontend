import type { Pelicula } from './pelicula.types';

/** Mismos valores que devuelve `orquestador.procesar()` en back_agent (ver ESTADO-IMPLEMENTACION.md). */
export type VoiceResponseType =
  | 'respuesta_texto'
  | 'resultado_consulta'
  | 'confirmacion_pendiente'
  | 'accion_confirmada';

/** Misma forma que `AccionPropuesta` en back_agent/app/schemas.py — el "contrato compartido con el ia-gateway". */
export interface AccionPropuesta {
  rol: 'cliente' | 'administrador';
  intencion: string;
  entidad: string;
  payload: Record<string, unknown>;
  evidencia_confirmacion: boolean;
}

/** Payload de `consultar_cartelera` (back_agent/app/tools/cliente.py) cuando `tipo === 'resultado_consulta'`. */
export interface DatosConsultaCartelera {
  peliculas?: Pelicula[];
  error?: string;
  detalle?: string;
}

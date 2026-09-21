import { ApiError } from '../api/client';

/**
 * El backend siempre normaliza sus errores a `{ message, code }` (ver
 * `HttpExceptionFilter`). Estos `code` son estables y accionables — mapearlos a texto
 * en español evita mostrarle al admin el mensaje crudo del backend (o el genérico de
 * Postgres) cuando ya sabemos exactamente qué pasó.
 */
const MENSAJES_POR_CODIGO: Record<string, string> = {
  CONFLICTO_HORARIO_SALA:
    'Esa sala ya tiene otra función en ese horario (contando el tiempo de limpieza). Elegí otro horario o sala.',
  CONFLICTO_DUPLICADO: 'Ya existe un registro igual — revisá los datos antes de guardar de nuevo.',
  REFERENCIA_INEXISTENTE:
    'Algo que elegiste ya no existe (puede haber sido borrado por otra persona). Actualizá la página e intentá de nuevo.',
};

/** Mensaje amigable para mostrar bajo un formulario del admin cuando falla un guardado. */
export function mensajeDeError(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    return MENSAJES_POR_CODIGO[err.code ?? ''] ?? err.message;
  }
  return fallback;
}

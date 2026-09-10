import { apiFetch } from './client';
import type { LogAccion, FiltrosConsultaLog } from '../core/types/audit.types';

/** `GET /audit/log-acciones` — solo administrador (RF12), ver Backend/src/modules/audit/audit.controller.ts. */
export function listarLogAcciones(filtros: FiltrosConsultaLog, token: string): Promise<LogAccion[]> {
  const params = new URLSearchParams();
  if (filtros.usuarioId !== undefined) params.set('usuarioId', String(filtros.usuarioId));
  if (filtros.accion) params.set('accion', filtros.accion);
  if (filtros.desde) params.set('desde', filtros.desde);
  if (filtros.hasta) params.set('hasta', filtros.hasta);
  if (filtros.limite !== undefined) params.set('limite', String(filtros.limite));
  const query = params.toString();
  return apiFetch<LogAccion[]>(`/audit/log-acciones${query ? `?${query}` : ''}`, { token });
}

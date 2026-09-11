import { apiFetch } from './client';

export interface InteraccionIa {
  idInteraccion: number;
  idUsuario: number;
  idFuncion?: number | null;
  intencionDetectada: string;
  widgetGenerado?: string | null;
  textoTranscrito?: string | null;
  fechaHora: string;
}

export interface CrearInteraccionInput {
  idUsuario: number;
  idFuncion?: number;
  intencionDetectada: string;
  widgetGenerado?: string;
  textoTranscrito?: string;
}

export function registrarInteraccion(input: CrearInteraccionInput): Promise<InteraccionIa> {
  return apiFetch<InteraccionIa>('/interacciones', { method: 'POST', body: input });
}

export function listarInteracciones(token: string, filtros?: { idUsuario?: number; limite?: number }): Promise<InteraccionIa[]> {
  const params = new URLSearchParams();
  if (filtros?.idUsuario !== undefined) params.set('idUsuario', String(filtros.idUsuario));
  if (filtros?.limite !== undefined) params.set('limite', String(filtros.limite));
  const query = params.toString();
  return apiFetch<InteraccionIa[]>(`/interacciones${query ? `?${query}` : ''}`, { token });
}

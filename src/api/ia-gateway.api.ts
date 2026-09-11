import { apiFetch } from './client';

export interface AccionIaPayload {
  accion: {
    tipo: 'crear_pelicula' | 'actualizar_pelicula' | 'crear_funcion' | 'cancelar_funcion' | 'crear_venta';
    [key: string]: unknown;
  };
  contexto: {
    idUsuario: number;
    rol: 'cliente' | 'administrador';
    evidenciaConfirmacion: boolean;
    nivelDespliegue?: string;
  };
}

export interface RespuestaIaGateway {
  ok: boolean;
  resultado?: unknown;
  motivo?: string;
}

export function ejecutarAccionIa(payload: AccionIaPayload): Promise<RespuestaIaGateway> {
  return apiFetch<RespuestaIaGateway>('/ia-gateway/acciones', { method: 'POST', body: payload });
}

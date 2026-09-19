import { ApiError } from './client';
import type { AccionPropuesta, VoiceResponseType } from '../core/types/voice.types';

const VOICE_API_URL = import.meta.env.VITE_VOICE_API_URL ?? 'http://localhost:8000';

/** Conversacion continua (WebSocket). Por defecto es la misma direccion del servicio de voz con ws:// en vez de http://. */
export const VOICE_WS_URL: string =
  import.meta.env.VITE_VOICE_WS_URL ?? `${VOICE_API_URL.replace(/^http/, 'ws')}/ws/voz`;

export interface VoiceChatResult {
  transcript: string;
  replyText: string;
  audioUrl: string;
  /** RF18: que tipo de resultado devolvio el orquestador (ver back_agent/app/orquestador.py). */
  tipo: VoiceResponseType;
  /** Presente solo si tipo === 'resultado_consulta' (ej. peliculas encontradas). */
  datos: unknown;
  /** Presente solo si tipo es 'confirmacion_pendiente' o 'accion_confirmada'. */
  accionPropuesta: AccionPropuesta | null;
}

/**
 * Envia un audio grabado al agente de voz (FastAPI, back_agent/) y devuelve
 * la transcripcion, el texto de respuesta y una URL reproducible del audio
 * de respuesta (blob URL, liberar con URL.revokeObjectURL cuando ya no se
 * necesite). No usa apiFetch: esta API recibe FormData y devuelve audio
 * binario, no JSON, y sus errores vienen como { detail } (FastAPI), no
 * { message, code } (Nest).
 *
 * rol y sesionId son obligatorios en el backend (RF11: el agente necesita
 * saber quien habla antes de decidir que puede hacer) y sesionId agrupa los
 * turnos de una misma conversacion de voz para cuando el orquestador tenga
 * historial.
 */
export async function sendVoiceMessage(
  audioBlob: Blob,
  rol: 'cliente' | 'administrador',
  sesionId: string,
  token?: string | null,
): Promise<VoiceChatResult> {
  const form = new FormData();
  form.append('audio', audioBlob, 'grabacion.webm');
  form.append('rol', rol);
  form.append('sesion_id', sesionId);

  // El agente reenvia este JWT (no usa credenciales propias) para llamar en
  // nombre del usuario a endpoints del backend que exigen sesion real -- lo
  // necesitan las tools de administrador (reportes, salas, promociones,
  // precios) y la ejecucion final contra /ia-gateway/acciones (RF10, ver
  // back_agent/app/gateway_client.py). Sin token, esas tools devuelven un
  // error explicandolo en vez de fallar en silencio.
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${VOICE_API_URL}/voice-chat`, {
    method: 'POST',
    headers,
    body: form,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new ApiError(
      errorBody?.detail ?? `Error ${res.status} al llamar /voice-chat`,
      res.status,
    );
  }

  const transcript = decodeURIComponent(res.headers.get('X-Transcript') ?? '');
  const replyText = decodeURIComponent(res.headers.get('X-Reply-Text') ?? '');
  const tipo = (res.headers.get('X-Response-Type') as VoiceResponseType | null) ?? 'respuesta_texto';

  const datosRaw = res.headers.get('X-Datos');
  const datos = datosRaw ? JSON.parse(decodeURIComponent(datosRaw)) : null;

  const accionRaw = res.headers.get('X-Accion-Propuesta');
  const accionPropuesta = accionRaw ? (JSON.parse(decodeURIComponent(accionRaw)) as AccionPropuesta) : null;

  const audioUrl = URL.createObjectURL(await res.blob());

  return { transcript, replyText, audioUrl, tipo, datos, accionPropuesta };
}

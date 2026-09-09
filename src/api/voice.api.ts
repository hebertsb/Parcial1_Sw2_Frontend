import { ApiError } from './client';

const VOICE_API_URL = import.meta.env.VITE_VOICE_API_URL ?? 'http://localhost:8000';

export interface VoiceChatResult {
  transcript: string;
  replyText: string;
  audioUrl: string;
}

/**
 * Envia un audio grabado al agente de voz (FastAPI, back_agent/) y devuelve
 * la transcripcion, el texto de respuesta y una URL reproducible del audio
 * de respuesta (blob URL, liberar con URL.revokeObjectURL cuando ya no se
 * necesite). No usa apiFetch: esta API recibe FormData y devuelve audio
 * binario, no JSON, y sus errores vienen como { detail } (FastAPI), no
 * { message, code } (Nest).
 */
export async function sendVoiceMessage(audioBlob: Blob): Promise<VoiceChatResult> {
  const form = new FormData();
  form.append('audio', audioBlob, 'grabacion.webm');

  const res = await fetch(`${VOICE_API_URL}/voice-chat`, {
    method: 'POST',
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
  const audioUrl = URL.createObjectURL(await res.blob());

  return { transcript, replyText, audioUrl };
}

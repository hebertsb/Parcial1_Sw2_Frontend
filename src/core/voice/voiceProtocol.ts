import type { AccionPropuesta, UiAction, VoiceResponseType } from '../types/voice.types';

/**
 * Protocolo de la conversacion continua por WebSocket (`/ws/voz`).
 * Espejo de la documentacion de `Backend_IA/agent_cine/app/routers/ws_voz.py` -- si cambia uno, cambia el otro.
 *
 * Audio del cliente al servidor: mensajes binarios con PCM16 mono 16 kHz little-endian.
 * Audio del servidor al cliente: mensajes binarios con 8 bytes de cabecera
 *   (uint32 LE sample_rate, uint32 LE numero de frase) + PCM16 mono.
 */

export type EstadoServidor = 'escuchando' | 'pensando' | 'hablando';

export type EventoServidor =
  | { type: 'ready'; sesion_id: string; vad: { silencio_fin_ms: number; umbral: number } }
  | { type: 'state'; value: EstadoServidor }
  | { type: 'vad'; hablando: boolean }
  | { type: 'transcript'; text: string }
  /**
   * Que debe hacer la pantalla; llega ANTES del `reply` para que la interfaz se mueva mientras el agente habla.
   * `v` numera la tanda: la pantalla lo devuelve en su `contexto` cuando ya la aplico (un agente viejo no lo manda).
   */
  | { type: 'ui_action'; acciones: UiAction[]; v?: number }
  | { type: 'reply'; texto: string; tipo: VoiceResponseType; datos?: unknown; accion_propuesta?: AccionPropuesta }
  | { type: 'metrics'; stt_ms: number; llm_ms: number; primer_audio_ms: number }
  | { type: 'interrupted' }
  | { type: 'error'; message: string };

/**
 * Lo que el cliente tiene MARCADO en la pantalla, solo con ids (el agente resuelve el resto contra el catalogo): asi el agente se
 * entera de lo que se marco TOCANDO ("¿que pelicula tengo seleccionada?", "eliminame la pelicula"). Ver estado_compra.py.
 */
export interface ContextoCompra {
  idPelicula: number | null;
  idFuncion: number | null;
  asientos: { id: string; idAsiento: number }[];
  dulceria: { idProducto: number; cantidad: number }[];
}

export type MensajeCliente =
  | { type: 'hello'; rol: 'cliente' | 'administrador'; sesion_id: string; token: string | null; barge_in: boolean }
  | { type: 'text'; text: string }
  | { type: 'interrupt' }
  /** La foto de lo marcado en pantalla + la version de la ultima tanda de acciones del servidor que ya aplico. No es un turno. */
  | { type: 'contexto'; v: number; compra: ContextoCompra }
  | { type: 'bye' };

/** Lo que las pantallas muestran del ultimo turno (la misma forma que ya usaban con /voice-chat, sin el audio). */
export interface ResultadoVoz {
  transcript: string;
  replyText: string;
  tipo: VoiceResponseType;
  datos: unknown;
  accionPropuesta: AccionPropuesta | null;
}

export const TASA_CAPTURA_HZ = 16000;
export const TAMANO_CABECERA_AUDIO = 8;

/** Separa un mensaje binario del servidor en (sample_rate, numero de frase, PCM16). */
export function leerAudioDelServidor(datos: ArrayBuffer): { sampleRate: number; numero: number; pcm: Int16Array } | null {
  if (datos.byteLength <= TAMANO_CABECERA_AUDIO) return null;
  const vista = new DataView(datos);
  const sampleRate = vista.getUint32(0, true);
  const numero = vista.getUint32(4, true);
  // PCM16: se copia a un buffer alineado (el offset 8 sirve, pero no se depende de eso).
  const muestras = (datos.byteLength - TAMANO_CABECERA_AUDIO) >> 1;
  const pcm = new Int16Array(muestras);
  for (let i = 0; i < muestras; i++) pcm[i] = vista.getInt16(TAMANO_CABECERA_AUDIO + i * 2, true);
  return { sampleRate, numero, pcm };
}

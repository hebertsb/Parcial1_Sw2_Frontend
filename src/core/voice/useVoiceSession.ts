import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react';
import { VOICE_WS_URL } from '../../api/voice.api';
import { PlaybackQueue } from './playbackQueue';
import {
  leerAudioDelServidor,
  TASA_CAPTURA_HZ,
  type EventoServidor,
  type MensajeCliente,
  type ResultadoVoz,
} from './voiceProtocol';

export type EstadoConversacion = 'apagada' | 'conectando' | 'escuchando' | 'pensando' | 'hablando' | 'error';

export interface OpcionesSesion {
  rol: 'cliente' | 'administrador';
  token?: string | null;
  /** Agrupa los turnos de una misma conversacion (el orquestador guarda ahi la accion pendiente de confirmar). */
  sesionId: string;
  /** true: el usuario puede hablar encima del agente y lo corta. Necesita cancelacion de eco (auriculares o buen microfono). */
  bargeIn?: boolean;
  /** Recibe cada evento del servidor (ej. para reaccionar con la interfaz). */
  onEvento?: (evento: EventoServidor) => void;
}

export interface SesionVoz {
  estado: EstadoConversacion;
  /** Hay una conversacion abierta (conectando o en curso). */
  activa: boolean;
  /** El servidor detecta que el usuario esta hablando en este momento. */
  usuarioHablando: boolean;
  silenciado: boolean;
  /** Lo ultimo que se le entendio al usuario. */
  transcript: string;
  /** El ultimo resultado (texto, tipo y datos para los widgets). */
  resultado: ResultadoVoz | null;
  error: string | null;
  /** Nivel del microfono (RMS 0..1), actualizado ~30 veces por segundo; se lee sin re-renderizar (requestAnimationFrame). */
  nivelMicRef: MutableRefObject<number>;
  iniciar: () => Promise<void>;
  terminar: () => void;
  alternar: () => void;
  silenciar: (valor: boolean) => void;
  /** Corta lo que esta diciendo el agente. */
  interrumpir: () => void;
  /** Entrada escrita: misma logica que la voz, sin reconocimiento. */
  enviarTexto: (texto: string) => void;
}

const REINTENTOS_MAX = 3;
const FRAME_MUESTRAS = 512; // 32 ms a 16 kHz: coincide con la ventana del VAD del servidor
const BUFFER_MAX_BYTES = 256 * 1024; // si la red no da abasto, se descarta audio en vez de acumular retraso

function mensajeDeError(err: unknown): string {
  const nombre = err instanceof DOMException ? err.name : '';
  if (nombre === 'NotAllowedError' || nombre === 'SecurityError') {
    return 'No diste permiso al micrófono. Habilitalo en el navegador y volvé a intentar.';
  }
  if (nombre === 'NotFoundError') return 'No se encontró ningún micrófono conectado.';
  if (err instanceof Error && /audioWorklet|addModule|AudioWorklet/i.test(`${err.name} ${err.message}`)) {
    return 'Este navegador no soporta la captura de audio en vivo. Probá con Chrome o Edge actualizados.';
  }
  return 'No se pudo abrir el micrófono.';
}

/**
 * Conversacion continua con el agente de voz (RF13/RF16): abre el microfono una vez y manda el audio sin
 * parar por WebSocket; el servidor detecta cuando el usuario termina cada frase, responde hablando y deja
 * interrumpirlo. No hay botones de "grabar" ni "enviar".
 *
 * No depende del router ni de la interfaz: se usa igual en la pantalla de voz y en la de voz + UI dinamica.
 */
export function useVoiceSession(opciones: OpcionesSesion): SesionVoz {
  const opcionesRef = useRef(opciones);
  opcionesRef.current = opciones;

  const [estado, setEstado] = useState<EstadoConversacion>('apagada');
  const [usuarioHablando, setUsuarioHablando] = useState(false);
  const [silenciado, setSilenciado] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [resultado, setResultado] = useState<ResultadoVoz | null>(null);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const nodoRef = useRef<AudioWorkletNode | null>(null);
  const playbackRef = useRef<PlaybackQueue | null>(null);
  const nivelMicRef = useRef(0);

  // Invalida arranques asincronos viejos (StrictMode monta dos veces; terminar() puede llegar a mitad de iniciar()).
  const generacionRef = useRef(0);
  const listoRef = useRef(false);
  const cerradaAPropositoRef = useRef(false);
  const intentosRef = useRef(0);
  const silenciadoRef = useRef(false);
  const transcriptRef = useRef('');
  const estadoRef = useRef<EstadoConversacion>('apagada');
  const temporizadorRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cambiarEstado = useCallback((nuevo: EstadoConversacion) => {
    estadoRef.current = nuevo;
    setEstado(nuevo);
  }, []);

  const enviar = useCallback((mensaje: MensajeCliente) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(mensaje));
  }, []);

  const liberarAudio = useCallback(() => {
    if (temporizadorRef.current) {
      clearTimeout(temporizadorRef.current);
      temporizadorRef.current = null;
    }
    playbackRef.current?.vaciar();
    playbackRef.current = null;
    if (nodoRef.current) {
      nodoRef.current.port.onmessage = null;
      nodoRef.current.disconnect();
      nodoRef.current = null;
    }
    streamRef.current?.getTracks().forEach((pista) => pista.stop());
    streamRef.current = null;
    const ctx = ctxRef.current;
    ctxRef.current = null;
    if (ctx && ctx.state !== 'closed') void ctx.close();
    nivelMicRef.current = 0;
  }, []);

  const manejarEvento = useCallback(
    (evento: EventoServidor) => {
      switch (evento.type) {
        case 'ready':
          listoRef.current = true;
          intentosRef.current = 0;
          cambiarEstado('escuchando');
          break;
        case 'state':
          cambiarEstado(evento.value);
          break;
        case 'vad':
          setUsuarioHablando(evento.hablando);
          // Habla encima del agente: se calla en el acto, sin esperar la ida y vuelta al servidor.
          if (evento.hablando && opcionesRef.current.bargeIn !== false) playbackRef.current?.vaciar();
          break;
        case 'interrupted':
          playbackRef.current?.vaciar();
          break;
        case 'transcript':
          transcriptRef.current = evento.text;
          setTranscript(evento.text);
          break;
        case 'reply':
          setResultado({
            transcript: transcriptRef.current,
            replyText: evento.texto,
            tipo: evento.tipo,
            datos: evento.datos ?? null,
            accionPropuesta: evento.accion_propuesta ?? null,
          });
          break;
        case 'error':
          setError(evento.message);
          break;
        default:
          break;
      }
      opcionesRef.current.onEvento?.(evento);
    },
    [cambiarEstado],
  );

  const abrirSocket = useCallback(
    (generacion: number) => {
      const ws = new WebSocket(VOICE_WS_URL);
      ws.binaryType = 'arraybuffer';
      wsRef.current = ws;

      ws.onopen = () => {
        const { rol, token, sesionId, bargeIn } = opcionesRef.current;
        enviar({ type: 'hello', rol, sesion_id: sesionId, token: token ?? null, barge_in: bargeIn !== false });
      };

      ws.onmessage = (mensaje) => {
        if (generacion !== generacionRef.current) return;
        if (typeof mensaje.data === 'string') {
          try {
            manejarEvento(JSON.parse(mensaje.data) as EventoServidor);
          } catch {
            // un mensaje ilegible no debe tumbar la conversacion
          }
          return;
        }
        const audio = leerAudioDelServidor(mensaje.data as ArrayBuffer);
        if (audio) playbackRef.current?.encolar(audio.sampleRate, audio.pcm);
      };

      ws.onclose = () => {
        if (generacion !== generacionRef.current || cerradaAPropositoRef.current) return;
        listoRef.current = false;
        wsRef.current = null;
        if (intentosRef.current < REINTENTOS_MAX) {
          // El microfono sigue abierto; solo se reconecta (el servidor conserva la sesion por sesion_id).
          intentosRef.current += 1;
          cambiarEstado('conectando');
          temporizadorRef.current = setTimeout(() => {
            if (generacion === generacionRef.current) abrirSocket(generacion);
          }, 400 * 2 ** intentosRef.current);
          return;
        }
        liberarAudio();
        setError('Se perdió la conexión con el asistente de voz. Revisá que el servicio esté encendido y volvé a intentar.');
        cambiarEstado('error');
      };
    },
    [cambiarEstado, enviar, liberarAudio, manejarEvento],
  );

  const terminar = useCallback(() => {
    generacionRef.current += 1;
    cerradaAPropositoRef.current = true;
    listoRef.current = false;
    const ws = wsRef.current;
    wsRef.current = null;
    if (ws) {
      ws.onclose = null;
      try {
        if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'bye' } satisfies MensajeCliente));
        ws.close();
      } catch {
        // ya estaba cerrado
      }
    }
    liberarAudio();
    setUsuarioHablando(false);
    cambiarEstado('apagada');
  }, [cambiarEstado, liberarAudio]);

  const iniciar = useCallback(async () => {
    if (estadoRef.current !== 'apagada' && estadoRef.current !== 'error') return;
    const generacion = ++generacionRef.current;
    cerradaAPropositoRef.current = false;
    intentosRef.current = 0;
    setError(null);
    transcriptRef.current = '';
    setTranscript('');
    cambiarEstado('conectando');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      if (generacion !== generacionRef.current) {
        stream.getTracks().forEach((pista) => pista.stop());
        return;
      }
      streamRef.current = stream;

      const ctx = new AudioContext({ latencyHint: 'interactive' });
      ctxRef.current = ctx;
      await ctx.resume();
      if (ctx.state !== 'running') {
        // El navegador puede dejar el audio en pausa hasta que el usuario toque la pagina (politica de autoplay).
        setError('Tocá cualquier parte de la pantalla para activar el audio.');
        const reanudar = () => void ctx.resume();
        window.addEventListener('pointerdown', reanudar, { once: true });
        ctx.onstatechange = () => {
          if (ctx.state === 'running') setError((actual) => (actual?.startsWith('Tocá cualquier') ? null : actual));
        };
      }
      await ctx.audioWorklet.addModule('/pcm-worklet.js');
      if (generacion !== generacionRef.current) {
        liberarAudio();
        return;
      }

      const fuente = ctx.createMediaStreamSource(stream);
      const nodo = new AudioWorkletNode(ctx, 'captura-pcm', {
        numberOfInputs: 1,
        numberOfOutputs: 1,
        outputChannelCount: [1],
        processorOptions: { targetRate: TASA_CAPTURA_HZ, frameSize: FRAME_MUESTRAS },
      });
      nodo.port.onmessage = (mensaje: MessageEvent<{ pcm: ArrayBuffer; nivel: number }>) => {
        nivelMicRef.current = mensaje.data.nivel;
        const ws = wsRef.current;
        if (listoRef.current && ws && ws.readyState === WebSocket.OPEN && ws.bufferedAmount < BUFFER_MAX_BYTES) {
          ws.send(mensaje.data.pcm);
        }
      };
      // Un nodo sin salida conectada puede no procesarse en algunos navegadores: se conecta a un volumen en 0.
      const mudo = ctx.createGain();
      mudo.gain.value = 0;
      fuente.connect(nodo);
      nodo.connect(mudo);
      mudo.connect(ctx.destination);
      nodo.port.postMessage({ type: 'pausa', valor: silenciadoRef.current });
      nodoRef.current = nodo;
      playbackRef.current = new PlaybackQueue(ctx);

      abrirSocket(generacion);
    } catch (err) {
      if (generacion !== generacionRef.current) return;
      liberarAudio();
      setError(mensajeDeError(err));
      cambiarEstado('error');
    }
  }, [abrirSocket, cambiarEstado, liberarAudio]);

  const alternar = useCallback(() => {
    if (estadoRef.current === 'apagada' || estadoRef.current === 'error') void iniciar();
    else terminar();
  }, [iniciar, terminar]);

  const silenciar = useCallback((valor: boolean) => {
    silenciadoRef.current = valor;
    setSilenciado(valor);
    nodoRef.current?.port.postMessage({ type: 'pausa', valor });
  }, []);

  const interrumpir = useCallback(() => {
    playbackRef.current?.vaciar();
    enviar({ type: 'interrupt' });
  }, [enviar]);

  const enviarTexto = useCallback(
    (texto: string) => {
      const limpio = texto.trim();
      if (limpio) enviar({ type: 'text', text: limpio });
    },
    [enviar],
  );

  // Al desmontar la pantalla se cierra todo (microfono incluido).
  useEffect(() => terminar, [terminar]);

  const activa = estado !== 'apagada' && estado !== 'error';

  return {
    estado,
    activa,
    usuarioHablando,
    silenciado,
    transcript,
    resultado,
    error,
    nivelMicRef,
    iniciar,
    terminar,
    alternar,
    silenciar,
    interrumpir,
    enviarTexto,
  };
}

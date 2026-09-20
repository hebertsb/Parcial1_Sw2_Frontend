import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react';
import { VOICE_API_URL, VOICE_WS_URL } from '../../api/voice.api';
import { formatearHora } from '../time/reloj';
import { PlaybackQueue } from './playbackQueue';
import type { CamposTarjeta, EventoPago } from '../types/pago.types';
import {
  leerAudioDelServidor,
  TASA_CAPTURA_HZ,
  type ContextoCompra,
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

/**
 * Lo que se MUESTRA del intercambio en curso (panel de voz de "Voz + UI Dinamica"). A diferencia de `transcript` y
 * `resultado` (que guardan lo ultimo que paso), esto vuelve a quedar vacio solo: cuando el agente termina de hablar y
 * pasa un momento, el panel regresa a "escuchando" para la proxima instruccion en vez de quedarse con la respuesta vieja.
 */
export interface TurnoVisible {
  transcript: string;
  respuesta: string;
  /** Hora real (del sistema) en que llego la respuesta, "20:45:12"; null si todavia no hay respuesta. */
  hora: string | null;
  /** Un fallo de ESTE turno (ej. "no pude procesar la frase"); los fallos de la conversacion van en `error`. */
  error: string | null;
}

const TURNO_VACIO: TurnoVisible = { transcript: '', respuesta: '', hora: null, error: null };

/** Cada cuanto se mide la latencia hacia el servicio de voz mientras hay conversacion (menos que el keep-alive de 5 s del servidor: se reusa la conexion). */
const PERIODO_LATENCIA_MS = 4000;

export interface SesionVoz {
  estado: EstadoConversacion;
  /** Hay una conversacion abierta (conectando o en curso). */
  activa: boolean;
  /** Se cayo la conexion con el asistente y se esta reintentando (el microfono sigue abierto). */
  reconectando: boolean;
  /** El servidor detecta que el usuario esta hablando en este momento. */
  usuarioHablando: boolean;
  silenciado: boolean;
  /** Lo ultimo que se le entendio al usuario. */
  transcript: string;
  /** El ultimo resultado (texto, tipo y datos para los widgets). */
  resultado: ResultadoVoz | null;
  /** Lo que se muestra del intercambio actual; se limpia solo al terminar (ver `TurnoVisible`). */
  turno: TurnoVisible;
  /** Latencia REAL (ms) de ida y vuelta al servicio de voz, medida cada pocos segundos; null si no hay conversacion o no respondio. */
  latenciaMs: number | null;
  /** Lo que tardo el ultimo turno hablado hasta que empezo a sonar la respuesta (ms), medido por el servidor; null si aun no hubo. */
  ultimaRespuestaMs: number | null;
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
  /** Le cuenta al agente lo que el cliente tiene marcado en pantalla (ver `ContextoCompra`). No es un turno: no se contesta. */
  enviarContexto: (version: number, compra: ContextoCompra) => void;
  /** Le avisa al agente si hay pantalla para el formulario de tarjeta (Voz + UI Dinamica) o no (Solo Voz). */
  enviarPantalla: (disponible: boolean) => void;
  /** Como va el formulario de tarjeta (solo el estado de cada campo, nunca lo escrito): el agente guia campo por campo con esto. */
  enviarPagoCampos: (idVenta: number, campos: CamposTarjeta) => void;
  /** Como termino el intento de pago; el agente lo verifica contra el backend antes de decir "pago aceptado". */
  enviarPagoEvento: (idVenta: number, evento: EventoPago, mensaje?: string) => void;
}

// Reconectar: el agente tarda ~15 s en volver a levantar (carga Whisper y Piper), asi que se insiste ese tiempo antes de rendirse.
const REINTENTOS_MAX = 8;
const ESPERA_REINTENTO_MAX_MS = 4000;
/** Cuanto se deja ver la respuesta despues de que el agente termino de hablar, antes de volver a "escuchando". */
const TIEMPO_LECTURA_MS = 3500;
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
  const [turno, setTurno] = useState<TurnoVisible>(TURNO_VACIO);
  const [reconectando, setReconectando] = useState(false);
  const [latencia, setLatencia] = useState<number | null>(null);
  const [ultimaRespuestaMs, setUltimaRespuestaMs] = useState<number | null>(null);
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
  const reinicioTurnoRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cambiarEstado = useCallback((nuevo: EstadoConversacion) => {
    estadoRef.current = nuevo;
    setEstado(nuevo);
  }, []);

  const cancelarReinicioTurno = useCallback(() => {
    if (reinicioTurnoRef.current) {
      clearTimeout(reinicioTurnoRef.current);
      reinicioTurnoRef.current = null;
    }
  }, []);

  /** El agente termino: se deja leer la respuesta un momento y el panel vuelve solo a "escuchando". */
  const programarReinicioTurno = useCallback(() => {
    cancelarReinicioTurno();
    reinicioTurnoRef.current = setTimeout(() => {
      reinicioTurnoRef.current = null;
      setTurno(TURNO_VACIO);
    }, TIEMPO_LECTURA_MS);
  }, [cancelarReinicioTurno]);

  const limpiarTurno = useCallback(() => {
    cancelarReinicioTurno();
    setTurno(TURNO_VACIO);
  }, [cancelarReinicioTurno]);

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
          setReconectando(false);
          setError(null);
          cambiarEstado('escuchando');
          break;
        case 'state':
          cambiarEstado(evento.value);
          // Mientras el agente piensa o habla se conserva lo que se muestra; al volver a escuchar empieza la cuenta para limpiarlo.
          if (evento.value === 'escuchando') programarReinicioTurno();
          else cancelarReinicioTurno();
          break;
        case 'vad':
          setUsuarioHablando(evento.hablando);
          // Habla encima del agente: se calla en el acto, sin esperar la ida y vuelta al servidor.
          if (evento.hablando && opcionesRef.current.bargeIn !== false) playbackRef.current?.vaciar();
          // Empieza un turno nuevo: la respuesta anterior ya no corresponde a lo que se esta diciendo.
          if (evento.hablando) limpiarTurno();
          break;
        case 'interrupted':
          playbackRef.current?.vaciar();
          break;
        case 'transcript':
          transcriptRef.current = evento.text;
          setTranscript(evento.text);
          cancelarReinicioTurno();
          setTurno({ transcript: evento.text, respuesta: '', hora: null, error: null });
          break;
        case 'reply':
          setResultado({
            transcript: transcriptRef.current,
            replyText: evento.texto,
            tipo: evento.tipo,
            datos: evento.datos ?? null,
            accionPropuesta: evento.accion_propuesta ?? null,
          });
          setTurno((actual) => ({ ...actual, respuesta: evento.texto, hora: formatearHora(new Date(), true), error: null }));
          break;
        case 'metrics':
          setUltimaRespuestaMs(evento.primer_audio_ms);
          break;
        case 'error':
          setError(evento.message);
          setTurno((actual) => ({ ...actual, error: evento.message }));
          break;
        default:
          break;
      }
      opcionesRef.current.onEvento?.(evento);
    },
    [cambiarEstado, cancelarReinicioTurno, limpiarTurno, programarReinicioTurno],
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
          setReconectando(true);
          cambiarEstado('conectando');
          temporizadorRef.current = setTimeout(() => {
            if (generacion === generacionRef.current) abrirSocket(generacion);
          }, Math.min(400 * 2 ** intentosRef.current, ESPERA_REINTENTO_MAX_MS));
          return;
        }
        liberarAudio();
        setReconectando(false);
        limpiarTurno();
        setError('Se perdió la conexión con el asistente de voz. Revisá que el servicio esté encendido y volvé a intentar.');
        cambiarEstado('error');
      };
    },
    [cambiarEstado, enviar, liberarAudio, limpiarTurno, manejarEvento],
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
    setReconectando(false);
    setUltimaRespuestaMs(null);
    limpiarTurno();
    cambiarEstado('apagada');
  }, [cambiarEstado, liberarAudio, limpiarTurno]);

  const iniciar = useCallback(async () => {
    if (estadoRef.current !== 'apagada' && estadoRef.current !== 'error') return;
    const generacion = ++generacionRef.current;
    cerradaAPropositoRef.current = false;
    intentosRef.current = 0;
    setError(null);
    setReconectando(false);
    limpiarTurno();
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
  }, [abrirSocket, cambiarEstado, liberarAudio, limpiarTurno]);

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

  const enviarContexto = useCallback(
    (version: number, compra: ContextoCompra) => enviar({ type: 'contexto', v: version, compra }),
    [enviar],
  );

  const enviarPantalla = useCallback((disponible: boolean) => enviar({ type: 'pantalla', disponible }), [enviar]);
  const enviarPagoCampos = useCallback((idVenta: number, campos: CamposTarjeta) => enviar({ type: 'pago_campos', idVenta, campos }), [enviar]);
  const enviarPagoEvento = useCallback(
    (idVenta: number, evento: EventoPago, mensaje?: string) => enviar({ type: 'pago_evento', idVenta, evento, ...(mensaje ? { mensaje } : {}) }),
    [enviar],
  );

  // Al desmontar la pantalla se cierra todo (microfono incluido).
  useEffect(() => terminar, [terminar]);

  const activa = estado !== 'apagada' && estado !== 'error';

  // Latencia REAL hacia el servicio de voz: mientras hay conversacion se mide, cada pocos segundos, cuanto tarda una
  // peticion de ida y vuelta (`no-cors`: solo interesa el tiempo, no la respuesta). Si no contesta, no se muestra nada.
  const conversando = estado === 'escuchando' || estado === 'pensando' || estado === 'hablando';
  useEffect(() => {
    if (!conversando) return undefined;
    let vivo = true;
    const muestras: number[] = [];
    const ping = () => fetch(`${VOICE_API_URL}/`, { mode: 'no-cors', cache: 'no-store' });
    const medir = async () => {
      const inicio = performance.now();
      try {
        await ping();
        muestras.push(Math.max(1, Math.round(performance.now() - inicio)));
        if (muestras.length > 3) muestras.shift();
        // Mediana de las ultimas 3: un pedido suelto que tuvo que abrir conexion (~0,4 s en Windows/Docker) no dispara el numero.
        const ordenadas = [...muestras].sort((a, b) => a - b);
        if (vivo) setLatencia(ordenadas[Math.floor(ordenadas.length / 2)]);
      } catch {
        muestras.length = 0;
        if (vivo) setLatencia(null);
      }
    };
    // El primer pedido paga abrir la conexion: se hace y se descarta para no arrancar mostrando un valor inflado.
    void ping()
      .catch(() => undefined)
      .then(() => {
        if (vivo) void medir();
      });
    const id = setInterval(() => void medir(), PERIODO_LATENCIA_MS);
    return () => {
      vivo = false;
      clearInterval(id);
    };
  }, [conversando]);

  return {
    estado,
    activa,
    reconectando,
    latenciaMs: conversando ? latencia : null,
    ultimaRespuestaMs,
    usuarioHablando,
    silenciado,
    transcript,
    resultado,
    turno,
    error,
    nivelMicRef,
    iniciar,
    terminar,
    alternar,
    silenciar,
    interrumpir,
    enviarTexto,
    enviarContexto,
    enviarPantalla,
    enviarPagoCampos,
    enviarPagoEvento,
  };
}

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../controllers/AuthContext';
import { sendVoiceMessage, type VoiceChatResult } from '../../api/voice.api';
import type { DatosConsultaCartelera } from '../../core/types/voice.types';
import { posterFor } from '../../core/posters';

type Estado = 'idle' | 'escuchando' | 'procesando' | 'hablando';

const ETIQUETA_INTENCION: Record<string, string> = {
  comprar_entrada: 'Compra de entradas',
  seleccionar_asiento: 'Selección de butacas',
  comprar_dulceria: 'Pedido de dulcería',
  crear_pelicula: 'Alta de película',
  actualizar_pelicula: 'Edición de película',
  eliminar_pelicula: 'Eliminación de película',
  crear_funcion: 'Programación de función',
  cancelar_funcion: 'Cancelación de función',
  crear_promocion: 'Alta de promoción',
  actualizar_promocion: 'Edición de promoción',
  eliminar_promocion: 'Eliminación de promoción',
  crear_precio: 'Alta de precio',
  actualizar_precio: 'Edición de precio',
  eliminar_precio: 'Eliminación de precio',
};

/**
 * Modo "Voz + UI Dinámica" (RF18) real. Pantalla completa como el modo
 * "Solo Voz" (VoiceAgent.tsx) — el micrófono arranca centrado, y en cuanto
 * el agente devuelve algo para mostrar (películas encontradas, una acción
 * propuesta), el micrófono se achica a una esquina y el contenido pasa a
 * ocupar toda la pantalla, para que se vea bien en vez de amontonado en una
 * franja chica arriba.
 */
export const VoiceHybridBar = ({ onSalir }: { onSalir: () => void }) => {
  const { usuario, token } = useAuth();
  const sesionIdRef = useRef(crypto.randomUUID());
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const [estado, setEstado] = useState<Estado>('idle');
  const [resultado, setResultado] = useState<VoiceChatResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (resultado?.audioUrl) URL.revokeObjectURL(resultado.audioUrl);
    };
  }, [resultado?.audioUrl]);

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType });
        void enviar(audioBlob);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setEstado('escuchando');
    } catch {
      setError('No se pudo acceder al micrófono. Revisá los permisos del navegador.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
  };

  const enviar = async (audioBlob: Blob) => {
    setEstado('procesando');
    try {
      const result = await sendVoiceMessage(audioBlob, usuario?.rol ?? 'cliente', sesionIdRef.current, token);
      setResultado(result);
      if (audioPlayerRef.current) {
        audioPlayerRef.current.src = result.audioUrl;
        await audioPlayerRef.current.play();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo hablar con el agente.');
      setEstado('idle');
    }
  };

  const toggleGrabar = () => {
    if (estado === 'idle') void startRecording();
    else if (estado === 'escuchando') stopRecording();
  };

  const datosCartelera = resultado?.tipo === 'resultado_consulta' ? (resultado.datos as DatosConsultaCartelera | null) : null;
  const tieneListaPeliculas = !!datosCartelera?.peliculas?.length;
  const tieneAccion = !!resultado?.accionPropuesta && (resultado.tipo === 'confirmacion_pendiente' || resultado.tipo === 'accion_confirmada');
  // Resultado de una consulta de solo lectura que no es la cartelera (ej.
  // consultar_reportes) -- se muestra como una tarjeta genérica de clave/valor
  // en vez de no mostrar nada, sin tener que conocer la forma exacta de cada
  // tool nueva que se agregue a futuro.
  const datosGenericos =
    resultado?.tipo === 'resultado_consulta' && resultado.datos && !tieneListaPeliculas && !(datosCartelera && 'error' in datosCartelera)
      ? (resultado.datos as Record<string, unknown>)
      : null;
  const hayContenido = tieneListaPeliculas || tieneAccion || !!datosGenericos;

  const estadoTexto = {
    idle: 'Tocá el micrófono para hablar',
    escuchando: 'Escuchando...',
    procesando: 'Procesando...',
    hablando: 'Lumen AI respondiendo...',
  }[estado];

  const isActive = estado === 'escuchando' || estado === 'hablando';

  const statusColorClass = {
    idle: 'text-on-surface-variant',
    escuchando: 'text-secondary',
    procesando: 'text-on-surface-variant',
    hablando: 'text-primary',
  }[estado];

  const statusDotClass = {
    idle: 'bg-outline',
    escuchando: 'bg-secondary shadow-[0_0_12px_rgba(76,215,246,0.9)]',
    procesando: 'bg-outline',
    hablando: 'bg-primary-container shadow-[0_0_12px_rgba(245,158,11,0.9)]',
  }[estado];

  return createPortal(
    <div className="fixed inset-0 z-[95] bg-surface-container-lowest text-on-surface overflow-hidden select-none flex flex-col">
      <audio
        ref={audioPlayerRef}
        hidden
        onPlay={() => setEstado('hablando')}
        onEnded={() => setEstado('idle')}
      />

      {/* Ambiente decorativo, igual familia visual que VoiceAgent.tsx */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[85vw] max-w-[1100px] h-[580px] bg-gradient-to-b from-primary/15 via-secondary/5 to-transparent blur-[110px] rounded-full opacity-70"></div>
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary-container/10 blur-[130px] rounded-full"></div>
        <div className="absolute bottom-1/3 -right-40 w-[420px] h-[420px] bg-secondary-container/15 blur-[140px] rounded-full"></div>
        <svg className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-full opacity-20 mix-blend-screen" fill="none" preserveAspectRatio="none" viewBox="0 0 1000 900">
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="hybridProjectorBeam" x1="500" x2="500" y1="0" y2="850">
              <stop offset="0%" stopColor="#ffc174" stopOpacity="0.8"></stop>
              <stop offset="35%" stopColor="#03b5d3" stopOpacity="0.25"></stop>
              <stop offset="100%" stopColor="#111319" stopOpacity="0"></stop>
            </linearGradient>
          </defs>
          <polygon fill="url(#hybridProjectorBeam)" points="460,0 540,0 920,900 80,900"></polygon>
        </svg>
      </div>

      {/* Barra superior: SIEMPRE visible (layout normal, sin fixed/z-index raros) —
          ahí viven el micrófono compacto y "Volver a Modo Táctil" en todo momento,
          para no depender de que un botón flotante aparezca sobre el contenido. */}
      <div className="relative z-30 w-full px-space-lg py-space-md flex items-center justify-between gap-space-md shrink-0">
        <div className="flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container/80 backdrop-blur-md shadow-md">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary shadow-[0_0_12px_rgba(76,215,246,0.9)]"></span>
          </span>
          <span className="hidden sm:inline font-label-code text-label-code text-on-surface uppercase tracking-widest">Voz + UI Dinámica</span>
        </div>

        <div className="flex items-center gap-space-sm">
          <span className="hidden md:inline font-label-code text-label-code text-secondary uppercase tracking-wider">{estadoTexto}</span>
          <button
            onClick={toggleGrabar}
            disabled={estado === 'procesando' || estado === 'hablando'}
            className={`relative flex items-center justify-center w-14 h-14 rounded-full shadow-[0_0_24px_-4px_rgba(245,158,11,0.4)] transition-all disabled:opacity-60 ${estado === 'escuchando' ? 'bg-error' : 'bg-gradient-to-tr from-surface-container via-primary-container/40 to-secondary/30'}`}
            title={estado === 'escuchando' ? 'Detener grabación' : 'Hablar'}
          >
            {estado === 'escuchando' && <div className="absolute inset-0 rounded-full bg-error/30 animate-ping"></div>}
            <span className={`material-symbols-outlined text-[24px] ${estado === 'escuchando' ? 'text-on-error' : 'text-primary'}`}>
              {estado === 'escuchando' ? 'stop_circle' : 'mic'}
            </span>
          </button>
          <button
            onClick={onSalir}
            className="flex items-center gap-space-xs px-space-md sm:px-space-lg py-space-sm rounded-full bg-surface-container-high/90 hover:bg-surface-bright text-on-surface transition-all backdrop-blur-xl shadow-lg active:scale-95"
          >
            <span className="material-symbols-outlined text-secondary text-[20px]">touch_app</span>
            <span className="hidden sm:inline font-label-md text-label-md font-bold">Volver a Modo Táctil</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="relative z-30 mx-space-lg mb-space-sm px-space-md py-space-xs rounded-full bg-error-container/30 text-error font-label-code text-label-code w-fit shrink-0">
          {error}
        </div>
      )}

      {/* Contenido: ocupa toda la pantalla disponible una vez que hay algo que mostrar. */}
      <div className={`relative z-10 flex-1 min-h-0 overflow-y-auto px-space-lg ${hayContenido ? 'pb-space-xl' : ''}`}>
        {!hayContenido ? (
          <div className="h-full flex flex-col items-center justify-center gap-space-xs py-space-md">
            <div className="mb-space-md flex flex-col items-center gap-space-xs">
              <div className="flex items-center gap-space-sm px-space-lg py-space-xs rounded-full bg-surface-container/90 backdrop-blur-xl shadow-[0_0_30px_rgba(245,158,11,0.25)] transition-all duration-300">
                <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${statusDotClass}`}></span>
                <span className={`font-label-code text-label-code font-bold tracking-[0.2em] uppercase ${statusColorClass}`}>
                  {estadoTexto}
                </span>
              </div>

              <div className="flex items-center justify-center gap-1.5 h-6 px-space-md">
                <span className={`w-1 bg-secondary/80 rounded-full h-3 ${isActive ? 'animate-[pulse_0.7s_ease-in-out_infinite]' : ''}`}></span>
                <span className={`w-1 bg-primary/90 rounded-full h-5 ${isActive ? 'animate-[pulse_0.5s_ease-in-out_infinite_0.1s]' : ''}`}></span>
                <span className={`w-1 bg-primary-container rounded-full h-4 ${isActive ? 'animate-[pulse_0.8s_ease-in-out_infinite_0.2s]' : ''}`}></span>
                <span className={`w-1 bg-tertiary rounded-full h-6 ${isActive ? 'animate-[pulse_0.6s_ease-in-out_infinite_0.15s]' : ''}`}></span>
                <span className={`w-1 bg-secondary rounded-full h-3 ${isActive ? 'animate-[pulse_0.7s_ease-in-out_infinite_0.3s]' : ''}`}></span>
                <span className={`w-1 bg-primary rounded-full h-5 ${isActive ? 'animate-[pulse_0.5s_ease-in-out_infinite_0.05s]' : ''}`}></span>
                <span className={`w-1 bg-tertiary rounded-full h-2 ${isActive ? 'animate-[pulse_0.9s_ease-in-out_infinite_0.25s]' : ''}`}></span>
              </div>
            </div>

            <div className="relative flex items-center justify-center w-[260px] h-[260px] sm:w-[340px] sm:h-[340px] my-space-xs">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/10 via-secondary/15 to-transparent blur-2xl animate-[spin_16s_linear_infinite] scale-125"></div>
              <div className="absolute inset-4 rounded-full bg-gradient-to-bl from-primary-container/20 via-surface-container-lowest to-secondary-container/20 blur-xl animate-[pulse_3s_ease-in-out_infinite]"></div>

              <svg className="absolute inset-0 w-full h-full pointer-events-none" fill="none" viewBox="0 0 400 400">
                <defs>
                  <linearGradient id="hybridOrbGradient1" x1="0%" x2="100%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#ffc174" stopOpacity="0.9"></stop>
                    <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.6"></stop>
                    <stop offset="100%" stopColor="#4cd7f6" stopOpacity="0.8"></stop>
                  </linearGradient>
                  <linearGradient id="hybridRingGradient" x1="0%" x2="100%" y1="100%" y2="0%">
                    <stop offset="0%" stopColor="#03b5d3" stopOpacity="0.7"></stop>
                    <stop offset="100%" stopColor="#ffb95f" stopOpacity="0.7"></stop>
                  </linearGradient>
                </defs>
                <circle className="opacity-60 origin-center animate-[spin_28s_linear_infinite]" cx="200" cy="200" r="165" stroke="url(#hybridRingGradient)" strokeDasharray="8 12" strokeWidth="1.5"></circle>
                <ellipse className="opacity-40 origin-center animate-[spin_20s_linear_infinite_reverse]" cx="200" cy="200" rx="180" ry="120" stroke="url(#hybridOrbGradient1)" strokeDasharray="14 8" strokeWidth="1"></ellipse>
                <path className="opacity-80" d="M 60,200 Q 130,165 200,200 T 340,200" fill="none" stroke="#4cd7f6" strokeLinecap="round" strokeWidth="2.5">
                  <animate attributeName="d" dur="3.2s" repeatCount="indefinite" values="M 60,200 Q 130,160 200,200 T 340,200; M 60,200 Q 130,240 200,200 T 340,200; M 60,200 Q 130,160 200,200 T 340,200"></animate>
                </path>
              </svg>

              <button
                onClick={toggleGrabar}
                disabled={estado === 'procesando' || estado === 'hablando'}
                className="relative w-40 h-40 sm:w-52 sm:h-52 rounded-full flex items-center justify-center shadow-[0_0_80px_rgba(245,158,11,0.45),inset_0_0_50px_rgba(3,181,211,0.5)] transition-transform duration-500 hover:scale-105 disabled:opacity-70 bg-gradient-to-tr from-surface-container via-primary-container/40 to-secondary/30 backdrop-blur-2xl"
              >
                <div className={`w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-primary via-primary-container to-secondary-container opacity-90 blur-[1px] flex items-center justify-center ${estado !== 'idle' ? 'animate-[pulse_2.2s_ease-in-out_infinite]' : ''}`}>
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-surface-container-lowest/80 backdrop-blur-md flex items-center justify-center shadow-inner">
                    <span className={`material-symbols-outlined text-[32px] sm:text-[36px] drop-shadow-[0_0_12px_rgba(255,193,116,0.8)] text-primary ${estado === 'escuchando' ? 'animate-pulse' : ''}`}>
                      {estado === 'escuchando' ? 'stop_circle' : 'graphic_eq'}
                    </span>
                  </div>
                </div>
              </button>
            </div>

            <div className="w-full max-w-3xl mt-space-sm">
              <div className="relative overflow-hidden rounded-xl bg-surface-container/85 backdrop-blur-2xl p-space-md sm:p-space-lg shadow-[0_16px_40px_-10px_rgba(0,0,0,0.8)]">
                <div className="flex items-center justify-between mb-space-sm">
                  <div className="flex items-center gap-space-xs">
                    <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(76,215,246,0.8)]"></span>
                    <span className="font-label-code text-label-code uppercase tracking-wider text-secondary">Transcripción en Tiempo Real</span>
                  </div>
                </div>

                <div className="flex flex-col gap-space-sm">
                  <div className="flex items-start gap-space-sm">
                    <div className="w-7 h-7 rounded-lg bg-surface-bright flex-shrink-0 flex items-center justify-center text-on-surface mt-0.5">
                      <span className="material-symbols-outlined text-[16px]">record_voice_over</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-code text-label-code text-outline uppercase tracking-wider">Tú ({usuario?.rol === 'administrador' ? 'Administrador' : 'Cliente'})</span>
                      <p className="font-headline-sm text-headline-sm text-on-surface leading-snug tracking-tight">
                        {resultado?.transcript || 'Presioná el micrófono y hablá para comenzar.'}
                      </p>
                    </div>
                  </div>

                  <div className="w-full h-px bg-gradient-to-r from-transparent via-outline-variant/40 to-transparent my-space-2xs"></div>

                  <div className="flex items-start gap-space-sm">
                    <div className="w-7 h-7 rounded-lg bg-primary-container/20 flex-shrink-0 flex items-center justify-center text-primary mt-0.5 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
                      <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                    </div>
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center gap-space-xs">
                        <span className="font-label-code text-label-code text-primary uppercase tracking-wider font-bold">Lumen AI</span>
                        {resultado?.replyText && (
                          <span className="font-label-code text-label-code text-tertiary px-space-2xs py-0.5 rounded bg-tertiary/10">PROCESADO CON ÉXITO</span>
                        )}
                      </div>
                      <p className="font-body-lg text-body-lg text-primary-fixed leading-relaxed mt-0.5">
                        {resultado?.replyText || 'Esperando tu mensaje...'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-space-lg pt-space-sm">
            {resultado?.transcript && (
              <div className="flex items-start gap-space-sm bg-surface-container/85 backdrop-blur-xl rounded-xl p-space-md shadow-md">
                <span className="material-symbols-outlined text-secondary">record_voice_over</span>
                <div className="flex flex-col gap-space-2xs">
                  <p className="font-body-md text-body-md text-on-surface">“{resultado.transcript}”</p>
                  {resultado.replyText && <p className="font-body-sm text-body-sm text-on-surface-variant">{resultado.replyText}</p>}
                </div>
              </div>
            )}

            {tieneListaPeliculas && datosCartelera?.peliculas && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-space-lg">
                {datosCartelera.peliculas.map((p) => (
                  <div key={p.idPelicula} className="flex flex-col bg-surface-container rounded-2xl overflow-hidden shadow-xl">
                    <div className="aspect-[2/3] w-full bg-surface-container-high">
                      <img src={p.posterUrl ?? posterFor(p.idPelicula)} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="p-space-sm flex flex-col gap-space-2xs">
                      <span className="font-headline-sm text-headline-sm text-on-surface leading-tight truncate">{p.titulo}</span>
                      <span className="font-label-code text-label-code text-secondary">{p.genero ?? 'Sin género'}</span>
                      <div className="flex items-center gap-space-2xs">
                        {p.clasificacion && <span className="px-space-2xs py-0.5 rounded bg-surface-container-high font-label-code text-label-code text-on-surface-variant">{p.clasificacion}</span>}
                        <span className="font-label-code text-label-code text-on-surface-variant">{p.duracionMin} min</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {datosGenericos && (() => {
              const reporte = (datosGenericos.reporte ?? datosGenericos) as unknown;
              const filas = Array.isArray(reporte) ? (reporte as Record<string, unknown>[]) : [reporte as Record<string, unknown>];
              return (
                <div className="flex flex-col gap-space-md">
                  {typeof datosGenericos.tipo_reporte === 'string' && (
                    <span className="font-label-code text-label-code text-secondary uppercase tracking-wider">
                      Reporte: {datosGenericos.tipo_reporte}
                    </span>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-md">
                    {filas.map((fila, i) => (
                      <div key={i} className="flex flex-col gap-space-2xs bg-surface-container rounded-xl p-space-md shadow-md">
                        {Object.entries(fila ?? {}).map(([k, v]) => (
                          <div key={k} className="flex items-center justify-between gap-space-sm">
                            <span className="font-label-code text-label-code text-on-surface-variant uppercase truncate">{k}</span>
                            <span className="font-body-md text-body-md text-on-surface font-bold whitespace-nowrap">
                              {Array.isArray(v) ? v.join(', ') : String(v)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {tieneAccion && resultado?.accionPropuesta && (
              <div className={`flex flex-col items-center text-center gap-space-md p-space-2xl rounded-2xl ${resultado.tipo === 'accion_confirmada' ? 'bg-tertiary/10' : 'bg-primary-container/15'}`}>
                <span className={`material-symbols-outlined text-[64px] ${resultado.tipo === 'accion_confirmada' ? 'text-tertiary' : 'text-primary'}`}>
                  {resultado.tipo === 'accion_confirmada' ? 'check_circle' : 'pending_actions'}
                </span>
                <span className="font-headline-md text-headline-md text-on-surface">
                  {ETIQUETA_INTENCION[resultado.accionPropuesta.intencion] ?? resultado.accionPropuesta.intencion}
                </span>
                <div className="flex flex-wrap items-center justify-center gap-space-sm">
                  {Object.entries(resultado.accionPropuesta.payload)
                    .filter(([, v]) => v !== null && v !== undefined && v !== '')
                    .map(([k, v]) => (
                      <span key={k} className="px-space-md py-space-xs rounded-full bg-surface-container-lowest/60 font-label-lg text-label-lg text-on-surface">
                        <span className="text-on-surface-variant uppercase font-label-code text-label-code mr-space-2xs">{k}:</span>
                        {Array.isArray(v) ? v.join(', ') : String(v)}
                      </span>
                    ))}
                </div>
                {resultado.tipo === 'confirmacion_pendiente' && (
                  <span className="font-label-code text-label-code text-primary uppercase tracking-widest font-bold mt-space-sm">Decí "confirmo" para seguir</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};

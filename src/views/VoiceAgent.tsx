import { useEffect, useRef, useState, type MouseEvent, type TouchEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendVoiceMessage } from '../api/voice.api';
import { useCine } from '../controllers/CineContext';

type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking';

export const VoiceAgent = () => {
  const navigate = useNavigate();
  const { state: cineState } = useCine();
  const onClose = () => navigate(cineState.peliculaSeleccionada ? '/compra' : '/cartelera');

  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [replyText, setReplyText] = useState('');
  const [error, setError] = useState<string | null>(null);
  let holdTimer: any = null;

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const startHold = (e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    setHoldProgress(0);
    holdTimer = setInterval(() => {
      setHoldProgress(prev => {
        if (prev >= 100) {
          clearInterval(holdTimer);
          setTimeout(() => {
            onClose();
          }, 250);
          return 100;
        }
        return prev + 10;
      });
    }, 60);
  };

  const endHold = () => {
    if (holdProgress < 100) {
      clearInterval(holdTimer);
      setHoldProgress(0);
    }
  };

  useEffect(() => {
    window.addEventListener('mouseup', endHold);
    window.addEventListener('touchend', endHold);
    return () => {
      window.removeEventListener('mouseup', endHold);
      window.removeEventListener('touchend', endHold);
      if (holdTimer) clearInterval(holdTimer);
    };
  }, [holdProgress]);

  const startRecording = async () => {
    console.log('[voz] 1. pidiendo permiso de microfono...');
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('[voz] 2. permiso concedido, stream:', stream, 'tracks:', stream.getAudioTracks());

      const recorder = new MediaRecorder(stream);
      console.log('[voz] 3. MediaRecorder creado, mimeType:', recorder.mimeType, 'state:', recorder.state);
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        console.log('[voz] 4. dataavailable, tamaño:', e.data.size);
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onerror = (e) => {
        console.error('[voz] ERROR en MediaRecorder:', e);
      };
      recorder.onstop = () => {
        console.log('[voz] 5. recorder.onstop, chunks:', audioChunksRef.current.length);
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType });
        console.log('[voz] 6. blob final, tamaño:', audioBlob.size, 'tipo:', audioBlob.type);
        void sendToAgent(audioBlob);
      };

      recorder.start();
      console.log('[voz] 3b. recorder.start() llamado, state:', recorder.state);
      mediaRecorderRef.current = recorder;
      setOrbState('listening');
    } catch (err) {
      console.error('[voz] ERROR al pedir microfono:', err);
      setError('No se pudo acceder al micrófono. Revisa los permisos del navegador.');
    }
  };

  const stopRecording = () => {
    console.log('[voz] stopRecording() llamado, recorder actual:', mediaRecorderRef.current, 'state:', mediaRecorderRef.current?.state);
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
  };

  const sendToAgent = async (audioBlob: Blob) => {
    console.log('[voz] 7. enviando al backend, tamaño del blob:', audioBlob.size);
    setOrbState('thinking');
    try {
      const result = await sendVoiceMessage(audioBlob);
      console.log('[voz] 8. respuesta del backend:', result);
      setTranscript(result.transcript);
      setReplyText(result.replyText);
      if (audioPlayerRef.current) {
        audioPlayerRef.current.src = result.audioUrl;
        await audioPlayerRef.current.play();
        console.log('[voz] 9. reproduciendo audio de respuesta');
      }
    } catch (err) {
      console.error('[voz] ERROR al hablar con el agente:', err);
      setError(err instanceof Error ? err.message : 'No se pudo hablar con el agente.');
      setOrbState('idle');
    }
  };

  const handleOrbClick = () => {
    console.log('[voz] click en el orbe, orbState actual:', orbState, 'isMuted:', isMuted);
    if (isMuted) return;
    if (orbState === 'idle') {
      void startRecording();
    } else if (orbState === 'listening') {
      stopRecording();
    }
  };

  const toggleMute = () => {
    if (!isMuted && orbState === 'listening') {
      stopRecording();
    }
    setIsMuted(!isMuted);
  };

  const offset = 320 - (320 * (holdProgress / 100));

  const statusText = isMuted
    ? 'MICRÓFONO PAUSADO'
    : orbState === 'listening'
      ? 'ESCUCHANDO TU RESPUESTA...'
      : orbState === 'thinking'
        ? 'PROCESANDO TU MENSAJE...'
        : orbState === 'speaking'
          ? 'LUMEN AI RESPONDIENDO...'
          : 'PRESIONA EL ORBE PARA HABLAR';

  const statusColorClass = isMuted
    ? 'text-error'
    : orbState === 'listening'
      ? 'text-secondary'
      : orbState === 'speaking'
        ? 'text-primary'
        : 'text-on-surface-variant';

  const statusDotClass = isMuted
    ? 'bg-error shadow-[0_0_12px_rgba(255,180,171,0.9)]'
    : orbState === 'listening'
      ? 'bg-secondary shadow-[0_0_12px_rgba(76,215,246,0.9)]'
      : orbState === 'speaking'
        ? 'bg-primary-container shadow-[0_0_12px_rgba(245,158,11,0.9)]'
        : 'bg-outline';

  const isActive = orbState === 'listening' || orbState === 'speaking';

  return (
    <div className="flex flex-col w-full absolute inset-0 z-[100] bg-surface-container-lowest text-on-surface overflow-hidden select-none min-h-screen">
      <audio
        ref={audioPlayerRef}
        hidden
        onPlay={() => setOrbState('speaking')}
        onEnded={() => setOrbState('idle')}
      />

      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[85vw] max-w-[1100px] h-[580px] bg-gradient-to-b from-primary/15 via-secondary/5 to-transparent blur-[110px] rounded-full opacity-70"></div>
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary-container/10 blur-[130px] rounded-full"></div>
        <div className="absolute bottom-1/3 -right-40 w-[420px] h-[420px] bg-secondary-container/15 blur-[140px] rounded-full"></div>
        <svg className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-full opacity-20 mix-blend-screen" fill="none" preserveAspectRatio="none" viewBox="0 0 1000 900">
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="projectorBeam" x1="500" x2="500" y1="0" y2="850">
              <stop offset="0%" stopColor="#ffc174" stopOpacity="0.8"></stop>
              <stop offset="35%" stopColor="#03b5d3" stopOpacity="0.25"></stop>
              <stop offset="100%" stopColor="#111319" stopOpacity="0"></stop>
            </linearGradient>
          </defs>
          <polygon fill="url(#projectorBeam)" points="460,0 540,0 920,900 80,900"></polygon>
        </svg>
      </div>

      <div className="relative z-30 w-full px-space-lg py-space-md flex items-center justify-between">
        <div className="flex items-center gap-space-sm">
          <div className="flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container/80 backdrop-blur-md shadow-md">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-tertiary shadow-[0_0_12px_rgba(86,229,169,0.9)]"></span>
            </span>
            <span className="font-label-code text-label-code text-on-surface uppercase tracking-widest">Canal de Voz Bidireccional</span>
          </div>
        </div>

        <div className="flex items-center gap-space-sm">
          <div className="relative group cursor-pointer" onMouseDown={startHold} onTouchStart={startHold}>
            <button aria-label="Cambiar a pantalla táctil tradicional" className="flex items-center gap-space-xs px-space-lg py-space-sm rounded-full bg-surface-container-high/90 hover:bg-surface-bright text-on-surface transition-all duration-200 backdrop-blur-xl shadow-lg active:scale-95">
              <span className="material-symbols-outlined text-secondary text-[20px]">touch_app</span>
              <div className="flex flex-col text-left">
                <span className="font-label-md text-label-md font-bold text-on-surface leading-tight">Modo Táctil</span>
                <span className="font-label-code text-label-code text-on-surface-variant text-[9px] uppercase tracking-wider">{holdProgress >= 100 ? 'CAMBIANDO...' : 'Mantén presionado'}</span>
              </div>
            </button>
            <svg className="absolute -inset-1 w-[calc(100%+8px)] h-[calc(100%+8px)] pointer-events-none -rotate-90">
              <rect className={`text-primary transition-all ${holdProgress > 0 ? 'opacity-100' : 'opacity-0'}`} fill="none" height="calc(100% - 4px)" rx="9999" stroke="currentColor" strokeDasharray="320" strokeDashoffset={offset} strokeWidth="2" width="calc(100% - 4px)" x="2" y="2"></rect>
            </svg>
          </div>
          <button onClick={toggleMute} className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-md ${isMuted ? 'bg-error-container/30 text-error' : 'bg-surface-container-high text-on-surface hover:text-primary'}`} title="Silenciar entrada de voz">
            <span className="material-symbols-outlined text-[20px]">{isMuted ? 'mic_off' : 'mic'}</span>
          </button>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-space-md py-space-xs">
        <div className="mb-space-md flex flex-col items-center gap-space-xs">
          <div className="flex items-center gap-space-sm px-space-lg py-space-xs rounded-full bg-surface-container/90 backdrop-blur-xl shadow-[0_0_30px_rgba(245,158,11,0.25)] transition-all duration-300">
            <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${statusDotClass}`}></span>
            <span className={`font-label-code text-label-code font-bold tracking-[0.2em] uppercase ${statusColorClass}`}>
              {statusText}
            </span>
          </div>

          {error && (
            <div className="px-space-md py-space-xs rounded-full bg-error-container/30 text-error font-label-code text-label-code">
              {error}
            </div>
          )}

          <div className="flex items-center justify-center gap-1.5 h-6 px-space-md">
            <span className={`w-1 bg-secondary/80 rounded-full h-3 ${isActive && 'animate-[pulse_0.7s_ease-in-out_infinite]'}`}></span>
            <span className={`w-1 bg-primary/90 rounded-full h-5 ${isActive && 'animate-[pulse_0.5s_ease-in-out_infinite_0.1s]'}`}></span>
            <span className={`w-1 bg-primary-container rounded-full h-4 ${isActive && 'animate-[pulse_0.8s_ease-in-out_infinite_0.2s]'}`}></span>
            <span className={`w-1 bg-tertiary rounded-full h-6 ${isActive && 'animate-[pulse_0.6s_ease-in-out_infinite_0.15s]'}`}></span>
            <span className={`w-1 bg-secondary rounded-full h-3 ${isActive && 'animate-[pulse_0.7s_ease-in-out_infinite_0.3s]'}`}></span>
            <span className={`w-1 bg-primary rounded-full h-5 ${isActive && 'animate-[pulse_0.5s_ease-in-out_infinite_0.05s]'}`}></span>
            <span className={`w-1 bg-tertiary rounded-full h-2 ${isActive && 'animate-[pulse_0.9s_ease-in-out_infinite_0.25s]'}`}></span>
          </div>
        </div>

        <div className="relative flex items-center justify-center w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] my-space-xs">
          <div className={`absolute inset-0 rounded-full bg-gradient-to-tr from-primary/10 via-secondary/15 to-transparent blur-2xl animate-[spin_16s_linear_infinite] scale-125 ${isMuted && 'opacity-30'}`}></div>
          <div className={`absolute inset-4 rounded-full bg-gradient-to-bl from-primary-container/20 via-surface-container-lowest to-secondary-container/20 blur-xl animate-[pulse_3s_ease-in-out_infinite] ${isMuted && 'opacity-30'}`}></div>

          <svg className="absolute inset-0 w-full h-full pointer-events-none" fill="none" viewBox="0 0 400 400">
            <defs>
              <linearGradient id="orbGradient1" x1="0%" x2="100%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="#ffc174" stopOpacity="0.9"></stop>
                <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.6"></stop>
                <stop offset="100%" stopColor="#4cd7f6" stopOpacity="0.8"></stop>
              </linearGradient>
              <linearGradient id="ringGradient" x1="0%" x2="100%" y1="100%" y2="0%">
                <stop offset="0%" stopColor="#03b5d3" stopOpacity="0.7"></stop>
                <stop offset="100%" stopColor="#ffb95f" stopOpacity="0.7"></stop>
              </linearGradient>
            </defs>
            <circle className={`opacity-60 origin-center ${!isMuted && 'animate-[spin_28s_linear_infinite]'}`} cx="200" cy="200" r="165" stroke="url(#ringGradient)" strokeDasharray="8 12" strokeWidth="1.5"></circle>
            <ellipse className={`opacity-40 origin-center ${!isMuted && 'animate-[spin_20s_linear_infinite_reverse]'}`} cx="200" cy="200" rx="180" ry="120" stroke="url(#orbGradient1)" strokeDasharray="14 8" strokeWidth="1"></ellipse>
            {!isMuted && (
              <path className="opacity-80" d="M 60,200 Q 130,165 200,200 T 340,200" fill="none" stroke="#4cd7f6" strokeLinecap="round" strokeWidth="2.5">
                <animate attributeName="d" dur="3.2s" repeatCount="indefinite" values="M 60,200 Q 130,160 200,200 T 340,200; M 60,200 Q 130,240 200,200 T 340,200; M 60,200 Q 130,160 200,200 T 340,200"></animate>
              </path>
            )}
          </svg>

          <div onClick={handleOrbClick} className={`relative w-48 h-48 sm:w-60 sm:h-60 rounded-full flex items-center justify-center shadow-[0_0_80px_rgba(245,158,11,0.45),inset_0_0_50px_rgba(3,181,211,0.5)] transition-transform duration-500 hover:scale-105 cursor-pointer bg-gradient-to-tr from-surface-container via-primary-container/40 to-secondary/30 backdrop-blur-2xl ${isMuted ? 'grayscale' : ''}`}>
            <div className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-primary via-primary-container to-secondary-container opacity-90 blur-[1px] ${!isMuted && 'animate-[pulse_2.2s_ease-in-out_infinite]'} flex items-center justify-center`}>
              <div className="w-20 h-20 rounded-full bg-surface-container-lowest/80 backdrop-blur-md flex items-center justify-center shadow-inner">
                <span className={`material-symbols-outlined text-[36px] drop-shadow-[0_0_12px_rgba(255,193,116,0.8)] ${isMuted ? 'text-on-surface-variant' : 'text-primary animate-pulse'}`}>
                  {isMuted ? 'mic_off' : orbState === 'listening' ? 'stop_circle' : 'graphic_eq'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-3xl mt-space-sm px-space-md">
          <div className="relative overflow-hidden rounded-xl bg-surface-container/85 backdrop-blur-2xl p-space-md sm:p-space-lg shadow-[0_16px_40px_-10px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between mb-space-sm">
              <div className="flex items-center gap-space-xs">
                <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(76,215,246,0.8)]"></span>
                <span className="font-label-code text-label-code uppercase tracking-wider text-secondary">Transcripción en Tiempo Real</span>
              </div>
            </div>

            <div className="flex flex-col gap-space-sm">
              <div className="flex items-start gap-space-sm group">
                <div className="w-7 h-7 rounded-lg bg-surface-bright flex-shrink-0 flex items-center justify-center text-on-surface mt-0.5">
                  <span className="material-symbols-outlined text-[16px]">record_voice_over</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-code text-label-code text-outline uppercase tracking-wider">Tú (Cliente)</span>
                  <p className="font-headline-sm text-headline-sm text-on-surface leading-snug tracking-tight">
                    {transcript || 'Presiona el orbe naranja y habla para comenzar.'}
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
                    {replyText && (
                      <span className="font-label-code text-label-code text-tertiary px-space-2xs py-0.5 rounded bg-tertiary/10">PROCESADO CON ÉXITO</span>
                    )}
                  </div>
                  <p className="font-body-lg text-body-lg text-primary-fixed leading-relaxed mt-0.5">
                    {replyText || 'Esperando tu mensaje...'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

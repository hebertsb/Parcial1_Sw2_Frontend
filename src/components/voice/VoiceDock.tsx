import { useEffect, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import type { SesionVoz } from '../../core/voice/useVoiceSession';

interface VoiceDockProps {
  voz: SesionVoz;
  /** Deja libre la barra inferior de la app (BottomHUD) cuando la pagina la muestra. */
  sobreBarraInferior: boolean;
  onCerrar: () => void;
}

const ESTADO_TEXTO = {
  apagada: 'Tocá el micrófono para conversar',
  conectando: 'Conectando…',
  escuchando: 'Escuchando — hablá cuando quieras',
  pensando: 'Procesando…',
  hablando: 'Lumen AI responde — podés interrumpir',
  error: 'Conversación detenida — tocá para reintentar',
} as const;

/**
 * Modo "Voz + UI Dinámica": un panel compacto y flotante, para que la app siga a la vista mientras se habla (el agente
 * la mueve sola). Muestra en vivo lo que se entendio y lo que contesta el agente; el mic se pausa con su boton y
 * hay un campo para escribir por si el ambiente es ruidoso.
 */
export const VoiceDock = ({ voz, sobreBarraInferior, onCerrar }: VoiceDockProps) => {
  const orbeRef = useRef<HTMLDivElement | null>(null);
  const [escribiendo, setEscribiendo] = useState(false);
  const [texto, setTexto] = useState('');

  // El aro del orbe respira con la voz del usuario (lee el nivel sin re-renderizar React).
  useEffect(() => {
    let cuadro = 0;
    const animar = () => {
      const orbe = orbeRef.current;
      if (orbe) {
        const nivel = voz.silenciado ? 0 : Math.min(voz.nivelMicRef.current * 7, 1);
        orbe.style.transform = `scale(${1 + nivel * 0.22})`;
        orbe.style.opacity = String(0.35 + nivel * 0.5);
      }
      cuadro = requestAnimationFrame(animar);
    };
    cuadro = requestAnimationFrame(animar);
    return () => cancelAnimationFrame(cuadro);
  }, [voz.nivelMicRef, voz.silenciado]);

  const apagada = voz.estado === 'apagada' || voz.estado === 'error';
  const estadoTexto = voz.silenciado && !apagada ? 'Micrófono pausado' : voz.estado === 'escuchando' && voz.usuarioHablando ? 'Te escucho…' : ESTADO_TEXTO[voz.estado];

  const colorOrbe = voz.silenciado
    ? 'bg-error text-on-error'
    : voz.estado === 'escuchando'
      ? 'bg-secondary text-on-secondary'
      : voz.estado === 'hablando'
        ? 'bg-primary-container text-on-primary-container'
        : voz.estado === 'error'
          ? 'bg-error text-on-error'
          : 'bg-surface-container-highest text-on-surface';

  const alOrbe = () => {
    if (apagada) void voz.iniciar();
    else if (voz.estado === 'hablando') voz.interrumpir();
    else voz.silenciar(!voz.silenciado);
  };

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    if (!texto.trim()) return;
    voz.enviarTexto(texto);
    setTexto('');
  };

  return createPortal(
    <div
      data-testid="voice-dock"
      className={`fixed left-1/2 -translate-x-1/2 z-[90] w-[min(780px,calc(100vw-1rem))] flex flex-col gap-space-xs ${sobreBarraInferior ? 'bottom-28' : 'bottom-6'}`}
    >
      {escribiendo && (
        <form onSubmit={enviar} className="flex items-center gap-space-xs rounded-full bg-surface-container/95 backdrop-blur-2xl shadow-xl px-space-md py-space-xs">
          <input
            autoFocus
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escribí lo que le dirías a Lumen…"
            aria-label="Escribir un mensaje a Lumen"
            className="flex-1 bg-transparent outline-none font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant"
          />
          <button type="submit" className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center" aria-label="Enviar">
            <span className="material-symbols-outlined text-[18px]">send</span>
          </button>
        </form>
      )}

      <div className="flex items-center gap-space-md rounded-2xl bg-surface-container/95 backdrop-blur-2xl shadow-[0_16px_48px_-8px_rgba(0,0,0,0.9)] px-space-md py-space-sm">
        <button
          type="button"
          onClick={alOrbe}
          aria-label={apagada ? 'Iniciar la conversación' : voz.estado === 'hablando' ? 'Interrumpir a Lumen' : voz.silenciado ? 'Reactivar el micrófono' : 'Pausar el micrófono'}
          className={`relative w-12 h-12 shrink-0 rounded-full flex items-center justify-center transition-colors ${colorOrbe}`}
        >
          <div ref={orbeRef} className="absolute inset-0 rounded-full bg-secondary/50 pointer-events-none" />
          <span className="relative material-symbols-outlined text-[24px]">
            {apagada ? 'mic' : voz.silenciado ? 'mic_off' : voz.estado === 'hablando' ? 'graphic_eq' : voz.estado === 'pensando' ? 'more_horiz' : 'mic'}
          </span>
        </button>

        <div className="flex-1 min-w-0 flex flex-col">
          <span className="font-label-code text-label-code text-secondary uppercase tracking-wider truncate" data-testid="dock-estado">
            {estadoTexto}
          </span>
          {voz.transcript && (
            <span className="font-body-sm text-body-sm text-on-surface-variant truncate" data-testid="dock-transcript">
              Vos: {voz.transcript}
            </span>
          )}
          {voz.resultado?.replyText && (
            <span className="font-body-md text-body-md text-on-surface line-clamp-2" data-testid="dock-respuesta">
              {voz.resultado.replyText}
            </span>
          )}
          {voz.error && <span className="font-label-md text-label-md text-error">{voz.error}</span>}
        </div>

        <div className="flex items-center gap-space-2xs shrink-0">
          <button
            type="button"
            onClick={() => setEscribiendo((v) => !v)}
            aria-label="Escribir en vez de hablar"
            aria-pressed={escribiendo}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${escribiendo ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:bg-surface-variant'}`}
          >
            <span className="material-symbols-outlined text-[20px]">keyboard</span>
          </button>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar el asistente de voz"
            className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-error-container hover:text-on-error-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

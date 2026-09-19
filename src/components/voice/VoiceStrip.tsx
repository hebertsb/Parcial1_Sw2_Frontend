import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { SesionVoz } from '../../core/voice/useVoiceSession';

interface VoiceStripProps {
  voz: SesionVoz;
}

const ETIQUETA_ESTADO = {
  apagada: 'Tocá el micrófono para conversar',
  conectando: 'Conectando…',
  escuchando: 'Escucha activa — hablá cuando quieras',
  pensando: 'Procesando…',
  hablando: 'Lumen AI responde — podés interrumpir',
  error: 'Conversación detenida — tocá el micrófono',
} as const;

const N_BARRAS = 5;

/**
 * Panel de voz de "Voz + UI Dinamica": una sola franja continua pegada al selector de modo (misma banda de fondo), sin
 * cortes. A la izquierda, sobre la franja, lo que se entiende (microfono, ecualizador y la frase); a la derecha, en una
 * tarjeta hundida, lo que contesta Lumen. La app de abajo queda a la vista y se mueve sola mientras se habla.
 *
 * Cuando el agente termina de hablar, a los pocos segundos vuelve solo a "escuchando" (ver `SesionVoz.turno`) en vez
 * de quedarse con la respuesta anterior. Para cerrarlo se usa el selector de modo de arriba, no un boton propio.
 */
export const VoiceStrip = ({ voz }: VoiceStripProps) => {
  const orbeRef = useRef<HTMLDivElement | null>(null);
  const barrasRef = useRef<Array<HTMLSpanElement | null>>([]);
  const estadoRef = useRef(voz.estado);
  const silenciadoRef = useRef(voz.silenciado);
  estadoRef.current = voz.estado;
  silenciadoRef.current = voz.silenciado;

  const [escribiendo, setEscribiendo] = useState(false);
  const [texto, setTexto] = useState('');

  // El aro del microfono y el ecualizador respiran con la voz (se lee el nivel sin re-renderizar React).
  useEffect(() => {
    let cuadro = 0;
    const animar = () => {
      const nivel = silenciadoRef.current ? 0 : Math.min(voz.nivelMicRef.current * 7, 1);
      const orbe = orbeRef.current;
      if (orbe) {
        orbe.style.transform = `scale(${1 + nivel * 0.28})`;
        orbe.style.opacity = String(0.3 + nivel * 0.55);
      }
      const t = performance.now() / 160;
      const habla = estadoRef.current === 'hablando';
      barrasRef.current.forEach((barra, i) => {
        if (!barra) return;
        const onda = 0.5 + 0.5 * Math.sin(t + i * 1.4);
        const altura = habla ? 0.3 + 0.7 * onda : 0.16 + nivel * (0.4 + 0.6 * onda);
        barra.style.transform = `scaleY(${altura.toFixed(3)})`;
      });
      cuadro = requestAnimationFrame(animar);
    };
    cuadro = requestAnimationFrame(animar);
    return () => cancelAnimationFrame(cuadro);
  }, [voz.nivelMicRef]);

  const apagada = voz.estado === 'apagada' || voz.estado === 'error';
  const etiqueta = voz.reconectando
    ? 'Reconectando con el asistente…'
    : voz.silenciado && !apagada
      ? 'Micrófono pausado'
      : voz.estado === 'escuchando' && voz.usuarioHablando
        ? 'Te escucho…'
        : ETIQUETA_ESTADO[voz.estado];

  // Un fallo de la conversacion (se cayo la conexion, no hay microfono) se queda; el de un turno se va con el turno.
  const error = voz.estado === 'error' ? voz.error : voz.turno.error;

  // Ambar mientras escucha (como en la interfaz original); cian cuando habla Lumen; rojo si esta pausado o fallo.
  const esRojo = voz.silenciado || voz.estado === 'error';
  const esAmbar = !esRojo && voz.estado === 'escuchando';
  const esCian = !esRojo && voz.estado === 'hablando';
  const colorOrbe = esRojo
    ? 'bg-error text-on-error shadow-[0_0_28px_rgba(255,180,171,0.35)]'
    : esAmbar
      ? 'bg-primary-container text-on-primary-container shadow-[0_0_30px_rgba(245,158,11,0.5)]'
      : esCian
        ? 'bg-secondary text-on-secondary shadow-[0_0_30px_rgba(76,215,246,0.45)]'
        : 'bg-surface-container-highest text-on-surface';
  const colorAro = esCian ? 'bg-secondary/50' : esRojo ? 'bg-error/40' : esAmbar ? 'bg-primary-container/50' : 'bg-on-surface/20';

  const chip = error
    ? { texto: 'No se pudo', clase: 'bg-error-container text-on-error-container' }
    : voz.estado === 'pensando'
      ? { texto: 'Procesando', clase: 'bg-primary-container/20 text-primary animate-pulse' }
      : voz.estado === 'hablando'
        ? { texto: 'Respondiendo', clase: 'bg-tertiary/15 text-tertiary' }
        : voz.turno.respuesta
          ? { texto: 'Listo', clase: 'bg-tertiary/15 text-tertiary' }
          : null;

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

  return (
    <section
      data-testid="voice-strip"
      aria-label="Asistente de voz"
      className="w-full px-space-lg pt-space-xs pb-space-md bg-surface-container-low/60 backdrop-blur-md border-b border-surface-container-high/50"
    >
      <div className="flex flex-col lg:flex-row lg:items-center gap-space-md lg:gap-space-xl">
        {/* Lo que se le entiende al usuario: sobre la franja, sin tarjeta propia */}
        <div className="flex items-center gap-space-md lg:basis-5/12 min-w-0">
          <button
            type="button"
            onClick={alOrbe}
            aria-label={apagada ? 'Iniciar la conversación' : voz.estado === 'hablando' ? 'Interrumpir a Lumen' : voz.silenciado ? 'Reactivar el micrófono' : 'Pausar el micrófono'}
            className={`relative w-16 h-16 shrink-0 rounded-full flex items-center justify-center transition-all ${colorOrbe}`}
          >
            <div ref={orbeRef} className={`absolute inset-0 rounded-full pointer-events-none ${colorAro}`} />
            <span className="relative material-symbols-outlined text-[30px]">
              {apagada ? 'mic' : voz.silenciado ? 'mic_off' : voz.estado === 'hablando' ? 'graphic_eq' : voz.estado === 'pensando' ? 'more_horiz' : 'mic'}
            </span>
            {/* Punto de conexion: verde con la conversacion en marcha */}
            {!apagada && !voz.reconectando && (
              <span aria-hidden className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-tertiary ring-2 ring-surface-container-low shadow-[0_0_8px_rgba(86,229,169,0.8)]" />
            )}
          </button>
          <div className="flex-1 min-w-0 flex flex-col gap-space-2xs">
            <div className="flex items-center gap-space-sm">
              <span className="font-label-code text-label-code text-secondary uppercase tracking-wider truncate" data-testid="strip-estado">
                {etiqueta}
              </span>
              <span aria-hidden className="flex items-center gap-[3px] h-4 shrink-0">
                {Array.from({ length: N_BARRAS }, (_, i) => (
                  <span
                    key={i}
                    ref={(el) => {
                      barrasRef.current[i] = el;
                    }}
                    className="w-[3px] h-4 rounded-full bg-primary-container origin-center"
                  />
                ))}
              </span>
            </div>
            <div className="h-12 flex items-center overflow-hidden">
              {voz.turno.transcript ? (
                <p className="font-body-lg text-body-lg text-on-surface italic line-clamp-2" data-testid="strip-transcript">
                  “{voz.turno.transcript}”
                </p>
              ) : (
                <p className="font-body-lg text-body-lg text-on-surface-variant/60 line-clamp-2" data-testid="strip-transcript-vacio">
                  Decime qué querés hacer…
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Lo que contesta el agente: tarjeta hundida en la misma franja */}
        <div className="flex items-start gap-space-md lg:basis-7/12 min-w-0 h-26 rounded-2xl bg-surface-container-lowest/80 border border-surface-container-high/40 shadow-inner px-space-md py-space-sm">
          <div className="w-11 h-11 shrink-0 rounded-xl bg-surface-container-high text-secondary flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">smart_toy</span>
          </div>
          <div className="flex-1 min-w-0 h-full flex flex-col gap-space-2xs">
            <div className="flex items-center gap-space-xs shrink-0">
              <span className="font-label-code text-label-code text-secondary uppercase tracking-wider truncate" data-testid="strip-agente">
                Agente Lumen AI (voz{voz.turno.hora ? ` • ${voz.turno.hora}` : ''})
              </span>
              {chip && <span className={`px-space-xs py-[1px] rounded-md font-label-code text-label-code ${chip.clase}`}>{chip.texto}</span>}
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
              {error ? (
                <p className="font-body-sm text-body-sm text-error line-clamp-3" data-testid="strip-error">
                  {error}
                </p>
              ) : voz.turno.respuesta ? (
                // Tres lineas con "…" si es mas larga (ej. el resumen de pago): el texto completo va en la ventana y en el `title`.
                <p className="font-body-sm text-body-sm text-on-surface line-clamp-3" data-testid="strip-respuesta" title={voz.turno.respuesta}>
                  {voz.turno.respuesta}
                </p>
              ) : (
                <p className="font-body-sm text-body-sm text-on-surface-variant/60" data-testid="strip-respuesta-vacio">
                  Lista para ayudarte: pedime la cartelera, entradas o algo de la dulcería.
                </p>
              )}
            </div>
          </div>
          {/* Escribir en vez de hablar (por si el ambiente es ruidoso): no cambia de modo, solo abre un campo de texto */}
          <button
            type="button"
            onClick={() => setEscribiendo((v) => !v)}
            aria-label="Escribir en vez de hablar"
            aria-pressed={escribiendo}
            className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center transition-colors ${escribiendo ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:bg-surface-variant'}`}
          >
            <span className="material-symbols-outlined text-[20px]">keyboard</span>
          </button>
        </div>
      </div>

      {escribiendo && (
        <form onSubmit={enviar} className="mt-space-sm flex items-center gap-space-xs rounded-full bg-surface-container-lowest/80 border border-surface-container-high/40 px-space-md py-space-xs">
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
    </section>
  );
};

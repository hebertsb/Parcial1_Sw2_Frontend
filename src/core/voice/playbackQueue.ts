/**
 * Cola de reproduccion del audio del agente. Cada frase llega como PCM16 suelto y se agenda justo
 * despues de la anterior (sin cortes entre frases); `vaciar()` corta todo de inmediato (barge-in).
 * Usa Web Audio en vez de un <audio>: permite arrancar apenas llega la primera frase y cortar en el acto.
 */
export class PlaybackQueue {
  private proximoInicio = 0;
  private readonly fuentes = new Set<AudioBufferSourceNode>();
  private readonly salida: GainNode;

  /** Se llama con true cuando empieza a sonar algo y con false cuando la cola se vacia (termino o se corto). */
  onCambio?: (reproduciendo: boolean) => void;

  constructor(private readonly ctx: AudioContext) {
    this.salida = ctx.createGain();
    this.salida.connect(ctx.destination);
  }

  get reproduciendo(): boolean {
    return this.fuentes.size > 0;
  }

  encolar(sampleRate: number, pcm: Int16Array): void {
    if (pcm.length === 0) return;
    const buffer = this.ctx.createBuffer(1, pcm.length, sampleRate);
    const canal = buffer.getChannelData(0);
    for (let i = 0; i < pcm.length; i++) canal[i] = pcm[i] / 32768;

    const fuente = this.ctx.createBufferSource();
    fuente.buffer = buffer;
    fuente.connect(this.salida);

    const estabaVacia = this.fuentes.size === 0;
    // Un pequeno margen para la primera frase (evita un chasquido); las siguientes van pegadas.
    const inicio = Math.max(this.ctx.currentTime + 0.02, this.proximoInicio);
    fuente.start(inicio);
    this.proximoInicio = inicio + buffer.duration;

    this.fuentes.add(fuente);
    fuente.onended = () => {
      this.fuentes.delete(fuente);
      if (this.fuentes.size === 0) {
        this.proximoInicio = 0;
        this.onCambio?.(false);
      }
    };
    if (estabaVacia) this.onCambio?.(true);
  }

  /** Corta lo que suena y descarta lo que estaba agendado. */
  vaciar(): void {
    const habia = this.fuentes.size > 0;
    for (const fuente of this.fuentes) {
      fuente.onended = null;
      try {
        fuente.stop();
      } catch {
        // ya habia terminado
      }
    }
    this.fuentes.clear();
    this.proximoInicio = 0;
    if (habia) this.onCambio?.(false);
  }
}

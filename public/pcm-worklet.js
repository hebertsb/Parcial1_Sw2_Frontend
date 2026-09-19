// Captura de microfono para la conversacion continua (core/voice/useVoiceSession.ts).
//
// Corre en el hilo de audio del navegador. Recibe el audio a la frecuencia nativa del dispositivo
// (44.1 / 48 kHz) y lo entrega como PCM16 mono a 16 kHz en paquetes de 512 muestras (32 ms), que es
// lo que espera el VAD del servidor (Silero). Remuestrea promediando (filtro de caja): alcanza para
// voz y funciona con cualquier relacion, incluso no entera (44100 -> 16000).
//
// Mensajes hacia el hilo principal: { pcm: ArrayBuffer, nivel: number }   (nivel = RMS 0..1)
// Mensajes desde el hilo principal:  { type: 'pausa', valor: boolean }
//   En pausa (microfono silenciado) se siguen mandando paquetes, pero de silencio: asi el servidor
//   sigue recibiendo reloj y cierra bien una frase que haya quedado a medias.

class CapturaPcm extends AudioWorkletProcessor {
  constructor(options) {
    super();
    const opciones = (options && options.processorOptions) || {};
    this.destino = opciones.targetRate || 16000;
    this.tamano = opciones.frameSize || 512;
    this.relacion = sampleRate / this.destino;   // `sampleRate` es global en AudioWorkletGlobalScope
    this.acumulado = 0;
    this.cuenta = 0;
    this.fase = 0;
    this.paquete = new Int16Array(this.tamano);
    this.n = 0;
    this.suma2 = 0;
    this.enPausa = false;
    this.port.onmessage = (evento) => {
      if (evento.data && evento.data.type === 'pausa') this.enPausa = !!evento.data.valor;
    };
  }

  process(entradas) {
    const canal = entradas[0] && entradas[0][0];
    if (!canal) return true;

    for (let i = 0; i < canal.length; i++) {
      this.acumulado += canal[i];
      this.cuenta += 1;
      this.fase += 1;
      if (this.fase >= this.relacion) {
        this.fase -= this.relacion;
        let muestra = this.enPausa ? 0 : this.acumulado / this.cuenta;
        this.acumulado = 0;
        this.cuenta = 0;
        if (muestra > 1) muestra = 1;
        else if (muestra < -1) muestra = -1;
        this.paquete[this.n++] = muestra < 0 ? muestra * 32768 : muestra * 32767;
        this.suma2 += muestra * muestra;
        if (this.n === this.tamano) {
          const nivel = Math.sqrt(this.suma2 / this.tamano);
          this.port.postMessage({ pcm: this.paquete.buffer, nivel }, [this.paquete.buffer]);
          this.paquete = new Int16Array(this.tamano);
          this.n = 0;
          this.suma2 = 0;
        }
      }
    }
    return true;
  }
}

registerProcessor('captura-pcm', CapturaPcm);

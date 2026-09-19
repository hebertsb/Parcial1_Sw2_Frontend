/**
 * Hora del sistema (la del equipo donde corre el kiosco), en 24 h y con la convencion de Bolivia:
 * "20:45" o, con `conSegundos`, "20:45:12". Nunca un valor fijo: todo lo que muestra una hora en la app sale de aca.
 */
export function formatearHora(fecha: Date, conSegundos = false): string {
  return fecha.toLocaleTimeString('es-BO', {
    hour: '2-digit',
    minute: '2-digit',
    ...(conSegundos ? { second: '2-digit' as const } : {}),
    hourCycle: 'h23',
  });
}

/** "2,1 s": duracion en segundos con un decimal y coma (para latencias de respuesta). */
export function formatearSegundos(ms: number): string {
  return `${(ms / 1000).toFixed(1).replace('.', ',')} s`;
}

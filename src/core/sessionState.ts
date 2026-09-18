/**
 * Persistencia chica en `sessionStorage` para que un F5 no tire al usuario a otra
 * pantalla — antes la pestaña activa del admin (`AdminConsole`/`AdminCartelera`/
 * `AdminPreciosPromos`/`AdminDulceria`) y el progreso de compra del cliente
 * (`CineContext`) vivían solo en memoria (`useState`/`useReducer`), así que un
 * refresh los reiniciaba a su valor por defecto. `sessionStorage` (no
 * `localStorage`): se pierde al cerrar la pestaña/navegador, que es lo esperable
 * para "dónde estabas parado", no algo que deba sobrevivir para siempre.
 */

export function leerEstadoSesion<T>(key: string, valorPorDefecto: T): T {
  try {
    const guardado = sessionStorage.getItem(key);
    return guardado ? (JSON.parse(guardado) as T) : valorPorDefecto;
  } catch {
    return valorPorDefecto;
  }
}

export function guardarEstadoSesion<T>(key: string, valor: T): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(valor));
  } catch {
    // sessionStorage puede fallar en modo incógnito estricto o con la cuota llena — no debe romper la app.
  }
}

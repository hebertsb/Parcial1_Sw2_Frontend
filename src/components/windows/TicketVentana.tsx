interface Elemento {
  nombre: string;
  cantidad: number;
}

export interface DatosTicketVoz {
  venta?: { idVenta?: number; total?: string | number; estado?: string } | null;
  pelicula?: string | null;
  funcion?: { fecha?: string; horaInicio?: string } | null;
  sala?: string | null;
  asientos?: string[];
  dulceria?: Elemento[];
}

const fechaLegible = (fecha?: string) =>
  fecha ? new Date(`${fecha}T00:00:00`).toLocaleDateString('es-BO', { weekday: 'short', day: 'numeric', month: 'short' }) : '—';

/** Franjas del "codigo de barras": decorativas pero determinadas por el numero de venta (la misma venta siempre se ve igual). */
const franjas = (semilla: number) => {
  const anchos: number[] = [];
  let n = semilla * 2654435761;
  for (let i = 0; i < 38; i++) {
    n = (n * 1103515245 + 12345) & 0x7fffffff;
    anchos.push(1 + (n % 3));
  }
  return anchos;
};

/**
 * La entrada digital (RF04/RF18): aparece cuando la venta y el pago ya se registraron de verdad. Muestra solo lo que
 * devolvio el backend (numero de venta, total) y lo que el usuario eligio.
 */
export const TicketVentana = ({ datos }: { datos: DatosTicketVoz }) => {
  const idVenta = datos.venta?.idVenta;
  const total = datos.venta?.total !== undefined ? Number(datos.venta.total) : null;
  const asientos = datos.asientos ?? [];
  const dulceria = datos.dulceria ?? [];

  return (
    <div className="flex flex-col gap-space-md">
      <div className="rounded-xl bg-gradient-to-br from-primary-container/25 via-surface-container-high to-secondary-container/20 p-space-md">
        <span className="font-label-code text-label-code text-secondary uppercase tracking-widest">Lumen Cinema · {datos.sala ?? 'Sala por confirmar'}</span>
        <h3 className="font-headline-md text-headline-md text-primary tracking-tight leading-tight mt-space-2xs">{datos.pelicula ?? 'Entrada'}</h3>
        <div className="mt-space-sm grid grid-cols-2 gap-space-sm">
          <div className="flex flex-col">
            <span className="font-label-code text-label-code text-on-surface-variant uppercase">Fecha</span>
            <span className="font-body-md text-body-md text-on-surface font-bold">{fechaLegible(datos.funcion?.fecha)}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="font-label-code text-label-code text-on-surface-variant uppercase">Hora</span>
            <span className="font-body-md text-body-md text-on-surface font-bold">{datos.funcion?.horaInicio?.slice(0, 5) ?? '—'}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-space-2xs">
        <span className="font-label-code text-label-code text-on-surface-variant uppercase">Asientos</span>
        <div className="flex flex-wrap gap-space-xs">
          {asientos.map((asiento) => (
            <span key={asiento} className="px-space-sm py-space-2xs rounded-lg bg-primary-container text-on-primary-container font-label-lg text-label-lg font-bold">
              {asiento}
            </span>
          ))}
        </div>
      </div>

      {dulceria.length > 0 && (
        <div className="flex flex-col gap-space-2xs">
          <span className="font-label-code text-label-code text-on-surface-variant uppercase">Dulcería</span>
          <span className="font-body-md text-body-md text-on-surface">{dulceria.map((d) => `${d.cantidad} × ${d.nombre}`).join(' · ')}</span>
        </div>
      )}

      <div className="flex items-end justify-between border-t border-dashed border-outline-variant pt-space-sm">
        <div className="flex flex-col">
          <span className="font-label-code text-label-code text-on-surface-variant uppercase">Compra</span>
          <span className="font-headline-sm text-headline-sm text-tertiary font-bold">#{idVenta ?? '—'}</span>
        </div>
        {total !== null && total > 0 && (
          <div className="flex flex-col items-end">
            <span className="font-label-code text-label-code text-on-surface-variant uppercase">Total</span>
            <span className="font-headline-sm text-headline-sm text-primary font-bold">{total.toFixed(2)} Bs</span>
          </div>
        )}
      </div>

      {idVenta !== undefined && (
        <div aria-hidden className="flex items-stretch justify-center gap-[2px] h-10 opacity-80">
          {franjas(idVenta).map((ancho, i) => (
            <span key={i} className="bg-on-surface" style={{ width: ancho }} />
          ))}
        </div>
      )}
    </div>
  );
};

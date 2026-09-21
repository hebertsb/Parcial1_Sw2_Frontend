import { useEffect, useRef, useState } from 'react';

interface CalendarioDiaProps {
  /** Fechas reales (`YYYY-MM-DD`) que tienen al menos una función programada. */
  diasDisponibles: string[];
  /** `null` = sin filtrar, muestra todos los días. */
  diaSeleccionado: string | null;
  onSeleccionarDia: (dia: string | null) => void;
}

const DIAS_SEMANA = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];

const pad = (n: number) => String(n).padStart(2, '0');
const aISO = (fecha: Date) => `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}`;
/** `Date(local 00:00)` a partir de `YYYY-MM-DD` — mismo patrón que Cartelera.tsx, evita el corrimiento de huso horario de `new Date('YYYY-MM-DD')`. */
const desdeISO = (iso: string) => new Date(`${iso}T00:00:00`);
/** Lunes = 0 ... Domingo = 6 (`Date.getDay()` nativo empieza en domingo = 0). */
const diaSemanaLunesInicio = (fecha: Date) => (fecha.getDay() + 6) % 7;

export const CalendarioDia = ({ diasDisponibles, diaSeleccionado, onSeleccionarDia }: CalendarioDiaProps) => {
  const [abierto, setAbierto] = useState(false);
  const [mesVisible, setMesVisible] = useState(() =>
    desdeISO(diaSeleccionado ?? diasDisponibles[0] ?? aISO(new Date())),
  );
  const contenedorRef = useRef<HTMLDivElement | null>(null);
  const disponiblesSet = new Set(diasDisponibles);

  useEffect(() => {
    if (!abierto) return;
    const alHacerClickFuera = (e: MouseEvent) => {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    };
    document.addEventListener('mousedown', alHacerClickFuera);
    return () => document.removeEventListener('mousedown', alHacerClickFuera);
  }, [abierto]);

  const primerDiaMes = new Date(mesVisible.getFullYear(), mesVisible.getMonth(), 1);
  const diasEnMes = new Date(mesVisible.getFullYear(), mesVisible.getMonth() + 1, 0).getDate();
  const offsetInicial = diaSemanaLunesInicio(primerDiaMes);
  const celdas: (Date | null)[] = [
    ...Array.from({ length: offsetInicial }, () => null),
    ...Array.from({ length: diasEnMes }, (_, i) => new Date(mesVisible.getFullYear(), mesVisible.getMonth(), i + 1)),
  ];

  const etiquetaBoton = diaSeleccionado
    ? desdeISO(diaSeleccionado).toLocaleDateString('es-BO', { weekday: 'short', day: 'numeric', month: 'short' })
    : 'Todos los días';

  return (
    <div ref={contenedorRef} className="relative">
      <button
        onClick={() => setAbierto((v) => !v)}
        className={`flex items-center gap-space-2xs px-space-md py-space-xs rounded-full font-label-lg text-label-lg transition-all whitespace-nowrap ${diaSeleccionado ? 'bg-primary text-on-primary font-bold shadow-md shadow-primary/20' : 'bg-surface-container-high hover:bg-surface-bright text-on-surface'}`}
      >
        <span className="material-symbols-outlined text-[18px]">calendar_month</span>
        <span className="capitalize">{etiquetaBoton}</span>
        <span className="material-symbols-outlined text-[18px]">{abierto ? 'expand_less' : 'expand_more'}</span>
      </button>

      {abierto && (
        <div className="absolute z-20 mt-space-xs left-0 w-72 bg-surface-container-highest rounded-2xl shadow-2xl p-space-md">
          <button
            onClick={() => {
              onSeleccionarDia(null);
              setAbierto(false);
            }}
            className={`w-full mb-space-sm px-space-sm py-space-2xs rounded-lg font-label-md text-label-md transition-colors ${diaSeleccionado === null ? 'bg-primary text-on-primary font-bold' : 'bg-surface-container-high hover:bg-surface-bright text-on-surface'}`}
          >
            Todos los días
          </button>

          <div className="flex items-center justify-between mb-space-sm">
            <button
              onClick={() => setMesVisible(new Date(mesVisible.getFullYear(), mesVisible.getMonth() - 1, 1))}
              className="p-1 rounded-full hover:bg-surface-bright text-on-surface-variant"
              aria-label="Mes anterior"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <span className="font-label-lg text-label-lg text-on-surface capitalize">
              {mesVisible.toLocaleDateString('es-BO', { month: 'long', year: 'numeric' })}
            </span>
            <button
              onClick={() => setMesVisible(new Date(mesVisible.getFullYear(), mesVisible.getMonth() + 1, 1))}
              className="p-1 rounded-full hover:bg-surface-bright text-on-surface-variant"
              aria-label="Mes siguiente"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {DIAS_SEMANA.map((d) => (
              <span key={d} className="text-center font-label-code text-label-code text-on-surface-variant">
                {d}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {celdas.map((fecha, i) => {
              if (!fecha) return <span key={`vacio-${i}`} />;
              const iso = aISO(fecha);
              const disponible = disponiblesSet.has(iso);
              const seleccionado = iso === diaSeleccionado;
              return (
                <button
                  key={iso}
                  disabled={!disponible}
                  onClick={() => {
                    onSeleccionarDia(iso);
                    setAbierto(false);
                  }}
                  className={`aspect-square rounded-lg font-label-md text-label-md transition-colors ${
                    seleccionado
                      ? 'bg-primary text-on-primary font-bold'
                      : disponible
                        ? 'bg-surface-container-high hover:bg-surface-bright text-on-surface cursor-pointer'
                        : 'text-on-surface-variant/30 cursor-not-allowed'
                  }`}
                >
                  {fecha.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

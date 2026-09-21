import type { FranjaHoraria } from '../../views/Cartelera';
import { CalendarioDia } from './CalendarioDia';

interface CarteleraFiltrosProps {
  /** Fechas reales (`YYYY-MM-DD`) que tienen al menos una función programada, ordenadas. */
  diasDisponibles: string[];
  /** `null` = sin filtrar, muestra todos los días. */
  diaSeleccionado: string | null;
  onSeleccionarDia: (dia: string | null) => void;
  /** Tipos reales de `salas.tipo` (2D, VIP, IMAX, ...) con funciones futuras, y cuántas tiene cada uno. */
  tiposSala: { tipo: string; cantidad: number }[];
  /** `null` = sin filtrar, muestra todos los tipos de sala. */
  tipoSalaSeleccionado: string | null;
  onSeleccionarTipoSala: (tipo: string | null) => void;
  /** `null` = sin filtrar por franja horaria. */
  franjaSeleccionada: FranjaHoraria | null;
  onSeleccionarFranja: (franja: FranjaHoraria | null) => void;
  textoBusqueda: string;
  onCambiarTextoBusqueda: (texto: string) => void;
}

const FRANJAS: { valor: FranjaHoraria; etiqueta: string; icono: string; rango: string }[] = [
  { valor: 'mañana', etiqueta: 'Mañana', icono: 'wb_twilight', rango: 'antes de 15:00' },
  { valor: 'tarde', etiqueta: 'Tarde', icono: 'wb_sunny', rango: '15:00 – 19:00' },
  { valor: 'noche', etiqueta: 'Noche', icono: 'bedtime', rango: 'después de 19:00' },
];

/** `salas.tipo` es texto libre que pone el admin — se mapea por palabra clave, con un ícono genérico de respaldo. */
const iconoParaTipoSala = (tipo: string): string => {
  const t = tipo.toLowerCase();
  if (t.includes('vip') || t.includes('premium')) return 'workspace_premium';
  if (t.includes('imax')) return 'panorama_wide_angle';
  if (t.includes('4dx') || t.includes('dinam') || t.includes('dynam')) return 'bolt';
  if (t.includes('3d')) return '3d_rotation';
  if (t.includes('2d')) return 'theaters';
  return 'chair';
};

const chip = (activo: boolean) =>
  `flex items-center gap-space-2xs px-space-md py-space-xs rounded-full font-label-lg text-label-lg transition-all whitespace-nowrap ${activo ? 'bg-primary text-on-primary font-bold shadow-md shadow-primary/20' : 'bg-surface-container-high hover:bg-surface-bright text-on-surface'}`;

export const CarteleraFiltros = ({
  diasDisponibles,
  diaSeleccionado,
  onSeleccionarDia,
  tiposSala,
  tipoSalaSeleccionado,
  onSeleccionarTipoSala,
  franjaSeleccionada,
  onSeleccionarFranja,
  textoBusqueda,
  onCambiarTextoBusqueda,
}: CarteleraFiltrosProps) => (
  <div className="w-full px-space-lg py-space-sm">
    <div className="w-full bg-surface-container p-space-md rounded-2xl shadow-xl flex flex-col gap-space-sm">
      {/* Día (calendario) + búsqueda */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-xs">
          <span className="font-label-code text-label-code text-on-surface-variant uppercase px-2">Día:</span>
          <CalendarioDia
            diasDisponibles={diasDisponibles}
            diaSeleccionado={diaSeleccionado}
            onSeleccionarDia={onSeleccionarDia}
          />
        </div>

        <div className="relative flex-1 lg:w-64">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-[20px]">search</span>
          <input
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant font-body-sm text-body-sm outline-none shadow-inner"
            placeholder="Buscar título o género..."
            type="text"
            value={textoBusqueda}
            onChange={(e) => onCambiarTextoBusqueda(e.target.value)}
          />
        </div>
      </div>

      <div className="h-px bg-surface-container-highest" />

      {/* Sala: chips compactos con ícono, conteo en tooltip */}
      <div className="flex items-center gap-space-xs overflow-x-auto pb-1">
        <span className="font-label-code text-label-code text-on-surface-variant uppercase px-2">Sala:</span>
        <button onClick={() => onSeleccionarTipoSala(null)} className={chip(tipoSalaSeleccionado === null)}>
          Todas
        </button>
        {tiposSala.length === 0 ? (
          <span className="font-body-sm text-body-sm text-on-surface-variant px-2">Sin tipos de sala registrados</span>
        ) : (
          tiposSala.map(({ tipo, cantidad }) => (
            <button
              key={tipo}
              onClick={() => onSeleccionarTipoSala(tipo)}
              title={`${cantidad} ${cantidad === 1 ? 'función' : 'funciones'}`}
              className={chip(tipoSalaSeleccionado === tipo)}
            >
              <span className="material-symbols-outlined text-[18px]">{iconoParaTipoSala(tipo)}</span>
              {tipo}
            </button>
          ))
        )}
      </div>

      {/* Horario: franjas del día con ícono de sol/luna */}
      <div className="flex items-center gap-space-xs overflow-x-auto pb-1">
        <span className="font-label-code text-label-code text-on-surface-variant uppercase px-2">Horario:</span>
        <button onClick={() => onSeleccionarFranja(null)} className={chip(franjaSeleccionada === null)}>
          <span className="material-symbols-outlined text-[18px]">schedule</span>
          Todos
        </button>
        {FRANJAS.map(({ valor, etiqueta, icono, rango }) => (
          <button
            key={valor}
            onClick={() => onSeleccionarFranja(valor)}
            title={rango}
            className={chip(franjaSeleccionada === valor)}
          >
            <span className="material-symbols-outlined text-[18px]">{icono}</span>
            {etiqueta}
          </button>
        ))}
      </div>
    </div>
  </div>
);

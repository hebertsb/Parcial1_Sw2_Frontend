import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

/**
 * Estado de interfaz que el agente de voz puede mover y que las pantallas leen: que pestaña del admin abrir,
 * cuándo recargar una pestaña y qué filtro aplicar en la cartelera. Vive arriba de las rutas para que sobreviva
 * a la navegación (las pantallas se montan y desmontan; esto no). Cada pedido lleva un contador `n`: pedir dos veces
 * lo mismo (ej. recargar la misma pestaña) cambia el valor y dispara el efecto de la pantalla igual.
 */

export interface FiltroCartelera {
  busqueda: string | null;
  dia: string | null;
  n: number;
}

/** Lo que el agente esta señalando en la cartelera: la(s) pelicula(s) y, si ya se eligio, el horario. */
export interface ResaltadoCartelera {
  ids: number[];
  idFuncion: number | null;
  n: number;
}

/** Cosas de la consola de administrador que el agente puede señalar: la fila que acaba de crear o cambiar. */
export type EntidadAdmin = 'pelicula' | 'funcion' | 'promocion' | 'precio';

export interface ResaltadoAdmin {
  entidad: EntidadAdmin;
  id: number;
  n: number;
}

/** Cuanto se queda resaltado (ms): lo justo para verlo mientras el agente habla y despues se apaga solo. */
const DURACION_RESALTADO_MS = 12000;

interface UiControl {
  solicitudAdminTab: { tab: string; n: number } | null;
  pedirAdminTab: (tab: string) => void;
  refrescos: Record<string, number>;
  refrescar: (tab: string) => void;
  filtroCartelera: FiltroCartelera | null;
  filtrarCartelera: (filtro: { busqueda?: string | null; dia?: string | null }) => void;
  resaltado: ResaltadoCartelera | null;
  resaltarCartelera: (ids: number[], idFuncion?: number | null) => void;
  resaltadoAdmin: ResaltadoAdmin | null;
  resaltarAdmin: (entidad: EntidadAdmin, id: number) => void;
}

const UiControlContext = createContext<UiControl | undefined>(undefined);

export const UiControlProvider = ({ children }: { children: ReactNode }) => {
  const [solicitudAdminTab, setSolicitudAdminTab] = useState<UiControl['solicitudAdminTab']>(null);
  const [refrescos, setRefrescos] = useState<Record<string, number>>({});
  const [filtroCartelera, setFiltroCartelera] = useState<FiltroCartelera | null>(null);
  const [resaltado, setResaltado] = useState<ResaltadoCartelera | null>(null);
  const [resaltadoAdmin, setResaltadoAdmin] = useState<ResaltadoAdmin | null>(null);
  const temporizadorRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const temporizadorAdminRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pedirAdminTab = useCallback((tab: string) => setSolicitudAdminTab((prev) => ({ tab, n: (prev?.n ?? 0) + 1 })), []);
  const refrescar = useCallback((tab: string) => setRefrescos((prev) => ({ ...prev, [tab]: (prev[tab] ?? 0) + 1 })), []);
  const filtrarCartelera = useCallback(
    (filtro: { busqueda?: string | null; dia?: string | null }) =>
      setFiltroCartelera((prev) => ({ busqueda: filtro.busqueda?.trim() || null, dia: filtro.dia ?? null, n: (prev?.n ?? 0) + 1 })),
    [],
  );

  const resaltarCartelera = useCallback((ids: number[], idFuncion: number | null = null) => {
    setResaltado((prev) => ({ ids, idFuncion, n: (prev?.n ?? 0) + 1 }));
    if (temporizadorRef.current) clearTimeout(temporizadorRef.current);
    temporizadorRef.current = setTimeout(() => setResaltado(null), DURACION_RESALTADO_MS);
  }, []);
  const resaltarAdmin = useCallback((entidad: EntidadAdmin, id: number) => {
    setResaltadoAdmin((prev) => ({ entidad, id, n: (prev?.n ?? 0) + 1 }));
    if (temporizadorAdminRef.current) clearTimeout(temporizadorAdminRef.current);
    temporizadorAdminRef.current = setTimeout(() => setResaltadoAdmin(null), DURACION_RESALTADO_MS);
  }, []);
  useEffect(
    () => () => {
      if (temporizadorRef.current) clearTimeout(temporizadorRef.current);
      if (temporizadorAdminRef.current) clearTimeout(temporizadorAdminRef.current);
    },
    [],
  );

  const value = useMemo(
    () => ({ solicitudAdminTab, pedirAdminTab, refrescos, refrescar, filtroCartelera, filtrarCartelera, resaltado, resaltarCartelera, resaltadoAdmin, resaltarAdmin }),
    [solicitudAdminTab, pedirAdminTab, refrescos, refrescar, filtroCartelera, filtrarCartelera, resaltado, resaltarCartelera, resaltadoAdmin, resaltarAdmin],
  );
  return <UiControlContext.Provider value={value}>{children}</UiControlContext.Provider>;
};

export const useUiControl = (): UiControl => {
  const contexto = useContext(UiControlContext);
  if (!contexto) throw new Error('useUiControl debe usarse dentro de un UiControlProvider');
  return contexto;
};

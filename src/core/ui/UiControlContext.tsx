import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

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

interface UiControl {
  solicitudAdminTab: { tab: string; n: number } | null;
  pedirAdminTab: (tab: string) => void;
  refrescos: Record<string, number>;
  refrescar: (tab: string) => void;
  filtroCartelera: FiltroCartelera | null;
  filtrarCartelera: (filtro: { busqueda?: string | null; dia?: string | null }) => void;
}

const UiControlContext = createContext<UiControl | undefined>(undefined);

export const UiControlProvider = ({ children }: { children: ReactNode }) => {
  const [solicitudAdminTab, setSolicitudAdminTab] = useState<UiControl['solicitudAdminTab']>(null);
  const [refrescos, setRefrescos] = useState<Record<string, number>>({});
  const [filtroCartelera, setFiltroCartelera] = useState<FiltroCartelera | null>(null);

  const pedirAdminTab = useCallback((tab: string) => setSolicitudAdminTab((prev) => ({ tab, n: (prev?.n ?? 0) + 1 })), []);
  const refrescar = useCallback((tab: string) => setRefrescos((prev) => ({ ...prev, [tab]: (prev[tab] ?? 0) + 1 })), []);
  const filtrarCartelera = useCallback(
    (filtro: { busqueda?: string | null; dia?: string | null }) =>
      setFiltroCartelera((prev) => ({ busqueda: filtro.busqueda?.trim() || null, dia: filtro.dia ?? null, n: (prev?.n ?? 0) + 1 })),
    [],
  );

  const value = useMemo(
    () => ({ solicitudAdminTab, pedirAdminTab, refrescos, refrescar, filtroCartelera, filtrarCartelera }),
    [solicitudAdminTab, pedirAdminTab, refrescos, refrescar, filtroCartelera, filtrarCartelera],
  );
  return <UiControlContext.Provider value={value}>{children}</UiControlContext.Provider>;
};

export const useUiControl = (): UiControl => {
  const contexto = useContext(UiControlContext);
  if (!contexto) throw new Error('useUiControl debe usarse dentro de un UiControlProvider');
  return contexto;
};

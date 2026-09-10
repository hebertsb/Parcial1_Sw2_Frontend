import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../controllers/AuthContext';
import { useCine } from '../controllers/CineContext';
import { AdminReportes } from './admin/AdminReportes';
import { AdminAuditoria } from './admin/AdminAuditoria';
import { AdminCartelera } from './admin/AdminCartelera';
import { AdminSalas } from './admin/AdminSalas';

type AdminTab = 'cartelera' | 'reportes' | 'auditoria' | 'promos' | 'salas';

const NAV_ITEMS: { tab: AdminTab; icon: string; label: string }[] = [
  { tab: 'cartelera', icon: 'movie', label: 'Cartelera & Funciones' },
  { tab: 'reportes', icon: 'analytics', label: 'Reportes & Ventas' },
  { tab: 'auditoria', icon: 'security_update_good', label: 'Auditoría & Logs' },
  { tab: 'promos', icon: 'sell', label: 'Precios & Promos' },
  { tab: 'salas', icon: 'weekend', label: 'Configuración Salas' },
];

/**
 * Shell del panel admin: sidebar + topbar + switch de tab. `cartelera` (películas +
 * funciones), `reportes`, `auditoria` y `salas` ya están conectados a datos reales
 * (`GET/POST/PATCH/DELETE /peliculas`, `/funciones`, `/salas`, `GET /reportes/*`,
 * `GET /audit/log-acciones`); `promos` (CRUD de precios/promociones) queda pendiente,
 * próximo módulo de la Fase 3.
 */
export const AdminConsole = () => {
  const navigate = useNavigate();
  const { dispatch } = useCine();
  const { usuario, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('reportes');

  const onBack = () => {
    dispatch({ type: 'RESETEAR_COMPRA' });
    navigate('/');
  };
  const cerrarSesion = () => {
    logout();
    onBack();
  };

  return (
    <div className="bg-background font-body-md text-body-md text-on-background min-h-screen flex selection:bg-primary-container selection:text-on-primary-container">
      <aside className="fixed left-0 top-0 h-full w-72 bg-surface-container-low z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col">
          <div className="h-20 px-space-lg flex items-center gap-space-sm bg-surface-container-lowest">
            <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container shadow-[0_0_24px_-4px_rgba(245,158,11,0.35)]">
              <span className="material-symbols-outlined">theater_comedy</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm tracking-tight text-primary leading-none">LUMEN</span>
              <span className="font-label-code text-label-code uppercase tracking-wider text-secondary mt-space-2xs">Admin Console</span>
            </div>
          </div>
          <div className="px-space-md mt-space-xs">
            <span className="px-space-sm font-label-code text-label-code uppercase text-outline">Módulos de Control</span>
            <nav className="mt-space-xs flex flex-col gap-space-2xs">
              {NAV_ITEMS.map(({ tab, icon, label }) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-space-sm px-space-sm py-space-xs rounded-lg transition-colors w-full text-left ${activeTab === tab ? 'bg-primary-container text-on-primary-container font-headline-sm' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'}`}
                >
                  <span className="material-symbols-outlined">{icon}</span>
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>
        <div className="p-space-md flex flex-col gap-space-sm bg-surface-container-lowest">
          <button onClick={onBack} className="w-full flex items-center justify-center gap-space-xs py-space-xs px-space-sm rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-variant transition-colors font-label-md text-label-md">
            <span className="material-symbols-outlined text-[18px]">terminal</span>Volver a Modo Kiosco
          </button>
        </div>
      </aside>

      <div className="pl-72 flex-grow flex flex-col min-h-screen w-full">
        <header className="fixed top-0 left-72 right-0 h-20 bg-surface/85 backdrop-blur-xl z-40 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="w-full h-20 px-space-xl flex items-center justify-between">
            <nav className="hidden xl:flex items-center gap-space-xs p-space-2xs rounded-lg bg-surface-container-low">
              {NAV_ITEMS.map(({ tab, label }) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-space-sm py-space-2xs rounded font-label-lg text-label-lg transition-colors ${activeTab === tab ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'}`}
                >
                  {label}
                </button>
              ))}
            </nav>
            <div className="flex items-center gap-space-sm pl-space-sm">
              <div className="flex flex-col text-right hidden sm:flex">
                <span className="font-label-lg text-label-lg text-on-surface font-bold">{usuario?.nombre ?? 'Admin'}</span>
                <span className="font-label-code text-label-code text-outline uppercase">
                  {usuario?.rol === 'administrador' ? 'Administrador' : (usuario?.rol ?? '—')}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
              </div>
              <button onClick={cerrarSesion} className="w-9 h-9 rounded-lg flex items-center justify-center bg-surface-container-high text-on-surface-variant hover:bg-error-container hover:text-on-error-container transition-colors" title="Cerrar Sesión">
                <span className="material-symbols-outlined text-[20px]">logout</span>
              </button>
            </div>
          </div>
        </header>

        <main className="w-full pt-20 bg-background flex-grow">
          {activeTab === 'cartelera' && <AdminCartelera />}
          {activeTab === 'reportes' && <AdminReportes />}
          {activeTab === 'auditoria' && <AdminAuditoria />}
          {activeTab === 'salas' && <AdminSalas />}
          {activeTab === 'promos' && (
            <div className="w-full h-full flex items-center justify-center p-space-xl">
              <div className="flex flex-col items-center justify-center gap-space-md opacity-50">
                <span className="material-symbols-outlined text-[64px]">engineering</span>
                <span className="font-headline-md text-headline-md text-on-surface-variant">Módulo en Desarrollo</span>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

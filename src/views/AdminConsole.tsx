import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCine } from '../controllers/CineContext';

export const AdminConsole = () => {
  const navigate = useNavigate();
  const { dispatch } = useCine();
  const onBack = () => {
    dispatch({ type: 'RESETEAR_COMPRA' });
    navigate('/');
  };
  const [activeTab, setActiveTab] = useState<'cartelera' | 'telemetria' | 'logs' | 'promos' | 'salas'>('cartelera');

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
          <div className="px-space-md py-space-sm">
            <div className="px-space-sm py-space-xs rounded-lg bg-surface-container flex items-center gap-space-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary"></span>
              </span>
              <span className="font-label-code text-label-code text-on-surface-variant truncate uppercase">Edge Active • PG Node</span>
            </div>
          </div>
          <div className="px-space-md mt-space-xs">
            <span className="px-space-sm font-label-code text-label-code uppercase text-outline">Módulos de Control</span>
            <nav className="mt-space-xs flex flex-col gap-space-2xs">
              <button onClick={() => setActiveTab('cartelera')} className={`flex items-center gap-space-sm px-space-sm py-space-xs rounded-lg transition-colors w-full text-left ${activeTab === 'cartelera' ? 'bg-primary-container text-on-primary-container font-headline-sm' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'}`}>
                <span className="material-symbols-outlined">movie</span>Cartelera & Funciones
              </button>
              <button onClick={() => setActiveTab('telemetria')} className={`flex items-center gap-space-sm px-space-sm py-space-xs rounded-lg transition-colors w-full text-left ${activeTab === 'telemetria' ? 'bg-primary-container text-on-primary-container font-headline-sm' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'}`}>
                <span className="material-symbols-outlined">analytics</span>Reportes & Ventas
              </button>
              <button onClick={() => setActiveTab('logs')} className={`flex items-center gap-space-sm px-space-sm py-space-xs rounded-lg transition-colors w-full text-left ${activeTab === 'logs' ? 'bg-primary-container text-on-primary-container font-headline-sm' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'}`}>
                <span className="material-symbols-outlined">security_update_good</span>Auditoría & Logs
              </button>
              <button onClick={() => setActiveTab('promos')} className={`flex items-center gap-space-sm px-space-sm py-space-xs rounded-lg transition-colors w-full text-left ${activeTab === 'promos' ? 'bg-primary-container text-on-primary-container font-headline-sm' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'}`}>
                <span className="material-symbols-outlined">sell</span>Precios & Promos
              </button>
              <button onClick={() => setActiveTab('salas')} className={`flex items-center gap-space-sm px-space-sm py-space-xs rounded-lg transition-colors w-full text-left ${activeTab === 'salas' ? 'bg-primary-container text-on-primary-container font-headline-sm' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'}`}>
                <span className="material-symbols-outlined">weekend</span>Configuración Salas
              </button>
            </nav>
          </div>
        </div>
        <div className="p-space-md flex flex-col gap-space-sm bg-surface-container-lowest">
          <div className="p-space-sm rounded-xl bg-surface-container flex flex-col gap-space-2xs">
            <div className="flex items-center justify-between">
              <span className="font-label-code text-label-code uppercase text-secondary">Voz Neural RF07</span>
              <span className="material-symbols-outlined text-secondary text-[16px]">graphic_eq</span>
            </div>
            <p className="font-label-md text-label-md text-on-surface-variant leading-tight">Procesando comandos de voz operativo en tiempo real</p>
          </div>
          <button onClick={onBack} className="w-full flex items-center justify-center gap-space-xs py-space-xs px-space-sm rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-variant transition-colors font-label-md text-label-md">
            <span className="material-symbols-outlined text-[18px]">terminal</span>Volver a Modo Kiosco
          </button>
        </div>
      </aside>

      <div className="pl-72 flex-grow flex flex-col min-h-screen w-full">
        <header className="fixed top-0 left-72 right-0 h-20 bg-surface/85 backdrop-blur-xl z-40 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="w-full h-20 px-space-xl flex items-center justify-between">
            <div className="flex items-center gap-space-lg">
              <nav className="hidden xl:flex items-center gap-space-xs p-space-2xs rounded-lg bg-surface-container-low">
                <button onClick={() => setActiveTab('cartelera')} className={`px-space-sm py-space-2xs rounded font-label-lg text-label-lg transition-colors ${activeTab === 'cartelera' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'}`}>Cartelera & Funciones</button>
                <button onClick={() => setActiveTab('telemetria')} className={`px-space-sm py-space-2xs rounded font-label-lg text-label-lg transition-colors ${activeTab === 'telemetria' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'}`}>Reportes & Ventas</button>
                <button onClick={() => setActiveTab('logs')} className={`px-space-sm py-space-2xs rounded font-label-lg text-label-lg transition-colors ${activeTab === 'logs' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'}`}>Auditoría & Logs</button>
                <button onClick={() => setActiveTab('promos')} className={`px-space-sm py-space-2xs rounded font-label-lg text-label-lg transition-colors ${activeTab === 'promos' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'}`}>Precios & Promos</button>
              </nav>
            </div>
            <div className="flex items-center gap-space-md">
              <div className="relative flex items-center">
                <button className="flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container-high text-secondary hover:bg-surface-variant transition-colors shadow-[0_0_32px_0px_rgba(6,182,212,0.45)]" type="button">
                  <span className="material-symbols-outlined text-[20px] animate-pulse text-secondary">mic</span>
                  <span className="font-label-md text-label-md uppercase tracking-wider">Escucha Activa</span>
                </button>
              </div>
              <div className="flex items-center gap-space-sm pl-space-sm">
                <div className="flex flex-col text-right hidden sm:flex">
                  <span className="font-label-lg text-label-lg text-on-surface font-bold">Admin General</span>
                  <span className="font-label-code text-label-code text-outline">ID: ADM-9042</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
                </div>
                <button onClick={onBack} className="w-9 h-9 rounded-lg flex items-center justify-center bg-surface-container-high text-on-surface-variant hover:bg-error-container hover:text-on-error-container transition-colors" title="Cerrar Sesión">
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>
        
        <main className="w-full pt-20 bg-background flex-grow">
          {activeTab === 'cartelera' && <AdminCartelera />}
          {activeTab === 'telemetria' && <AdminTelemetria />}
          {['logs', 'promos', 'salas'].includes(activeTab) && (
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

const AdminCartelera = () => {
  const [conflictResolved, setConflictResolved] = useState(false);
  const [offsetApplied, setOffsetApplied] = useState(false);
  const [reassigned, setReassigned] = useState(false);

  return (
    <div className="w-full px-space-xl py-space-lg flex flex-col gap-space-lg">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md p-space-md rounded-xl bg-surface-container-low shadow-sm">
        <div className="flex flex-col gap-space-2xs min-w-0">
          <div className="flex items-center gap-space-xs">
            <span className="font-label-code text-label-code uppercase tracking-wider text-secondary flex items-center gap-space-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> CU03 • CU04 Ops Kernel
            </span>
            <span className="text-outline text-label-code">•</span>
            <span className="font-label-code text-label-code text-tertiary flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">cloud_done</span> Sincronizado con Base de Datos Supabase PG
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight truncate">
            Gestión de Cartelera & Programación de Funciones
          </h1>
        </div>
        <div className="flex items-center gap-space-sm shrink-0">
          <div className="flex items-center bg-surface-container px-space-sm py-space-xs rounded-lg shadow-inner gap-space-xs">
            <span className="material-symbols-outlined text-outline text-[18px]">calendar_today</span>
            <select className="bg-transparent text-on-surface font-label-lg text-label-lg outline-none cursor-pointer">
              <option className="bg-surface-container text-on-surface">Hoy • 24 Octubre 2024</option>
              <option className="bg-surface-container text-on-surface">Viernes • 25 Octubre 2024</option>
              <option className="bg-surface-container text-on-surface">Sábado • 26 Octubre 2024 (Estrenos)</option>
              <option className="bg-surface-container text-on-surface">Domingo • 27 Octubre 2024</option>
            </select>
          </div>
          <button className="flex items-center gap-space-2xs px-space-md py-space-xs rounded-lg bg-surface-container-high hover:bg-surface-variant text-on-surface transition-colors font-label-lg text-label-lg" type="button">
            <span className="material-symbols-outlined text-[18px]">sync</span>
            <span>Refrescar Matrix</span>
          </button>
          <button className="flex items-center gap-space-2xs px-space-md py-space-xs rounded-lg bg-primary-container text-on-primary-container font-headline-sm text-headline-sm hover:brightness-110 active:scale-95 transition-all shadow-[0_0_24px_-4px_rgba(245,158,11,0.35)]" type="button">
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            <span>Nueva Película</span>
          </button>
        </div>
      </div>

      <section className="relative overflow-hidden rounded-xl bg-surface-container-low p-space-md shadow-md">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-primary-container/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col gap-space-md">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md pb-space-sm bg-surface-container-lowest/60 p-space-sm rounded-lg">
            <div className="flex items-center gap-space-sm min-w-0">
              <div className="relative flex items-center justify-center shrink-0 w-12 h-12 rounded-full bg-surface-container-high shadow-[0_0_32px_0px_rgba(6,182,212,0.45)]">
                <span className="animate-ping absolute inline-flex h-10 w-10 rounded-full bg-secondary opacity-30"></span>
                <span className="material-symbols-outlined text-secondary text-[26px]">mic</span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-space-2xs">
                  <span className="font-label-code text-label-code uppercase tracking-wider text-secondary">Voz Delegada RF07 • Parseo Semántico</span>
                  <span className="px-space-2xs py-0.5 rounded bg-tertiary-container/30 text-tertiary font-label-code text-label-code uppercase">Confianza 98.4%</span>
                </div>
                <p className="font-body-lg text-body-lg text-on-surface font-semibold truncate tracking-tight">
                  Orden de voz activa: <span className="text-primary italic">“Crea una función para Duna a las 22:00 en Sala 3 con audio Atmos”</span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1 shrink-0 h-6 px-space-sm bg-surface-container rounded-full">
              <span className="w-1 h-2 bg-secondary rounded-full animate-pulse"></span>
              <span className="w-1 h-5 bg-secondary rounded-full animate-pulse [animation-delay:150ms]"></span>
              <span className="w-1 h-3 bg-secondary rounded-full animate-pulse [animation-delay:300ms]"></span>
              <span className="w-1 h-6 bg-secondary rounded-full animate-pulse [animation-delay:75ms]"></span>
              <span className="w-1 h-4 bg-secondary rounded-full animate-pulse [animation-delay:220ms]"></span>
              <span className="w-1 h-2 bg-secondary rounded-full animate-pulse [animation-delay:400ms]"></span>
              <span className="font-label-code text-label-code text-on-surface-variant ml-2 uppercase">Audio OK</span>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md p-space-md rounded-lg bg-surface-container">
            <div className="flex items-start gap-space-sm min-w-0">
              <div className="w-9 h-9 rounded-lg bg-error-container text-on-error-container flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_16px_rgba(225,29,72,0.35)]">
                <span className="material-symbols-outlined text-[20px]">warning</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-label-code text-label-code text-primary uppercase font-bold tracking-wider">Aviso IA: Conflicto Detectado (RF09)</span>
                <p className="font-body-md text-body-md text-on-surface leading-snug">
                  Se detectó colisión temporal con <strong className="text-on-surface font-bold">“Oppenheimer”</strong> (finaliza a las 22:15 en Sala 3). 
                  ¿Deseas desfasar a las <span className="text-primary font-bold">22:30</span> o reasignar a <span className="text-secondary font-bold">Sala 2 (Dolby Cinema Atmos)</span>?
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-space-xs shrink-0 self-end lg:self-center">
              <button 
                onClick={() => { setReassigned(true); setOffsetApplied(false); }}
                className={`px-space-sm py-space-xs rounded-lg font-label-md text-label-md transition-colors flex items-center gap-space-2xs ${reassigned ? 'bg-secondary text-on-secondary' : 'bg-surface-container-high hover:bg-surface-variant text-secondary'}`}
              >
                <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                Usar Sala 2 (22:00)
              </button>
              <button 
                onClick={() => { setOffsetApplied(true); setReassigned(false); }}
                className={`px-space-sm py-space-xs rounded-lg font-label-md text-label-md transition-colors flex items-center gap-space-2xs ${offsetApplied ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high hover:bg-surface-variant text-primary'}`}
              >
                <span className="material-symbols-outlined text-[16px]">schedule</span>
                Ajustar a 22:30
              </button>
              <button className="px-space-sm py-space-xs rounded-lg bg-surface-container-lowest hover:bg-error-container hover:text-on-error-container text-on-surface-variant font-label-md text-label-md transition-colors">
                Cancelar
              </button>
              <button 
                onClick={() => setConflictResolved(true)}
                disabled={conflictResolved}
                className={`px-space-md py-space-xs rounded-lg font-label-lg text-label-lg transition-all flex items-center gap-space-2xs ${conflictResolved ? 'bg-surface-container-high text-outline' : 'bg-primary text-on-primary hover:bg-primary-fixed-dim shadow-[0_0_20px_rgba(245,158,11,0.4)]'}`}
              >
                <span className="material-symbols-outlined text-[18px]">{conflictResolved ? 'cloud_done' : 'bolt'}</span>
                {conflictResolved ? 'Confirmado en PG' : 'Confirmar y Ejecutar en BD (RF10)'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        <section className="lg:col-span-5 flex flex-col gap-space-md">
          <div className="flex items-center justify-between p-space-sm bg-surface-container-low rounded-lg">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-[20px]">movie_filter</span>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Catálogo de Cartelera Activa</h2>
            </div>
            <span className="px-space-xs py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-code text-label-code">
              4 Películas Operativas
            </span>
          </div>

          <div className="flex flex-col gap-space-sm">
            {[
              { title: "Duna: Parte Dos", duration: "166 min", director: "Denis Villeneuve", rating: "+14 Años", format1: "IMAX Láser", format2: "Dolby Atmos", active: true },
              { title: "Oppenheimer", duration: "180 min", director: "Christopher Nolan", rating: "+16 Años", format1: "70mm IMAX", format2: "Dolby Atmos", active: true },
              { title: "Spider-Man: Across Spider-Verse", duration: "140 min", director: "Joaquim Dos Santos", rating: "Todo Público", format1: "4DX 3D", format2: "MacroXE", active: true },
              { title: "Blade Runner 2049 (Clásico)", duration: "164 min", director: "Denis Villeneuve", rating: "+14 Años", format1: "Dolby Cinema", format2: "", active: true, isSpecial: true }
            ].map((movie, idx) => (
              <article key={idx} className={`p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex flex-col gap-space-sm group shadow-sm ${movie.isSpecial ? 'opacity-90' : ''}`}>
                <div className="flex gap-space-sm">
                  <div className="w-20 h-28 rounded-lg shrink-0 shadow-md bg-surface-container-highest"></div>
                  <div className="flex flex-col justify-between flex-1 min-w-0">
                    <div className="flex flex-col gap-space-2xs">
                      <div className="flex items-start justify-between gap-space-2xs">
                        <h3 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors truncate">
                          {movie.title}
                        </h3>
                        <span className={`px-space-xs py-0.5 rounded font-label-code text-label-code uppercase shrink-0 ${movie.isSpecial ? 'bg-surface-container text-on-surface-variant' : 'bg-tertiary-container/30 text-tertiary'}`}>
                          {movie.isSpecial ? 'Especial' : 'Activa'}
                        </span>
                      </div>
                      <p className="font-label-md text-label-md text-on-surface-variant">{movie.duration} • {movie.director}</p>
                    </div>
                    <div className="flex flex-wrap gap-space-2xs">
                      <span className={`px-2 py-0.5 rounded bg-surface-container font-label-code text-label-code uppercase ${movie.rating === 'Todo Público' ? 'text-tertiary' : 'text-on-surface'}`}>{movie.rating}</span>
                      <span className="px-2 py-0.5 rounded bg-surface-container text-secondary font-label-code text-label-code">{movie.format1}</span>
                      {movie.format2 && <span className="px-2 py-0.5 rounded bg-surface-container text-primary font-label-code text-label-code">{movie.format2}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-space-xs bg-surface-container-lowest/50 p-space-xs rounded-lg">
                  <div className="flex items-center gap-space-xs">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="checkbox" defaultChecked className="accent-primary rounded cursor-pointer" />
                      <span className="font-label-code text-label-code text-on-surface-variant">Venta Kiosco</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="checkbox" defaultChecked={!movie.isSpecial} className="accent-primary rounded cursor-pointer" />
                      <span className="font-label-code text-label-code text-on-surface-variant">Venta Web</span>
                    </label>
                  </div>
                  <div className="flex items-center gap-space-2xs">
                    <button className="p-space-2xs rounded bg-surface-container hover:bg-surface-variant text-on-surface font-label-md text-label-md transition-colors" title="Baja temporal" type="button">
                      <span className="material-symbols-outlined text-[16px]">pause_circle</span>
                    </button>
                    <button className="px-space-sm py-1 rounded bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-md text-label-md transition-colors flex items-center gap-1" type="button">
                      <span className="material-symbols-outlined text-[14px]">edit</span>
                      Editar Ficha
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="lg:col-span-7 flex flex-col gap-space-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm p-space-sm bg-surface-container-low rounded-lg">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-secondary text-[20px]">view_timeline</span>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Cronograma de Salas por Franjas Horarias (RF07)</h2>
            </div>
            <div className="flex items-center gap-space-sm flex-wrap">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-secondary"></span>
                <span className="font-label-code text-label-code text-on-surface-variant">Confirmado</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-primary animate-pulse"></span>
                <span className="font-label-code text-label-code text-primary font-bold">Propuesta IA (RF09)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-error"></span>
                <span className="font-label-code text-label-code text-on-surface-variant">Conflicto</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-surface-container-highest"></span>
                <span className="font-label-code text-label-code text-on-surface-variant">Libre</span>
              </div>
            </div>
          </div>

          <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-space-md overflow-x-auto shadow-md">
            <div className="grid grid-cols-11 gap-1 text-center font-label-code text-label-code text-outline py-space-xs bg-surface-container-lowest/80 rounded-lg shrink-0 min-w-[620px]">
              <div>14:00</div><div>15:00</div><div>16:00</div><div>17:00</div><div>18:00</div><div>19:00</div><div>20:00</div><div>21:00</div><div>22:00</div><div>23:00</div><div>24:00</div>
            </div>

            <div className="flex flex-col gap-space-md min-w-[620px]">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-label-lg text-label-lg text-on-surface font-semibold flex items-center gap-space-2xs">
                    <span className="material-symbols-outlined text-outline text-[16px]">theaters</span>
                    Sala 1 • MacroXE <span className="text-outline font-normal text-label-code">(Capacidad: 280)</span>
                  </span>
                  <span className="font-label-code text-label-code text-tertiary">Ocupación Promedio: 78%</span>
                </div>
                <div className="relative h-14 bg-surface-container rounded-lg flex items-center p-1 overflow-hidden">
                  <div className="absolute left-[5%] w-[24%] h-11 rounded bg-secondary/20 hover:bg-secondary/30 transition-all p-2 flex flex-col justify-center cursor-pointer">
                    <span className="font-label-code text-label-code text-secondary font-bold truncate leading-tight">Spider-Man: Across</span>
                    <span className="font-label-code text-[10px] text-on-surface-variant">14:30 - 17:00 • 2D Macro</span>
                  </div>
                  <div className="absolute left-[34%] w-[28%] h-11 rounded bg-secondary/20 hover:bg-secondary/30 transition-all p-2 flex flex-col justify-center cursor-pointer">
                    <span className="font-label-code text-label-code text-secondary font-bold truncate leading-tight">Spider-Man: Across</span>
                    <span className="font-label-code text-[10px] text-on-surface-variant">17:45 - 20:15 • 3D Atmos</span>
                  </div>
                  <div className="absolute left-[66%] w-[25%] h-11 rounded bg-secondary/20 hover:bg-secondary/30 transition-all p-2 flex flex-col justify-center cursor-pointer">
                    <span className="font-label-code text-label-code text-secondary font-bold truncate leading-tight">Blade Runner 2049</span>
                    <span className="font-label-code text-[10px] text-on-surface-variant">21:00 - 23:45 • MacroXE</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-label-lg text-label-lg text-on-surface font-semibold flex items-center gap-space-2xs">
                    <span className="material-symbols-outlined text-outline text-[16px]">speaker</span>
                    Sala 2 • Dolby Cinema Atmos <span className="text-outline font-normal text-label-code">(Capacidad: 210)</span>
                  </span>
                  <span className="font-label-code text-label-code text-secondary">Alternativa Recomendada IA</span>
                </div>
                <div className="relative h-14 bg-surface-container rounded-lg flex items-center p-1 overflow-hidden">
                  <div className="absolute left-[8%] w-[28%] h-11 rounded bg-secondary/20 hover:bg-secondary/30 transition-all p-2 flex flex-col justify-center cursor-pointer">
                    <span className="font-label-code text-label-code text-secondary font-bold truncate leading-tight">Blade Runner 2049</span>
                    <span className="font-label-code text-[10px] text-on-surface-variant">15:00 - 17:45 • Atmos</span>
                  </div>
                  <div className="absolute left-[40%] w-[29%] h-11 rounded bg-secondary/20 hover:bg-secondary/30 transition-all p-2 flex flex-col justify-center cursor-pointer">
                    <span className="font-label-code text-label-code text-secondary font-bold truncate leading-tight">Duna: Parte Dos</span>
                    <span className="font-label-code text-[10px] text-on-surface-variant">18:30 - 21:15 • Atmos</span>
                  </div>
                  
                  {reassigned && !conflictResolved && (
                     <div className="absolute left-[73%] w-[26%] h-11 rounded bg-primary-container text-on-primary-container shadow-[0_0_24px_rgba(245,158,11,0.6)] animate-pulse p-2 flex flex-col justify-center cursor-pointer">
                       <div className="flex items-center justify-between">
                         <span className="font-label-code text-label-code font-bold truncate leading-tight">Duna 2 (Propuesta)</span>
                         <span className="material-symbols-outlined text-[14px]">psychology</span>
                       </div>
                       <span className="font-label-code text-[10px] text-on-primary-container/80 font-semibold">22:00 - 00:45 • Atmos</span>
                     </div>
                  )}

                  {reassigned && conflictResolved && (
                     <div className="absolute left-[73%] w-[26%] h-11 rounded bg-tertiary-container text-on-tertiary-container p-2 flex flex-col justify-center cursor-pointer">
                       <div className="flex items-center justify-between">
                         <span className="font-label-code text-label-code uppercase font-bold truncate leading-tight">Duna 2 • Confirmada</span>
                         <span className="material-symbols-outlined text-[14px]">done_all</span>
                       </div>
                       <span className="font-label-code text-[10px]">22:00 - 00:45 • Sala 2</span>
                     </div>
                  )}
                  
                  {!reassigned && (
                    <div className="absolute left-[73%] w-[26%] h-11 rounded bg-surface-container-high/80 hover:bg-secondary/10 border-dashed transition-all p-2 flex flex-col justify-center cursor-pointer">
                      <div className="flex items-center gap-1 text-secondary">
                        <span className="material-symbols-outlined text-[12px]">auto_fix_high</span>
                        <span className="font-label-code text-label-code font-bold truncate">Hueco 22:00 Disponible</span>
                      </div>
                      <span className="font-label-code text-[10px] text-on-surface-variant">Compatible con Audio Atmos</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1 p-space-xs rounded-lg bg-surface-container-highest/20">
                <div className="flex items-center justify-between">
                  <span className="font-label-lg text-label-lg text-primary font-bold flex items-center gap-space-2xs">
                    <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                    Sala 3 • IMAX Láser 70mm <span className="text-on-surface-variant font-normal text-label-code">(Capacidad: 340)</span>
                  </span>
                  <span className="px-space-xs py-0.5 rounded bg-primary-container/30 text-primary font-label-code text-label-code animate-pulse font-bold">
                    SALA EN NEGOCIACIÓN DE VOZ
                  </span>
                </div>
                <div className="relative h-16 bg-surface-container rounded-lg flex items-center p-1 overflow-hidden">
                  <div className="absolute left-[2%] w-[33%] h-12 rounded bg-secondary/20 hover:bg-secondary/30 transition-all p-2 flex flex-col justify-center cursor-pointer">
                    <span className="font-label-code text-label-code text-secondary font-bold truncate leading-tight">Duna: Parte Dos</span>
                    <span className="font-label-code text-[10px] text-on-surface-variant">14:15 - 17:00 • 70mm Láser</span>
                  </div>
                  <div className="absolute left-[38%] w-[36%] h-12 rounded bg-error-container/40 hover:bg-error-container/60 transition-all p-2 flex flex-col justify-center cursor-pointer">
                    <div className="flex items-center justify-between">
                      <span className="font-label-code text-label-code text-error font-bold truncate leading-tight">Oppenheimer (Conflicto)</span>
                      <span className="material-symbols-outlined text-error text-[14px]">error</span>
                    </div>
                    <span className="font-label-code text-[10px] text-on-error-container">18:45 - 22:15 (Fin solapado)</span>
                  </div>
                  
                  {!reassigned && !conflictResolved && (
                    <div className={`absolute ${offsetApplied ? 'left-[75%]' : 'left-[75%]'} w-[24%] h-12 rounded bg-primary-container text-on-primary-container p-2 flex flex-col justify-center cursor-pointer shadow-[0_0_24px_rgba(245,158,11,0.6)] animate-pulse`} id="timeline-proposed-block">
                      <div className="flex items-center justify-between">
                        <span className="font-label-code text-label-code uppercase font-bold truncate leading-tight">Duna 2 (Propuesta)</span>
                        <span className="material-symbols-outlined text-[14px]">psychology</span>
                      </div>
                      <span className="font-label-code text-[10px] font-semibold">{offsetApplied ? '22:30' : '22:30'} - 01:15 • Atmos Láser</span>
                    </div>
                  )}

                  {!reassigned && conflictResolved && (
                     <div className="absolute left-[75%] w-[24%] h-12 rounded bg-tertiary-container text-on-tertiary-container p-2 flex flex-col justify-center cursor-pointer">
                       <div className="flex items-center justify-between">
                         <span className="font-label-code text-label-code uppercase font-bold truncate leading-tight">Duna 2 • Confirmada</span>
                         <span className="material-symbols-outlined text-[14px]">done_all</span>
                       </div>
                       <span className="font-label-code text-[10px]">22:30 - 01:15 • Sala 3 IMAX</span>
                     </div>
                  )}

                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-label-lg text-label-lg text-on-surface font-semibold flex items-center gap-space-2xs">
                    <span className="material-symbols-outlined text-outline text-[16px]">motion_sensor_active</span>
                    Sala 4 • 4DX Extreme <span className="text-outline font-normal text-label-code">(Capacidad: 140)</span>
                  </span>
                  <span className="font-label-code text-label-code text-tertiary">Actuadores calibrados</span>
                </div>
                <div className="relative h-14 bg-surface-container rounded-lg flex items-center p-1 overflow-hidden">
                  <div className="absolute left-[10%] w-[26%] h-11 rounded bg-secondary/20 hover:bg-secondary/30 transition-all p-2 flex flex-col justify-center cursor-pointer">
                    <span className="font-label-code text-label-code text-secondary font-bold truncate leading-tight">Spider-Man: Across</span>
                    <span className="font-label-code text-[10px] text-on-surface-variant">15:15 - 17:35 • Efectos 4D</span>
                  </div>
                  <div className="absolute left-[42%] w-[26%] h-11 rounded bg-secondary/20 hover:bg-secondary/30 transition-all p-2 flex flex-col justify-center cursor-pointer">
                    <span className="font-label-code text-label-code text-secondary font-bold truncate leading-tight">Spider-Man: Across</span>
                    <span className="font-label-code text-[10px] text-on-surface-variant">18:30 - 20:50 • Efectos 4D</span>
                  </div>
                  <div className="absolute left-[72%] w-[25%] h-11 rounded bg-secondary/20 hover:bg-secondary/30 transition-all p-2 flex flex-col justify-center cursor-pointer">
                    <span className="font-label-code text-label-code text-secondary font-bold truncate leading-tight">Duna: Parte Dos 4DX</span>
                    <span className="font-label-code text-[10px] text-on-surface-variant">21:30 - 00:15 • 4DX Atmos</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-space-xs rounded bg-surface-container text-on-surface-variant font-label-code text-label-code">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">touch_app</span>
                Haz clic sobre cualquier bloque para editar precio de entrada, aforo reservado o desprogramar.
              </span>
              <span className="text-primary font-semibold">Desfase automático por limpieza: 15 min incluido</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm">
            <div className="p-space-sm rounded-lg bg-surface-container-low flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-label-code text-label-code uppercase text-outline">Funciones Programadas</span>
                <span className="font-headline-sm text-headline-sm text-on-surface">18 Funciones</span>
              </div>
              <div className="w-10 h-10 rounded bg-surface-container flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined">schedule_send</span>
              </div>
            </div>
            <div className="p-space-sm rounded-lg bg-surface-container-low flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-label-code text-label-code uppercase text-outline">Aforo Vendido Hoy</span>
                <span className="font-headline-sm text-headline-sm text-tertiary">3,120 / 4,200</span>
              </div>
              <div className="w-10 h-10 rounded bg-surface-container flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined">group</span>
              </div>
            </div>
            <div className="p-space-sm rounded-lg bg-surface-container-low flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-label-code text-label-code uppercase text-outline">Latencia Edge BD</span>
                <span className="font-headline-sm text-headline-sm text-primary">18ms PG Pool</span>
              </div>
              <div className="w-10 h-10 rounded bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">network_check</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm p-space-md rounded-xl bg-surface-container-lowest shadow-inner">
        <div className="flex items-center gap-space-sm min-w-0">
          <div className="w-8 h-8 rounded-full bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px]">terminal</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-label-code text-label-code uppercase text-outline tracking-wider">Log Rápido de Transacciones en BD</span>
            <p className="font-label-md text-label-md text-on-surface truncate">
              {conflictResolved ? 
                (reassigned ? 
                  `Última acción ejecutada: Inserción Exitosa Duna 2 Sala 2 (22:00) confirmada por voz por ADM-9042 a las ${new Date().toLocaleTimeString()} en Supabase Postgres.` 
                  : `Última acción ejecutada: Inserción Exitosa Duna 2 Sala 3 (22:30) confirmada por voz por ADM-9042 a las ${new Date().toLocaleTimeString()} en Supabase Postgres.`)
                : `Última acción ejecutada: Modificación de horario Sala 2 por ADM-9042 confirmada por voz a las 19:42:01 via Edge Worker.`
              }
            </p>
          </div>
        </div>
        <div className="flex items-center gap-space-xs shrink-0">
          <span className="px-space-xs py-1 rounded bg-surface-container text-outline font-label-code text-label-code">
            TX-ID: 9812-441-PG
          </span>
          <button className="px-space-sm py-1 rounded bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-md text-label-md transition-colors flex items-center gap-1" type="button">
            <span className="material-symbols-outlined text-[14px]">history</span>
            Ver Logs Completos
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminTelemetria = () => {
  return (
    <div className="p-space-xl flex flex-col gap-space-xl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
        <div className="flex flex-col gap-space-2xs">
          <div className="flex items-center gap-space-xs">
            <span className="px-space-xs py-0.5 rounded bg-primary/10 text-primary font-label-code text-label-code uppercase tracking-wider">CU05 • Módulo Ejecutivo</span>
            <span className="text-outline font-label-code text-label-code">•</span>
            <span className="text-on-surface-variant font-label-code text-label-code">Regulador SIN v2.4 Activo</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Telemetría de Ventas & Trazabilidad Fiscal</h1>
        </div>
        <div className="flex flex-wrap items-center gap-space-sm">
          <div className="p-space-2xs rounded-xl bg-surface-container flex items-center shadow-md">
            <button className="px-space-sm py-space-xs rounded-lg bg-primary-container text-on-primary-container font-label-md text-label-md shadow-sm transition-all" type="button">Hoy</button>
            <button className="px-space-sm py-space-xs rounded-lg text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors" type="button">Esta Semana</button>
            <button className="px-space-sm py-space-xs rounded-lg text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors" type="button">Mensual</button>
            <button className="px-space-sm py-space-xs rounded-lg text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors" type="button">Rango Fiscal</button>
          </div>
          <button className="flex items-center gap-space-xs px-space-md py-space-xs rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-primary font-label-lg text-label-lg shadow-md transition-all" type="button">
            <span className="material-symbols-outlined text-[20px]">verified_user</span>
            <span>Exportar Informe Fiscal SIN</span>
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-surface-container-low p-space-lg shadow-xl">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-secondary/10 blur-3xl pointer-events-none"></div>
        <div className="absolute right-32 -bottom-20 w-72 h-72 rounded-full bg-primary/10 blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col xl:flex-row gap-space-lg items-start xl:items-center justify-between">
          <div className="flex flex-col gap-space-xs max-w-2xl">
            <div className="flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary shadow-[0_0_24px_0px_rgba(6,182,212,0.35)]">
                <span className="material-symbols-outlined animate-pulse text-[22px]">spatial_audio</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-code text-label-code uppercase tracking-wider text-secondary">Motor Neural RF08 • Transcripción On-Edge</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Consulta auditada por voz con inferencia local criptográfica</span>
              </div>
            </div>
            <div className="mt-space-2xs p-space-sm rounded-xl bg-surface-container-lowest/80 backdrop-blur-md">
              <p className="font-headline-sm text-headline-sm text-on-surface italic">
                "¿Cuánto se recaudó hoy en funciones IMAX y cuál es el combo de Candy Bar más vendido?"
              </p>
            </div>
          </div>
          
          <div className="w-full xl:w-auto xl:min-w-[480px] p-space-md rounded-xl bg-surface-container flex flex-col gap-space-xs shadow-lg">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-space-2xs font-label-code text-label-code uppercase text-tertiary">
                <span className="w-2 h-2 rounded-full bg-tertiary inline-block animate-ping"></span>
                Respuesta Instantánea Validada
              </span>
              <span className="font-label-code text-label-code text-outline">Latencia: 42ms • SHA-256 Valid</span>
            </div>
            <p className="font-body-md text-body-md text-on-surface leading-relaxed">
              Total recaudado hoy en <span className="font-bold text-primary">IMAX: 14,880.00 Bs</span> <span className="text-tertiary font-bold">(+18.4% vs ayer)</span>. Producto Candy Bar líder: <span className="font-bold text-secondary">Combo Popcorn Balde + 2 Bebidas</span> (342 unidades vendidas).
            </p>
            <div className="pt-space-2xs flex items-center gap-space-md">
              <div className="flex items-center gap-space-2xs text-on-surface-variant font-label-code text-label-code">
                <span className="material-symbols-outlined text-[16px] text-tertiary">fingerprint</span>
                Nodo Local: RF08-PG-Edge
              </div>
              <div className="flex items-center gap-space-2xs text-on-surface-variant font-label-code text-label-code">
                <span className="material-symbols-outlined text-[16px] text-secondary">mic_double</span>
                Confianza: 99.8%
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-md">
        <div className="p-space-lg rounded-2xl bg-surface-container-low flex flex-col justify-between shadow-lg relative overflow-hidden group hover:bg-surface-container transition-all">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-space-2xs">
              <span className="font-label-code text-label-code uppercase tracking-wider text-outline">Ingresos Consolidados Hoy</span>
              <span className="font-display-hero text-[40px] leading-[44px] text-primary">42,650.00 <span className="font-headline-sm text-headline-sm text-on-surface-variant">Bs</span></span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-[0_0_24px_-4px_rgba(245,158,11,0.35)]">
              <span className="material-symbols-outlined text-[26px]">payments</span>
            </div>
          </div>
          <div className="mt-space-lg pt-space-md flex flex-col gap-space-xs bg-surface-container-lowest/60 p-space-sm rounded-xl">
            <div className="flex justify-between items-center">
              <span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-space-2xs">
                <span className="w-2 h-2 rounded-full bg-primary"></span> Taquilla & Boletos
              </span>
              <span className="font-label-lg text-label-lg text-on-surface">31,200.00 Bs</span>
            </div>
            <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: '73.15%' }}></div>
            </div>
            <div className="flex justify-between items-center mt-space-2xs">
              <span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-space-2xs">
                <span className="w-2 h-2 rounded-full bg-secondary"></span> Candy Bar / Confitería
              </span>
              <span className="font-label-lg text-label-lg text-on-surface">11,450.00 Bs</span>
            </div>
            <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
              <div className="bg-secondary h-full rounded-full" style={{ width: '26.85%' }}></div>
            </div>
          </div>
        </div>

        <div className="p-space-lg rounded-2xl bg-surface-container-low flex flex-col justify-between shadow-lg relative overflow-hidden group hover:bg-surface-container transition-all">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-space-2xs">
              <span className="font-label-code text-label-code uppercase tracking-wider text-outline">Ocupación Promedio de Salas</span>
              <div className="flex items-baseline gap-space-xs">
                <span className="font-display-hero text-[40px] leading-[44px] text-tertiary">84.2%</span>
                <span className="font-label-code text-label-code text-tertiary flex items-center">
                  <span className="material-symbols-outlined text-[16px]">arrow_upward</span> +6.8%
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary shadow-[0_0_24px_-4px_rgba(48,200,143,0.35)]">
              <span className="material-symbols-outlined text-[26px]">chair</span>
            </div>
          </div>
          <div className="mt-space-lg pt-space-md flex flex-col gap-space-xs bg-surface-container-lowest/60 p-space-sm rounded-xl">
            <div className="flex justify-between items-center">
              <span className="font-label-md text-label-md text-on-surface-variant">Boletos Emitidos Hoy</span>
              <span className="font-headline-sm text-headline-sm text-on-surface">1,280 <span className="font-body-sm text-body-sm text-outline">/ 1,520 cupos</span></span>
            </div>
            <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden mt-space-2xs">
              <div className="bg-tertiary h-full rounded-full" style={{ width: '84.2%' }}></div>
            </div>
            <div className="flex justify-between items-center mt-space-2xs font-label-code text-label-code text-outline">
              <span>Sala 1 (IMAX): 96%</span>
              <span>Sala 2 (VIP): 78%</span>
              <span>Sala 3 (3D): 79%</span>
            </div>
          </div>
        </div>

        <div className="p-space-lg rounded-2xl bg-surface-container-low flex flex-col justify-between shadow-lg relative overflow-hidden group hover:bg-surface-container transition-all">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-space-2xs">
              <span className="font-label-code text-label-code uppercase tracking-wider text-outline">Dispersión de Canales</span>
              <span className="font-display-hero text-[40px] leading-[44px] text-secondary">Kiosk-04</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shadow-[0_0_24px_-4px_rgba(76,215,246,0.35)]">
              <span className="material-symbols-outlined text-[26px]">touch_app</span>
            </div>
          </div>
          <div className="mt-space-lg pt-space-md flex flex-col gap-space-xs bg-surface-container-lowest/60 p-space-sm rounded-xl">
            <div className="flex justify-between items-center">
              <span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-space-2xs">
                <span className="w-2 h-2 rounded-full bg-secondary"></span> Kiosk-04 Activo (Principal)
              </span>
              <span className="font-label-lg text-label-lg text-secondary">45%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-space-2xs">
                <span className="w-2 h-2 rounded-full bg-primary"></span> Kiosk-01 (Entrada Hall)
              </span>
              <span className="font-label-lg text-label-lg text-on-surface">32%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-space-2xs">
                <span className="w-2 h-2 rounded-full bg-tertiary"></span> Lumen App Móvil QR
              </span>
              <span className="font-label-lg text-label-lg text-on-surface">23%</span>
            </div>
            <div className="w-full flex h-2 rounded-full overflow-hidden mt-space-2xs bg-surface-container gap-0.5">
              <div className="bg-secondary h-full" style={{ width: '45%' }}></div>
              <div className="bg-primary h-full" style={{ width: '32%' }}></div>
              <div className="bg-tertiary h-full" style={{ width: '23%' }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg">
        <div className="xl:col-span-8 p-space-lg rounded-2xl bg-surface-container-low shadow-lg flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-md">
            <div className="flex flex-col">
              <span className="font-label-code text-label-code uppercase tracking-wider text-outline">Desempeño de Cartelera</span>
              <h2 className="font-headline-md text-headline-md text-on-surface">Ingresos Generados por Título</h2>
            </div>
            <div className="flex items-center gap-space-xs font-label-code text-label-code text-on-surface-variant">
              <span className="inline-block w-2 h-2 rounded-full bg-primary"></span> Entradas
              <span className="inline-block w-2 h-2 rounded-full bg-secondary ml-space-xs"></span> Candy Bar Asociado
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md my-space-md">
            <div className="p-space-md rounded-xl bg-surface-container flex flex-col gap-space-sm relative overflow-hidden group">
              <div className="w-full h-36 rounded-lg overflow-hidden relative">
                <div className="w-full h-full bg-surface-container-highest"></div>
                <div className="absolute top-2 right-2 px-space-xs py-0.5 rounded bg-surface-container-lowest/90 text-primary font-label-code text-label-code">
                  LÍDER 58%
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-on-surface truncate">Duna: Parte Dos</span>
                <span className="font-label-code text-label-code text-outline">IMAX Láser • 4K Dolby Atmos</span>
              </div>
              <div className="flex justify-between items-baseline pt-space-xs">
                <span className="font-headline-md text-headline-md text-primary">24,737.00 <span className="text-body-sm font-normal">Bs</span></span>
                <span className="font-label-code text-label-code text-tertiary">742 tkts</span>
              </div>
              <div className="w-full bg-surface-container-lowest h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: '58%' }}></div>
              </div>
            </div>

            <div className="p-space-md rounded-xl bg-surface-container flex flex-col gap-space-sm relative overflow-hidden group">
              <div className="w-full h-36 rounded-lg overflow-hidden relative">
                <div className="w-full h-full bg-surface-container-highest"></div>
                <div className="absolute top-2 right-2 px-space-xs py-0.5 rounded bg-surface-container-lowest/90 text-on-surface font-label-code text-label-code">
                  24%
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-on-surface truncate">Oppenheimer</span>
                <span className="font-label-code text-label-code text-outline">VIP Lounge • Sala 2</span>
              </div>
              <div className="flex justify-between items-baseline pt-space-xs">
                <span className="font-headline-md text-headline-md text-on-surface">10,236.00 <span className="text-body-sm font-normal">Bs</span></span>
                <span className="font-label-code text-label-code text-tertiary">308 tkts</span>
              </div>
              <div className="w-full bg-surface-container-lowest h-2 rounded-full overflow-hidden">
                <div className="bg-on-surface-variant h-full rounded-full" style={{ width: '24%' }}></div>
              </div>
            </div>

            <div className="p-space-md rounded-xl bg-surface-container flex flex-col gap-space-sm relative overflow-hidden group">
              <div className="w-full h-36 rounded-lg overflow-hidden relative">
                <div className="w-full h-full bg-surface-container-highest"></div>
                <div className="absolute top-2 right-2 px-space-xs py-0.5 rounded bg-surface-container-lowest/90 text-on-surface font-label-code text-label-code">
                  18%
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-on-surface truncate">Spider-Man: Multiverso</span>
                <span className="font-label-code text-label-code text-outline">3D Digital • Sala 3</span>
              </div>
              <div className="flex justify-between items-baseline pt-space-xs">
                <span className="font-headline-md text-headline-md text-on-surface">7,677.00 <span className="text-body-sm font-normal">Bs</span></span>
                <span className="font-label-code text-label-code text-tertiary">230 tkts</span>
              </div>
              <div className="w-full bg-surface-container-lowest h-2 rounded-full overflow-hidden">
                <div className="bg-secondary h-full rounded-full" style={{ width: '18%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 p-space-lg rounded-2xl bg-surface-container-low shadow-lg flex flex-col justify-between">
          <div className="flex flex-col gap-space-2xs">
            <span className="font-label-code text-label-code uppercase tracking-wider text-outline">Procesamiento Transaccional</span>
            <h2 className="font-headline-md text-headline-md text-on-surface">Métodos de Cobro</h2>
          </div>
          
          <div className="my-space-md flex flex-col items-center justify-center relative">
            <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
              <circle className="text-surface-container" cx="50" cy="50" fill="none" r="38" stroke="currentColor" strokeWidth="12"></circle>
              <circle className="text-secondary" cx="50" cy="50" fill="none" r="38" stroke="currentColor" strokeDasharray="114.6 238.76" strokeLinecap="round" strokeWidth="12"></circle>
              <circle className="text-primary" cx="50" cy="50" fill="none" r="38" stroke="currentColor" strokeDasharray="90.7 238.76" strokeDashoffset="-118" strokeLinecap="round" strokeWidth="12"></circle>
              <circle className="text-tertiary" cx="50" cy="50" fill="none" r="38" stroke="currentColor" strokeDasharray="33.4 238.76" strokeDashoffset="-212" strokeLinecap="round" strokeWidth="12"></circle>
            </svg>
            <div className="absolute flex flex-col items-center justify-center pointer-events-none">
              <span className="font-display-hero text-headline-lg leading-none text-on-surface">100%</span>
              <span className="font-label-code text-label-code uppercase text-outline mt-1">Auditado</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-space-sm bg-surface-container-lowest/80 p-space-md rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="w-3 h-3 rounded bg-secondary"></span>
                <span className="font-label-md text-label-md text-on-surface">Tarjeta POS Kiosco</span>
              </div>
              <div className="text-right">
                <span className="font-label-lg text-label-lg font-bold text-on-surface">48%</span>
                <span className="font-label-code text-label-code text-outline block">20,472 Bs</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="w-3 h-3 rounded bg-primary"></span>
                <span className="font-label-md text-label-md text-on-surface">QR Simple Interoperable</span>
              </div>
              <div className="text-right">
                <span className="font-label-lg text-label-lg font-bold text-on-surface">38%</span>
                <span className="font-label-code text-label-code text-outline block">16,207 Bs</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="w-3 h-3 rounded bg-tertiary"></span>
                <span className="font-label-md text-label-md text-on-surface">Efectivo en Taquilla</span>
              </div>
              <div className="text-right">
                <span className="font-label-lg text-label-lg font-bold text-on-surface">14%</span>
                <span className="font-label-code text-label-code text-outline block">5,971 Bs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-surface-container-low p-space-lg shadow-xl flex flex-col gap-space-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-sm">
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-ping"></span>
              <span className="font-label-code text-label-code uppercase tracking-wider text-tertiary">RF12 • Ledger Criptográfico Inmutable</span>
            </div>
            <h2 className="font-headline-md text-headline-md text-on-surface">Registro de Auditoría & Trazabilidad de Comandos</h2>
          </div>
          <div className="flex items-center gap-space-sm">
            <div className="px-space-sm py-space-xs rounded-lg bg-surface-container flex items-center gap-space-xs font-label-code text-label-code text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px] text-tertiary">dataset</span>
              <span>Supabase PG: WAL Sync Activo</span>
            </div>
            <button className="px-space-sm py-space-xs rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-code text-label-code uppercase transition-colors" type="button">
              Filtrar Hashing
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left font-body-sm text-body-sm">
            <thead>
              <tr className="bg-surface-container-lowest text-outline font-label-code text-label-code uppercase tracking-wider">
                <th className="py-space-sm px-space-md rounded-l-lg">Timestamp</th>
                <th className="py-space-sm px-space-md">Usuario / Rol</th>
                <th className="py-space-sm px-space-md">Tipo de Acción</th>
                <th className="py-space-sm px-space-md">Comando Ejecutado</th>
                <th className="py-space-sm px-space-md">Hash Transacción SHA-256</th>
                <th className="py-space-sm px-space-md rounded-r-lg text-right">Estado Supabase PG</th>
              </tr>
            </thead>
            <tbody className="divide-y-0">
              <tr className="hover:bg-surface-container/50 transition-colors">
                <td className="py-space-md px-space-md font-label-code text-label-code text-on-surface-variant whitespace-nowrap">2025-05-14 18:42:11 UTC</td>
                <td className="py-space-md px-space-md whitespace-nowrap">
                  <div className="flex items-center gap-space-xs">
                    <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-label-code text-[10px]">AD</span>
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md text-on-surface">ADM-9042</span>
                      <span className="font-label-code text-label-code text-outline">Gerente General</span>
                    </div>
                  </div>
                </td>
                <td className="py-space-md px-space-md whitespace-nowrap">
                  <span className="px-space-xs py-0.5 rounded-full bg-secondary/10 text-secondary font-label-code text-label-code flex items-center gap-1 w-fit">
                    <span className="material-symbols-outlined text-[14px]">record_voice_over</span> Voz RF06
                  </span>
                </td>
                <td className="py-space-md px-space-md text-on-surface max-w-xs truncate"><code>QUERY_IMAX_REVENUE_TODAY_AND_TOP_CANDY</code></td>
                <td className="py-space-md px-space-md font-label-code text-label-code text-on-surface-variant whitespace-nowrap"><span className="text-primary font-mono select-all">e3b0c44298fc1c...b855</span></td>
                <td className="py-space-md px-space-md text-right whitespace-nowrap">
                  <span className="inline-flex items-center gap-space-2xs text-tertiary font-label-code text-label-code font-bold">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span> COMMITTED
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

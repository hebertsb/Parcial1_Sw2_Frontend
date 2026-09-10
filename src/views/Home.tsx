import { useNavigate } from 'react-router-dom';
import { useAuth } from '../controllers/AuthContext';
import { useCine } from '../controllers/CineContext';

export const Home = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const { dispatch } = useCine();

  const onNavigate = () => {
    dispatch({ type: 'RESETEAR_COMPRA' });
    navigate('/cartelera');
  };

  /** Voz requiere cuenta de Google — ver Login.tsx. */
  const onVoiceMode = () => {
    if (usuario) {
      navigate('/voz');
      return;
    }
    navigate('/login', { state: { from: { pathname: '/voz' } } });
  };

  return (
    <div className="flex flex-col w-full relative overflow-hidden select-none">
      {/* Dynamic Cinematic Ambient Lighting & Dust Particle Simulation */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-[1100px] h-[580px] bg-gradient-to-b from-primary/15 via-secondary/5 to-transparent blur-3xl opacity-60 rounded-full"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary/10 blur-3xl rounded-full"></div>
        <div className="absolute top-1/3 -right-32 w-[32rem] h-[32rem] bg-secondary/10 blur-3xl rounded-full"></div>
        
        {/* Volumetric Projector Beam Emulation */}
        <svg className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] opacity-25" fill="none" viewBox="0 0 1200 600">
          <defs>
            <linearGradient id="beamGrad" x1="0.5" x2="0.5" y1="0" y2="1">
              <stop offset="0%" stopColor="#ffb95f" stopOpacity="0.55"></stop>
              <stop offset="60%" stopColor="#4cd7f6" stopOpacity="0.12"></stop>
              <stop offset="100%" stopColor="#111319" stopOpacity="0"></stop>
            </linearGradient>
          </defs>
          <polygon fill="url(#beamGrad)" points="600,0 200,600 1000,600"></polygon>
        </svg>
      </div>

      <div className="relative z-10 w-full px-space-xl lg:px-space-2xl py-space-xl flex flex-col justify-between max-w-[1720px] mx-auto min-h-[calc(100vh-5rem)]">
        {/* SECTION 1: Immersive Cinematic Hero Header */}
        <div className="flex flex-col items-center text-center space-y-space-sm pt-space-xs">
          <div className="inline-flex items-center gap-space-xs bg-surface-container-low/90 backdrop-blur-md px-space-md py-space-2xs rounded-full shadow-md">
            <span className="w-2.5 h-2.5 rounded-full bg-tertiary animate-ping"></span>
            <span className="font-label-code text-label-code tracking-widest text-primary uppercase">KIOSCO INTELIGENTE #04 • TERMINAL ACTIVA</span>
            <span className="text-outline-variant">•</span>
            <span className="font-label-code text-label-code text-on-surface-variant">SENSOR DE PROXIMIDAD: PRESENCIAL</span>
          </div>
          <div className="space-y-space-2xs max-w-4xl">
            <h1 className="font-display-hero text-display-hero text-on-surface tracking-tight leading-none uppercase">
              Bienvenido a <span className="bg-gradient-to-r from-primary via-primary-fixed-dim to-secondary bg-clip-text text-transparent">Lumen Cinema</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant font-medium max-w-2xl mx-auto pt-space-2xs">
              Tu experiencia cinematográfica de máxima fidelidad comienza aquí. Selecciona tu forma preferida de navegación para continuar:
            </p>
          </div>
        </div>

        {/* SECTION 2: Dual Entry Portals (Voice AI Agent vs Visual Touch Kiosk) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-xl lg:gap-space-2xl items-stretch my-space-lg">
          
          {/* PORTAL A: Lumen Voice AI Agent */}
          <div 
            onClick={onVoiceMode}
            className="relative group bg-surface-container-low rounded-xl p-space-xl flex flex-col justify-between shadow-xl transition-all duration-300 hover:scale-[1.01] overflow-hidden cursor-pointer"
          >
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-secondary/15 rounded-full blur-2xl pointer-events-none transition-all duration-500 group-hover:bg-secondary/25"></div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-secondary to-transparent opacity-40 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="flex items-center justify-between gap-space-md">
              <div className="inline-flex items-center gap-space-xs bg-secondary/10 px-space-sm py-space-xs rounded-full">
                <span className="material-symbols-outlined text-secondary text-[20px] animate-pulse">mic</span>
                <span className="font-label-code text-label-code text-secondary uppercase font-bold tracking-wider">Agente Conversacional AI</span>
              </div>
              <span className="font-label-code text-label-code bg-surface-container px-space-sm py-space-2xs text-tertiary rounded-full uppercase tracking-wider">
                Más Rápido • Cero Contacto
              </span>
            </div>
            
            <div className="flex flex-col items-center justify-center my-space-lg text-center space-y-space-md">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-secondary/10 animate-ping opacity-30 pointer-events-none"></div>
                <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-secondary-container via-secondary/20 to-primary/20 blur-xl opacity-50"></div>
                <div className="relative w-36 h-36 rounded-full bg-surface-container-highest flex items-center justify-center shadow-[0_0_40px_rgba(76,215,246,0.35)] group-hover:shadow-[0_0_55px_rgba(76,215,246,0.55)] transition-all">
                  <svg className="w-20 h-20 text-secondary" fill="currentColor" viewBox="0 0 100 100">
                    <rect className="animate-pulse" height="24" rx="3" style={{animationDelay: '150ms'}} width="6" x="18" y="38"></rect>
                    <rect className="animate-pulse" height="52" rx="3" style={{animationDelay: '350ms'}} width="6" x="30" y="24"></rect>
                    <rect className="animate-pulse" height="72" rx="3" style={{animationDelay: '50ms'}} width="6" x="42" y="14"></rect>
                    <rect className="animate-pulse" height="44" rx="3" style={{animationDelay: '250ms'}} width="6" x="54" y="28"></rect>
                    <rect className="animate-pulse" height="60" rx="3" style={{animationDelay: '450ms'}} width="6" x="66" y="20"></rect>
                    <rect className="animate-pulse" height="28" rx="3" style={{animationDelay: '100ms'}} width="6" x="78" y="36"></rect>
                  </svg>
                </div>
              </div>
              <div className="space-y-space-2xs">
                <h2 className="font-headline-lg text-headline-lg text-on-surface">Habla con Lumen AI</h2>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mx-auto">
                  Expresa naturalmente tus gustos, pide horarios específicos o reserva sin navegar por menús.
                </p>
              </div>
            </div>
            
            <div className="space-y-space-xs my-space-xs">
              <span className="font-label-code text-label-code text-outline uppercase tracking-wider block text-center lg:text-left">
                Ejemplos de órdenes habladas instantáneas:
              </span>
              <div className="grid grid-cols-1 gap-space-xs">
                <div className="bg-surface-container/90 px-space-md py-space-xs rounded-lg flex items-center justify-between transition-colors hover:bg-surface-container-high">
                  <span className="font-body-sm text-body-sm text-on-surface flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-secondary text-[16px]">record_voice_over</span>
                    "Quiero 2 entradas para Duna a las 8:15"
                  </span>
                  <span className="font-label-code text-label-code text-outline font-bold">PROBAR</span>
                </div>
                <div className="bg-surface-container/90 px-space-md py-space-xs rounded-lg flex items-center justify-between transition-colors hover:bg-surface-container-high">
                  <span className="font-body-sm text-body-sm text-on-surface flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-secondary text-[16px]">record_voice_over</span>
                    "Recomiéndame una película de suspenso"
                  </span>
                  <span className="font-label-code text-label-code text-outline font-bold">PROBAR</span>
                </div>
                <div className="bg-surface-container/90 px-space-md py-space-xs rounded-lg flex items-center justify-between transition-colors hover:bg-surface-container-high">
                  <span className="font-body-sm text-body-sm text-on-surface flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-secondary text-[16px]">record_voice_over</span>
                    "¿Hay asientos VIP libres para Oppenheimer hoy?"
                  </span>
                  <span className="font-label-code text-label-code text-outline font-bold">PROBAR</span>
                </div>
              </div>
            </div>
            
            <button className="mt-space-md w-full h-[60px] bg-secondary-container text-on-secondary-container rounded-lg font-headline-sm text-headline-sm flex items-center justify-center gap-space-sm shadow-[0_0_24px_rgba(76,215,246,0.3)] active:scale-95 transition-transform" type="button">
              <span className="material-symbols-outlined text-[24px]">graphic_eq</span>
              <span>Toca o simplemente empieza a hablar</span>
            </button>
          </div>

          {/* PORTAL B: Visual Touch Kiosk Exploration */}
          <div 
            onClick={onNavigate}
            className="relative group bg-surface-container-low rounded-xl p-space-xl flex flex-col justify-between shadow-xl transition-all duration-300 hover:scale-[1.01] overflow-hidden cursor-pointer"
          >
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/15 rounded-full blur-2xl pointer-events-none transition-all duration-500 group-hover:bg-primary/25"></div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-40 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="flex items-center justify-between gap-space-md">
              <div className="inline-flex items-center gap-space-xs bg-primary/10 px-space-sm py-space-xs rounded-full">
                <span className="material-symbols-outlined text-primary text-[20px]">touch_app</span>
                <span className="font-label-code text-label-code text-primary uppercase font-bold tracking-wider">Exploración Táctil</span>
              </div>
              <span className="font-label-code text-label-code bg-surface-container px-space-sm py-space-2xs text-on-surface-variant rounded-full uppercase tracking-wider">
                Navegación Clásica • Butacas & Candy Bar
              </span>
            </div>
            
            <div className="my-space-md space-y-space-xs">
              <div className="flex items-center justify-between">
                <span className="font-label-code text-label-code text-outline uppercase tracking-wider">Películas en Sala Hoy:</span>
                <span className="font-label-code text-label-code text-primary flex items-center gap-space-2xs">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span> 14 FORMATOS ACTIVOS
                </span>
              </div>
              <div className="grid grid-cols-4 gap-space-sm">
                <div className="relative rounded-lg overflow-hidden bg-surface-container-highest shadow-md group/poster">
                  <div className="aspect-[2/3] w-full bg-cover bg-center" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCJ5qhMITiLoH-PieMYRvSrdDGyC_D6fD-skfNE-GzFRhGXzLiqsdjBRM4Y-gd_7mpt5-y5OnvDi2aDK9R0GRto4LGaHSQvX9WLxP2-F_fCrfVrCtjgJWF7eCeGr8QGGnUPS26EgNOZ1lWj2Hm9orVspdIyM2JzSuTDlLNC05wotFoeD1cpM4F0zJuw2gJrJLuplt-d6SMudbzMOovHRps_Q4vVUVelPOXgNSi5j58Tps0vyQsGUK56kA')"}}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent flex flex-col justify-end p-space-xs">
                    <span className="font-label-code text-label-code bg-surface-container-lowest/90 text-primary px-space-2xs py-0.5 rounded font-bold self-start mb-0.5">IMAX</span>
                    <span className="font-body-sm text-body-sm font-bold text-on-surface truncate">Duna: Parte Dos</span>
                  </div>
                </div>
                <div className="relative rounded-lg overflow-hidden bg-surface-container-highest shadow-md group/poster">
                  <div className="aspect-[2/3] w-full bg-cover bg-center" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDLMu3ASvIClRKbh30yVLdk8HzCRPK6HSeKxDuWw2LU6ft7u-ZNXPo5hjM-QpJbVlVyXkhVpGS8NRrSzdEBC0EVXyugZJiA0QZNHHGvxVig6zA1XG7FioMd1aB2faRk16O2Znn1wP6qhWCHXn82M7M-0JsHK00wzUyTPPMwVVD5iQr_VhcQkgVRanvkkwJerjiRBNY3hOaDf675xlyI0fTPQRPHqxgt6qvgdD4gXcc3j1cs_ec41lxLMg')"}}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent flex flex-col justify-end p-space-xs">
                    <span className="font-label-code text-label-code bg-secondary-container text-on-secondary-container px-space-2xs py-0.5 rounded font-bold self-start mb-0.5">4DX</span>
                    <span className="font-body-sm text-body-sm font-bold text-on-surface truncate">Spider-Man</span>
                  </div>
                </div>
                <div className="relative rounded-lg overflow-hidden bg-surface-container-highest shadow-md group/poster">
                  <div className="aspect-[2/3] w-full bg-cover bg-center" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAl39onyeVLK_HAlppWt0muGuFsV3GRtNByq9MsoaU1Wf0ICC5lGKi6x4zmOQZtYn0qayAEsUSJ8hbqnzNBYZBoAcrYhtV4R3N8a0bPO6lMpyKKu7QpkoCxlHfBXC8cCypNs_okWIfNK8m6c9A66k8LP283OA1mKMkuFpG2df1nW6zVwX3a6ciWOCzoRFCsfSXyYCyQPMCLzuTSwmIwnFF7b5jKBYALGlBheWNoZfTMqqOQj88_Xoz2bw')"}}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent flex flex-col justify-end p-space-xs">
                    <span className="font-label-code text-label-code bg-surface-container-lowest/90 text-primary px-space-2xs py-0.5 rounded font-bold self-start mb-0.5">70MM</span>
                    <span className="font-body-sm text-body-sm font-bold text-on-surface truncate">Oppenheimer</span>
                  </div>
                </div>
                <div className="relative rounded-lg overflow-hidden bg-surface-container-highest shadow-md group/poster">
                  <div className="aspect-[2/3] w-full bg-cover bg-center" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDxrOWNF4E3WJgUq2_BwfUfGwS_mwsP4aDXp_lcOOICn9G59KEqQMnLxYro1hJB8EImmA8hBW2WLDF_u1flAcrq7Yj23WcVecxCKxMBu9-_epcG3Nma5DlwSku8KkylXBu-3f9pUDnq3piV-j6FWPeTxKN7aKR2vtK4VIgbAtcsAvYToToTQqgA800ETG6rOFI1yVZkZ-SksciyovSvyasXC3hPk8Ss5D_BzhzNLtr_yb2fzYFhUAJMpw')"}}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent flex flex-col justify-end p-space-xs">
                    <span className="font-label-code text-label-code bg-surface-container-lowest/90 text-tertiary px-space-2xs py-0.5 rounded font-bold self-start mb-0.5">ATMOS</span>
                    <span className="font-body-sm text-body-sm font-bold text-on-surface truncate">El Viaje de Chihiro</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-space-2xs text-center lg:text-left">
              <h2 className="font-headline-lg text-headline-lg text-on-surface">Explorar Cartelera Táctil</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Visualiza salas interactivas, selecciona butacas específicas en el mapa curvo y añade palomitas en combo gourmet.
              </p>
            </div>
            
            <button className="mt-space-md w-full h-[60px] bg-primary-container text-on-primary-container rounded-lg font-headline-sm text-headline-sm flex items-center justify-center gap-space-sm shadow-[0_0_24px_rgba(245,158,11,0.35)] active:scale-95 transition-transform" type="button">
              <span>Ver Películas y Horarios</span>
              <span className="material-symbols-outlined text-[24px]">arrow_forward</span>
            </button>
          </div>
        </div>
        
        {/* SECTION 3: Bottom Identification Strip & Accessible Auxiliary Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-space-md items-center bg-surface-container-lowest/85 backdrop-blur-lg p-space-md rounded-xl shadow-lg mt-auto">
          <div className="md:col-span-6 flex items-center gap-space-md">
            <div className="w-14 h-14 shrink-0 rounded-xl bg-surface-container flex items-center justify-center text-primary shadow-sm">
              <span className="material-symbols-outlined text-[32px] animate-pulse">contactless</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-space-xs">
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold truncate">Membresía Cinéfilo Club</span>
                <span className="font-label-code text-label-code bg-primary/10 text-primary px-space-xs py-0.5 rounded">OPCIONAL</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                Acerca tu tarjeta NFC o escanea tu QR para acumular puntos o descargar boletos comprados en la app.
              </p>
            </div>
            <button className="shrink-0 h-11 px-space-md bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-lg font-label-lg text-label-lg flex items-center gap-space-xs transition-colors" type="button">
              <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
              <span>Escanear QR</span>
            </button>
          </div>
          
          <div className="md:col-span-4 flex items-center justify-start md:justify-center gap-space-sm">
            <button aria-label="Ajustar Contraste Visual" className="h-11 px-space-sm bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface rounded-lg flex items-center gap-space-xs transition-colors" type="button">
              <span className="material-symbols-outlined text-[18px]">contrast</span>
              <span className="font-label-md text-label-md">Alto Contraste</span>
            </button>
            <button aria-label="Asistencia de Audio y Volumen" className="h-11 px-space-sm bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface rounded-lg flex items-center gap-space-xs transition-colors" type="button">
              <span className="material-symbols-outlined text-[18px]">volume_up</span>
              <span className="font-label-md text-label-md">Volumen Kiosco</span>
            </button>
            <button aria-label="Ajuste Altura Silla de Ruedas" className="h-11 w-11 bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface rounded-lg flex items-center justify-center transition-colors" type="button">
              <span className="material-symbols-outlined text-[20px]">accessible</span>
            </button>
          </div>
          
          <div className="md:col-span-2 flex justify-end">
            <button 
              className="group flex items-center gap-space-2xs text-outline hover:text-on-surface transition-colors p-space-xs rounded-lg" 
              type="button"
            >
              <span className="material-symbols-outlined text-[18px] group-hover:rotate-45 transition-transform">settings</span>
              <span className="font-label-code text-label-code uppercase tracking-wider">Modo Técnico</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

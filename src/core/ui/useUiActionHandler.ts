import { useCallback, useRef, type MutableRefObject } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCine } from '../../controllers/CineContext';
import type { DestinoNavegacion, UiAction } from '../types/voice.types';
import { useUiControl } from './UiControlContext';
import { useVentanas } from './VentanasContext';

export type ModoInteraccion = 'tactil' | 'hibrido' | 'voz';

const RUTAS: Partial<Record<DestinoNavegacion, string>> = {
  inicio: '/',
  cartelera: '/cartelera',
  mis_compras: '/mis-compras',
};

/** Pasos de `/compra` (ver ProcesoCompra.tsx): cada uno es un valor de `estadoCompra`. */
const PASOS_COMPRA: Partial<Record<DestinoNavegacion, 'seleccionando_asientos' | 'seleccionando_candybar' | 'pago'>> = {
  asientos: 'seleccionando_asientos',
  candybar: 'seleccionando_candybar',
  pago: 'pago',
};

/** Pestañas de la consola de administrador (ver AdminConsole.tsx). */
const TABS_ADMIN: Partial<Record<DestinoNavegacion, string>> = {
  admin_cartelera: 'cartelera',
  admin_reportes: 'reportes',
  admin_promos: 'promos',
  admin_dulceria: 'dulceria',
  admin_usuarios: 'usuarios',
  admin_auditoria: 'auditoria',
  admin_salas: 'salas',
};

const RUTA_ADMIN = '/admin/console';

const esperar = (ms: number) => new Promise<void>((resolver) => setTimeout(resolver, ms));

/**
 * Traduce las acciones de interfaz que manda el agente (`ui_action`, ver back_agent/app/ui_actions.py) a lo que
 * la app ya sabe hacer: navegar con el router, mover el estado de la compra (`CineContext`), cambiar de pestaña del
 * admin, filtrar/resaltar la cartelera y abrir/cerrar ventanas. Es DETERMINISTA: el modelo de lenguaje no decide la interfaz.
 *
 * Las acciones de un turno se ejecutan EN ORDEN y en serie (una cola): algunas esperan (ej. dejar ver la película y el
 * horario resaltados antes de pasar a los asientos), y un turno nuevo no debe pisar a uno que todavía se está mostrando.
 *
 * En "Solo Voz" no hay pantalla que mover: ahi solo se actualiza el estado de la compra (asi, si el usuario pasa
 * despues al modo tactil, ya encuentra su carrito) pero no se navega, no se resalta nada ni se abren ventanas.
 */
export function useUiActionHandler(modoRef: MutableRefObject<ModoInteraccion>): (acciones: UiAction[]) => void {
  const navigate = useNavigate();
  const location = useLocation();
  const { dispatch } = useCine();
  const control = useUiControl();
  const ventanas = useVentanas();

  // La ruta actual se lee por ref: el manejador se llama desde un evento del WebSocket, no desde un render.
  const rutaRef = useRef(location.pathname);
  rutaRef.current = location.pathname;
  const colaRef = useRef<Promise<void>>(Promise.resolve());

  const ejecutar = useCallback(
    async (acciones: UiAction[]) => {
      const conPantalla = modoRef.current === 'hibrido';
      const irA = (ruta: string) => {
        if (conPantalla && rutaRef.current !== ruta) navigate(ruta);
      };

      for (const accion of acciones) {
        switch (accion.tipo) {
          // ---- estado de la compra (se aplica en todos los modos)
          case 'compra.seleccionar_funcion':
            ventanas.cerrar('ticket'); // arranca otra compra: el comprobante de la anterior ya no corresponde
            dispatch({ type: 'SELECCIONAR_PELICULA', payload: { pelicula: accion.pelicula, horario: accion.horario } });
            dispatch({ type: 'SET_FUNCION_SELECCIONADA', payload: accion.funcion });
            break;
          case 'compra.seleccionar_butacas':
            dispatch({ type: 'SET_BUTACAS', payload: accion.butacas });
            break;
          case 'compra.candybar':
            dispatch({ type: 'SET_CANDYBAR', payload: accion.items });
            break;
          case 'compra.completada':
            ventanas.cerrar('confirmacion'); // ya se pagó: no queda nada por confirmar (el servidor también lo cierra)
            if (accion.venta) dispatch({ type: 'SET_VENTA_CREADA', payload: accion.venta });
            dispatch({ type: 'SET_ESTADO_COMPRA', payload: 'completado' });
            irA('/compra');
            break;
          case 'compra.reiniciar':
            ventanas.cerrar('confirmacion');
            ventanas.cerrar('ticket');
            dispatch({ type: 'RESETEAR_COMPRA' });
            break;

          // ---- lo que necesita pantalla
          case 'navegar': {
            const paso = PASOS_COMPRA[accion.destino];
            const tab = TABS_ADMIN[accion.destino];
            if (paso) {
              dispatch({ type: 'SET_ESTADO_COMPRA', payload: paso });
              irA('/compra');
            } else if (tab) {
              if (conPantalla) control.pedirAdminTab(tab);
              irA(RUTA_ADMIN);
            } else if (RUTAS[accion.destino]) {
              ventanas.cerrar('ticket'); // se sale de la compra: el comprobante no tiene que quedar flotando sobre otra pantalla
              irA(RUTAS[accion.destino]!);
            }
            break;
          }
          case 'cartelera.filtrar':
            if (conPantalla) control.filtrarCartelera({ busqueda: accion.busqueda, dia: accion.dia });
            break;
          case 'cartelera.mostrar':
            if (!conPantalla) break;
            // Si ya esta en los asientos y solo cambia la funcion, no se lo saca de ahi para mostrar la cartelera.
            if (accion.omitir_en_compra && rutaRef.current === '/compra') break;
            ventanas.cerrar('ticket');
            control.filtrarCartelera({ busqueda: null, dia: null }); // que ningun filtro anterior oculte lo que se va a mostrar
            control.resaltarCartelera(accion.ids, accion.idFuncion ?? null);
            irA('/cartelera');
            if (accion.pausa_ms) await esperar(accion.pausa_ms); // se ve la eleccion un momento antes de seguir
            break;
          case 'admin.abrir_tab':
            if (conPantalla) {
              control.pedirAdminTab(accion.tab);
              irA(RUTA_ADMIN);
            }
            break;
          case 'admin.refrescar':
            if (conPantalla) control.refrescar(accion.tab);
            break;
          case 'admin.resaltar':
            if (conPantalla) {
              control.pedirAdminTab(accion.tab);
              control.resaltarAdmin(accion.entidad, accion.id);
              irA(RUTA_ADMIN);
            }
            break;
          case 'ventana.abrir':
            if (conPantalla) ventanas.abrir(accion.ventana, accion.datos);
            break;
          case 'ventana.cerrar':
            ventanas.cerrar(accion.ventana);
            break;
          default:
            break;
        }
      }
    },
    [modoRef, navigate, dispatch, control, ventanas],
  );

  return useCallback(
    (acciones: UiAction[]) => {
      colaRef.current = colaRef.current.then(() => ejecutar(acciones)).catch((error) => console.error('[ui_action]', error));
    },
    [ejecutar],
  );
}

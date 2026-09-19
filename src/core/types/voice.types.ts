import type { Pelicula } from './pelicula.types';
import type { Funcion } from './funcion.types';
import type { Butaca, ItemCandyBarSeleccionado } from './compra.types';
import type { Venta } from './venta.types';

/** Mismos valores que devuelve `orquestador.procesar()` en back_agent (ver ESTADO-IMPLEMENTACION.md). */
export type VoiceResponseType =
  | 'respuesta_texto'
  | 'resultado_consulta'
  | 'confirmacion_pendiente'
  | 'accion_confirmada'
  /** Un paso de la compra por voz (elegir funcion, asientos o dulceria): ver compra_voz.py. */
  | 'compra_paso';

/** Misma forma que `AccionPropuesta` en back_agent/app/schemas.py — el "contrato compartido con el ia-gateway". */
export interface AccionPropuesta {
  rol: 'cliente' | 'administrador';
  intencion: string;
  entidad: string;
  payload: Record<string, unknown>;
  evidencia_confirmacion: boolean;
  /** Lo que se le lee al usuario al pedir la confirmacion (para la venta incluye el aviso de no reembolso). */
  resumen?: string | null;
}

/** Payload de `consultar_cartelera` (back_agent/app/tools/cliente.py) cuando `tipo === 'resultado_consulta'`. */
export interface DatosConsultaCartelera {
  peliculas?: Pelicula[];
  error?: string;
  detalle?: string;
}

// --------------------------------------------------------------------------- acciones de interfaz (RF18)

export type DestinoNavegacion =
  | 'inicio'
  | 'cartelera'
  | 'mis_compras'
  | 'asientos'
  | 'candybar'
  | 'pago'
  | 'admin_cartelera'
  | 'admin_reportes'
  | 'admin_promos'
  | 'admin_dulceria'
  | 'admin_usuarios'
  | 'admin_auditoria'
  | 'admin_salas';

export type TipoVentana = 'confirmacion' | 'reporte' | 'ticket';

/**
 * Lo que la pantalla debe hacer mientras el agente habla. Las deriva el backend de forma DETERMINISTA del
 * resultado de cada herramienta (el LLM no decide la interfaz): ver back_agent/app/ui_actions.py, que es el
 * espejo de este tipo — si cambia uno, cambia el otro. Llegan como una lista ordenada en el evento `ui_action`.
 */
export type UiAction =
  | { tipo: 'navegar'; destino: DestinoNavegacion }
  | { tipo: 'cartelera.filtrar'; busqueda?: string | null; dia?: string | null }
  /** Lleva a la cartelera y RESALTA la(s) pelicula(s) y, si ya se eligio, el horario; espera `pausa_ms` para que se vea. */
  | { tipo: 'cartelera.mostrar'; ids: number[]; idFuncion?: number; pausa_ms?: number; omitir_en_compra?: boolean }
  | { tipo: 'compra.seleccionar_funcion'; pelicula: Pelicula; funcion: Funcion; horario: string }
  | { tipo: 'compra.seleccionar_butacas'; butacas: Butaca[] }
  | { tipo: 'compra.candybar'; items: ItemCandyBarSeleccionado[] }
  | { tipo: 'compra.completada'; venta: Venta | null }
  | { tipo: 'compra.reiniciar' }
  /** Saca la pelicula y lo que depende de ella (funcion, butacas); la dulceria se queda. */
  | { tipo: 'compra.quitar_pelicula' }
  /** Suelta la funcion y las butacas y deja la pelicula (cambio de horario). */
  | { tipo: 'compra.quitar_funcion' }
  | { tipo: 'admin.abrir_tab'; tab: string }
  | { tipo: 'admin.refrescar'; tab: string }
  /** Señala en la consola la fila que el agente acaba de crear o cambiar (cambia de sub-pestaña si hace falta y la centra). */
  | { tipo: 'admin.resaltar'; tab: string; entidad: 'pelicula' | 'funcion' | 'promocion' | 'precio'; id: number }
  | { tipo: 'ventana.abrir'; ventana: TipoVentana; datos: Record<string, unknown> }
  | { tipo: 'ventana.cerrar'; ventana: TipoVentana };

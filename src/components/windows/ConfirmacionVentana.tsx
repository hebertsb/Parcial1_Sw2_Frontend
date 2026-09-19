import { useState } from 'react';
import { VOICE_API_URL } from '../../api/voice.api';

interface CampoConfirmacion {
  etiqueta: string;
  valor: string;
}

export interface DatosConfirmacion {
  titulo?: string;
  resumen?: string;
  /** Portada que se va a cargar (la sirve el agente, ej. "/portadas/coco.jpg"): se ve ANTES de confirmar. */
  imagen?: string;
  campos?: CampoConfirmacion[];
  total?: number;
  metodoPago?: string;
  /** Aviso de no reembolso (RF03): solo lo trae la compra. */
  aviso?: string;
  texto?: string;
}

interface ConfirmacionVentanaProps {
  datos: DatosConfirmacion;
  onCancelar: () => void;
  /** Solo las acciones de gestion tienen boton de confirmar; la compra se confirma HABLANDO (RF19). */
  onConfirmar?: () => void;
}

/** Un valor largo (ej. la sinopsis) no cabe en una fila "etiqueta ... valor": va en su propio renglon, debajo de la etiqueta. */
const ES_LARGO = 48;

const Etiqueta = ({ children }: { children: string }) => (
  <dt className="font-label-code text-label-code text-on-surface-variant uppercase tracking-wider">{children}</dt>
);

/**
 * Lo que el agente esta por hacer, para revisarlo antes de decir "confirmo" (RF03/RF19/RF06/RF07). La compra de
 * entradas SOLO se confirma hablando: el "confirmo" dicho es la evidencia que el backend exige (RF19), asi que ahi
 * no hay boton de confirmar, solo de cancelar. Las acciones de gestion del administrador si se pueden confirmar tocando.
 */
export const ConfirmacionVentana = ({ datos, onCancelar, onConfirmar }: ConfirmacionVentanaProps) => {
  const campos = datos.campos ?? [];
  const cortos = campos.filter((campo) => campo.valor.length <= ES_LARGO);
  const largos = campos.filter((campo) => campo.valor.length > ES_LARGO);
  const [imagenRota, setImagenRota] = useState(false);
  // La ruta es relativa al servicio de voz (que es quien tiene la carpeta de portadas).
  const imagen = datos.imagen && !imagenRota ? (datos.imagen.startsWith('/') ? `${VOICE_API_URL}${datos.imagen}` : datos.imagen) : null;

  return (
    <div className="flex flex-col gap-space-md">
      {datos.resumen && <p className="font-body-md text-body-md text-on-surface leading-snug">{datos.resumen}</p>}

      {(imagen || cortos.length > 0) && (
        // Con portada, va AL LADO de los datos: asi la ventana no crece tanto y los botones siguen a la vista.
        <div className="flex items-start gap-space-md">
          {imagen && (
            <img
              data-testid="confirmacion-portada"
              src={imagen}
              alt="Portada de la película"
              onError={() => setImagenRota(true)}
              className="w-24 shrink-0 rounded-xl shadow-lg object-cover aspect-2/3 bg-surface-container-highest"
            />
          )}
          {cortos.length > 0 && (
            <dl className="flex-1 min-w-0 flex flex-col gap-space-2xs rounded-xl bg-surface-container-lowest/60 p-space-sm">
              {cortos.map((campo) => (
                <div key={campo.etiqueta} className="flex items-baseline justify-between gap-space-md">
                  <Etiqueta>{campo.etiqueta}</Etiqueta>
                  <dd className="font-body-md text-body-md text-on-surface font-bold text-right">{campo.valor}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}

      {largos.length > 0 && (
        <dl className="flex flex-col gap-space-xs rounded-xl bg-surface-container-lowest/60 p-space-sm">
          {largos.map((campo) => (
            <div key={campo.etiqueta} className="flex flex-col gap-space-2xs">
              <Etiqueta>{campo.etiqueta}</Etiqueta>
              <dd className="font-body-md text-body-md text-on-surface leading-snug">{campo.valor}</dd>
            </div>
          ))}
        </dl>
      )}

      {typeof datos.total === 'number' && datos.total > 0 && (
        <div className="flex items-center justify-between rounded-xl bg-primary-container/15 px-space-md py-space-sm">
          <span className="font-label-code text-label-code text-on-surface-variant uppercase tracking-wider">
            Total{datos.metodoPago ? ` · ${datos.metodoPago}` : ''}
          </span>
          <span className="font-headline-sm text-headline-sm text-primary font-bold">{datos.total.toFixed(2)} Bs</span>
        </div>
      )}

      {datos.aviso && (
        <div className="flex items-start gap-space-xs rounded-xl bg-error-container/25 px-space-md py-space-sm text-error">
          <span className="material-symbols-outlined text-[20px] shrink-0">gpp_maybe</span>
          <span className="font-label-md text-label-md font-bold">{datos.aviso}</span>
        </div>
      )}

      <p className="font-label-code text-label-code text-primary uppercase tracking-widest font-bold text-center">Decí «confirmo» para continuar</p>

      {/* Pegada al borde de abajo: si la ventana no entra en la pantalla y el contenido se desplaza, Cancelar/Confirmar no se pierden. */}
      <div className="sticky bottom-0 -mx-space-md -mb-space-md flex items-center justify-end gap-space-sm bg-surface-container px-space-md py-space-xs">
        <button
          type="button"
          onClick={onCancelar}
          className="px-space-lg py-space-xs rounded-full bg-surface-container-highest hover:bg-error-container hover:text-on-error-container text-on-surface font-label-md text-label-md transition-colors"
        >
          Cancelar
        </button>
        {onConfirmar && (
          <button
            type="button"
            onClick={onConfirmar}
            className="px-space-lg py-space-xs rounded-full bg-primary-container text-on-primary-container font-label-md text-label-md font-bold shadow-[0_0_16px_rgba(245,158,11,0.35)] hover:brightness-110 transition-all"
          >
            Confirmar
          </button>
        )}
      </div>
    </div>
  );
};

import { useEffect, useState } from 'react';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { obtenerConfiguracionPagos } from '../../api/pagos.api';
import type { ConfiguracionPagos } from '../types/pago.types';

/** La configuración se pide una sola vez por carga de la página (la comparten todas las pantallas de pago). */
let configEnCurso: Promise<ConfiguracionPagos> | null = null;
const stripePorClave = new Map<string, Promise<Stripe | null>>();

/** Carga Stripe.js una sola vez por clave publicable, con los mensajes en español. Devuelve null si no se pudo cargar (ej. sin internet). */
export function stripePara(clavePublicable: string): Promise<Stripe | null> {
  let promesa = stripePorClave.get(clavePublicable);
  if (!promesa) {
    promesa = loadStripe(clavePublicable, { locale: 'es' }).catch(() => null);
    stripePorClave.set(clavePublicable, promesa);
  }
  return promesa;
}

export interface EstadoConfigPagos {
  cargando: boolean;
  /** null si el backend no informó (caído) o si Stripe no está configurado en el servidor: en ambos casos solo hay efectivo. */
  stripe: ConfiguracionPagos['stripe'] | null;
}

/** ¿Está disponible el pago con tarjeta y con qué clave? Pregunta al backend, así el frontend no necesita ninguna variable de entorno de Stripe. */
export function useConfigPagos(): EstadoConfigPagos {
  const [estado, setEstado] = useState<EstadoConfigPagos>({ cargando: true, stripe: null });

  useEffect(() => {
    let vivo = true;
    configEnCurso ??= obtenerConfiguracionPagos();
    configEnCurso
      .then((config) => vivo && setEstado({ cargando: false, stripe: config.stripe.habilitado ? config.stripe : null }))
      .catch(() => {
        configEnCurso = null; // que la próxima vez vuelva a preguntar
        if (vivo) setEstado({ cargando: false, stripe: null });
      });
    return () => {
      vivo = false;
    };
  }, []);

  return estado;
}

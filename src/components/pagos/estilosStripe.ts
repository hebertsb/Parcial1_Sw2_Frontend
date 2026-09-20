import type { StripeElementStyle } from '@stripe/stripe-js';

/**
 * Estilo de los campos de tarjeta de Stripe, que viven en iframes (por eso no heredan el CSS de la app): mismo texto claro sobre el
 * vidrio oscuro del formulario. La fuente se carga en el iframe con `FUENTES_STRIPE` (ver `Elements` en SeccionPago.tsx).
 */
export const ESTILO_CAMPO_STRIPE: StripeElementStyle = {
  base: {
    color: '#f4efe8',
    fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
    fontSize: '17px',
    fontWeight: '500',
    fontSmoothing: 'antialiased',
    letterSpacing: '0.06em',
    iconColor: '#ffc174',
    '::placeholder': { color: 'rgba(216, 195, 173, 0.42)' },
  },
  invalid: { color: '#ffb4ab', iconColor: '#ffb4ab' },
};

export const FUENTES_STRIPE = [
  { cssSrc: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600&display=swap' },
];

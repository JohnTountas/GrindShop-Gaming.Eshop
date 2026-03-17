/**
 * Footer message event helpers for checkout.
 */
import { FOOTER_MESSAGE_EVENT } from '../constants';

export type CheckoutFooterMessage = 'termsOfService' | 'privacySecurity';

export function dispatchCheckoutFooterMessage(message: CheckoutFooterMessage) {
  window.dispatchEvent(
    new CustomEvent(FOOTER_MESSAGE_EVENT, {
      detail: message,
    })
  );
}

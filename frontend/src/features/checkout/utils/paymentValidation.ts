/**
 * Pure checkout payment validation rules.
 */
import type { CardPaymentDetails, PaymentMethod } from '../types';
import { isValidCardNumber, isValidEmail, isValidExpiry } from './validators';

interface ValidateCheckoutPaymentStepArgs {
  isShippingComplete: boolean;
  hasAuthorizedPayment: boolean;
  hasAcceptedPolicies: boolean;
  selectedPaymentMethod: PaymentMethod;
  cardDetails: CardPaymentDetails;
  walletEmail: string;
  bankTransferReference: string;
}

export function validateCheckoutPaymentStep({
  isShippingComplete,
  hasAuthorizedPayment,
  hasAcceptedPolicies,
  selectedPaymentMethod,
  cardDetails,
  walletEmail,
  bankTransferReference,
}: ValidateCheckoutPaymentStepArgs) {
  if (!isShippingComplete) {
    return 'Please complete all shipping fields before payment confirmation.';
  }

  if (!hasAuthorizedPayment) {
    return 'You must authorize the payment amount to continue.';
  }

  if (!hasAcceptedPolicies) {
    return 'You must accept the Terms of Service and Privacy Policy to continue.';
  }

  if (selectedPaymentMethod === 'CARD') {
    if (!cardDetails.holderName.trim()) {
      return 'Cardholder name is required.';
    }
    if (!isValidCardNumber(cardDetails.number)) {
      return 'Enter a valid card number.';
    }
    if (!isValidExpiry(cardDetails.expiry)) {
      return 'Enter a valid card expiry in MM/YY format.';
    }
    if (!/^\d{3,4}$/.test(cardDetails.cvv)) {
      return 'Enter a valid card security code.';
    }
    return '';
  }

  if (selectedPaymentMethod === 'BANK_TRANSFER') {
    if (bankTransferReference.trim().length < 6) {
      return 'Bank transfer reference must be at least 6 characters.';
    }
    return '';
  }

  if (!isValidEmail(walletEmail)) {
    return 'Enter a valid wallet email address.';
  }

  return '';
}

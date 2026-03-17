/**
 * Stable initial values and shared field styling for checkout.
 */
import type { ShippingAddress } from '@/shared/types';
import type { CardPaymentDetails } from '../types';

export const INITIAL_SHIPPING_ADDRESS: ShippingAddress = {
  fullName: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  country: '',
  phone: '',
};

export const INITIAL_CARD_DETAILS: CardPaymentDetails = {
  holderName: '',
  number: '',
  expiry: '',
  cvv: '',
};

const INPUT_BASE_CLASS =
  'mt-1.5 block w-full rounded-xl border px-3 py-2.5 text-sm text-primary-900 focus:outline-none';
const INPUT_DEFAULT_CLASS =
  'border-primary-300/70 bg-primary-100/72 placeholder:text-primary-600 focus:border-accent-700';
const INPUT_MISSING_CLASS =
  'border-red-300 bg-red-50 placeholder:text-red-500 focus:border-red-500';

export function isNumericShippingField(key: keyof ShippingAddress) {
  return key === 'zipCode' || key === 'phone';
}

export function getCheckoutInputClass(
  _value: string,
  highlightMissing: boolean,
  isMissingValue: boolean
) {
  return `${INPUT_BASE_CLASS} ${
    highlightMissing && isMissingValue ? INPUT_MISSING_CLASS : INPUT_DEFAULT_CLASS
  }`;
}

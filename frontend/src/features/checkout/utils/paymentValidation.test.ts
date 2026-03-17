import { describe, expect, it } from 'vitest';
import { validateCheckoutPaymentStep } from './paymentValidation';

const baseArgs = {
  isShippingComplete: true,
  hasAuthorizedPayment: true,
  hasAcceptedPolicies: true,
  selectedPaymentMethod: 'CARD' as const,
  cardDetails: {
    holderName: 'Jane Doe',
    number: '4242424242424242',
    expiry: '12/30',
    cvv: '123',
  },
  walletEmail: '',
  bankTransferReference: '',
};

describe('validateCheckoutPaymentStep', () => {
  it('returns an error when shipping is incomplete', () => {
    expect(
      validateCheckoutPaymentStep({
        ...baseArgs,
        isShippingComplete: false,
      })
    ).toBe('Please complete all shipping fields before payment confirmation.');
  });

  it('returns an error for invalid card details', () => {
    expect(
      validateCheckoutPaymentStep({
        ...baseArgs,
        cardDetails: {
          ...baseArgs.cardDetails,
          number: '1234',
        },
      })
    ).toBe('Enter a valid card number.');
  });

  it('validates bank-transfer references separately', () => {
    expect(
      validateCheckoutPaymentStep({
        ...baseArgs,
        selectedPaymentMethod: 'BANK_TRANSFER',
        bankTransferReference: 'abc',
      })
    ).toBe('Bank transfer reference must be at least 6 characters.');
  });

  it('accepts a valid wallet payment', () => {
    expect(
      validateCheckoutPaymentStep({
        ...baseArgs,
        selectedPaymentMethod: 'PAYPAL',
        walletEmail: 'player@example.com',
      })
    ).toBe('');
  });
});

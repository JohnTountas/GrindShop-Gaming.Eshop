/**
 * Checkout workflow hook.
 *
 * It keeps form state, payment orchestration, and post-purchase navigation in
 * one place while delegating pure rules to smaller helpers.
 */
import { useQueryClient } from '@tanstack/react-query';
import { type FormEvent, type MouseEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { persistGuestOrder } from '@/features/orders/utils/guestOrderStorage';
import { clearGuestCart } from '@/shared/cart/guestCart';
import type { CartItem } from '@/shared/types';
import { showSuccessMessage } from '@/shared/ui/toast';
import { PAYMENT_OPTIONS } from '../constants';
import {
  getCheckoutInputClass,
  INITIAL_CARD_DETAILS,
  INITIAL_SHIPPING_ADDRESS,
  isNumericShippingField,
} from '../config/checkoutDefaults';
import type { CardPaymentDetails, PaymentMethod } from '../types';
import { buildPaymentIntentId } from '../utils/buildPaymentIntentId';
import {
  buildPaymentPreview,
  calculateCheckoutTotals,
  getPaymentFingerprintSource,
  isShippingAddressComplete,
} from '../utils/checkoutCalculations';
import { applySuccessfulCheckoutCacheUpdates } from '../utils/checkoutCache';
import { dispatchCheckoutFooterMessage, type CheckoutFooterMessage } from '../utils/footerMessages';
import { digitsOnly, formatCardExpiry } from '../utils/formatters';
import { validateCheckoutPaymentStep } from '../utils/paymentValidation';
import { useCreateOrder } from './useCreateOrder';

interface UseCheckoutFlowOptions {
  authed: boolean;
  items: CartItem[];
}

export function useCheckoutFlow({ authed, items }: UseCheckoutFlowOptions) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(INITIAL_SHIPPING_ADDRESS);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('CARD');
  const [cardDetails, setCardDetails] = useState<CardPaymentDetails>(INITIAL_CARD_DETAILS);
  const [walletEmail, setWalletEmail] = useState('');
  const [bankTransferReference, setBankTransferReference] = useState('');
  const [hasAuthorizedPayment, setHasAuthorizedPayment] = useState(false);
  const [hasAcceptedPolicies, setHasAcceptedPolicies] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showMissingFieldHints, setShowMissingFieldHints] = useState(false);

  const selectedPaymentOption =
    PAYMENT_OPTIONS.find((option) => option.id === selectedPaymentMethod) ?? PAYMENT_OPTIONS[0];

  const createOrderMutation = useCreateOrder({
    onSuccess: async (order) => {
      if (authed) {
        await applySuccessfulCheckoutCacheUpdates(queryClient, order);
      }

      showSuccessMessage({
        title: 'Order placed successfully',
        message: `Thank you for choosing GrindSpot. Your order is confirmed and our team is preparing it for fast dispatch. Payment authorized with ${selectedPaymentOption.label}.`,
        tone: 'success',
        placement: 'center',
        durationMs: 9000,
      });

      if (!authed) {
        persistGuestOrder(order);
        clearGuestCart();
        navigate(`/checkout/success/${order.id}`);
        return;
      }

      navigate('/orders', {
        state: {
          highlightOrderId: order.id,
        },
      });
    },
    onError: (message) => {
      setErrorMessage(message);
    },
  });

  const totals = calculateCheckoutTotals(items);
  const isShippingComplete = isShippingAddressComplete(form);
  const paymentInputsLocked = !isShippingComplete || createOrderMutation.isPending;

  function clearValidationMessage() {
    setErrorMessage('');
  }

  const paymentPreview = buildPaymentPreview({
    selectedPaymentMethod,
    cardDetails,
    walletEmail,
    bankTransferReference,
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearValidationMessage();
    setShowMissingFieldHints(true);

    const paymentValidationError = validateCheckoutPaymentStep({
      isShippingComplete,
      hasAuthorizedPayment,
      hasAcceptedPolicies,
      selectedPaymentMethod,
      cardDetails,
      walletEmail,
      bankTransferReference,
    });

    if (paymentValidationError) {
      setErrorMessage(paymentValidationError);
      return;
    }

    const paymentIntentId = buildPaymentIntentId(
      selectedPaymentMethod,
      getPaymentFingerprintSource({
        selectedPaymentMethod,
        cardDetails,
        walletEmail,
        bankTransferReference,
      })
    );

    setCardDetails((current) => ({ ...current, cvv: '' }));
    createOrderMutation.mutate({
      shippingAddress: form,
      paymentIntentId,
      guestItems: authed
        ? undefined
        : items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
    });
  }

  function updateShippingField(key: keyof typeof INITIAL_SHIPPING_ADDRESS, value: string) {
    clearValidationMessage();
    const nextValue = isNumericShippingField(key) ? digitsOnly(value) : value;
    setForm((current) => ({ ...current, [key]: nextValue }));
  }

  function updateCardField(key: keyof CardPaymentDetails, value: string) {
    clearValidationMessage();
    setCardDetails((current) => ({ ...current, [key]: value }));
  }

  function updateSelectedPaymentMethod(nextMethod: PaymentMethod) {
    clearValidationMessage();
    setSelectedPaymentMethod(nextMethod);

    if (nextMethod !== 'CARD') {
      setCardDetails((current) => ({ ...current, cvv: '' }));
    }
  }

  function updateWalletEmail(value: string) {
    clearValidationMessage();
    setWalletEmail(value);
  }

  function updateBankTransferReference(value: string) {
    clearValidationMessage();
    setBankTransferReference(value.toUpperCase());
  }

  function updateAuthorizedPayment(checked: boolean) {
    clearValidationMessage();
    setHasAuthorizedPayment(checked);
  }

  function updateAcceptedPolicies(checked: boolean) {
    clearValidationMessage();
    setHasAcceptedPolicies(checked);
  }

  function isMissingValue(value: string) {
    return showMissingFieldHints && value.trim().length === 0;
  }

  function getInputClass(value: string, highlightMissing = false) {
    return getCheckoutInputClass(value, highlightMissing, isMissingValue(value));
  }

  function openFooterMessage(event: MouseEvent<HTMLButtonElement>, message: CheckoutFooterMessage) {
    event.preventDefault();
    event.stopPropagation();
    dispatchCheckoutFooterMessage(message);
  }

  return {
    form,
    cardDetails,
    walletEmail,
    bankTransferReference,
    hasAuthorizedPayment,
    hasAcceptedPolicies,
    errorMessage,
    selectedPaymentMethod,
    selectedPaymentOption,
    paymentInputsLocked,
    paymentPreview,
    isShippingComplete,
    isSubmitting: createOrderMutation.isPending,
    totals,
    handleSubmit,
    updateShippingField,
    updateSelectedPaymentMethod,
    updateWalletEmail,
    updateBankTransferReference,
    updateAuthorizedPayment,
    updateAcceptedPolicies,
    updateCardHolderName: (value: string) => updateCardField('holderName', value),
    updateCardNumber: (value: string) => updateCardField('number', digitsOnly(value).slice(0, 19)),
    updateCardExpiry: (value: string) => updateCardField('expiry', formatCardExpiry(value)),
    updateCardCvv: (value: string) => updateCardField('cvv', digitsOnly(value).slice(0, 4)),
    isMissingValue,
    getInputClass,
    openTermsOfServiceMessage: (event: MouseEvent<HTMLButtonElement>) =>
      openFooterMessage(event, 'termsOfService'),
    openPrivacyPolicyMessage: (event: MouseEvent<HTMLButtonElement>) =>
      openFooterMessage(event, 'privacySecurity'),
  };
}

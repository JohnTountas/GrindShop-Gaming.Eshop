import type { StorefrontState } from './types';

export const guestCompareStorageKey = 'guestCompareProductIds';
export const guestCompareUpdatedEvent = 'storefront:guest-compare-updated';

export const defaultStorefrontState: StorefrontState = {
  wishlistProductIds: [],
  compareProductIds: [],
  compareLimit: 4,
};

export const twoWordBrands = new Map<string, string>([['cooler master', 'Cooler Master']]);

export const oneWordBrands: Record<string, string> = {
  vengeance: 'Vengeance',
  ajazz: 'Ajazz',
  msi: 'MSI',
  corsair: 'Corsair',
  dell: 'Dell',
  hyperx: 'HyperX',
  keychron: 'Keychron',
  lg: 'LG',
  logitech: 'Logitech',
  razer: 'Razer',
  ryzen: 'Ryzen',
  samsung: 'Samsung',
  steelseries: 'SteelSeries',
  xiaomi: 'Xiaomi',
};

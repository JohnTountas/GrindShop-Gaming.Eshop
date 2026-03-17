/**
 * Pure helpers for catalog-management query normalization.
 */
export function parseOptionalText(value: string | string[] | undefined) {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  if (Array.isArray(value)) {
    const first = value.find((item) => typeof item === 'string' && item.trim().length > 0);
    return first?.trim();
  }

  return undefined;
}

export function parseOptionalNumber(value: number | string | undefined) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

export function parsePositiveInt(value: number | string | undefined, fallback: number) {
  const parsed = parseOptionalNumber(value);
  if (parsed === undefined) {
    return fallback;
  }

  return Math.max(1, Math.trunc(parsed));
}

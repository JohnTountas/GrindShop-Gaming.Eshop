import { oneWordBrands, twoWordBrands } from '../constants';
import type { ProductLike } from '../types';

function normalizeTitleTokens(title: string): string[] {
  return title
    .replace(/[_/]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((token) => token.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, ''))
    .filter(Boolean);
}

function toTitleCase(value: string): string {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`)
    .join('-');
}

export function getProductBrand(product: ProductLike) {
  const tokens = normalizeTitleTokens(product.title);
  if (tokens.length === 0) {
    return 'Generic';
  }

  if (tokens.length > 1) {
    const firstTwoWords = `${tokens[0]} ${tokens[1]}`.toLowerCase();
    const twoWordBrand = twoWordBrands.get(firstTwoWords);
    if (twoWordBrand) {
      return twoWordBrand;
    }
  }

  const firstWord = tokens[0].toLowerCase();
  return oneWordBrands[firstWord] ?? toTitleCase(tokens[0]);
}

export function getCompatibilityTags(product: ProductLike) {
  const category = `${product.category?.name ?? ''} ${product.category?.slang ?? ''}`.toLowerCase();

  if (category.includes('desktop') || category.includes('pc')) {
    return ['PC'];
  }
  if (category.includes('monitor')) {
    return ['PC', 'PlayStation 5', 'Xbox Series X|S'];
  }
  if (category.includes('headset')) {
    return ['PC', 'PlayStation 5', 'Xbox Series X|S', 'Switch'];
  }
  if (category.includes('keyboard') || category.includes('mouse')) {
    return ['PC', 'Mac', 'PlayStation 5'];
  }

  return ['Universal'];
}

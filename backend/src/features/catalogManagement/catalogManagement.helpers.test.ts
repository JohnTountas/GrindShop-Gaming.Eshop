import { parseOptionalNumber, parseOptionalText, parsePositiveInt } from './catalogManagement.helpers';

describe('catalogManagement.helpers', () => {
  describe('parseOptionalText', () => {
    it('returns undefined for empty strings', () => {
      expect(parseOptionalText('   ')).toBeUndefined();
    });

    it('returns the first trimmed non-empty string from arrays', () => {
      expect(parseOptionalText(['', ' gaming ', 'fallback'])).toBe('gaming');
    });
  });

  describe('parseOptionalNumber', () => {
    it('parses finite numeric strings', () => {
      expect(parseOptionalNumber('42')).toBe(42);
    });

    it('returns undefined for invalid numbers', () => {
      expect(parseOptionalNumber('abc')).toBeUndefined();
    });
  });

  describe('parsePositiveInt', () => {
    it('uses the fallback for missing values', () => {
      expect(parsePositiveInt(undefined, 40)).toBe(40);
    });

    it('truncates decimals and clamps values to at least one', () => {
      expect(parsePositiveInt('3.8', 1)).toBe(3);
      expect(parsePositiveInt('0', 1)).toBe(1);
    });
  });
});

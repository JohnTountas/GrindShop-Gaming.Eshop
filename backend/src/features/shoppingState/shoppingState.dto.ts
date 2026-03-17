/**
 * Validation schemas for authenticated user shopping-state actions.
 */
import { z } from 'zod';

// Defines zod validation rules for wishlist/compare toggle payloads.
export const toggleShoppingStateProductSchema = z.object({
  body: z.object({
    productId: z.string().uuid('Invalid product ID'),
  }),
});

// TypeScript shape for wishlist/compare toggle requests after validation.
export type ToggleShoppingStateProductDTO = z.infer<typeof toggleShoppingStateProductSchema>['body'];


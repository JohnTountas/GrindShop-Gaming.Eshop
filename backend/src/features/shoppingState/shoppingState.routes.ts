/**
 * Route definitions for authenticated shopping-state endpoints.
 */
import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import * as shoppingStateController from './shoppingState.controller';
import { toggleShoppingStateProductSchema } from './shoppingState.dto';

// Express router for wishlist/compare endpoints.
const router = Router();

// All shopping-state routes require authentication.
router.use(authenticate);

router.get('/storefront', shoppingStateController.getStorefrontState);
router.get('/wishlist', shoppingStateController.getWishlist);
router.post(
  '/wishlist/toggle',
  validate(toggleShoppingStateProductSchema),
  shoppingStateController.toggleWishlist
);
router.post(
  '/compare/toggle',
  validate(toggleShoppingStateProductSchema),
  shoppingStateController.toggleCompare
);
router.delete('/compare', shoppingStateController.clearCompare);

export default router;


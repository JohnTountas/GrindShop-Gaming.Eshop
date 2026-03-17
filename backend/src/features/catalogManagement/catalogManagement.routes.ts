/**
 * Route definitions for admin catalog management.
 */
import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import * as catalogManagementController from './catalogManagement.controller';
import {
  createReviewSchema,
  createSpecificationSchema,
  deleteReviewSchema,
  deleteSpecificationSchema,
  getAdminProductContentSchema,
  listAdminProductsSchema,
  updateReviewSchema,
  updateSpecificationSchema,
} from './catalogManagement.dto';

// Express router for admin catalog endpoints.
const router = Router();

// All admin catalog routes require authentication and admin role.
router.use(authenticate, authorize('ADMIN'));

router.get('/products', validate(listAdminProductsSchema), catalogManagementController.listProducts);
router.get(
  '/products/:productId/content',
  validate(getAdminProductContentSchema),
  catalogManagementController.getProductContent
);

router.post(
  '/products/:productId/specifications',
  validate(createSpecificationSchema),
  catalogManagementController.createSpecification
);
router.patch(
  '/specifications/:specificationId',
  validate(updateSpecificationSchema),
  catalogManagementController.updateSpecification
);
router.delete(
  '/specifications/:specificationId',
  validate(deleteSpecificationSchema),
  catalogManagementController.deleteSpecification
);

router.post('/products/:productId/reviews', validate(createReviewSchema), catalogManagementController.createReview);
router.patch('/reviews/:reviewId', validate(updateReviewSchema), catalogManagementController.updateReview);
router.delete('/reviews/:reviewId', validate(deleteReviewSchema), catalogManagementController.deleteReview);

export default router;

/**
 * HTTP controllers for admin product content operations.
 */
import { Response, NextFunction } from 'express';
import { asyncHandler } from '../../middleware/error.middleware';
import { AuthRequest } from '../../middleware/auth.middleware';
import { CatalogManagementService } from './catalogManagement.service';

// Service instance used by admin catalog controllers.
const catalogManagementService = new CatalogManagementService();

// Lists products.
export const listProducts = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const result = await catalogManagementService.listProducts(req.query);
    res.json(result);
  }
);

// Retrieves product content.
export const getProductContent = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const result = await catalogManagementService.getProductContent(req.params.productId);
    res.json(result);
  }
);

// Creates specification.
export const createSpecification = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const result = await catalogManagementService.createSpecification(req.params.productId, req.body);
    res.status(201).json(result);
  }
);

// Updates specification.
export const updateSpecification = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const result = await catalogManagementService.updateSpecification(req.params.specificationId, req.body);
    res.json(result);
  }
);

// Deletes specification.
export const deleteSpecification = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const result = await catalogManagementService.deleteSpecification(req.params.specificationId);
    res.json(result);
  }
);

// Creates review.
export const createReview = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const result = await catalogManagementService.createReview(req.params.productId, req.body);
    res.status(201).json(result);
  }
);

// Updates review.
export const updateReview = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const result = await catalogManagementService.updateReview(req.params.reviewId, req.body);
    res.json(result);
  }
);

// Deletes review.
export const deleteReview = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const result = await catalogManagementService.deleteReview(req.params.reviewId);
    res.json(result);
  }
);


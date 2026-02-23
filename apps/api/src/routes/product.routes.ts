import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { optionalAuthMiddleware } from '../middleware/auth.middleware';
import { searchLimiter } from '../middleware/rateLimiter';

const router = Router();

// Search products — guest-accessible (optionalAuth), rate-limited
router.get('/search', optionalAuthMiddleware, searchLimiter, productController.search);

// Search products by barcode — guest-accessible, rate-limited
router.get('/barcode/:code', optionalAuthMiddleware, searchLimiter, productController.searchByBarcode);

// Popular products — reads from MongoDB cache, no SerpApi calls
router.get('/popular', optionalAuthMiddleware, productController.getPopularProducts);

// Categories — static list, no auth needed
router.get('/categories', productController.getCategories);

// Get a single product by ID
router.get('/:id', optionalAuthMiddleware, productController.getProduct);

// Get sorted prices for a product
router.get('/:id/prices', optionalAuthMiddleware, productController.getProductPrices);

// Get price history — guest-accessible (for chart on results page)
router.get('/:id/history', optionalAuthMiddleware, productController.getProductHistory);

export default router;

import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.middleware';
import { premiumMiddleware } from '../middleware/premium.middleware';
import { searchLimiter } from '../middleware/rateLimiter';

const router = Router();

// Search products — guest-accessible (optionalAuth), rate-limited
router.get('/search', optionalAuthMiddleware, searchLimiter, productController.search);

// Search products by barcode — guest-accessible, rate-limited
router.get('/barcode/:code', optionalAuthMiddleware, searchLimiter, productController.searchByBarcode);

// Search products by image (Google Lens via SerpApi) — guest-accessible, rate-limited
router.post('/image-search', optionalAuthMiddleware, searchLimiter, productController.imageSearch);

// Get a single product by ID
router.get('/:id', optionalAuthMiddleware, productController.getProduct);

// Get sorted prices for a product
router.get('/:id/prices', optionalAuthMiddleware, productController.getProductPrices);

// Get price history — premium only (requires auth)
router.get('/:id/history', authMiddleware, premiumMiddleware, productController.getProductHistory);

export default router;

import express from 'express';
import { getCategories, getProducts, getProductBySlugOrId, createProduct } from '../services/catalog.service.js';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/categories', async (req, res) => {
  try {
    const categories = await getCategories();
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/products', async (req, res) => {
  try {
    const { category, platform, search, featured, limit } = req.query;
    const products = await getProducts({ category, platform, search, featured, limit });
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/products/:idOrSlug', async (req, res) => {
  try {
    const product = await getProductBySlugOrId(req.params.idOrSlug);
    if (!product) return res.status(404).json({ success: false, error: 'Producto no encontrado.' });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/products', requireAuth, requireAdmin, async (req, res) => {
  try {
    const product = await createProduct(req.body);
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;

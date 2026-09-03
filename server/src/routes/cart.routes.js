import { Router } from 'express';
import { getCart, postItem, deleteItem, safetyCheck } from '../controllers/cart.controller.js';

const router = Router();

router.get('/', getCart);
router.post('/items', postItem);
router.delete('/items/:productId', deleteItem);
router.post('/safety-check', safetyCheck);

export default router;
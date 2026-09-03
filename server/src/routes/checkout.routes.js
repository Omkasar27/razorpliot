import { Router } from 'express';
import { postCreateOrder, postVerify, postFail, postRetry } from '../controllers/checkout.controller.js';

const router = Router();

router.post('/create-order', postCreateOrder);
router.post('/verify', postVerify);
router.post('/fail', postFail);
router.post('/retry', postRetry);

export default router;
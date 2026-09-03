import { Router } from 'express';
import { decide } from '../controllers/recommendation.controller.js';

const router = Router();

router.post('/:id/decision', decide);

export default router;
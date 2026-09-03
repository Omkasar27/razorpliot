import { Router } from 'express';
import { postSession } from '../controllers/auth.controller.js';

const router = Router();

router.post('/session', postSession);

export default router;
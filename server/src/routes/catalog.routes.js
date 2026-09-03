import { Router } from 'express';
import { search } from '../controllers/catalog.controller.js';

const router = Router();

router.get('/search', search);

export default router;
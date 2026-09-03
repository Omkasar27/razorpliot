import { Router } from 'express';
import { getRules, updateRules } from '../controllers/rules.controller.js';

const router = Router();

router.get('/', getRules);
router.put('/', updateRules);

export default router;
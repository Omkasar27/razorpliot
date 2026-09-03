import { Router } from 'express';
import { getPending, postDecision } from '../controllers/approval.controller.js';

const router = Router();

router.get('/', getPending);
router.post('/:id/decision', postDecision);

export default router;
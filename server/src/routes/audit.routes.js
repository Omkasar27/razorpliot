import { Router } from 'express';
import { getAuditTrail } from '../controllers/audit.controller.js';

const router = Router();

router.get('/', getAuditTrail);

export default router;
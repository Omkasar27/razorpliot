import { Router } from 'express';
import { postMessage, getConversation } from '../controllers/conversation.controller.js';

const router = Router();

router.post('/', postMessage);
router.get('/:id', getConversation);

export default router;
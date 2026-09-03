import { handleMessage } from '../commerce/conversationOrchestrator.js';
import Conversation from '../db/models/Conversation.js';

export async function postMessage(req, res, next) {
  try {
    const { merchantId, userId, message, conversationId } = req.body;
    if (!merchantId || !userId || !message) {
      const err = new Error('Missing required fields');
      err.status = 400;
      err.publicMessage = 'merchantId, userId, and message are required.';
      throw err;
    }
    const result = await handleMessage({ merchantId, userId, message, conversationId });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getConversation(req, res, next) {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      const err = new Error('Not found');
      err.status = 404;
      err.publicMessage = 'Conversation not found.';
      throw err;
    }
    res.json({ conversation });
  } catch (err) {
    next(err);
  }
}
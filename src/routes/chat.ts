import { Router } from 'express';
import { chatController } from '../controllers/chat.js';
import { requiresAuth } from '../middlewares/auth.js';

const router = Router();

router.get('/', requiresAuth, chatController.listarChats);
router.get('/:id', requiresAuth, chatController.verChat);
router.post('/:id/mensaje', requiresAuth, chatController.enviarMensaje);

export default router;

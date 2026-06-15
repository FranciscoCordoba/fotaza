import { Router } from 'express';
import { comunidadController } from '../controllers/comunidad.js';
import { requiresAuth } from '../middlewares/auth.js';
import { upload } from '../utils/multer.js';

const router = Router();

router.get('/crear', requiresAuth, comunidadController.crearComunidadView);
router.post('/crear', requiresAuth, upload.single('imagen'), comunidadController.crearComunidad);
router.get('/:nickComunidad', comunidadController.getComunidadView);

export default router;

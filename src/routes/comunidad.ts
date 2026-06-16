import { Router } from 'express';
import { comunidadController } from '../controllers/comunidad.js';
import { requiresAuth } from '../middlewares/auth.js';
import { upload } from '../utils/multer.js';

const router = Router();

router.get('/crear', requiresAuth, comunidadController.crearComunidadView);
router.post('/crear', requiresAuth, upload.single('imagen'), comunidadController.crearComunidad);
router.post('/:nickComunidad/seguir', requiresAuth, comunidadController.seguirComunidad);
router.post('/:nickComunidad/dejar-seguir', requiresAuth, comunidadController.dejarDeSeguirComunidad);
router.get('/:nickComunidad', comunidadController.getComunidadView);

export default router;

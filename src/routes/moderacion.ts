import { Router } from "express";
import { requiresAuth } from "../middlewares/auth.js";
import { moderacionController } from "../controllers/moderacion.js";

const router = Router();

router.get('/', requiresAuth, moderacionController.getDenuncias);
router.post('/desestimar', requiresAuth, moderacionController.desestimar);
router.post('/eliminar', requiresAuth, moderacionController.eliminarComentario);
router.post('/estado-imagen', requiresAuth, moderacionController.actualizarEstadoDenunciaImagen);

export default router;

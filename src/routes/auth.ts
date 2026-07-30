import { Router } from "express";
import { authController } from "../controllers/auth.js";

const router = Router()

router.get('/login', authController.loginUsuarioView)
router.post('/login', authController.loginUsuario)
router.get('/registro', authController.registroUsuarioView)
router.post('/registro', authController.registrarUsuario)
//router.post('/refresh', authController.refreshToken)
router.get('/logout', authController.cerrarSesion)

export default router
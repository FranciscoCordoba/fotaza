import { Router } from "express";
import { usuarioController } from "../controllers/usuario.js";

const router = Router()

router.get('/login', usuarioController.loginUsuarioView)
router.post('/login', usuarioController.loginUsuario)
router.get('/registro', usuarioController.registroUsuarioView)
router.post('/registro', usuarioController.registrarUsuario)
//router.post('/refresh', usuarioController.refreshToken)

export default router
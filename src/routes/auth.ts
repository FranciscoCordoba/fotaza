import { Router } from "express";
import { usuarioController } from "../controllers/usuario.js";

const router = Router()

router.get('/login', usuarioController.loginUsuarioView)
router.post('/login', usuarioController.loginUsuario)
router.post('/registro', usuarioController.registrarUsuario)


export default router
import { Router } from 'express'
import { usuarioController } from '../controllers/usuario.js'

const router = Router()

router.post('/login', usuarioController.loginUsuario)
router.post('/crear', usuarioController.crearUsuario)
router.delete('/eliminar', usuarioController.eliminarUsuario)

router.post('/seguir', usuarioController.seguirUsuario)
router.delete('/dejar_seguir', usuarioController.dejarSeguirUsuario)
router.get('/listar_seguidores', usuarioController.listarSeguidores)

router.post('/enviar_mensaje', usuarioController.enviarMensaje)


export default router

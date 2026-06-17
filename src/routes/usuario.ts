import { Router } from 'express'
import { usuarioController } from '../controllers/usuario.js'

const router = Router()

router.get('/allUsers', usuarioController.allUsers)

// router.post('/cerrar_sesion', usuarioController.cerrarSesion)
// router.delete('/eliminar', usuarioController.eliminarUsuario)

router.post('/seguir', usuarioController.seguirUsuario)
router.post('/dejar_seguir', usuarioController.dejarSeguirUsuario)
// router.get('/listar_seguidores', usuarioController.listarSeguidores)

// router.post('/enviar_mensaje', usuarioController.enviarMensaje)

router.get('/perfil/:nickname', usuarioController.perfilUsuario)

export default router

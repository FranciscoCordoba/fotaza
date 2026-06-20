import { Router } from 'express'
import { usuarioController } from '../controllers/usuario.js'
import { requiresAuth } from '../middlewares/auth.js'

const router = Router()

router.get('/allUsers', usuarioController.allUsers)

// router.post('/cerrar_sesion', usuarioController.cerrarSesion)
// router.delete('/eliminar', usuarioController.eliminarUsuario)

router.post('/seguir', usuarioController.seguirUsuario)
router.post('/dejar_seguir', usuarioController.dejarSeguirUsuario)
// router.get('/listar_seguidores', usuarioController.listarSeguidores)

// router.post('/enviar_mensaje', usuarioController.enviarMensaje)

router.get('/perfil/:nickname', usuarioController.perfilUsuario)

router.get('/colecciones', requiresAuth, usuarioController.verColeccionesView)
router.get('/colecciones/nueva', requiresAuth, usuarioController.nuevaColeccionView)
router.post('/colecciones/nueva', requiresAuth, usuarioController.crearColeccion)
router.get('/colecciones/:nickColeccion', requiresAuth, usuarioController.verColeccionDetalleView)

export default router

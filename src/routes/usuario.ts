import { Router } from 'express'
import { usuarioController } from '../controllers/usuario.js'
import { requiresAuth } from '../middlewares/auth.js'

const router = Router()

// router.post('/cerrar_sesion', usuarioController.cerrarSesion)
// router.delete('/eliminar', usuarioController.eliminarUsuario)

router.post('/seguir', requiresAuth, usuarioController.seguirUsuario)
router.post('/dejar_seguir', requiresAuth, usuarioController.dejarSeguirUsuario)
// router.get('/listar_seguidores', usuarioController.listarSeguidores)

router.get('/perfil/:nickname', requiresAuth, usuarioController.perfilUsuario)

router.get('/colecciones', requiresAuth, usuarioController.verColeccionesView)
router.get('/colecciones/nueva', requiresAuth, usuarioController.nuevaColeccionView)
router.post('/colecciones/nueva', requiresAuth, usuarioController.crearColeccion)
router.get('/colecciones/:nickColeccion', requiresAuth, usuarioController.verColeccionDetalleView)

router.get('/notificaciones', requiresAuth, usuarioController.verNotificacionesView)
router.post('/notificaciones/:id/vista', requiresAuth, usuarioController.marcarNotificacionVista)

export default router

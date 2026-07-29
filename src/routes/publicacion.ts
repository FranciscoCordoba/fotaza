import { Router } from 'express'
import { publicacionController } from '../controllers/publicacion.js'
import { requiresAuth } from '../middlewares/auth.js'
import { upload } from '../utils/multer.js'

const router = Router()

router.get('/publicacion/:id', publicacionController.getPublicacionById)
router.get('/p/:id/:orden', publicacionController.getPublicacionByIdView)
router.get('/crear', requiresAuth, publicacionController.crearPublicacionView)
router.get('/buscar', requiresAuth, publicacionController.buscarPublicacionesView)
router.post('/crear', upload.array('imagenes', 10), requiresAuth, publicacionController.crearPublicacion)
router.post('/imagen/:idImagen/valorar', requiresAuth, publicacionController.valorarImagen)
router.post('/imagen/:idImagen/comentar', requiresAuth, publicacionController.comentarImagen)
router.post('/imagen/:idImagen/toggle-comentarios', requiresAuth, publicacionController.toggleComentariosImagen)
router.post('/comentario/:idComentario/denunciar', requiresAuth, publicacionController.denunciarComentario)
router.get('/imagen/:idImagen/denunciar', requiresAuth, publicacionController.denunciarImagenView)
router.post('/imagen/:idImagen/denunciar', requiresAuth, publicacionController.denunciarImagenPost)
router.post('/:id/favorito', requiresAuth, publicacionController.toggleFavorito)
router.post('/imagen/:idImagen/copyright', requiresAuth, publicacionController.setCopyrightImagen)

export default router
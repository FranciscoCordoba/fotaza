import { Router } from 'express'
import { publicacionController } from '../controllers/publicacion.js'
import { requiresAuth } from '../middlewares/auth.js'
import multer from "multer"
import type { Request } from "express"

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(new Error('Solo se permiten archivos de imagen (JPEG, PNG, WEBP)'))
    }
}

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 1024 * 1024 * 4 //limite de 4MB por imagen (Vercel max 4.5MB payload)
    },
    fileFilter: fileFilter
})

const router = Router()

router.get('/publicacion/:id', publicacionController.getPublicacionById)
router.get('/p/:id/:orden', publicacionController.getPublicacionByIdView)
router.get('/crear', publicacionController.crearPublicacionView)
router.get('/buscar', publicacionController.buscarPublicacionesView)
router.post('/crear', upload.array('imagenes', 10), publicacionController.crearPublicacion)
router.post('/imagen/:idImagen/valorar', requiresAuth, publicacionController.valorarImagen)
router.post('/imagen/:idImagen/comentar', requiresAuth, publicacionController.comentarImagen)

export default router
import { Router } from 'express'
import { publicacionController } from '../controllers/publicacion.js'
import multer from "multer"

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 1024 * 1024 * 5 //limite de 5MB por imagen
    }
})

const router = Router()

router.get('/publicacion/:id', publicacionController.getPublicacionById)
router.get('/p/:id', publicacionController.getPublicacionByIdView)
router.get('/crear', publicacionController.crearPublicacionView)
router.post('/crear', upload.single('imagen'), publicacionController.crearPublicacion)

export default router
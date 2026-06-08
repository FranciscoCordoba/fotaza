import { Router } from "express"
import { feedController } from "../controllers/feed.js"

const router = Router()

router.get('/all', feedController.getAll)

export default router

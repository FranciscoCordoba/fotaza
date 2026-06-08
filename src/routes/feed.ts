import { Router } from "express"
import { feedController } from "../controllers/feed.js"

const router = Router()

router.get('/', feedController.getAll)

export default router

import { Router } from "express"
import { feedController } from "../controllers/feed.js"
import { requiresAuth } from "../middlewares/auth.js"

const router = Router()

router.get('/', feedController.getAll)
router.get('/siguiendo', requiresAuth, feedController.getFollowingFeed)
router.get('/comunidades', requiresAuth, feedController.getComunidadesFeed)

export default router

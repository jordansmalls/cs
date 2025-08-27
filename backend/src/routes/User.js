import { updateProfile, getProfile, deleteProfile, changePassword } from "../controllers/User.js"
import e from "express"
import { protect } from "../middleware/authMiddleware.js"
import userLimiter from "../utils/userLimiter.js"

const router = e.Router()

router.use(userLimiter)

router.put("/profile", protect, updateProfile)
router.get("/profile", protect, getProfile)
router.delete("/profile", protect, deleteProfile)
router.put("/password", protect, changePassword)


export default router;
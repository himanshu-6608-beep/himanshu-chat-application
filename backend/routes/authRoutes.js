import authControllers from "../controllers/authController.js"
import express from "express"
import authMiddleware from "../middlewares/authMiddleware.js";
const router = express.Router();


router.post("/signup", authControllers.handleSignUp)
router.post("/login", authControllers.handleLogin)
router.get("/users", authMiddleware, authControllers.getUsers);
router.post("/adduser", authMiddleware, authControllers.addUser);
router.post("/logout", authControllers.handleLogOut);
router.put("/profile/:id",
    upload.single("profileImage"),
    usercontroller.updateProfile
)
export default router;
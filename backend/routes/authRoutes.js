import authControllers from "../controllers/authController.js"
import express from "express"
import authMiddleware from "../middlewares/authMiddleware.js";
const router = express.Router();
import upload from "../middlewares/uploads.js";

router.post("/signup", authControllers.handleSignUp)
router.post("/login", authControllers.handleLogin)
router.get("/users", authMiddleware, authControllers.getUsers);
router.post("/adduser", authMiddleware, authControllers.addUser);
router.post("/logout",authMiddleware,authControllers.handleLogOut);
router.patch("/passwordchange", authMiddleware,authControllers.handleChangePassword)
router.get("/userfilter", authMiddleware, authControllers.handleFilter);
router.put("/profile/:id",authMiddleware,
    upload.single("profileImage"),
    authControllers.updateProfile
)
export default router;
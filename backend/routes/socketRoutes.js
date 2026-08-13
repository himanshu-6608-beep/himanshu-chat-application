import {getMessages} from "../controllers/messageController.js";
import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/messages/:receiverId",authMiddleware, getMessages);

export default router
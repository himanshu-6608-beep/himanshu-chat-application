import {getMessages} from "../controllers/messageController.js";
import express from "express";

const router = express.Router();

router.get("/messages/:senderId/:receiverId", getMessages);

export default router
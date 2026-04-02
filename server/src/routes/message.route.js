import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  getAllMessage,
  sendMessage,
  deleteMessage,
} from "../controllers/message.controller.js";

import { upload } from "../middleware/multer.middleware.js";

const router = Router();

// ✅ protect all routes
router.use(verifyJWT);

/* =========================
   MESSAGES
========================= */

// 📩 Get all messages of a chat (with pagination)
router.get("/:chatId", getAllMessage);

// 📤 Send message (text + optional file)
router.post(
  "/:chatId/message",
  upload.fields([{ name: "resource", maxCount: 1 }]),
  sendMessage,
);

// ❌ Delete message
router.delete("/:messageId", deleteMessage);

export default router;

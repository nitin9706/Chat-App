import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  createOneToOneChat,
  createGroupChat,
  getUserChats,
  getChatById,
  renameGroupChat,
  addMemberToGroup,
  removeMemberFromGroup,
  leaveGroupChat,
  deleteChat,
} from "../controllers/chat.controller.js";

import { upload } from "../middleware/multer.middleware.js";

const router = Router();

// ✅ protect all routes
router.use(verifyJWT);

/* =========================
   CHAT CREATION
========================= */

// 1-1 chat
router.post("/one-to-one", upload.none(), createOneToOneChat);

// group chat
router.post("/group", upload.none(), createGroupChat);

/* =========================
   FETCH CHATS
========================= */

// get all chats of logged-in user
router.get("/", getUserChats);

// get single chat by id
router.get("/:chatId", getChatById);

/* =========================
   GROUP MANAGEMENT
========================= */

// rename group
router.patch("/:chatId/rename", upload.none(), renameGroupChat);

// add member
router.patch("/:chatId/add-member", upload.none(), addMemberToGroup);

// remove member
router.patch("/:chatId/remove-member", upload.none(), removeMemberFromGroup);

// leave group
router.patch("/:chatId/leave", leaveGroupChat);

/* =========================
   DELETE CHAT
========================= */

router.delete("/:chatId", deleteChat);

export default router;

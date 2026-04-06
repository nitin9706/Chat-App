import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  googleLogin,
  sendMe,
} from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(upload.single("avatar"), registerUser);
router.route("/login").post(upload.none(), loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/logout/:id").post(logoutUser);
router.route("/refresh-access-token").get(upload.none(), refreshAccessToken);
router.route("/change-password").patch(verifyJWT, changePassword);
router.route("/google").post(googleLogin);
router.route("/me").get(verifyJWT, sendMe);
export default router;

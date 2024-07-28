import express from "express";
import {
  updateUser,
  savePost,
  profilePosts,
} from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.put("/:id", verifyToken, updateUser);
router.post("/save", verifyToken, savePost);
router.get("/profilePosts", verifyToken, profilePosts);

export default router;

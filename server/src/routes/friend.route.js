import express from "express";
import {
  addFriend,
  acceptFriendRequest,
} from "../controllers/friend.controller.js";
import { protectedRoute } from "./../middleware/auth.middleware.js";

const router = express.Router();
router.post("/add", protectedRoute, acceptFriendRequest);
router.post("/accept", protectedRoute, acceptFriendRequest);

export default router;

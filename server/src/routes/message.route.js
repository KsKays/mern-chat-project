import express from "express";
const router = express.Router();
import { protectedRoute } from "./../middleware/auth.middleware.js";
import { getUsersForSidebar } from "../controllers/message.controller.js";

router.get("/users", protectedRoute, getUsersForSidebar);

export default router;

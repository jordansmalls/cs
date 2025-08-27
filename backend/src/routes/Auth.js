import express from "express";
import { register, login, logout } from "../controllers/Auth.js";
import createLimiter from "../utils/createLimiter.js";
import generalLimiter from "../utils/generalLimiter.js";

const router = express.Router();

router.post("/register", createLimiter, register);
router.post("/login", generalLimiter, login);
router.post("/logout", generalLimiter, logout);

export default router;

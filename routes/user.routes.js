import express from "express";
import { register } from "../controllers/use.controller.js"

const router = express.Router();

router.post("/register", register);
router.get("/verify/:token",verify);


export default router;

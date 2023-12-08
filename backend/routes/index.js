
import TestRoutes from "../routes/TestRoutes.js";
import express from "express";

const router = express.Router();

export default router;

router.use("/Test", TestRoutes);

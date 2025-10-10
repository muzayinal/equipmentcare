import express from "express";
import {
  getAllMachines,
  getMachineById,
  createMachine,
  updateMachine,
  deleteMachine,
} from "../controllers/machineController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ========== ROUTES ==========
router.get("/", verifyToken, getAllMachines);
router.get("/:id", verifyToken, getMachineById);
router.post("/", verifyToken, createMachine);
router.put("/:id", verifyToken, updateMachine);
router.delete("/:id", verifyToken, deleteMachine);

export default router;

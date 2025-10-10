import express from "express";
import jwt from "jsonwebtoken";
import {
  getAllMachines,
  getMachineById,
  createMachine,
  updateMachine,
  deleteMachine,
} from "../controller/machineController.js";

const router = express.Router();
const SECRET_KEY = "industrial_secret_key";

// Middleware verifikasi token
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
}

// ========== ROUTES ==========
router.get("/", verifyToken, getAllMachines);
router.get("/:id", verifyToken, getMachineById);
router.post("/", verifyToken, createMachine);
router.put("/:id", verifyToken, updateMachine);
router.delete("/:id", verifyToken, deleteMachine);

export default router;

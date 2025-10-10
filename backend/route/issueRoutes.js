import express from "express";
import jwt from "jsonwebtoken";
import {
  getAllIssues,
  getIssueById,
  createIssue,
  updateIssue,
  deleteIssue,
  updateIssueStatus,
} from "../controller/issueController.js";

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

// Routes
router.get("/", verifyToken, getAllIssues);
router.get("/:id", verifyToken, getIssueById);
router.post("/", verifyToken, createIssue);
router.put("/:id", verifyToken, updateIssue);
router.delete("/:id", verifyToken, deleteIssue);
router.put("/:id/status", verifyToken, updateIssueStatus);
export default router;

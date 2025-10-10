import db from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ========== GET ALL USERS ==========
export const getAllUsers = (req, res) => {
  const q = `
    SELECT 
      u.id, u.username, u.email, u.role, u.created_at,
      p.name, p.email AS profile_email, p.address
    FROM users u
    LEFT JOIN profiles p ON u.id = p.user_id
    ORDER BY u.created_at DESC
  `;
  db.query(q, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
};

// ========== GET USER BY ID ==========
export const getUserById = (req, res) => {
  const q = `
    SELECT 
      u.id, u.username, u.email, u.role, u.created_at,
      p.name, p.email AS profile_email, p.address
    FROM users u
    LEFT JOIN profiles p ON u.id = p.user_id
    WHERE u.id = ?
  `;
  db.query(q, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0)
      return res.status(404).json({ message: "User not found" });
    res.json(result[0]);
  });
};

// ========== CREATE USER + PROFILE ==========
export const createUser = async (req, res) => {
  try {
    const { username, email, password, role, name, profile_email, address } = req.body;

    const password_hash = await bcrypt.hash(password, 10);

    const qUser = `
      INSERT INTO users (username, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `;

    db.query(qUser, [username, email, password_hash, role || "operator"], (err, userResult) => {
      if (err) return res.status(500).json({ error: err.message });

      const userId = userResult.insertId;

      const qProfile = `
        INSERT INTO profiles (user_id, name, email, address)
        VALUES (?, ?, ?, ?)
      `;
      db.query(qProfile, [userId, name, profile_email || email, address], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "User and profile created", user_id: userId });
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ========== UPDATE USER + PROFILE ==========
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, password, role, name, profile_email, address } = req.body;

  const updates = [];
  const values = [];

  if (username) { updates.push("username = ?"); values.push(username); }
  if (email) { updates.push("email = ?"); values.push(email); }
  if (password) { 
    const hash = await bcrypt.hash(password, 10);
    updates.push("password_hash = ?");
    values.push(hash);
  }
  if (role) { updates.push("role = ?"); values.push(role); }

  values.push(id);

  const qUser = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;

  db.query(qUser, values, (err) => {
    if (err) return res.status(500).json({ error: err.message });

    const qProfile = `
      UPDATE profiles 
      SET name = ?, email = ?, address = ? 
      WHERE user_id = ?
    `;
    db.query(qProfile, [name, profile_email, address, id], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ message: "User and profile updated" });
    });
  });
};

// ========== DELETE USER (CASCADE DELETE PROFILE) ==========
export const deleteUser = (req, res) => {
  db.query("DELETE FROM users WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "User and profile deleted" });
  });
};

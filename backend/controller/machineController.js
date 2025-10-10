import db from "../db.js";

// ========== GET ALL MACHINES ==========
export const getAllMachines = (req, res) => {
  const q = "SELECT * FROM machines ORDER BY created_at DESC";
  db.query(q, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
};

// ========== GET MACHINE BY ID ==========
export const getMachineById = (req, res) => {
  const { id } = req.params;
  const q = "SELECT * FROM machines WHERE id = ?";
  db.query(q, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0)
      return res.status(404).json({ message: "Machine not found" });
    res.json(result[0]);
  });
};

// ========== CREATE MACHINE ==========
export const createMachine = (req, res) => {
  const {
    machine_code,
    machine_name,
    location,
    serial_number,
    brand,
    model,
    year_installed,
    status,
    description,
  } = req.body;

  const q = `
    INSERT INTO machines 
    (machine_code, machine_name, location, serial_number, brand, model, year_installed, status, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    q,
    [
      machine_code,
      machine_name,
      location,
      serial_number,
      brand,
      model,
      year_installed,
      status || "Active",
      description,
    ],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({
        message: "Machine created successfully",
        id: result.insertId,
      });
    }
  );
};

// ========== UPDATE MACHINE ==========
export const updateMachine = (req, res) => {
  const { id } = req.params;
  const updates = [];
  const values = [];

  for (const key in req.body) {
    updates.push(`${key} = ?`);
    values.push(req.body[key]);
  }

  values.push(id);

  const q = `UPDATE machines SET ${updates.join(", ")}, updated_at = NOW() WHERE id = ?`;

  db.query(q, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Machine not found" });
    res.json({ message: "Machine updated successfully" });
  });
};

// ========== DELETE MACHINE ==========
export const deleteMachine = (req, res) => {
  const { id } = req.params;
  const q = "DELETE FROM machines WHERE id = ?";
  db.query(q, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Machine not found" });
    res.json({ message: "Machine deleted successfully" });
  });
};

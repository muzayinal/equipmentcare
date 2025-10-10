import db from "../db.js";

// ========== GET ALL ISSUES ==========
export const getAllIssues = (req, res) => {
  const q = `
    SELECT 
      i.*, 
      m.machine_name AS machine_name, 
      u.username AS reporter_name,
      a.username AS assigned_to_name
    FROM machine_issues i
    LEFT JOIN machines m ON i.machine_id = m.id
    LEFT JOIN users u ON i.reported_by_id = u.id
    LEFT JOIN users a ON i.assigned_to_id = a.id
    ORDER BY i.created_at DESC
  `;

  db.query(q, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
};

// ========== GET ISSUE BY ID ==========
export const getIssueById = (req, res) => {
  const q = `
    SELECT 
      i.*, 
      m.machine_name AS machine_name,
      u.username AS reporter_name,
      a.username AS assigned_to_name
    FROM machine_issues i
    LEFT JOIN machines m ON i.machine_id = m.id
    LEFT JOIN users u ON i.reported_by_id = u.id
    LEFT JOIN users a ON i.assigned_to_id = a.id
    WHERE i.id = ?
  `;

  db.query(q, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0)
      return res.status(404).json({ message: "Issue not found" });
    res.json(result[0]);
  });
};

// ========== CREATE ISSUE ==========
export const createIssue = (req, res) => {
  const {
    machine_id,
    error_summary,
    error_description,
    error_code,
    reported_by_id,
    assigned_to_id,
    priority,
    status,
    initial_action,
    machine_condition,
  } = req.body;

  const q = `
    INSERT INTO machine_issues 
    (machine_id, error_summary, error_description, error_code, reported_by_id, assigned_to_id, priority, status, initial_action, machine_condition, occurred_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  db.query(
    q,
    [
      machine_id,
      error_summary,
      error_description,
      error_code,
      reported_by_id,
      assigned_to_id || null,
      priority || "Medium",
      status || "Open",
      initial_action || null,
      machine_condition || null,
    ],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: "Issue created", id: result.insertId });
    }
  );
};

// ========== UPDATE ISSUE ==========
export const updateIssue = (req, res) => {
  const id = req.params.id;
  const fields = [];
  const values = [];

  for (const key in req.body) {
    fields.push(`${key} = ?`);
    values.push(req.body[key]);
  }

  if (fields.length === 0)
    return res.status(400).json({ message: "No fields to update" });

  values.push(id);

  const q = `UPDATE machine_issues SET ${fields.join(", ")} WHERE id = ?`;
  db.query(q, values, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Issue updated" });
  });
};

// ========== DELETE ISSUE (HARD DELETE) ==========
export const deleteIssue = (req, res) => {
  db.query("DELETE FROM machine_issues WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Issue deleted" });
  });
};

export const updateIssueStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userRole = req.user.role;

  // Ambil status lama untuk validasi
  db.query("SELECT status FROM machine_issues WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: "Issue not found" });

    const currentStatus = results[0].status;

    // Daftar transisi status yang valid untuk setiap role
    const validTransitions = {
      operator: [], // tidak boleh ubah status
      technician: {
        Open: ["On Progress"],
        "On Progress": ["Pending Part", "Closed"],
        "Pending Part": ["On Progress"]
      },
      admin: ["Open", "On Progress", "Pending Part", "Closed"] // boleh ubah ke mana pun
    };

    // Cek apakah role punya izin
    if (userRole !== "admin") {
      const allowedNext = validTransitions[userRole]?.[currentStatus];
      if (!allowedNext || !allowedNext.includes(status)) {
        return res.status(403).json({
          message: `Technician tidak bisa mengubah status dari '${currentStatus}' ke '${status}'`
        });
      }
    }

    // Jalankan update status
    const q = `
      UPDATE machine_issues 
      SET status = ?, 
          updated_at = NOW(),
          ${status === "On Progress" ? "repair_start = NOW()," : ""}
          ${status === "Closed" ? "repair_end = NOW()," : ""}
          updated_by = ?
      WHERE id = ?
    `;

    db.query(q, [status, req.user.id, id], (err2, result) => {
      if (err2) return res.status(500).json({ error: err2.message });
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Issue not found" });

      res.json({ message: `Status changed to ${status} by ${userRole}` });
    });
  });
};

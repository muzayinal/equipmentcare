import db from "../db.js";

// ========== GET ALL ISSUES ==========
export const getAllIssues = (req, res) => {
  const q = `
    SELECT 
      i.id, 
      i.error_summary AS errorSummary, 
      i.error_description AS description, 
      i.error_code AS errorCode, 
      i.priority, 
      i.status, 
      m.machine_name AS machineName, 
      m.location, 
      u.username AS reporterName
    FROM machine_issues i
    LEFT JOIN machines m ON i.machine_id = m.id
    LEFT JOIN users u ON i.reported_by_id = u.id
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
      m.machine_name AS machineName,
      u.username AS reporterName
    FROM machine_issues i
    LEFT JOIN machines m ON i.machine_id = m.id
    LEFT JOIN users u ON i.reported_by_id = u.id
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
    priority,
    status,
  } = req.body;

  const q = `
    INSERT INTO machine_issues 
    (machine_id, error_summary, error_description, error_code, reported_by_id, priority, status, occurred_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  db.query(
    q,
    [
      machine_id,
      error_summary,
      error_description,
      error_code,
      reported_by_id,
      priority || "Medium",
      status || "Open",
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
    if (req.body.hasOwnProperty(key)) {
      fields.push(`${key} = ?`);
      values.push(req.body[key]);
    }
  }

  // Jika tidak ada field yang diupdate
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

    // Susun query update dengan kondisi repair_start dan repair_end
    const updates = ["status = ?", "updated_at = NOW()", "updated_by = ?"];
    const params = [status, req.user.id, id];

    if (status === "On Progress") {
      updates.splice(2, 0, "repair_start = NOW()"); // insert before updated_by
    } else if (status === "Closed") {
      updates.splice(2, 0, "repair_end = NOW()");
    }

    const q = `UPDATE machine_issues SET ${updates.join(", ")} WHERE id = ?`;

    db.query(q, params, (err2, result) => {
      if (err2) return res.status(500).json({ error: err2.message });
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Issue not found" });

      res.json({ message: `Status changed to ${status} by ${userRole}` });
    });
  });
};

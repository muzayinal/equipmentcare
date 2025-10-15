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
  const userRole = req.user.role?.toLowerCase(); // lowercase supaya aman

  const normalize = (val) => val?.trim().toLowerCase(); // fungsi bantu

  // Ambil status lama untuk validasi
  db.query("SELECT status FROM machine_issues WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: "Issue not found" });

    const currentStatus = normalize(results[0].status);
    const newStatus = normalize(status);

    // Transisi status valid
    const validTransitions = {
      operator: {}, // tidak boleh ubah
      technician: {
        open: ["on progress"],
        "on progress": ["pending part", "closed"],
        "pending part": ["on progress"]
      },
      admin: {
        open: ["on progress", "pending part", "closed"],
        "on progress": ["open", "pending part", "closed"],
        "pending part": ["open", "on progress", "closed"],
        closed: ["open", "on progress", "pending part"]
      }
    };

    const allowedNext = validTransitions[userRole]?.[currentStatus];

    if (!allowedNext || !allowedNext.includes(newStatus)) {
      return res.status(403).json({
        message: `Role '${userRole}' tidak diizinkan mengubah status dari '${results[0].status}' ke '${status}'`
      });
    }

    // Susun query update
    const updates = ["status = ?", "updated_at = NOW()", "updated_by = ?"];
    const params = [status, req.user.id, id]; // status tetap asli (huruf besar/kecil sesuai input)

    if (newStatus === "on progress") {
      updates.splice(2, 0, "repair_start = NOW()");
    } else if (newStatus === "closed") {
      updates.splice(2, 0, "repair_end = NOW()");
    }

    const q = `UPDATE machine_issues SET ${updates.join(", ")} WHERE id = ?`;

    db.query(q, params, (err2, result) => {
      if (err2) return res.status(500).json({ error: err2.message });
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Issue not found" });

      res.json({ message: `Status changed to '${status}' by '${userRole}'` });
    });
  });
};


export const getLimitIssues = (req, res) => {
  // Ambil parameter limit dan order dari query params
  const limit = parseInt(req.query.limit) || 10; // Default limit 10 jika tidak ada
  const order = req.query.order || "DESC"; // Default urutkan berdasarkan DESC

  // Validasi parameter limit dan order
  if (isNaN(limit) || limit <= 0) {
    return res.status(400).json({ error: "Limit must be a positive integer" });
  }

  // Batasi limit agar tidak terlalu besar
  const MAX_LIMIT = 10;
  if (limit > MAX_LIMIT) {
    return res.status(400).json({ error: `Limit cannot exceed ${MAX_LIMIT}` });
  }

  // Validasi order (harus ASC atau DESC)
  if (!["ASC", "DESC"].includes(order.toUpperCase())) {
    return res.status(400).json({ error: "Order must be either 'ASC' or 'DESC'" });
  }

  // Menyesuaikan query dengan order yang dipilih
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
    ORDER BY i.created_at ${order.toUpperCase()}  -- Ubah di sini sesuai dengan order yang dipilih
    LIMIT ?;
  `;
  
  console.log("Executing Query:", q);  // Untuk debug, cek query yang dijalankan
  
  // Jalankan query dengan limit yang sesuai
  db.query(q, [limit], (err, result) => {
    if (err) {
      console.error("Database error:", err); // Debugging error
      return res.status(500).json({ error: err.message });
    }

    console.log("Result from DB:", result); // Debugging hasil query
    res.json(result); // Kirim hasil ke client
  });
};





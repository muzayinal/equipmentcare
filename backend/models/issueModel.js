import db from "../db.js";

// Ambil semua issue (yang belum dihapus)
export async function getAllIssues() {
  const [rows] = await db.query(`
    SELECT i.*, m.name AS machine_name, u.name AS reporter_name
    FROM machine_issues i
    JOIN machines m ON i.machine_id = m.id
    JOIN users u ON i.reported_by = u.id
    WHERE i.is_deleted = 0
    ORDER BY i.created_at DESC
  `);
  return rows;
}

// Ambil issue by id
export async function getIssueById(id) {
  const [rows] = await db.query(`SELECT * FROM machine_issues WHERE id = ? AND is_deleted = 0`, [id]);
  return rows[0];
}

// Tambah issue baru
export async function createIssue(data) {
  const {
    machine_id,
    issue_title,
    issue_description,
    priority,
    reported_by
  } = data;
  const [result] = await db.query(
    `INSERT INTO machine_issues (machine_id, issue_title, issue_description, priority, reported_by)
     VALUES (?, ?, ?, ?, ?)`,
    [machine_id, issue_title, issue_description, priority, reported_by]
  );
  return result.insertId;
}

// Update issue
export async function updateIssue(id, data) {
  const fields = [];
  const values = [];

  for (const key in data) {
    fields.push(`${key} = ?`);
    values.push(data[key]);
  }
  values.push(id);

  await db.query(`UPDATE machine_issues SET ${fields.join(", ")} WHERE id = ?`, values);
}

// Soft delete
export async function deleteIssue(id) {
  await db.query(`UPDATE machine_issues SET is_deleted = 1 WHERE id = ?`, [id]);
}

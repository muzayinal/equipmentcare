import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import db from "./db.js";
import issueRoutes from "./route/issueRoutes.js";
import userRoutes from "./route/userRoutes.js";
import machineRoutes from "./route/machineRoutes.js";
const app = express();
const SECRET_KEY = "industrial_secret_key";

// ===== Middleware =====
app.use(cookieParser());
app.use(express.json());

// CORS global (cukup ini, tidak perlu app.options(*) lagi)
app.use(
  cors({
    origin: "http://localhost:3000", // FE origin
    credentials: true,               // izinkan kirim cookie
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

db.connect((err) => {
  if (err) console.error("❌ DB Connection Error:", err);
  else console.log("✅ Connected to MySQL Database");
});

// ===== LOGIN =====
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    db.query("SELECT * FROM users WHERE username = ?", [username], async (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.length === 0) return res.status(404).json({ message: "User not found" });

      const user = result[0];
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) return res.status(401).json({ message: "Wrong password" });

      // Buat token JWT
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role, email: user.email },
        SECRET_KEY,
        { expiresIn: "1h" }
      );

      // Simpan cookie ke browser
      res.cookie("token", token, {
        httpOnly: false,  // Cookie hanya dapat diakses oleh server, bukan JavaScript
        secure: false,   // Gunakan true jika sudah menggunakan HTTPS
        sameSite: "Lax",  // Sesuaikan dengan kebutuhan CORS
        maxAge: 60 * 60 * 1000,  // Token kadaluarsa dalam 1 jam
      });

      db.query("UPDATE users SET token = ? WHERE id = ?", [token, user.id], (err, updateResult) => {
        if (err) return res.status(500).json({ error: err.message });
        // Mengirim respons sukses
        return res.json({ message: "Login success", token });
      });
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

app.use("/api/issues", issueRoutes);
// ===== PROTECTED ROUTE =====
app.use("/api/users", userRoutes);
app.use("/api/machines", machineRoutes);

app.get("/api/profile", (req, res) => {
  const authHeader = req.headers["authorization"];  // Ambil token dari header Authorization
  const token = authHeader && authHeader.split(" ")[1];  // Mengambil token setelah 'Bearer'

  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    console.log("Decoded user:", user);  // Menampilkan payload yang sudah didecode
    res.json({ message: "Profile accessed", user });  // Mengirimkan data pengguna
  });
});

// ===== GET USER BY EMAIL (Hanya Admin) =====
// app.get("/api/user/:email", (req, res) => {
//   const token = req.headers["authorization"]?.split(" ")[1]; // Mendapatkan token dari header

//   if (!token) return res.status(401).json({ message: "No token provided" });

//   // Verifikasi token untuk memastikan hanya admin yang dapat mengakses data
//   jwt.verify(token, SECRET_KEY, (err, user) => {
//     if (err) return res.status(403).json({ message: "Invalid token" });

//     // Memeriksa apakah role pengguna adalah admin
//     if (user.role !== "admin") {
//       return res.status(403).json({ message: "You are not authorized to access this data" });
//     }

//     const email = req.params.email;

//     // Query untuk mencari pengguna berdasarkan email
//     const query = `
//       SELECT 
//         u.username, u.role, u.email, 
//         p.name, p.address
//       FROM users u
//       LEFT JOIN profiles p ON u.email = p.email
//     `;

//     db.query(query, [email], (err, result) => {
//       if (err) return res.status(500).json({ error: err.message });
//       if (result.length === 0) return res.status(404).json({ message: "User not found" });

//       // Mengembalikan data pengguna yang sudah digabungkan dari users dan profiles
//       res.json(result);
//     });
//   });
// });

// ===== LOGOUT =====
app.post("/api/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logout success" });
});

// ===== RUN SERVER =====
app.listen(4000, () => {
  console.log("✅ Server running on http://localhost:4000");
});

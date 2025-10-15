"use client";
import React, { useState } from "react";
import UserTable from "@/components/user/User";


interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  address?: string;
  role: string;
}


export default function User() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [namalengkap, setNamaLengkap] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");
  const [reloadTable, setReloadTable] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUserId(null);
    setUsername("");
    setPassword("");
    setRole("");
    setNamaLengkap("");
    setEmail("");
    setAddress("");
    setMessage("");
  };

  
  // Ketika tombol Edit diklik dari UserTable
  const handleEditUser = (user: User) => {
    setUsername(user.username);
    setEmail(user.email);
    setNamaLengkap(user.name);
    setAddress(user.address?? "");
    setRole(user.role);
    setEditingUserId(user.id);
    setIsModalOpen(true);
  };

  // Fungsi hapus user
  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Apakah kamu yakin ingin menghapus user ini?")) {
      return; // batal hapus kalau user cancel
    }

    try {
      const res = await fetch(`http://localhost:4000/api/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          // Kalau pakai auth token, tambahkan header Authorization juga
        },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Gagal menghapus user");
      }

      setMessage("User berhasil dihapus!");
      setReloadTable((prev) => !prev); // reload table
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message); // Safely access 'message' property
      } else {
        console.error("An unknown error occurred");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const userData = {
      username,
      password,
      role,
      name: namalengkap,
      email,
      address,
    };

    const url = editingUserId
      ? `http://localhost:4000/api/users/${editingUserId}`
      : "http://localhost:4000/api/users";

    const method = editingUserId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const result = await res.json();

      if (res.ok) {
        setMessage("User berhasil disimpan!");
        setReloadTable((prev) => !prev);
        closeModal();
      } else {
        setMessage(result.message || "Gagal menyimpan user");
      }
    } catch (error) {
      setMessage("Terjadi kesalahan, coba lagi!");
      console.error(error);
    }
  };

  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
            User
          </h3>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
            onClick={() => {
              // Reset form sebelum tambah user baru
              setEditingUserId(null);
              setUsername("");
              setPassword("");
              setRole("");
              setNamaLengkap("");
              setEmail("");
              setAddress("");
              setMessage("");
              openModal();
            }}
          >
            Add User
          </button>
        </div>
        <div className="space-y-6">
          <UserTable reload={reloadTable} onEdit={handleEditUser} onDelete={handleDeleteUser}/>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center z-50 py-10 bg-black bg-opacity-30">
          <div className="bg-gray-100 rounded-lg p-8 shadow-lg w-1/2 max-w-4xl max-h-[90vh] overflow-auto">
            <h2 className="text-2xl font-semibold mb-6">
              {editingUserId ? "Edit User" : "Add New User"}
            </h2>

            {message && (
              <p
                className={`mb-4 ${
                  message.includes("berhasil")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {message}
              </p>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-gray-700">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700">
                  Password {editingUserId && "(isi jika ingin ganti)"}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  {...(!editingUserId && { required: true })}
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">-- Pilih Role --</option>
                  <option value="admin">Admin</option>
                  <option value="technician">Technician</option>
                  <option value="operator">Operator</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700">Nama Lengkap</label>
                <input
                  type="text"
                  value={namalengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700">Alamat</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

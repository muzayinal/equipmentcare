"use client";
import IssueTable from "@/components/issue/Issue";
import UserTable from "@/components/user/User";
import React, { useState } from "react";


export default function Issue() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [namalengkap, setNamaLengkap] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Fungsi untuk menutup modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Fungsi untuk menangani submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Username:", username);
    console.log("Password:", password);
    // Tambahkan logika untuk menyimpan data atau mengirim ke API
    closeModal(); // Tutup modal setelah submit
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
                onClick={openModal}
            >
            Add User
            </button>
        </div>
        <div className="space-y-6">
            <IssueTable />
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center z-50">
            <div className="bg-gray-100 bg-opacity-20 rounded-lg p-8 shadow-lg w-1/2 max-w-4xl">
                <h2 className="text-2xl font-semibold mb-6">Add New User</h2>
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
                    <label className="block text-gray-700">Password</label>
                    <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    required
                    />
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
                    type="text"
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

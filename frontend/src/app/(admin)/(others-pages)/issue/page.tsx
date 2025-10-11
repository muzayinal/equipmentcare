"use client";

import React, { useState, useEffect } from "react";
import IssueTable from "@/components/issue/Issue"; // Komponen tabel untuk Issue
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import * as XLSX from "xlsx"; // Impor XLSX untuk ekspor Excel
import jsPDF from "jspdf";
import 'jspdf-autotable';  

interface DecodedToken {
  id: number;
  username: string;
  email: string;
  role: string;  // Pastikan token memiliki properti 'role'
}

export default function IssuePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
   // State untuk rentang tanggal
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Update machineList type to handle an array of objects
  const [machineList, setMachineList] = useState<{ id: string; machineName: string }[]>([]);

  // State untuk form issue
  const [machineName, setMachineName] = useState("");
  const [issueCode, setIssueCode] = useState("");
  const [errorSummary, setErrorSummary] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const [reloadTable, setReloadTable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<number | null>(null); 

  // ID issue yang sedang diedit (null artinya tambah baru)
  const [editingIssueId, setEditingIssueId] = useState<string | null>(null);

  // Mengambil data mesin dari API saat komponen dimuat
  useEffect(() => {
    const fetchMachines = async () => {
      const token = Cookies.get("token");
      if (!token) {
        return;
      }

      try {
          // Decode token untuk ambil role
          const decodedToken: DecodedToken = jwtDecode(token);  // menggunakan <any> untuk typing decoded token
          // Cek role dari token
          if (decodedToken.id) {
            setUserId(decodedToken.id);
          } else {
            setUserId(null);
          }
  
        } catch (err) {
          console.error('Error decoding token:', err);
          setError('Invalid token or expired');
          setLoading(false);
          return;
        }

      try {
        const response = await fetch("http://localhost:4000/api/machines/", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setMachineList(data); // Set the machine list based on API response
      } catch (error) {
        console.error("Error fetching machines:", error);
      }
    };

    fetchMachines();
  }, []);

  const openModalForAdd = () => {
    setEditingIssueId(null);
    resetForm();
    setMessage("");
    setIsModalOpen(true);
  };

  const openModalForEdit = (issue: any) => {
    setIssueCode(issue.issueCode);
    setDescription(issue.description);
    setPriority(issue.priority);
    setStatus(issue.status);
    setMachineName(issue.machineName); // Pre-fill machine name for editing
    setEditingIssueId(issue.id);
    setMessage("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
    setEditingIssueId(null);
    setMessage("");
  };

  const resetForm = () => {
    setIssueCode("");
    setDescription("");
    setPriority("");
    setStatus("");
    setMachineName(""); // Reset machine name
    setErrorSummary(""); // Reset error summary
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = Cookies.get("token");
    if (!token) {
      return;
    }

    const issueData = editingIssueId ? {
      error_code: issueCode,
      error_summary: errorSummary,
      error_description: description,
      priority,
      status,
      machine_id: machineName, // Include machine name when submitting
    } :
    {
      error_code: issueCode,
      error_summary: errorSummary,
      error_description: description,
      priority,
      status,
      machine_id: machineName, // Include machine name when submitting
      reported_by_id : userId
    }
    ;

    const url = editingIssueId
      ? `http://localhost:4000/api/issues/${editingIssueId}`
      : `http://localhost:4000/api/issues`;
    const method = editingIssueId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(issueData),
      });

      const result = await res.json();

      if (res.ok) {
        setMessage("Issue berhasil disimpan");
        setReloadTable((prev) => !prev);
        closeModal();
      } else {
        setMessage(result.message || "Gagal menyimpan issue");
      }
    } catch (error) {
      console.error("Error save issue:", error);
      setMessage("Terjadi kesalahan saat menyimpan");
    }
  };

  const handleDeleteIssue = async (issueId: string) => {
    const confirmDel = confirm("Apakah Anda yakin akan menghapus issue ini?");
    if (!confirmDel) return;

    try {
      const res = await fetch(`http://localhost:4000/api/issues/${issueId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Gagal menghapus issue");
      }
      setMessage("Issue berhasil dihapus");
      setReloadTable((prev) => !prev);
    } catch (error) {
      console.error("Error delete issue:", error);
      setMessage((error as any).message || "Terjadi kesalahan hapus");
    }
  };

  // Fungsi untuk menangani perubahan pada input tanggal
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value);
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value);

  // Fungsi untuk memfilter data berdasarkan rentang tanggal
  const filterDataByDate = (data: any[]) => {
    if (!startDate || !endDate) return data;

    const filteredData = data.filter((issue) => {
      const issueDate = new Date(issue.createdAt);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return issueDate >= start && issueDate <= end;
    });

    return filteredData;
  };

  // Fungsi ekspor ke PDF
  // const exportToPDF = () => {
  //   const doc = new jsPDF();
  //   const table = document.querySelector("table"); // Menargetkan elemen tabel dari IssueTable

  //   if (table) {
  //     doc.autoTable({ html: table });
  //     doc.save("issues_report.pdf");
  //   }
  // };

  // Fungsi ekspor ke Excel
  const exportToExcel = () => {
    const table = document.querySelector("table"); // Menargetkan elemen tabel dari IssueTable

    if (table) {
      const wb = XLSX.utils.table_to_book(table);
      XLSX.writeFile(wb, "issues_report.xlsx");
    }
  };

  useEffect(() => {
    // Ambil data mesin dan set pengguna
  }, []);

  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
            Issues
          </h3>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
            onClick={openModalForAdd}
          >
            Add Issue
          </button>
          {/* Tombol ekspor PDF dan Excel */}
          <div className="space-x-4">
            <button
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              // onClick={exportToPDF}
            >
              Export to PDF
            </button>
            <button
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
              onClick={exportToExcel}
            >
              Export to Excel
            </button>
          </div>
        </div>
         {/* Filter Rentang Tanggal */}
        <div className="flex mb-4">
          <input
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            className="px-4 py-2 border border-gray-300 rounded-md"
          />
          <span className="mx-2">to</span>
          <input
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
            className="px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="space-y-6">
          <IssueTable
            reload={reloadTable}
            onEdit={openModalForEdit}
            onDelete={handleDeleteIssue}
          />
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-30 py-10">
          <div className="bg-gray-100 rounded-lg p-8 shadow-lg w-1/2 max-w-4xl max-h-[90vh] overflow-auto">
            <h2 className="text-2xl font-semibold mb-6">
              {editingIssueId ? "Edit Issue" : "Add New Issue"}
            </h2>

            {message && (
              <p
                className={`mb-4 ${
                  message.includes("berhasil") ? "text-green-600" : "text-red-600"
                }`}
              >
                {message}
              </p>
            )}

            <form onSubmit={handleSubmit}>
              {/* Machine Name */}
              <div className="mb-6">
                <label className="block text-gray-700">Machine Name</label>
                <select
                  value={machineName}
                  onChange={(e) => setMachineName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">— Select Machine —</option>
                  {machineList.map((machine) => (
                    <option key={machine.id} value={machine.id}>
                      {machine.machineName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Error Summary */}
              <div className="mb-6">
                <label className="block text-gray-700">Error Summary</label>
                <input
                  type="text"
                  value={errorSummary}
                  onChange={(e) => setErrorSummary(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-gray-700">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Issue Code */}
              <div className="mb-6">
                <label className="block text-gray-700">Issue Code</label>
                <input
                  type="text"
                  value={issueCode}
                  onChange={(e) => setIssueCode(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Priority */}
              <div className="mb-6">
                <label className="block text-gray-700">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">— Select Priority —</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              {/* Status */}
              <div className="mb-6">
                <label className="block text-gray-700">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">— Select Status —</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Closed">Closed</option>
                </select>
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

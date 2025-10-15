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

interface Issue {
  id: string;
  issueCode: string;
  description: string;
  priority: string;
  status: string;
  machineName: string;
}

interface Item {
  machineName?: string;
  machine?: { machineName: string };
  errorCode: string;
  errorSummary: string;
  description: string;
  priority: string;
  status: string;
}

export default function IssuePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const openModalForEdit = (issue: Issue) => {
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
      setMessage((error as Error).message || "Terjadi kesalahan hapus");
    }
  };

  const exportToExcel = async () => {
    try {
      const token = Cookies.get("token");

      const response = await fetch("http://localhost:4000/api/issues", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil data issue dari API");
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Data yang diterima bukan array");
      }

      // Filter kolom yang akan diekspor
      const exportData = data.map((item: Item, index: number) => ({
        No: index + 1,
        "Machine Name": item.machineName || item.machine?.machineName || "-",
        "Issue Code": item.errorCode,
        Summary: item.errorSummary,
        Description: item.description,
        Priority: item.priority,
        Status: item.status,
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Set width kolom
      worksheet['!cols'] = [
        { wch: 5 },  // Width for 'No' column
        { wch: 30 }, // Width for 'Machine Name' column
        { wch: 15 }, // Width for 'Issue Code' column
        { wch: 30 }, // Width for 'Summary' column
        { wch: 50 }, // Width for 'Description' column
        { wch: 10 }, // Width for 'Priority' column
        { wch: 10 }, // Width for 'Status' column
      ];

      // Inisialisasi style untuk header dan cell
      const headerStyle = {
        alignment: {
          horizontal: 'center',  // Center-align the header
          vertical: 'center',    // Vertically center the header
        },
        font: { bold: true },     // Make the header bold
      };

      const wrapTextStyle = {
        alignment: {
          wrapText: true,  // Enable text wrapping
        },
      };

      const numberStyle = {
        numFmt: '0',  // Number format (no decimal places)
      };

      // Menambahkan style pada header
      const headerColumns = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];  // Kolom untuk header
      headerColumns.forEach((col) => {
        const cell = worksheet[`${col}1`];
        if (cell) {
          if (!cell.s) cell.s = {}; // Pastikan cell.s ada
          cell.s = { ...cell.s, ...headerStyle };  // Terapkan style header (bold, center)
        }
      });

      // Menambahkan wrap text pada kolom Summary dan Description
      const wrapColumns = ['D', 'E'];  // Kolom untuk Summary dan Description
      wrapColumns.forEach((col) => {
        for (let rowIndex = 2; rowIndex <= exportData.length + 1; rowIndex++) {
          const cell = worksheet[`${col}${rowIndex}`];
          if (cell) {
            if (!cell.s) cell.s = {}; // Pastikan cell.s ada
            cell.s = { ...cell.s, ...wrapTextStyle };
          }
        }
      });

      // Menambahkan format angka untuk kolom Priority
      for (let rowIndex = 2; rowIndex <= exportData.length + 1; rowIndex++) {
        const cell = worksheet[`F${rowIndex}`];
        if (cell) {
          if (!cell.s) cell.s = {}; // Pastikan cell.s ada
          cell.s = { ...cell.s, ...numberStyle };  // Terapkan format angka (tanpa desimal)
        }
      }

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Issues");

      // Menulis file Excel
      XLSX.writeFile(workbook, "issues_report.xlsx");
      console.log(worksheet);
    } catch (error) {
      console.error("Export error:", error);
      setMessage("Gagal mengekspor ke Excel");
    }
  };

  const exportToPDF = async () => {
    try {
      const token = Cookies.get("token");

      const response = await fetch("http://localhost:4000/api/issues", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil data issue dari API");
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Data yang diterima bukan array");
      }

      // Filter kolom yang akan diekspor
      const exportData = data.map((item, index) => ({
        No: index + 1,
        "Machine Name": item.machineName || item.machine?.machineName || "-",
        "Issue Code": item.errorCode,
        Summary: item.errorSummary,
        Description: item.description,
        Priority: item.priority,
        Status: item.status,
      }));

      // Buat instance jsPDF dengan orientasi landscape
      const doc = new jsPDF('landscape');

      // Set font dan ukuran yang lebih kecil
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);  // Ukuran font lebih kecil agar lebih banyak data yang muat

      // Margin top
      const marginTop = 20; // margin atas
      const startY = marginTop;  // Mulai dari margin top

      // Kolom header untuk tabel
      const headers = ["No", "Machine Name", "Issue Code", "Summary", "Description", "Priority", "Status"];

      // Lebar kolom yang ditetapkan (dalam milimeter), lebih kecil agar lebih rapi
      const columnWidths = [3, 15, 10, 15, 30, 10, 10];  // Lebar kolom dalam milimeter

      // Mengonversi lebar kolom ke satuan poin (1 mm = 2.834 pt)
      const columnWidthsPt = columnWidths.map(width => width * 2.834);  // Konversi ke pt (point)

      // Mengurangi jarak antara baris agar lebih kompak
      const rowHeight = 6;  // Menurunkan tinggi baris untuk memberi ruang lebih
      const startX = 10;

      // Padding untuk memberi ruang di dalam cell
      const padding = 2;  // Padding dalam poin (pt)

      // Gambar header tabel dengan garis
      let xPosition = startX;
      headers.forEach((header, index) => {
        const columnCenterX = xPosition + columnWidthsPt[index] / 2; // Hitung posisi tengah untuk teks
        doc.text(header, columnCenterX, startY + padding, { align: "center" });  // Menambahkan padding dan align center
        doc.rect(xPosition, startY - 2, columnWidthsPt[index], rowHeight); // Garis header
        xPosition += columnWidthsPt[index];  // Menyesuaikan posisi x untuk header
      });

      // Kembalikan ke font normal untuk isi
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);  // Ukuran font lebih kecil agar lebih banyak data yang muat

      // Fungsi untuk membungkus teks, dengan konversi lebar ke pt
      const wrapText = (text : string, width : number) : string [] => {
        const widthInPt = width * 2.834;  // Konversi dari mm ke pt
        return doc.splitTextToSize(text, widthInPt); // Membungkus teks sesuai dengan lebar kolom
      };

      let currentY = startY + rowHeight; // Posisi baris pertama setelah header
      // Gambar isi tabel dan garis vertikal serta horizontal
      exportData.forEach((row) => {
        // Wrap teks
        const machineNameLines = wrapText(row["Machine Name"], columnWidths[1]);
        const issueCodeLines = wrapText(row["Issue Code"], columnWidths[2]);
        const summaryLines = wrapText(row["Summary"], columnWidths[3]);
        const descriptionLines = wrapText(row["Description"], columnWidths[4]);

        // Hitung baris maksimal
        const maxLines = Math.max(
          machineNameLines.length,
          issueCodeLines.length,
          summaryLines.length,
          descriptionLines.length,
          1 // Untuk kolom pendek lainnya
        );

        const rowHeightTotal = maxLines * rowHeight;

        // Data tiap kolom
        const cells = [
          { text: String(row.No), lines: [String(row.No)], width: columnWidthsPt[0] },
          { text: row["Machine Name"], lines: machineNameLines, width: columnWidthsPt[1] },
          { text: row["Issue Code"], lines: issueCodeLines, width: columnWidthsPt[2] },
          { text: row["Summary"], lines: summaryLines, width: columnWidthsPt[3] },
          { text: row["Description"], lines: descriptionLines, width: columnWidthsPt[4] },
          { text: row["Priority"], lines: [String(row["Priority"])], width: columnWidthsPt[5] },
          { text: row["Status"], lines: [String(row["Status"])], width: columnWidthsPt[6] },
        ];

        cells.forEach((cell, colIndex) => {
          const currentX = startX + columnWidthsPt.slice(0, colIndex).reduce((a, b) => a + b, 0);

          // Tulis baris-baris teks
          cell.lines.forEach((line, i) => {
            doc.text(line, currentX + padding, currentY + i * rowHeight + padding);
          });

          // Gambar sel
          doc.rect(currentX, currentY - 2, cell.width, rowHeightTotal);
        });

        // Update posisi Y ke bawah
        currentY += rowHeightTotal;
      });



      // Menyimpan PDF
      doc.save("issues_report.pdf");

    } catch (error) {
      console.error("Export error:", error);
      setMessage("Gagal mengekspor ke PDF");
    }
  };



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
              onClick={exportToPDF}
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

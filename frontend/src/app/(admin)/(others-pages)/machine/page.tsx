"use client";

import React, { useState } from "react";
import MachineTable from "@/components/machine/Machine";
import Cookies from "js-cookie";


interface Machine {
  id: string;
  machineCode: string;
  machineName: string;
  location: string;
  serialNumber: string;
  brand: string;
  model: string;
  year: string;
  status: string;
  description?: string;  // Optional field (since you're providing a default value)
}


export default function MachinePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // state form mesin
  const [machineCode, setMachineCode] = useState("");
  const [machineName, setMachineName] = useState("");
  const [location, setLocation] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [status, setStatus] = useState("");
  const [description, setDescription] = useState("");

  const [message, setMessage] = useState("");
  const [reloadTable, setReloadTable] = useState(false);

  // id mesin yang sedang diedit (null artinya tambah baru)
  const [editingMachineId, setEditingMachineId] = useState<string | null>(null);

  const openModalForAdd = () => {
    setEditingMachineId(null);
    resetForm();
    setMessage("");
    setIsModalOpen(true);
  };

  const openModalForEdit = (machine: Machine) => {
    // isi form dengan data mesin
    setMachineCode(machine.machineCode);
    setMachineName(machine.machineName);
    setLocation(machine.location);
    setSerialNumber(machine.serialNumber);
    setBrand(machine.brand);
    setModel(machine.model);
    setYear(machine.year);
    setStatus(machine.status);
    setDescription(machine.description || "");

    setEditingMachineId(machine.id);
    setMessage("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
    setEditingMachineId(null);
    setMessage("");
  };

  const resetForm = () => {
    setMachineCode("");
    setMachineName("");
    setLocation("");
    setSerialNumber("");
    setBrand("");
    setModel("");
    setYear("");
    setStatus("");
    setDescription("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = Cookies.get("token");
    if (!token) {
      return;
    }

    const machineData = {
      machine_code : machineCode,
      machine_name : machineName,
      location,
      serial_number : serialNumber,
      brand,
      model,
      year_installed : year,
      status,
      description,
    };

    const url = editingMachineId
      ? `http://localhost:4000/api/machines/${editingMachineId}`
      : `http://localhost:4000/api/machines`;
    const method = editingMachineId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(machineData),
      });

      const result = await res.json();

      if (res.ok) {
        setMessage("Machine berhasil disimpan");
        // trigger reload tabel
        setReloadTable((prev) => !prev);
        closeModal();
      } else {
        setMessage(result.message || "Gagal menyimpan mesin");
      }
    } catch (error) {
      console.error("Error save machine:", error);
      setMessage("Terjadi kesalahan saat menyimpan");
    }
  };

  const handleDeleteMachine = async (machineId: string) => {
    const confirmDel = confirm("Apakah Anda yakin akan menghapus mesin ini?");
    if (!confirmDel) return;

    const token = Cookies.get("token");
    if (!token) {
      return;
    }
    
    try {
      const res = await fetch(`http://localhost:4000/api/machines/${machineId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Gagal menghapus mesin");
      }
      setMessage("Machine berhasil dihapus");
      setReloadTable((prev) => !prev);
    } catch (error) {
      console.error("Error delete machine:", error);
      setMessage((error as Error).message || "Terjadi kesalahan hapus");
    }
  };

  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
            Machines
          </h3>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
            onClick={openModalForAdd}
          >
            Add Machine
          </button>
        </div>
        <div className="space-y-6">
          <MachineTable
            reload={reloadTable}
            onEdit={openModalForEdit}
            onDelete={handleDeleteMachine}
          />
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-30 py-10">
          <div className="bg-gray-100 rounded-lg p-8 shadow-lg w-1/2 max-w-4xl max-h-[90vh] overflow-auto">
            <h2 className="text-2xl font-semibold mb-6">
              {editingMachineId ? "Edit Machine" : "Add New Machine"}
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
              {/* Field Machine Code */}
              <div className="mb-6">
                <label className="block text-gray-700">Machine Code</label>
                <input
                  type="text"
                  value={machineCode}
                  onChange={(e) => setMachineCode(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Machine Name */}
              <div className="mb-6">
                <label className="block text-gray-700">Machine Name</label>
                <input
                  type="text"
                  value={machineName}
                  onChange={(e) => setMachineName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Location */}
              <div className="mb-6">
                <label className="block text-gray-700">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Serial Number */}
              <div className="mb-6">
                <label className="block text-gray-700">Serial Number</label>
                <input
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Brand */}
              <div className="mb-6">
                <label className="block text-gray-700">Brand</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Model */}
              <div className="mb-6">
                <label className="block text-gray-700">Model</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Year */}
              <div className="mb-6">
                <label className="block text-gray-700">Year</label>
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  required
                />
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
                  <option value="">— Pilih Status —</option>
                  <option value="Active">Active</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-gray-700">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
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

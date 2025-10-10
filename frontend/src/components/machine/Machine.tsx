"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
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
  description?: string;
}

interface MachineTableProps {
  reload: boolean;
  onEdit: (machine: Machine) => void;
  onDelete: (machineId: string) => void;
}

export default function MachineTable({
  reload,
  onEdit,
  onDelete,
}: MachineTableProps) {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchMachines = async () => {
      const token = Cookies.get("token");
      if (!token) {
        setError("Token not found!");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch("http://localhost:4000/api/machines/",{
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) {
          throw new Error(`Error: ${res.status}`);
        }
        const data = await res.json();
        setMachines(data);
        setError("");
      } catch (err) {
        console.error("Fetch machines error:", err);
        setError("Gagal memuat data mesin");
      } finally {
        setLoading(false);
      }
    };

    fetchMachines();
  }, [reload]);

  if (loading) {
    return <div>Loading machines...</div>;
  }
  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1200px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="w-15 px-2 py-3 text-gray-500">
                  No
                </TableCell>
                <TableCell isHeader className="px-2 py-3 text-gray-500">
                  Name
                </TableCell>
                <TableCell isHeader className="px-2 py-3 text-gray-500">
                  Location
                </TableCell>
                <TableCell isHeader className="px-2 py-3 text-gray-500">
                  Serial Number
                </TableCell>
                <TableCell isHeader className="px-2 py-3 text-gray-500">
                  Brand
                </TableCell>
                <TableCell isHeader className="px-2 py-3 text-gray-500">
                  Model
                </TableCell>
                <TableCell isHeader className="px-2 py-3 text-gray-500">
                  Year
                </TableCell>
                <TableCell isHeader className="px-2 py-3 text-gray-500">
                  Status
                </TableCell>
                <TableCell isHeader className="px-2 py-3 text-gray-500">
                  Description
                </TableCell>
                <TableCell isHeader className="px-2 py-3 text-gray-500">
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {machines.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center py-4">
                    No data mesin
                  </TableCell>
                </TableRow>
              ) : (
                machines.map((m, idx) => (
                  <TableRow key={m.id}>
                    <TableCell className="px-2 py-3 sm:px-6">{idx + 1}</TableCell>
                    <TableCell className="px-2 py-3">{m.machineName}</TableCell>
                    <TableCell className="px-2 py-3">{m.location}</TableCell>
                    <TableCell className="px-2 py-3">{m.serialNumber}</TableCell>
                    <TableCell className="px-2 py-3">{m.brand}</TableCell>
                    <TableCell className="px-2 py-3">{m.model}</TableCell>
                    <TableCell className="px-2 py-3">{m.year}</TableCell>
                    <TableCell className="px-2 py-3">{m.status}</TableCell>
                    <TableCell className="px-2 py-3">
                      {m.description || "-"}
                    </TableCell>
                    <TableCell className="px-2 py-3">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onEdit(m)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(m.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

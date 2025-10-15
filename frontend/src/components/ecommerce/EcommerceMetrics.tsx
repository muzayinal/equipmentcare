"use client";
import React, { useState, useEffect } from "react";
import { BoxIconLine, TaskIcon } from "@/icons";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

interface DecodedToken {
  id: number;
  username: string;
  email: string;
  role: string;  // Pastikan token memiliki properti 'role'
}

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

interface Issue {
  id: string;
  machineName: string;
  location: string;
  errorSummary: string;
  description: string;
  issueCode: string;
  priority: string;
  status: string;
}

export const EcommerceMetrics = () => {
  const [error, setError] = useState<string | null>(null);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [issues, setIssues] = useState<Issue[]>([]);
  
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
        const res = await fetch("http://localhost:4000/api/machines",{
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
  }, []);

  useEffect(() => {
      const fetchIssues = async () => {
        const token = Cookies.get("token");
        if (!token) {
          setLoading(false);
          setError("Token not found!");
          return;
        }
  
        // Fetch issues dari API
        try {
          const res = await fetch(`http://localhost:4000/api/issues/all`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
  
          if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
          }
  
          const data = await res.json();
          setIssues(data);
        } catch (err : unknown) {
          if (err instanceof Error) {
            setError(`Failed to fetch issue data: ${err.message}`);
          } else {
            setError("Failed to fetch issue data");
          }
        } finally {
          setLoading(false);
        }
      };
  
      fetchIssues();
    }, []);
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Machine
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {machines.length}
            </h4>
          </div>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <TaskIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Error
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {issues.length}
            </h4>
          </div>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}
    </div>
  );
};

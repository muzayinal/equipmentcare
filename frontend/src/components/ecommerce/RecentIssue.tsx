"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";

interface Issue {
  id: number;
  errorSummary: string;
  description: string;
  errorCode: string;
  priority: string;
  status: string;
  machineName: string;
  location: string;
  reporterName: string;
}

export default function RecentIssue() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<boolean>(true);
  const [issueData, setIssueData] = useState<Issue[]>([]);

  useEffect(() => {
    const limit = 9;  // Limit jumlah isu yang akan diambil
    const order = "DESC";  // Urutan pengambilan data

    const fetchIssueNewData = async () => {
      const token = Cookies.get("token");
      if (!token) {
        setError("Token not found!");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:4000/api/issues?limit=${limit}&order=${order}`, {
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
        setIssueData(data);
        setError("");
      } catch (err) {
        setError("Failed to fetch issue data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchIssueNewData();
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Recent Issue
          </h3>
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1502px]">
            <Table>
            {/* Table Header */}
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                    <TableCell
                        isHeader
                        className="w-10 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                        No
                    </TableCell>
                    <TableCell
                        isHeader
                        className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                        Error Summary
                    </TableCell>
                    <TableCell
                        isHeader
                        className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                        Description
                    </TableCell>
                    <TableCell
                        isHeader
                        className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                        Error Code
                    </TableCell>
                    <TableCell
                        isHeader
                        className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                        Priority
                    </TableCell>
                    <TableCell
                        isHeader
                        className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                        Status
                    </TableCell>
                    <TableCell
                        isHeader
                        className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                        Machine Name
                    </TableCell>
                    <TableCell
                        isHeader
                        className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                        Location
                    </TableCell>
                    <TableCell
                        isHeader
                        className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                        Reporter Name
                    </TableCell>
                </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {issueData.map((issue, index) => (
                <TableRow key={issue.id}>
                    <TableCell className="py-3">{index + 1}</TableCell>
                    <TableCell className="py-3">{issue.errorSummary}</TableCell>
                    <TableCell className="py-3">{issue.description}</TableCell>
                    <TableCell className="py-3">{issue.errorCode}</TableCell>
                    <TableCell className="py-3">{issue.priority}</TableCell>
                    <TableCell className="py-3">
                    <Badge
                        size="sm"
                        variant="light"
                        color={
                        issue.status === "Critical"
                            ? "error"
                            : issue.status === "High"
                            ? "warning"
                            : issue.status === "Medium"
                            ? "info"
                            : "success"
                        }
                    >
                        {issue.status}
                    </Badge>
                    </TableCell>
                    <TableCell className="py-3">{issue.machineName}</TableCell>
                    <TableCell className="py-3">{issue.location}</TableCell>
                    <TableCell className="py-3">{issue.reporterName}</TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>
      </div>
    </div>
  );
}

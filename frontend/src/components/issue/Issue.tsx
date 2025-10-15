"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Cookies from "js-cookie";
import Badge from "../ui/badge/Badge"; // Import Badge
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  username: string;
  email: string;
  role: string;  // Pastikan token memiliki properti 'role'
}

import {
  PencilIcon,
  TrashBinIcon,
} from "../../icons/index";

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

interface IssuesTableProps {
  reload: boolean;
  onEdit: (issues: Issue) => void;
  onDelete: (machineId: string) => void;
}

export default function IssueTable({ reload }: IssuesTableProps) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [role, setRole] = useState<string | null>(null); // Mengganti isOperator dan isAdmin

  // Fetch issues from API
  useEffect(() => {
    const fetchIssues = async () => {
      const token = Cookies.get("token");
      if (!token) {
        setLoading(false);
        setError("Token not found!");
        return;
      }

      try {
        // Decode token untuk ambil role
        const decodedToken: DecodedToken = jwtDecode(token);  // menggunakan <any> untuk typing decoded token
        // Cek role dari token
        if (decodedToken.role === 'admin') {
          setRole('admin');
        } else if (decodedToken.role === 'technician') {
          setRole('technician');
        }

      } catch (err) {
        setError('Invalid token or expired');
        setLoading(false);
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
  }, [reload]);

  // Handle loading and error states
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  // Handle edit status
  const handleStatusChange = async (issueId: string, newStatus: string) => {
    const token = Cookies.get("token");
    if (!token) return;

    const updatedIssue = { status: newStatus };

    try {
      const res = await fetch(`http://localhost:4000/api/issues/${issueId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedIssue),
      });

      const result = await res.json();
      if (res.ok) {
        // Update the status locally after successful update
        setIssues((prevIssues) =>
          prevIssues.map((issue) =>
            issue.id === issueId ? { ...issue, status: newStatus } : issue
          )
        );
      } else {
        setError(result.message || "Failed to update status");
      }
    } catch (err : unknown) {
      if (err instanceof Error) {
        setError(`Failed to update status: ${err.message}`);
      } else {
        setError("Failed to update status");
      }
    }
  };

  // Edit issue handler
  const handleEdit = (id: string) => {
    console.log(`Editing issue with ID: ${id}`);
  };

  // Delete issue handler
  const handleDelete = (id: string) => {
    const updatedIssues = issues.filter((issue) => issue.id !== id);
    setIssues(updatedIssues);
    console.log(`Deleted issue with ID: ${id}`);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[902px]">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  No
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Machine Name
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Location
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Error Summary
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Priority
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Status
                </TableCell>
                {role === 'admin' && (
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Action
                  </TableCell>
                )}
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {issues.length > 0 ? (
                issues.map((issue, index) => (
                  <TableRow key={issue.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">{index + 1}</TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">{issue.machineName}</TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">{issue.location}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{issue.errorSummary}</TableCell>
                    
                    {/* Priority Column with Badge */}
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {issue.priority == "Critical" && (
                        <Badge variant="light" color="error">
                          {issue.priority}
                        </Badge>
                      )}
                      {issue.priority === "High" && (
                        <Badge variant="light" color="warning">
                          {issue.priority}
                        </Badge>
                      )}

                      {issue.priority === "Medium" && (
                        <Badge variant="light" color="info">
                          {issue.priority}
                        </Badge>
                      )}

                      {issue.priority === "Low" && (
                        <Badge variant="light" color="success">
                          {issue.priority}
                        </Badge>
                      )}
                    </TableCell>

                    {/* Status Column */}
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {role === 'admin' || role === 'technician' ? (
                        issue.status !== "Closed" ?(
                          <select
                            value={issue.status}
                            onChange={(e) => handleStatusChange(issue.id, e.target.value)}
                            className="bg-gray-200 p-2 rounded-md"
                          >
                            <option value="Open">Open</option>
                            <option value="On Progress">On Progress</option>
                            <option value="Closed">Closed</option>
                          </select>
                        ) : (
                          <span>{issue.status}</span>
                        )
                      ) : (
                        <span>{issue.status}</span>
                      )}
                    </TableCell>

                    {role === 'admin' && (
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <div className="flex items-center space-x-4">
                          <button onClick={() => handleEdit(issue.id)} className="text-blue-500 hover:text-blue-700">
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleDelete(issue.id)} className="text-red-500 hover:text-red-700">
                            <TrashBinIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell className="text-center py-4">
                    No issues available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

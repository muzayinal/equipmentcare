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
import {
  PencilIcon,
  TrashBinIcon,
} from "../../icons/index";

interface UserData {
  id: string;
  username: string;
  email: string;
  role: string;
  name: string;
  address?: string;
}

interface UserTableProps {
  reload: boolean;
  onEdit: (user: any) => void;
  onDelete?: (userId: string) => void; // opsional, kalau mau handle delete dari parent
}

export default function UserTable({ reload, onEdit, onDelete }: UserTableProps) {
  const [userData, setUserData] = useState<UserData[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = Cookies.get("token");
      if (!token) {
        setError("Token not found!");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:4000/api/users/`, {
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
        setUserData(data);
        setError("");
      } catch (err) {
        setError("Failed to fetch user data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [reload]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="w-12 px-2 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  No
                </TableCell>
                <TableCell
                  isHeader
                  className="px-2 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Username
                </TableCell>
                <TableCell
                  isHeader
                  className="px-2 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Email
                </TableCell>
                <TableCell
                  isHeader
                  className="px-2 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Full Name
                </TableCell>
                <TableCell
                  isHeader
                  className="px-2 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {userData.length > 0 ? (
                userData.map((user, index) => (
                  <TableRow key={user.id}>
                    <TableCell className="px-2 py-3 sm:px-6 text-start">
                      {index + 1}
                    </TableCell>
                    <TableCell className="px-2 py-3 sm:px-2 text-start">
                      <div>
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {user.username}
                        </span>
                        <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                          {user.role}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-2 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {user.email}
                    </TableCell>
                    <TableCell className="px-2 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {user.name}
                    </TableCell>
                    <TableCell className="px-2 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => onEdit(user)}
                          className="text-blue-500 hover:text-blue-700"
                          aria-label={`Edit user ${user.username}`}
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() =>
                            onDelete
                              ? onDelete(user.id)
                              : alert("Delete function not implemented")
                          }
                          className="text-red-500 hover:text-red-700"
                          aria-label={`Delete user ${user.username}`}
                        >
                          <TrashBinIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell className="text-center py-4 text-gray-500">
                    No user data available
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

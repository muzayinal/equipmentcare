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
import Badge from "../ui/badge/Badge";
import Image from "next/image";
import {
  PencilIcon,
  TrashBinIcon,
} from "../../icons/index";
interface Order {
  id: number;
  user: {
    image: string;
    name: string;
    role: string;
  };
  projectName: string;
  team: {
    images: string[];
  };
  status: string;
  budget: string;
}

// Define the table data using the interface
const tableData: Order[] = [
  {
    id: 1,
    user: {
      image: "/images/user/user-17.jpg",
      name: "Lindsey Curtis",
      role: "Web Designer",
    },
    projectName: "Agency Website",
    team: {
      images: [
        "/images/user/user-22.jpg",
        "/images/user/user-23.jpg",
        "/images/user/user-24.jpg",
      ],
    },
    budget: "3.9K",
    status: "Active",
  },
  {
    id: 2,
    user: {
      image: "/images/user/user-18.jpg",
      name: "Kaiya George",
      role: "Project Manager",
    },
    projectName: "Technology",
    team: {
      images: ["/images/user/user-25.jpg", "/images/user/user-26.jpg"],
    },
    budget: "24.9K",
    status: "Pending",
  },
  {
    id: 3,
    user: {
      image: "/images/user/user-17.jpg",
      name: "Zain Geidt",
      role: "Content Writing",
    },
    projectName: "Blog Writing",
    team: {
      images: ["/images/user/user-27.jpg"],
    },
    budget: "12.7K",
    status: "Active",
  },
  {
    id: 4,
    user: {
      image: "/images/user/user-20.jpg",
      name: "Abram Schleifer",
      role: "Digital Marketer",
    },
    projectName: "Social Media",
    team: {
      images: [
        "/images/user/user-28.jpg",
        "/images/user/user-29.jpg",
        "/images/user/user-30.jpg",
      ],
    },
    budget: "2.8K",
    status: "Cancel",
  },
  {
    id: 5,
    user: {
      image: "/images/user/user-21.jpg",
      name: "Carla George",
      role: "Front-end Developer",
    },
    projectName: "Website",
    team: {
      images: [
        "/images/user/user-31.jpg",
        "/images/user/user-32.jpg",
        "/images/user/user-33.jpg",
      ],
    },
    budget: "4.5K",
    status: "Active",
  },
];
interface UserData {
  name: string;
  email: string;
}

export default function IssueTable() {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState<boolean>(true);
    useEffect(() => {
      const fetchUserData = async () => {
      const token = Cookies.get("token");
        if (!token) {
          setLoading(false);
          setError("Token not found!");
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
        } catch (err) {
          setError("Failed to fetch user data");
        } finally {
          setLoading(false);
        }
      };

      fetchUserData();

  }, []); // hanya jalan saat profileData berubah


  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }
    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
                <div className="min-w-[1102px]">
                    <Table>
                        {/* Table Header */}
                        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                            <TableRow>
                                <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                No
                                </TableCell>
                                <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                Username
                                </TableCell>
                                <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                Email
                                </TableCell>
                                <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                Full Name
                                </TableCell>
                                <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                Action
                                </TableCell>
                            </TableRow>
                        </TableHeader>

                        {/* Table Body */}
                        {userData && (
                          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {Array.isArray(userData) && userData.length > 0 ? (
                              userData.map((user, index) => (
                                  <TableRow key={user.email}>
                                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                                        <div className="flex items-center gap-3">
                                            {index + 1}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                                        <div className="flex items-center gap-3">
                                        {/* <div className="w-10 h-10 overflow-hidden rounded-full">
                                            <Image
                                            width={40}
                                            height={40}
                                            src={order.user.image}
                                            alt={order.user.name}
                                            />
                                        </div> */}
                                        <div>
                                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                            {user.username}
                                            </span>
                                            <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                                            {user.role}
                                            </span>
                                        </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        {user.email}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        {user.name}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                      <div className="flex items-center space-x-4">
                                        <button
                                          onClick={() => alert("Edit user")}
                                          className="text-blue-500 hover:text-blue-700"
                                        >
                                          <PencilIcon className="w-5 h-5" />
                                        </button>
                                        <button
                                          onClick={() => alert("Delete user")}
                                          className="text-red-500 hover:text-red-700"
                                        >
                                          <TrashBinIcon className="w-5 h-5" />
                                        </button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell className="text-center py-4">
                                  No user data available
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        )}
                    </Table>
                </div>
            </div>
        </div>
    );
}

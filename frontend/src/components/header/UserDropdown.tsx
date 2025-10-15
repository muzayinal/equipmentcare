"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Dropdown } from "../ui/dropdown/Dropdown";
// import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { co } from "@fullcalendar/core/internal-common";

interface UserData {
  name: string;
  email: string;
}

interface DecodedToken {
  id: number;
  username: string;
  email: string;
  role: string;  // Pastikan token memiliki properti 'role'
}

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState<number | null>(null); // Only store number, not object
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // === Dropdown Control ===
  const toggleDropdown = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  const closeDropdown = () => setIsOpen(false);

  // === Fetch Profile Data ===
  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = Cookies.get("token");

      if (!token) {
        console.warn("Token not found!");
        return;
      }

      try {
        // Decode token untuk mengambil payload
        const decodedToken: DecodedToken = jwtDecode(token);
        // Set userId state to the decoded id
        setUserId(decodedToken.id);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Error decoding:", error.message);
        } else {
          console.error("Unknown error occurred");
        }
        setUserId(null);
        return;
      }
    };

    fetchUserProfile();
  }, []); // This will only run once to decode the token

  useEffect(() => {
    const fetchUserData = async () => {
      if (userId === null) return; // Don't fetch if userId is not set yet

      const token = Cookies.get("token");
      if (!token) return;

      try {
        const res = await fetch(`http://localhost:4000/api/users/${userId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          const resData = await res.json();
          setError(resData.message || "Failed to fetch profile");
          return;
        }

        const data = await res.json();
        setUserData(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(`Failed to fetch profile: ${err.message}`);
        } else {
          setError("Failed to fetch profile");
        }
      }
    };

    fetchUserData();
  }, [userId]); // This will run whenever userId changes

  const handleLogout = () => {
    // Clear the token and user data from cookies
    Cookies.remove("token");
    setUserData(null); // Reset user data
    closeDropdown(); // Close the dropdown

    // Redirect to login page after logout
    router.push("/signin");
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 dark:text-gray-400 dropdown-toggle"
      >
        <span className="mr-3 overflow-hidden rounded-full h-11 w-11">
          <Image width={44} height={44} src="/images/user/owner.jpg" alt="User" />
        </span>
        <span className="block mr-1 font-medium text-theme-sm">
          {userData?.name || "User"}
        </span>
        <svg
          className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        {/* Display error message if it exists */}
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <div>
          <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
            {userData?.name || "User Name"}
          </span>
          <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
            {userData?.email || "user@domain.com"}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
        >
          Sign out
        </button>
      </Dropdown>
    </div>
  );
}

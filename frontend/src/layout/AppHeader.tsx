"use client";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import UserDropdown from "@/components/header/UserDropdown";
import { useSidebar } from "@/context/SidebarContext";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";

const AppHeader: React.FC = () => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // ✅ Pastikan useSidebar() tidak menyebabkan re-render terus-menerus
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();

  // ✅ Toggle sidebar (desktop vs mobile)
  const handleToggle = React.useCallback(() => {
    if (typeof window !== "undefined") {
      if (window.innerWidth >= 1024) {
        toggleSidebar();
      } else {
        toggleMobileSidebar();
      }
    }
  }, [toggleSidebar, toggleMobileSidebar]);

  // ✅ Toggle aplikasi menu
  const toggleApplicationMenu = React.useCallback(() => {
    setApplicationMenuOpen((prev) => !prev);
  }, []);

  // ✅ Shortcut Ctrl+K / Cmd+K fokus ke input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 flex w-full bg-white border-gray-200 z-10 dark:border-gray-800 dark:bg-gray-900 lg:border-b">
      <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
        {/* ============ Left Section ============ */}
        <div className="flex items-center justify-between w-full gap-2 px-3 py-3 border-b border-gray-200 dark:border-gray-800 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
          {/* Sidebar Toggle */}
          <button
            className="flex items-center justify-center w-10 h-10 text-gray-500 border-gray-200 rounded-lg dark:border-gray-800 dark:text-gray-400 lg:h-11 lg:w-11 lg:border"
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
          >
            {isMobileOpen ? (
              // Cross Icon
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.22 7.28a.75.75 0 0 1 1.06 0L12 11.94l4.72-4.72a.75.75 0 0 1 1.06 1.06L13.06 13l4.72 4.72a.75.75 0 1 1-1.06 1.06L12 14.06l-4.72 4.72a.75.75 0 0 1-1.06-1.06L10.94 13 6.22 8.28a.75.75 0 0 1 0-1.06z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              // Burger Icon
              <svg
                width="16"
                height="12"
                viewBox="0 0 16 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M1.33.25h13.33c.41 0 .75.34.75.75s-.34.75-.75.75H1.33A.75.75 0 0 1 .58 1c0-.41.34-.75.75-.75zM1.33 10.25h13.33c.41 0 .75.34.75.75s-.34.75-.75.75H1.33a.75.75 0 1 1 0-1.5zm0-5h6.67c.41 0 .75.34.75.75s-.34.75-.75.75H1.33a.75.75 0 1 1 0-1.5z"
                  fill="currentColor"
                />
              </svg>
            )}
          </button>

          {/* Logo */}
          <Link href="/" className="lg:hidden">
            Equipment Care
          </Link>

          {/* Application Menu Toggle (Mobile) */}
          <button
            onClick={toggleApplicationMenu}
            className="flex items-center justify-center w-10 h-10 text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6 10.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm12 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-6 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>

        {/* ============ Right Section ============ */}
        <div
          className={`${
            isApplicationMenuOpen ? "flex" : "hidden"
          } items-center justify-between w-full gap-4 px-5 py-4 lg:flex shadow-theme-md lg:justify-end lg:px-0 lg:shadow-none`}
        >
          <div className="flex items-center gap-2 2xsm:gap-3">
            <ThemeToggleButton />
          </div>
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Shield, CalendarDays, Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const navItems = [
  { name: "Plantilla", href: "/plantilla", icon: Users },
  { name: "Equipos", href: "/equipos", icon: Shield },
  { name: "Partidos", href: "/partidos", icon: CalendarDays },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const NavLinks = () => (
    <div className="flex flex-col gap-2">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={closeMobileMenu}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
              ${
                isActive
                  ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 font-medium"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
          >
            <Icon
              className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                isActive ? "text-purple-600 dark:text-purple-400" : ""
              }`}
            />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Mobile Header & Hamburger */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-40 shadow-sm">
        <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white">
          RACING <span className="text-purple-600 dark:text-purple-400">ZGZ</span>
        </span>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar Content (Desktop & Mobile side-sheet) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex flex-col h-screen ${
          isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="p-6 flex flex-col h-full">
          {/* Desktop Logo & Theme Toggle (Hidden on mobile header) */}
          <div className="hidden lg:flex items-center justify-between mb-10">
            <h1 className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">
              RACING <span className="text-purple-600 dark:text-purple-400">ZGZ</span>
            </h1>
            <ThemeToggle />
          </div>

          {/* Mobile Logo (Inside Drawer) */}
          <div className="flex lg:hidden items-center justify-between mb-8">
            <h1 className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">
              RACING <span className="text-purple-600 dark:text-purple-400">ZGZ</span>
            </h1>
            <button
              onClick={closeMobileMenu}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1">
            <NavLinks />
          </nav>

          {/* Bottom section (Optional, e.g., Profile or Logout) */}
          <div className="pt-6 border-t border-gray-100 dark:border-gray-800 mt-auto">
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} Racing Club Zaragoza
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

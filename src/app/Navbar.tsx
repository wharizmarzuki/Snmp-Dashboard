"use client";

import React, { useState } from "react";
import { LayoutDashboard, HardDrive, Bell, FileText } from "lucide-react";

export default function Navbar() {
  const [activeRoute, setActiveRoute] = useState("/");

  const navItems = [
    { href: "/", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/devices", icon: HardDrive, label: "Devices" },
    { href: "/alerts", icon: Bell, label: "Alerts" },
    { href: "/reports", icon: FileText, label: "Reports" },
  ];

  interface NavItem {
    href: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    label: string;
  }

  const handleNavClick = (href: string): void => {
    setActiveRoute(href);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* The Navbar */}
      <div className="w-full border-b bg-white">
        <div className="flex items-center gap-6 px-4 py-2">
          <div className="text-lg font-semibold">NetSNMP</div>
          <nav className="flex gap-2">
            {navItems.map(({ href, icon: Icon, label }) => (
              <a
                key={href}
                href={href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(href);
                }}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-100 hover:text-slate-900 transition-colors ${
                  activeRoute === href
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-700"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </a>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}

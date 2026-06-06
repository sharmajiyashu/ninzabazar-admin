"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Collapsible from "@radix-ui/react-collapsible";
import { IconChevronDown, IconLogout } from "@tabler/icons-react";
import { sidebarNav, isNavSection } from "@/lib/sidebar-nav";
import React, { useState } from "react";
import { twMerge } from "tailwind-merge";
import { signOut } from "next-auth/react";

export function DashboardSidebar() {
  const pathname = usePathname();
  const [openSections, setOpenSections] = React.useState<
    Record<string, boolean>
  >({});

  const handleLogout = () => {
    signOut();
  };

  return (
    <aside className="flex h-full w-full flex-col bg-green-900 text-green-50">
      {/* Brand Header */}
      <div className="flex h-16 shrink-0 items-center px-6">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 transition-transform hover:opacity-90 active:scale-[0.98]"
        >
          <span className="text-xl font-bold text-white truncate">Ninja Bazaar</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto scrollbar-none">
        {sidebarNav.map((item) => {
          const hasItems = isNavSection(item);
          const Icon = item.icon;
          const href = item.href;
          const title = item.titleKey;

          if (!hasItems) {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                scroll={false}
                className={twMerge(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-green-600 text-white shadow-md shadow-green-900/20"
                    : "text-green-200 hover:bg-green-800 hover:text-white"
                )}
              >
                {Icon && (
                  <Icon 
                    className={twMerge(
                      "h-5 w-5 shrink-0 transition-transform group-hover:scale-110",
                      isActive ? "text-white" : "text-green-300 group-hover:text-white"
                    )} 
                  />
                )}
                <span>{title}</span>
              </Link>
            );
          }

          const isOpen = openSections[href] ?? pathname.startsWith(href);
          return (
            <Collapsible.Root
              key={href}
              open={isOpen}
              onOpenChange={(open) =>
                setOpenSections((prev) => ({ ...prev, [href]: open }))
              }
              className="space-y-1"
            >
              <Collapsible.Trigger
                className={twMerge(
                  "group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200",
                  "text-green-200 hover:bg-green-800 hover:text-white",
                  isOpen && "bg-green-800/50 text-white"
                )}
              >
                <div className="flex items-center gap-3">
                  {Icon && (
                    <Icon 
                      className={twMerge(
                        "h-5 w-5 shrink-0 transition-transform group-hover:scale-110",
                        isOpen ? "text-white" : "text-green-300 group-hover:text-white"
                      )} 
                    />
                  )}
                  <span>{title}</span>
                </div>
                <IconChevronDown 
                  className={twMerge(
                    "h-4 w-4 shrink-0 transition-transform duration-300 opacity-50", 
                    isOpen && "rotate-180 opacity-100"
                  )} 
                />
              </Collapsible.Trigger>
              <Collapsible.Content className="overflow-hidden animate-in slide-in-from-top-2 duration-300">
                <div className="ml-5 mt-1 border-l-2 border-green-700 pl-4 space-y-1">
                  {item.items.map((sub) => {
                    const subActive = pathname === sub.href;
                    const SubIcon = sub.icon;
                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        scroll={false}
                        className={twMerge(
                          "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                          subActive
                            ? "font-semibold text-green-50 bg-green-700"
                            : "text-green-300 hover:text-white hover:bg-green-800/50"
                        )}
                      >
                        {SubIcon && (
                          <SubIcon className={twMerge("h-4 w-4 shrink-0", subActive ? "text-green-100" : "text-green-400")} />
                        )}
                        {sub.titleKey}
                      </Link>
                    );
                  })}
                </div>
              </Collapsible.Content>
            </Collapsible.Root>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="mt-auto p-4 border-t border-green-800">
        <button
          onClick={handleLogout}
          className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-green-200 hover:bg-green-800 hover:text-white transition-all duration-200"
        >
          <IconLogout className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}

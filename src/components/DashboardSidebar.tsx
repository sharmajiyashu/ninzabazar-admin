"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Collapsible from "@radix-ui/react-collapsible";
import { IconChevronDown, IconLogout } from "@tabler/icons-react";
import { ROUTES } from "@/constants/routes";
import {
  sidebarNav,
  isNavSection,
  isNavEntryActive,
  type SidebarNavEntry,
} from "@/constants/navigation";
import React from "react";
import { twMerge } from "tailwind-merge";
import { logoutAdmin } from "@/lib/auth-client";

function NavEntry({
  item,
  depth = 0,
  openSections,
  setOpenSections,
}: {
  item: SidebarNavEntry;
  depth?: number;
  openSections: Record<string, boolean>;
  setOpenSections: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}) {
  const pathname = usePathname();
  const hasItems = isNavSection(item);
  const Icon = item.icon;
  const href = item.href;
  const title = item.titleKey;
  const sectionKey = `${depth}:${href}`;

  if (!hasItems) {
    const isActive = pathname === href;
    return (
      <Link
        key={sectionKey}
        href={href}
        scroll={false}
        className={twMerge(
          "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
          depth > 0 && "rounded-lg py-2",
          isActive
            ? "bg-green-600 text-white shadow-md shadow-green-900/20"
            : "text-green-200 hover:bg-green-800 hover:text-white"
        )}
      >
        {Icon && (
          <Icon
            className={twMerge(
              "shrink-0 transition-transform group-hover:scale-110",
              depth > 0 ? "h-4 w-4" : "h-5 w-5",
              isActive ? "text-white" : "text-green-300 group-hover:text-white"
            )}
          />
        )}
        <span>{title}</span>
      </Link>
    );
  }

  const isActive = isNavEntryActive(pathname, item);
  const isOpen = openSections[sectionKey] ?? isActive;

  return (
    <Collapsible.Root
      key={sectionKey}
      open={isOpen}
      onOpenChange={(open) =>
        setOpenSections((prev) => ({ ...prev, [sectionKey]: open }))
      }
      className="space-y-1"
    >
      <Collapsible.Trigger
        className={twMerge(
          "group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200",
          depth > 0 && "rounded-lg py-2",
          "text-green-200 hover:bg-green-800 hover:text-white",
          (isOpen || isActive) && "bg-green-800/50 text-white"
        )}
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <Icon
              className={twMerge(
                "shrink-0 transition-transform group-hover:scale-110",
                depth > 0 ? "h-4 w-4" : "h-5 w-5",
                isOpen || isActive
                  ? "text-white"
                  : "text-green-300 group-hover:text-white"
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
        <div
          className={twMerge(
            "mt-1 space-y-1 border-l-2 border-green-700 pl-4",
            depth === 0 ? "ml-5" : "ml-3"
          )}
        >
          {item.items.map((sub) => (
            <NavEntry
              key={`${depth + 1}:${sub.href}`}
              item={sub}
              depth={depth + 1}
              openSections={openSections}
              setOpenSections={setOpenSections}
            />
          ))}
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

export function DashboardSidebar() {
  const [openSections, setOpenSections] = React.useState<
    Record<string, boolean>
  >({});

  const handleLogout = () => {
    void logoutAdmin();
  };

  return (
    <aside className="flex h-full w-full flex-col bg-green-900 text-green-50">
      {/* Brand Header */}
      <div className="flex h-16 shrink-0 items-center px-6">
        <Link
          href={ROUTES.dashboard}
          className="flex min-w-0 items-center gap-2.5 transition-transform hover:opacity-90 active:scale-[0.98]"
        >
          <span className="text-xl font-bold text-white truncate">Ninja Bazaar</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto scrollbar-none">
        {sidebarNav.map((item) => (
          <NavEntry
            key={item.href}
            item={item}
            openSections={openSections}
            setOpenSections={setOpenSections}
          />
        ))}
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

import {
  IconUsers,
  IconPackage,
  IconBuildingStore,
  IconShoppingCart,
  IconShieldLock,
  IconLayoutDashboard,
  IconTags,
  IconLayout,
  IconSettings,
  IconMessage2,
  IconAdjustments,
} from "@tabler/icons-react";

export interface SidebarNavItem {
  titleKey: string;
  href: string;
  icon?: React.ElementType;
}

export interface SidebarNavSection {
  titleKey: string;
  href: string;
  items: SidebarNavEntry[];
  icon?: React.ElementType;
}

export type SidebarNavEntry = SidebarNavItem | SidebarNavSection;

export function isNavSection(
  item: SidebarNavEntry
): item is SidebarNavSection {
  return "items" in item && Array.isArray((item as SidebarNavSection).items);
}

export function collectNavHrefs(entry: SidebarNavEntry): string[] {
  if (!isNavSection(entry)) {
    return [entry.href];
  }
  return entry.items.flatMap(collectNavHrefs);
}

export function isNavEntryActive(pathname: string, entry: SidebarNavEntry): boolean {
  if (!isNavSection(entry)) {
    return pathname === entry.href;
  }
  return collectNavHrefs(entry).some(
    (href) => pathname === href || pathname.startsWith(`${href}/`)
  );
}

export const sidebarNav: SidebarNavEntry[] = [
  { titleKey: "Dashboard", href: "/", icon: IconLayoutDashboard },
  { titleKey: "User Management", href: "/user-management", icon: IconUsers },
  { titleKey: "Store Approval", href: "/store-approval", icon: IconBuildingStore },
  {
    titleKey: "Administration",
    href: "/product-approval",
    icon: IconAdjustments,
    items: [
      { titleKey: "Product Approval", href: "/product-approval", icon: IconPackage },
      { titleKey: "Product Settings", href: "/product-settings-management", icon: IconSettings },
      { titleKey: "Categories", href: "/category-management", icon: IconTags },
      { titleKey: "Subcategories", href: "/category-management/subcategories", icon: IconTags },
      { titleKey: "Landing Page Management", href: "/landing-page-management", icon: IconLayout },
    ],
  },
  { titleKey: "Customer Queries", href: "/customer-queries", icon: IconMessage2 },
  { titleKey: "Order Management", href: "/order-disputes", icon: IconShoppingCart },
  { titleKey: "Escrow Management", href: "/escrow-management", icon: IconShieldLock },
];

import {
  IconUsers,
  IconPackage,
  IconBuildingStore,
  IconShoppingCart,
  IconShieldLock,
  IconLayoutDashboard
} from "@tabler/icons-react";

export interface SidebarNavItem {
  titleKey: string;
  href: string;
  icon?: React.ElementType;
}

export interface SidebarNavSection {
  titleKey: string;
  href: string;
  items: SidebarNavItem[];
  icon?: React.ElementType;
}

export type SidebarNavEntry = SidebarNavItem | SidebarNavSection;

export function isNavSection(
  item: SidebarNavEntry
): item is SidebarNavSection {
  return "items" in item && Array.isArray((item as SidebarNavSection).items);
}

export const sidebarNav: SidebarNavEntry[] = [
  { titleKey: "Dashboard", href: "/", icon: IconLayoutDashboard },
  { titleKey: "User Management", href: "/user-management", icon: IconUsers },
  { titleKey: "Product Approval", href: "/product-approval", icon: IconPackage },
  { titleKey: "Store Approval", href: "/store-approval", icon: IconBuildingStore },
  { titleKey: "Order Management", href: "/order-disputes", icon: IconShoppingCart },
  { titleKey: "Escrow Management", href: "/escrow-management", icon: IconShieldLock },
];

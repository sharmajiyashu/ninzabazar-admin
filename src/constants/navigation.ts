import {
  IconBuildingStore,
  IconLayout,
  IconMessage2,
  IconPackage,
  IconSettings,
  IconShieldLock,
  IconShoppingCart,
  IconTags,
  IconUsers,
  IconLayoutDashboard,
  IconAdjustments,
} from '@tabler/icons-react';
import { ROUTES } from '@/constants/routes';

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
  return 'items' in item && Array.isArray((item as SidebarNavSection).items);
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
  { titleKey: 'Dashboard', href: ROUTES.dashboard, icon: IconLayoutDashboard },
  { titleKey: 'Users', href: ROUTES.users, icon: IconUsers },
  { titleKey: 'Products', href: ROUTES.products, icon: IconPackage },
  { titleKey: 'Orders', href: ROUTES.orders, icon: IconShoppingCart },
  { titleKey: 'Store Approvals', href: ROUTES.stores, icon: IconBuildingStore },
  { titleKey: 'Customer Queries', href: ROUTES.queries, icon: IconMessage2 },
  {
    titleKey: 'Categories',
    href: ROUTES.categories,
    icon: IconTags,
    items: [
      { titleKey: 'Categories', href: ROUTES.categories, icon: IconTags },
      { titleKey: 'Subcategories', href: ROUTES.subcategories, icon: IconTags },
    ],
  },
  {
    titleKey: 'Settings',
    href: ROUTES.settings,
    icon: IconSettings,
    items: [
      { titleKey: 'Overview', href: ROUTES.settings, icon: IconSettings },
      { titleKey: 'Product Config', href: ROUTES.settingsProductConfig, icon: IconAdjustments },
      { titleKey: 'Landing Page', href: ROUTES.settingsLanding, icon: IconLayout },
      { titleKey: 'Escrow', href: ROUTES.settingsEscrow, icon: IconShieldLock },
    ],
  },
];

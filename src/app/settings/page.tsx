import Link from 'next/link';
import { ROUTES } from '@/constants/routes';

const settingsLinks = [
  { title: 'Product Configuration', href: ROUTES.settingsProductConfig, description: 'Brands, colors, and materials' },
  { title: 'Landing Page', href: ROUTES.settingsLanding, description: 'Manage homepage sections and deals' },
  { title: 'Escrow Management', href: ROUTES.settingsEscrow, description: 'Manage held payments and releases' },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Platform configuration and administrative tools.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {settingsLinks.map(({ title, href, description }) => (
          <Link
            key={href}
            href={href}
            className="rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-green-600/40 hover:bg-green-50/50"
          >
            <h2 className="font-semibold text-foreground">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

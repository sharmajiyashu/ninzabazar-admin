import DashboardCharts from '@/components/dashboard/DashboardCharts';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Platform overview with live metrics and trends.
        </p>
      </div>

      <DashboardCharts />
    </div>
  );
}

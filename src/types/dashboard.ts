export interface DashboardStatCard {
  label: string;
  value: number;
  href: string;
  tone: 'green' | 'blue' | 'amber' | 'rose';
}

export interface ChartDatum {
  name: string;
  value: number;
  fill?: string;
}

export interface OrdersTrendPoint {
  date: string;
  orders: number;
  revenue: number;
}

export interface DashboardStats {
  summary: DashboardStatCard[];
  ordersTrend: OrdersTrendPoint[];
  storeStatus: ChartDatum[];
  productStatus: ChartDatum[];
  queryStatus: ChartDatum[];
}

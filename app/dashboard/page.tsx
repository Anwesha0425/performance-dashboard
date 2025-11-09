import DashboardClient from './DashboardClient';
import { generateInitialDataset } from '@/lib/dataGenerator';

export const metadata = {
  title: 'Performance Dashboard | Next.js 14',
  description: 'High-performance real-time data visualization dashboard',
};

export default async function DashboardPage() {
  
  const initialData = generateInitialDataset(10000);

  return <DashboardClient initialData={initialData} />;
}
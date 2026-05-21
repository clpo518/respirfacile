'use client';

interface DashboardStatCardProps {
  value: number;
  label: string;
  icon?: string;
  status?: 'normal' | 'alert' | 'success';
  description?: string;
}

export default function DashboardStatCard({
  value,
  label,
  icon = '📊',
  status = 'normal',
  description,
}: DashboardStatCardProps) {
  const statusColors = {
    normal: 'text-forest-800',
    alert: 'text-red-600',
    success: 'text-green-700',
  };

  return (
    <div className="bg-white rounded-2xl border border-beige-200 p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        {description && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            status === 'alert' ? 'bg-red-50 text-red-600' :
            status === 'success' ? 'bg-green-50 text-green-600' :
            'bg-beige-100 text-forest-500'
          }`}>{description}</span>
        )}
      </div>
      <div className={`text-3xl font-bold ${statusColors[status]} mb-1`}>
        {value}
      </div>
      <p className="text-xs font-medium text-forest-500">{label}</p>
    </div>
  );
}

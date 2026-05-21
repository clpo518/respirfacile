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
    <div className="bg-white rounded-3xl border border-beige-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{icon}</span>
          {description && (
            <span className="text-xs text-forest-500 font-medium">{description}</span>
          )}
        </div>
      </div>
      <div className={`text-4xl font-bold ${statusColors[status]} mb-2`}>
        {value}
      </div>
      <p className="text-sm font-medium text-forest-600">{label}</p>
    </div>
  );
}

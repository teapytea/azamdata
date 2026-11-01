import { ReactNode } from "react";

interface KpiCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  colorClass: string;
  trend?: string;
  onClick?: () => void;
}

export default function KpiCard({
  title,
  value,
  icon,
  colorClass,
  trend,
  onClick,
}: KpiCardProps) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-xl border-2 p-6 transition-all duration-200 cursor-pointer
        hover:shadow-lg hover:-translate-y-1 hover:scale-105
        ${colorClass}
        ${onClick ? "hover:shadow-xl" : ""}
      `}
      onClick={onClick}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <defs>
            <pattern
              id="grid"
              width="10"
              height="10"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 10 0 L 0 0 0 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-shrink-0">{icon}</div>
          {trend && (
            <div className="text-xs font-medium opacity-75">{trend}</div>
          )}
        </div>

        <div className="space-y-1">
          <h3 className="text-sm font-medium opacity-90 leading-tight">
            {title}
          </h3>
          <div className="text-3xl font-bold tracking-tight">
            {value.toLocaleString("id-ID")}
          </div>
        </div>
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity duration-200" />
    </div>
  );
}

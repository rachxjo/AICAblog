import { CheckCircle, AlertTriangle, HelpCircle, XCircle } from "lucide-react";
import type { FactCheckStatus } from "@/types/database";

const CONFIG: Record<
  FactCheckStatus,
  { icon: React.ElementType; label: string; className: string }
> = {
  verified: {
    icon: CheckCircle,
    label: "Fact-Checked",
    className: "text-green-600 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800",
  },
  uncertain: {
    icon: AlertTriangle,
    label: "Under Review",
    className: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800",
  },
  unverified: {
    icon: HelpCircle,
    label: "Unverified",
    className: "text-gray-500 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700",
  },
  flagged: {
    icon: XCircle,
    label: "Flagged for Review",
    className: "text-red-600 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800",
  },
};

export function FactCheckBadge({ status }: { status: FactCheckStatus }) {
  const config = CONFIG[status];
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </div>
  );
}

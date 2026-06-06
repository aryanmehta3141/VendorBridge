import { useEffect, useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import Loading from "@/components/common/Loading";
import { get } from "@/services/api";

interface DashboardStats {
  totalVendors: number;
  activeRFQs: number;
  pendingApprovals: number;
  totalInvoices: number;
}

interface DashboardResponse {
  success: boolean;
  data: DashboardStats;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await get<DashboardResponse>("/dashboard");
        setStats(res.data);
      } catch {
        setError("Failed to load dashboard stats.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const cards = stats
    ? [
        { label: "Total Vendors", value: stats.totalVendors, color: "bg-blue-50 text-blue-700 border-blue-200" },
        { label: "Active RFQs", value: stats.activeRFQs, color: "bg-green-50 text-green-700 border-green-200" },
        { label: "Pending Approvals", value: stats.pendingApprovals, color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
        { label: "Total Invoices", value: stats.totalInvoices, color: "bg-purple-50 text-purple-700 border-purple-200" },
      ]
    : [];

  return (
    <div>
      <PageHeader title="Dashboard" description="Analytics and overview" />

      {loading && <Loading />}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {stats && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <div key={card.label} className={`rounded-lg border p-5 ${card.color}`}>
              <p className="text-sm font-medium opacity-80">{card.label}</p>
              <p className="mt-1 text-3xl font-bold">{card.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

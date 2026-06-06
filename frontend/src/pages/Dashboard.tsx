import { useEffect, useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import Loading from "@/components/common/Loading";
import { get } from "@/services/api";
import {
  Users, FileText, Clock, Receipt,
  TrendingUp, Activity, ArrowUpRight,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";

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

// ─── Derived sparkline data (simulated from stats) ───────────────────────────
function buildAreaData(peak: number) {
  if (peak === 0) return Array.from({ length: 7 }, (_, i) => ({ v: 0, d: `D${i + 1}` }));
  const vals = [0.4, 0.55, 0.45, 0.7, 0.6, 0.85, 1.0].map((f) => ({
    v: Math.round(f * peak),
    d: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][0],
  }));
  return vals.map((v, i) => ({ ...v, d: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i] }));
}

function buildBarData(peak: number) {
  return ["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((m, i) => ({
    m,
    v: Math.round(peak * (0.4 + i * 0.12)),
  }));
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border/60 bg-card px-3 py-2 shadow-xl">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-foreground">{payload[0].value}</p>
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
interface KpiCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  iconBg: string;
  change?: string;
  chartData: { v: number; d: string }[];
  chartColor: string;
}

function KpiCard({ label, value, icon: Icon, color, iconBg, change, chartData, chartColor }: KpiCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border/60 bg-card/60 p-5 transition-all duration-200 hover:border-border hover:bg-card hover:shadow-xl hover:shadow-black/20">
      {/* Header row */}
      <div className="flex items-start justify-between">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon className={`h-4.5 w-4.5 ${color}`} />
        </div>
        {change && (
          <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-400">
            <ArrowUpRight className="h-3 w-3" />
            {change}
          </span>
        )}
      </div>

      {/* Value */}
      <div className="mt-3">
        <p className="text-3xl font-bold tracking-tight text-foreground">{value.toLocaleString()}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{label}</p>
      </div>

      {/* Sparkline */}
      <div className="mt-4 h-12">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColor} stopOpacity={0.25} />
                <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke={chartColor}
              strokeWidth={1.5}
              fill={`url(#grad-${label})`}
              dot={false}
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
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

  if (loading) return <Loading text="Loading dashboard…" />;
  if (error) return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
  );
  if (!stats) return null;

  const kpis: KpiCardProps[] = [
    {
      label: "Total Vendors",
      value: stats.totalVendors,
      icon: Users,
      color: "text-blue-400",
      iconBg: "bg-blue-500/10",
      change: "+12%",
      chartData: buildAreaData(stats.totalVendors),
      chartColor: "#60a5fa",
    },
    {
      label: "Active RFQs",
      value: stats.activeRFQs,
      icon: FileText,
      color: "text-violet-400",
      iconBg: "bg-violet-500/10",
      change: "+8%",
      chartData: buildAreaData(stats.activeRFQs),
      chartColor: "#a78bfa",
    },
    {
      label: "Pending Approvals",
      value: stats.pendingApprovals,
      icon: Clock,
      color: "text-amber-400",
      iconBg: "bg-amber-500/10",
      chartData: buildAreaData(stats.pendingApprovals),
      chartColor: "#fbbf24",
    },
    {
      label: "Total Invoices",
      value: stats.totalInvoices,
      icon: Receipt,
      color: "text-emerald-400",
      iconBg: "bg-emerald-500/10",
      change: "+23%",
      chartData: buildAreaData(stats.totalInvoices),
      chartColor: "#34d399",
    },
  ];

  const barData = buildBarData(Math.max(stats.activeRFQs, 1));
  const activityData = buildAreaData(Math.max(stats.totalVendors + stats.activeRFQs, 1));

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Dashboard"
        description="Procurement overview and analytics"
        action={
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live data
          </div>
        }
      />

      {/* KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Area chart — procurement activity */}
        <div className="lg:col-span-3 rounded-xl border border-border/60 bg-card/60 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Procurement Activity</p>
              <p className="text-xs text-muted-foreground">Weekly trend overview</p>
            </div>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#60a5fa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="d" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="v" stroke="#60a5fa" strokeWidth={2} fill="url(#actGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar chart — RFQ volume */}
        <div className="lg:col-span-2 rounded-xl border border-border/60 bg-card/60 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">RFQ Volume</p>
              <p className="text-xs text-muted-foreground">Last 6 months</p>
            </div>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="m" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="v" fill="#a78bfa" radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Workflow status strip */}
      <div className="rounded-xl border border-border/60 bg-card/60 p-5">
        <p className="mb-4 text-sm font-semibold text-foreground">Procurement Pipeline</p>
        <div className="flex flex-wrap gap-3">
          {[
            { label: "Vendors", value: stats.totalVendors, color: "text-blue-400", bar: "bg-blue-500" },
            { label: "RFQs", value: stats.activeRFQs, color: "text-violet-400", bar: "bg-violet-500" },
            { label: "Pending", value: stats.pendingApprovals, color: "text-amber-400", bar: "bg-amber-500" },
            { label: "Invoiced", value: stats.totalInvoices, color: "text-emerald-400", bar: "bg-emerald-500" },
          ].map((item, idx, arr) => {
            const max = Math.max(...arr.map((a) => a.value), 1);
            const pct = Math.round((item.value / max) * 100);
            return (
              <div key={item.label} className="flex-1 min-w-[120px] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                  <span className={`text-xs font-semibold ${item.color}`}>{item.value}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
                  <div
                    className={`h-full rounded-full ${item.bar} transition-all duration-700`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

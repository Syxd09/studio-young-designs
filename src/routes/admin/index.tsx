import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import {
  Users,
  MessageSquare,
  Image as ImageIcon,
  Briefcase,
  ArrowRight,
  Clock,
  CheckCircle2,
  Database,
  TrendingUp,
  Sliders,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { format, subDays, startOfDay, isSameDay } from "date-fns";

export const Route = createFileRoute("/admin/")({
  component: DashboardComponent,
});

interface Stats {
  leads: number;
  gallery: number;
  services: number;
  testimonials: number;
}

interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  status: string;
  created_at: string;
}

interface DailyTrend {
  date: string;
  displayDate: string;
  count: number;
}

interface ServiceRatio {
  name: string;
  count: number;
  percentage: number;
}

function DashboardComponent() {
  const [stats, setStats] = useState<Stats>({ leads: 0, gallery: 0, services: 0, testimonials: 0 });
  const [recentLeads, setRecentLeads] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<"connected" | "warning">("connected");
  const [dailyTrends, setDailyTrends] = useState<DailyTrend[]>([]);
  const [serviceRatios, setServiceRatios] = useState<ServiceRatio[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Get counts
      const [leadsRes, galleryRes, servicesRes, testimonialsRes] = await Promise.all([
        supabase.from("enquiries").select("*", { count: "exact", head: true }),
        supabase.from("gallery").select("*", { count: "exact", head: true }),
        supabase.from("services").select("*", { count: "exact", head: true }),
        supabase.from("testimonials").select("*", { count: "exact", head: true }),
      ]);

      if (leadsRes.error || galleryRes.error) {
        setDbStatus("warning");
      } else {
        setDbStatus("connected");
      }

      // 2. Get recent leads
      const { data: recent, error: recentErr } = await supabase
        .from("enquiries")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(4);

      if (recentErr) throw recentErr;

      const totalLeads = leadsRes.count || 0;
      setStats({
        leads: totalLeads,
        gallery: galleryRes.count || 0,
        services: servicesRes.count || 0,
        testimonials: testimonialsRes.count || 0,
      });

      setRecentLeads(recent || []);

      // 3. Calculate 7-day trend
      const { data: trendData = [] } = await supabase
        .from("enquiries")
        .select("created_at, service")
        .order("created_at", { ascending: true });

      const trends: DailyTrend[] = [];
      const serviceCounts: Record<string, number> = {};

      for (let i = 6; i >= 0; i--) {
        const targetDate = subDays(new Date(), i);
        trends.push({
          date: format(targetDate, "yyyy-MM-dd"),
          displayDate: format(targetDate, "EEE"),
          count: 0,
        });
      }

      (trendData || []).forEach((lead) => {
        // Group trends
        const leadDate = new Date(lead.created_at);
        trends.forEach((t) => {
          if (isSameDay(leadDate, new Date(t.date))) {
            t.count++;
          }
        });

        // Group service ratios
        const svc = lead.service || "Other";
        serviceCounts[svc] = (serviceCounts[svc] || 0) + 1;
      });

      setDailyTrends(trends);

      const ratios: ServiceRatio[] = Object.entries(serviceCounts)
        .map(([name, count]) => ({
          name,
          count,
          percentage: totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0,
        }))
        .sort((a, b) => b.count - a.count);

      setServiceRatios(ratios);
    } catch (err) {
      console.error("Error loading dashboard stats:", err);
      setDbStatus("warning");
    } finally {
      setLoading(false);
    }
  };

  // SVG Chart Calculations
  const chartHeight = 120;
  const chartWidth = 500;
  const padding = 20;
  const maxCount = Math.max(...dailyTrends.map((t) => t.count), 4); // minimum ceiling of 4 for better visual scale

  const points = dailyTrends.map((t, idx) => {
    const x = padding + (idx * (chartWidth - padding * 2)) / (dailyTrends.length - 1);
    const y = chartHeight - padding - (t.count * (chartHeight - padding * 2)) / maxCount;
    return { x, y, count: t.count, label: t.displayDate };
  });

  const pathD =
    points.length > 0
      ? `M ${points[0].x} ${points[0].y} ` +
        points
          .slice(1)
          .map((p) => `L ${p.x} ${p.y}`)
          .join(" ")
      : "";

  const areaD =
    points.length > 0
      ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`
      : "";

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-transparent">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-[#cb2026]" />
          <p className="font-display text-xs tracking-widest uppercase text-stone-400">
            Analyzing Command Metrics
          </p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Active Inquiries",
      count: stats.leads,
      icon: MessageSquare,
      color: "text-[#cb2026]",
      bg: "bg-[#cb2026]/10",
      border: "hover:border-[#cb2026]/50",
    },
    {
      label: "Portfolio Items",
      count: stats.gallery,
      icon: ImageIcon,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/20",
      border: "hover:border-blue-300 dark:hover:border-blue-800",
    },
    {
      label: "Bespoke Services",
      count: stats.services,
      icon: Briefcase,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/20",
      border: "hover:border-emerald-300 dark:hover:border-emerald-800",
    },
    {
      label: "Approved Reviews",
      count: stats.testimonials,
      icon: Users,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-950/20",
      border: "hover:border-purple-300 dark:hover:border-purple-800",
    },
  ];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-stone-850 dark:text-[#FAF9F6]">
      {/* Welcome Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#141416] border border-stone-200 dark:border-stone-850 p-6 rounded-xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-display font-semibold text-stone-900 dark:text-white tracking-wide">
              Command Center
            </h1>
            <span
              className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                dbStatus === "connected"
                  ? "bg-green-100 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/50"
                  : "bg-amber-100 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50"
              }`}
            >
              <Database size={10} />
              {dbStatus === "connected" ? "DB Live" : "DB Offline"}
            </span>
          </div>
          <p className="text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-widest mt-1.5 font-bold">
            Studio Young Designs Luxury CMS
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link
            to="/admin/gallery"
            className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-stone-900 dark:text-white bg-stone-100 dark:bg-stone-850 hover:bg-stone-200 dark:hover:bg-stone-800 px-3.5 py-2 rounded-lg transition-all font-bold"
          >
            <ImageIcon size={12} className="text-[#cb2026]" />
            <span>+ Portfolio Item</span>
          </Link>
          <Link
            to="/admin/journal"
            className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-stone-900 dark:text-white bg-stone-100 dark:bg-stone-850 hover:bg-stone-200 dark:hover:bg-stone-800 px-3.5 py-2 rounded-lg transition-all font-bold"
          >
            <Briefcase size={12} className="text-[#cb2026]" />
            <span>+ Write Article</span>
          </Link>
          <Link
            to="/admin/enquiries"
            className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-stone-900 dark:text-white bg-stone-100 dark:bg-stone-850 hover:bg-stone-200 dark:hover:bg-stone-800 px-3.5 py-2 rounded-lg transition-all font-bold"
          >
            <MessageSquare size={12} className="text-[#cb2026]" />
            <span>Leads CRM</span>
          </Link>
          <button
            onClick={fetchDashboardData}
            className="text-[10px] uppercase tracking-widest text-[#cb2026] border border-[#cb2026]/40 hover:border-[#cb2026] px-3.5 py-2 rounded-lg transition-all font-bold cursor-pointer"
          >
            Sync Server
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.08 }}
            className={`border bg-white dark:bg-[#141416] border-stone-200 dark:border-stone-850 p-5 rounded-xl relative overflow-hidden group transition-all shadow-sm ${card.border}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[9px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-bold">
                  {card.label}
                </p>
                <h3 className="text-3xl font-display font-bold text-stone-900 dark:text-white mt-1.5">
                  {card.count}
                </h3>
              </div>
              <div className={`p-2.5 rounded ${card.bg}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-20 h-20 bg-stone-50 dark:bg-stone-900/35 rounded-full group-hover:scale-150 transition-all duration-700 pointer-events-none" />
          </motion.div>
        ))}
      </div>

      {/* Graphs / Analytics and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend analysis chart */}
        <section className="lg:col-span-2 border border-stone-200 dark:border-stone-850 bg-white dark:bg-[#141416] rounded-xl p-6 space-y-6 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xs uppercase tracking-widest font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <TrendingUp size={14} className="text-[#cb2026]" />
                Inquiry Intake Trends
              </h2>
              <p className="text-[10px] text-stone-400 dark:text-stone-550 mt-1 font-semibold">
                Number of customer leads received over the last 7 days
              </p>
            </div>
          </div>

          {/* Area Chart rendered dynamically via SVG */}
          <div className="w-full overflow-hidden pt-2">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto overflow-visible"
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#cb2026" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#cb2026" stopOpacity="0.00" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.5, 1].map((ratio, i) => {
                const y = padding + ratio * (chartHeight - padding * 2);
                return (
                  <line
                    key={i}
                    x1={padding}
                    y1={y}
                    x2={chartWidth - padding}
                    y2={y}
                    stroke="rgba(128,128,128,0.08)"
                    strokeWidth="1"
                    strokeDasharray="4"
                  />
                );
              })}

              {/* Fill Area */}
              {areaD && (
                <motion.path
                  d={areaD}
                  fill="url(#chartGradient)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8 }}
                />
              )}

              {/* Line Path */}
              {pathD && (
                <motion.path
                  d={pathD}
                  fill="none"
                  stroke="#cb2026"
                  strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                />
              )}

              {/* Data Markers */}
              {points.map((p, idx) => (
                <g key={idx} className="group/dot cursor-pointer">
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="4"
                    fill="#FFFFFF"
                    stroke="#cb2026"
                    strokeWidth="2"
                    className="transition-all duration-300 group-hover/dot:r-6"
                  />
                  {p.count > 0 && (
                    <text
                      x={p.x}
                      y={p.y - 10}
                      textAnchor="middle"
                      fill="currentColor"
                      fontSize="9"
                      fontWeight="bold"
                      className="opacity-70 dark:opacity-90 group-hover/dot:opacity-100 transition-opacity"
                    >
                      {p.count}
                    </text>
                  )}
                  {/* X Axis Label */}
                  <text
                    x={p.x}
                    y={chartHeight - 4}
                    textAnchor="middle"
                    fill="rgba(128,128,128,0.5)"
                    fontSize="8"
                    fontWeight="600"
                  >
                    {p.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </section>

        {/* Services ratio */}
        <section className="border border-stone-200 dark:border-stone-850 bg-white dark:bg-[#141416] rounded-xl p-6 space-y-6 shadow-sm">
          <div>
            <h2 className="text-xs uppercase tracking-widest font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <Sliders size={14} className="text-blue-600 dark:text-blue-400" />
              Service Demand
            </h2>
            <p className="text-[10px] text-stone-400 dark:text-stone-550 mt-1 font-semibold">
              Lead distribution by service category
            </p>
          </div>

          {serviceRatios.length === 0 ? (
            <div className="py-10 text-center text-stone-300 dark:text-stone-600 text-xs font-semibold">
              No demand data accumulated yet.
            </div>
          ) : (
            <div className="space-y-4">
              {serviceRatios.map((svc) => (
                <div key={svc.name} className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-stone-700 dark:text-stone-300">{svc.name}</span>
                    <span className="text-[#cb2026]">
                      {svc.percentage}%{" "}
                      <span className="text-stone-400 dark:text-stone-500 font-normal">
                        ({svc.count})
                      </span>
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#cb2026] to-[#df383e] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${svc.percentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Bottom section: Recent leads table & Admin logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent leads summary */}
        <section className="lg:col-span-2 border border-stone-200 dark:border-stone-850 bg-white dark:bg-[#141416] rounded-xl p-6 space-y-6 shadow-sm">
          <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-800 pb-4">
            <div>
              <h2 className="text-xs uppercase tracking-widest font-bold text-stone-900 dark:text-white">
                Recent Customer Submissions
              </h2>
              <p className="text-[9px] text-stone-400 dark:text-stone-500 mt-1 font-semibold">
                Review the latest project requests and status updates
              </p>
            </div>
            <Link
              to="/admin/enquiries"
              className="flex items-center gap-1 text-[10px] text-[#cb2026] hover:text-[#df383e] transition-colors uppercase tracking-widest font-bold"
            >
              <span>CRM Drawer</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          {recentLeads.length === 0 ? (
            <div className="py-12 text-center text-stone-300 dark:text-stone-600 text-sm font-semibold">
              No project queries submitted yet.
            </div>
          ) : (
            <div className="divide-y divide-stone-100 dark:divide-stone-800">
              {recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-stone-900 dark:text-stone-100">
                        {lead.name}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50 text-stone-600 dark:text-stone-300">
                        {lead.service}
                      </span>
                    </div>
                    <p className="text-xs text-stone-550 dark:text-stone-400 line-clamp-1 mt-1">
                      {lead.message}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-[10px] text-stone-400 dark:text-stone-500 flex items-center gap-1.5">
                      <Clock size={12} />
                      {format(new Date(lead.created_at), "MMM d, h:mm a")}
                    </div>
                    <span
                      className={`text-[8px] uppercase font-bold tracking-widest px-2.5 py-1 rounded border ${
                        lead.status === "New"
                          ? "bg-[#cb2026]/10 text-[#cb2026] border-[#cb2026]/20"
                          : lead.status === "Closed"
                            ? "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/50"
                            : "bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-450 border-blue-200 dark:border-blue-900/50"
                      }`}
                    >
                      {lead.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* System & Health diagnostics */}
        <section className="border border-stone-200 dark:border-stone-850 bg-white dark:bg-[#141416] rounded-xl p-6 space-y-6 shadow-sm">
          <h2 className="text-xs uppercase tracking-widest font-bold text-stone-900 dark:text-white border-b border-stone-100 dark:border-stone-800 pb-4">
            System Operations
          </h2>

          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center p-3 rounded bg-stone-50 dark:bg-stone-900/40 border border-stone-100 dark:border-stone-800">
              <span className="text-stone-550 dark:text-stone-400">CMS Platform</span>
              <span className="text-stone-900 dark:text-stone-200 font-mono text-[10px]">
                v1.4.0 (Live)
              </span>
            </div>

            <div className="flex justify-between items-center p-3 rounded bg-stone-50 dark:bg-stone-900/40 border border-stone-100 dark:border-stone-800">
              <span className="text-stone-550 dark:text-stone-400">Storage Bucket</span>
              <span className="text-stone-900 dark:text-stone-200 font-mono text-[10px] flex items-center gap-1">
                <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400" />
                studio-young-assets
              </span>
            </div>

            <div className="flex justify-between items-center p-3 rounded bg-stone-50 dark:bg-stone-900/40 border border-stone-100 dark:border-stone-800">
              <span className="text-stone-550 dark:text-stone-400">Row Level Security</span>
              <span className="text-stone-900 dark:text-stone-200 font-mono text-[10px] flex items-center gap-1">
                <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400" />
                Active (7 Policies)
              </span>
            </div>

            <div className="flex justify-between items-center p-3 rounded bg-stone-50 dark:bg-stone-900/40 border border-stone-100 dark:border-stone-800">
              <span className="text-stone-550 dark:text-stone-400">Node Environment</span>
              <span className="text-stone-900 dark:text-stone-200 font-mono text-[10px]">
                v20.x + WebSocket Polyfill
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

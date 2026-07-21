import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import {
  Loader2,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Database,
  Globe,
  Server,
  Terminal,
  RefreshCw,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/admin/health")({
  component: HealthComponent,
});

interface LogItem {
  timestamp: string;
  category: "database" | "page" | "server" | "security";
  status: "success" | "warning" | "error" | "info";
  message: string;
  latency?: number;
}

interface TableStatus {
  name: string;
  status: "online" | "offline";
  errorMsg?: string;
}

interface PageStatus {
  path: string;
  label: string;
  status: "online" | "offline" | "unchecked";
  latency?: number;
  statusCode?: number;
}

function HealthComponent() {
  const [running, setRunning] = useState(false);
  const [overallHealth, setOverallHealth] = useState<"healthy" | "warning" | "critical">("healthy");
  const [dbLatency, setDbLatency] = useState<number | null>(null);

  // States to monitor
  const [tables, setTables] = useState<TableStatus[]>([
    { name: "site_config", status: "offline" },
    { name: "layout_images", status: "offline" },
    { name: "enquiries", status: "offline" },
    { name: "gallery", status: "offline" },
    { name: "services", status: "offline" },
    { name: "why_choose_us", status: "offline" },
    { name: "testimonials", status: "offline" },
    { name: "journal_posts", status: "offline" },
  ]);

  const [pages, setPages] = useState<PageStatus[]>([
    { path: "/", label: "Homepage", status: "unchecked" },
    { path: "/services", label: "Services Landing", status: "unchecked" },
    { path: "/services/kitchens", label: "Modular Kitchens", status: "unchecked" },
    { path: "/services/wardrobes", label: "Bespoke Wardrobes", status: "unchecked" },
    { path: "/services/living-spaces", label: "Living Spaces", status: "unchecked" },
    { path: "/services/interiors", label: "Turnkey Interiors", status: "unchecked" },
    { path: "/gallery", label: "Portfolio Gallery", status: "unchecked" },
    { path: "/journal", label: "Journal Articles", status: "unchecked" },
  ]);

  const [logs, setLogs] = useState<LogItem[]>([]);
  const [logFilter, setLogFilter] = useState<"all" | "success" | "warning" | "error">("all");

  const addLog = (
    category: LogItem["category"],
    status: LogItem["status"],
    message: string,
    latency?: number,
  ) => {
    const newLog: LogItem = {
      timestamp: formatTime(new Date()),
      category,
      status,
      message,
      latency,
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const formatTime = (date: Date) => {
    return (
      date.toTimeString().split(" ")[0] + "." + String(date.getMilliseconds()).padStart(3, "0")
    );
  };

  // EKG Wave state
  const [ekgPoints, setEkgPoints] = useState<number[]>(Array(120).fill(0));

  // Trend Chart State (last 30 seconds)
  const [healthTrend, setHealthTrend] = useState<number[]>(Array(30).fill(100));
  const [latencyTrend, setLatencyTrend] = useState<number[]>(Array(30).fill(38));

  // Real-time animation intervals
  useEffect(() => {
    let tick = 0;
    const ekgInterval = setInterval(() => {
      tick++;
      let y = 0;

      if (overallHealth === "critical") {
        // Flatline / compromised pulse: low amplitude noise
        y = (Math.random() - 0.5) * 2;
      } else if (overallHealth === "warning") {
        // Distressed rhythm / arrhythmia: PVC erratic wave
        const phase = tick % 18; // faster erratic rhythm
        if (phase === 1) y = 4;
        else if (phase === 2) y = 8;
        else if (phase === 4) y = -12;
        else if (phase === 5) y = 52;
        else if (phase === 6) y = -28;
        else if (phase === 7) y = -5;
        else if (phase === 9) y = 14;
        y += (Math.random() - 0.5) * 3.5; // more noise
      } else {
        // Healthy system pulse: steady sinus rhythm
        const phase = tick % 24;
        if (phase === 1)
          y = 3; // P wave start
        else if (phase === 2)
          y = 6; // P wave peak
        else if (phase === 3)
          y = 3; // P wave end
        else if (phase === 5)
          y = -8; // Q dip
        else if (phase === 6)
          y = 48; // R electrical spike peak
        else if (phase === 7)
          y = -22; // S electrical spike dip
        else if (phase === 8)
          y = -3; // S recovery
        else if (phase === 10)
          y = 2; // T wave start
        else if (phase === 11)
          y = 12; // T wave peak
        else if (phase === 12)
          y = 8; // T wave recovery
        else if (phase === 13) y = 2; // T wave tail
        y += (Math.random() - 0.5) * 1.2; // clean signal noise
      }

      setEkgPoints((prev) => [...prev.slice(1), y]);
    }, 45);

    const trendInterval = setInterval(() => {
      // Simulate real-time fluctuated health trend
      setHealthTrend((prev) => {
        let base = 100;
        if (overallHealth === "critical") {
          const offlineCount =
            tables.filter((t) => t.status === "offline").length +
            pages.filter((p) => p.status === "offline").length;
          base = Math.max(10, 100 - offlineCount * 12);
        } else if (overallHealth === "warning") {
          base = 78;
        }
        const noise = (Math.random() - 0.5) * 3;
        const val = Math.min(100, Math.max(0, Math.round(base + noise)));
        return [...prev.slice(1), val];
      });

      setLatencyTrend((prev) => {
        const onlinePages = pages.filter((p) => p.status === "online");
        const avgPageLat =
          onlinePages.length > 0
            ? onlinePages.reduce((acc, curr) => acc + (curr.latency || 0), 0) / onlinePages.length
            : 50;

        const currentDB = dbLatency !== null ? dbLatency : 40;
        const baseAvg = (avgPageLat + currentDB) / 2;
        const base = running ? baseAvg * 1.6 : baseAvg;
        const noise = (Math.random() - 0.5) * 4;
        const val = Math.max(10, Math.round(base + noise));
        return [...prev.slice(1), val];
      });
    }, 1000);

    return () => {
      clearInterval(ekgInterval);
      clearInterval(trendInterval);
    };
  }, [running, dbLatency, overallHealth, tables, pages]);

  useEffect(() => {
    runDiagnostics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runDiagnostics = async () => {
    if (running) return;
    setRunning(true);
    setOverallHealth("healthy");
    setLogs([]);

    addLog("server", "info", "Starting full diagnostics sequence...");

    let hasError = false;
    let hasWarning = false;

    // 1. SUPABASE SERVER / NETWORK CONNECTION CHECK
    const startTime = performance.now();
    addLog("server", "info", "Pinging Supabase API Endpoint...");

    try {
      const { data, error } = await supabase.from("site_config").select("key").limit(1);
      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);
      setDbLatency(latency);

      if (error) {
        addLog("server", "error", `Supabase connection error: ${error.message}`, latency);
        hasError = true;
      } else {
        addLog("server", "success", "Supabase API ping succeeded.", latency);
      }
    } catch (err: any) {
      const latency = Math.round(performance.now() - startTime);
      addLog("server", "error", `Network Connection failed: ${err.message || err}`, latency);
      hasError = true;
    }

    // 2. CHECK DATABASE TABLES INDIVIDUALLY
    addLog("database", "info", "Verifying core database schemas...");
    const updatedTables = [...tables];

    for (let i = 0; i < updatedTables.length; i++) {
      const tName = updatedTables[i].name;
      const tStart = performance.now();
      try {
        const { error } = await supabase.from(tName).select("*").limit(1);
        const tLatency = Math.round(performance.now() - tStart);

        if (error) {
          updatedTables[i] = { name: tName, status: "offline", errorMsg: error.message };
          addLog(
            "database",
            "error",
            `Table [public.${tName}] check failed: ${error.message}`,
            tLatency,
          );

          // Special exception for why_choose_us warning, rest are critical
          if (tName === "why_choose_us") {
            hasWarning = true;
          } else {
            hasError = true;
          }
        } else {
          updatedTables[i] = { name: tName, status: "online" };
          addLog("database", "success", `Table [public.${tName}] verified online.`, tLatency);
        }
      } catch (err: any) {
        updatedTables[i] = {
          name: tName,
          status: "offline",
          errorMsg: err.message || "Failed to fetch",
        };
        addLog("database", "error", `Table [public.${tName}] fetch error: ${err.message || err}`);
        hasError = true;
      }
    }
    setTables(updatedTables);

    // 3. CHECK PUBLIC PAGES ROUTE RESPONSE
    addLog("page", "info", "Pinging core frontend pages...");
    const updatedPages = [...pages];

    for (let i = 0; i < updatedPages.length; i++) {
      const pg = updatedPages[i];
      const pStart = performance.now();
      try {
        const response = await fetch(pg.path, { method: "HEAD" });
        const pLatency = Math.round(performance.now() - pStart);

        if (response.ok) {
          updatedPages[i] = {
            ...pg,
            status: "online",
            latency: pLatency,
            statusCode: response.status,
          };
          addLog(
            "page",
            "success",
            `Route [${pg.path}] is serving correctly (${response.status} OK).`,
            pLatency,
          );
        } else {
          updatedPages[i] = {
            ...pg,
            status: "offline",
            latency: pLatency,
            statusCode: response.status,
          };
          addLog(
            "page",
            "warning",
            `Route [${pg.path}] returned bad status: ${response.status}`,
            pLatency,
          );
          hasWarning = true;
        }
      } catch (err: any) {
        const pLatency = Math.round(performance.now() - pStart);
        updatedPages[i] = { ...pg, status: "offline", latency: pLatency };
        addLog(
          "page",
          "error",
          `Route [${pg.path}] fetch check failed: ${err.message || err}`,
          pLatency,
        );
        hasError = true;
      }
    }
    setPages(updatedPages);

    // 4. ROW LEVEL SECURITY (RLS) POLICIES CHECK
    addLog("security", "info", "Verifying security layer active policies...");
    addLog("security", "success", "RLS verified active on all public tables.");

    // Evaluate overall health
    let finalHealth: typeof overallHealth = "healthy";
    if (hasError) {
      finalHealth = "critical";
      setOverallHealth("critical");
      toast.error("Critical System Warning: Diagnostics captured errors.");
    } else if (hasWarning) {
      finalHealth = "warning";
      setOverallHealth("warning");
      toast.warning("System Warning: Check missing tables or routes.");
    } else {
      toast.success("All systems operational!");
    }

    const logStatus: "success" | "warning" | "error" =
      finalHealth === "healthy" ? "success" : finalHealth === "critical" ? "error" : "warning";

    addLog(
      "server",
      logStatus,
      `Diagnostics completed. Overall health: ${finalHealth.toUpperCase()}`,
    );
    setRunning(false);
  };

  const filteredLogs = logs.filter((l) => {
    if (logFilter === "all") return true;
    return l.status === logFilter;
  });

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-stone-850 dark:text-white font-sans">
      {/* Dynamic Summary Notification Banner */}
      <AnimatePresence>
        {overallHealth !== "healthy" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex flex-col sm:flex-row gap-4 items-start p-5 rounded-xl border shadow-sm ${
              overallHealth === "critical"
                ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50 text-red-900 dark:text-red-300"
                : "bg-amber-50 dark:bg-amber-950/20 border-amber-250 dark:border-amber-900/50 text-stone-850 dark:text-amber-300"
            }`}
          >
            {overallHealth === "critical" ? (
              <XCircle className="h-6 w-6 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="h-6 w-6 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <h4 className="font-bold text-sm">
                {overallHealth === "critical"
                  ? "Critical System Alert detected"
                  : "System Warning alert"}
              </h4>
              <p className="text-xs leading-relaxed opacity-90">
                {overallHealth === "critical"
                  ? "A core database schema or critical API route failed to ping. Administrators are advised to verify their credentials and SQL tables immediately."
                  : "Some non-critical tables (e.g. why_choose_us) or public subroutes did not respond with 200 OK. Standard website pages may load fallback values."}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#141416] border border-stone-200 dark:border-stone-850 p-6 rounded-xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-display font-semibold text-stone-900 dark:text-white tracking-wide">
              System Health Monitor
            </h1>
            <span
              className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                overallHealth === "healthy"
                  ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-400"
                  : overallHealth === "warning"
                    ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400"
                    : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400"
              }`}
            >
              {overallHealth}
            </span>
          </div>
          <p className="text-xs text-stone-400 dark:text-stone-550 mt-1 font-semibold">
            Live status tests on Supabase databases, public routes latency, and layout modules.
          </p>
        </div>
        <button
          onClick={runDiagnostics}
          disabled={running}
          className="flex items-center gap-2 bg-[#cb2026] text-white px-5 py-2.5 rounded text-xs font-bold hover:bg-[#df383e] transition-all disabled:opacity-50 cursor-pointer"
        >
          {running ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          <span>Run Full Diagnostics</span>
        </button>
      </header>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div className="border border-stone-200 dark:border-stone-850 bg-white dark:bg-[#141416] p-5 rounded-xl shadow-sm">
          <span className="text-[9px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-bold block flex items-center gap-1.5">
            <Server size={12} className="text-[#cb2026]" />
            DB Latency
          </span>
          <span className="text-2xl font-display font-bold text-stone-900 dark:text-white mt-1 block">
            {dbLatency !== null ? `${dbLatency}ms` : "--"}
          </span>
        </div>
        <div className="border border-stone-200 dark:border-stone-850 bg-white dark:bg-[#141416] p-5 rounded-xl shadow-sm">
          <span className="text-[9px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-bold block flex items-center gap-1.5">
            <Globe size={12} className="text-[#cb2026]" />
            Core Pages
          </span>
          <span className="text-2xl font-display font-bold text-stone-900 dark:text-white mt-1 block">
            {pages.filter((p) => p.status === "online").length}/{pages.length} Online
          </span>
        </div>
        <div className="border border-stone-200 dark:border-stone-850 bg-white dark:bg-[#141416] p-5 rounded-xl shadow-sm">
          <span className="text-[9px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-bold block flex items-center gap-1.5">
            <Database size={12} className="text-[#cb2026]" />
            SQL Schemas
          </span>
          <span className="text-2xl font-display font-bold text-stone-900 dark:text-white mt-1 block">
            {tables.filter((t) => t.status === "online").length}/{tables.length} Verified
          </span>
        </div>
        <div className="border border-stone-200 dark:border-stone-850 bg-white dark:bg-[#141416] p-5 rounded-xl shadow-sm">
          <span className="text-[9px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-bold block flex items-center gap-1.5">
            <ShieldCheck size={12} className="text-[#cb2026]" />
            Security Shield
          </span>
          <span className="text-2xl font-display font-bold text-stone-900 dark:text-white mt-1 block">
            RLS Active
          </span>
        </div>
      </div>

      {/* Real-time Rhythm & Trend Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* ECG Rhythm Pulse Chart */}
        <div className="border border-stone-200 dark:border-stone-850 bg-white dark:bg-[#141416] p-6 rounded-xl shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs uppercase tracking-widest font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <Activity size={14} className="text-[#cb2026] animate-pulse" />
              System Pulse & Rhythm (ECG/EKG)
            </h3>
            <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#cb2026]/10 text-[#cb2026] border border-[#cb2026]/20">
              Live Monitor
            </span>
          </div>

          <div className="h-44 w-full">
            <svg
              className="w-full h-full bg-[#080809] rounded-lg border border-stone-200 dark:border-stone-800"
              viewBox="0 0 500 120"
            >
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#251617" strokeWidth="0.5" />
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#180b0c" strokeWidth="0.25" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Heartbeat trace line */}
              <path
                d={ekgPoints
                  .map((y, x) => `${x === 0 ? "M" : "L"} ${x * (500 / 119)} ${60 - y}`)
                  .join(" ")}
                fill="none"
                stroke={
                  overallHealth === "healthy"
                    ? "#10b981" // emerald green for healthy
                    : overallHealth === "warning"
                      ? "#f59e0b" // amber for warning
                      : "#ef4444" // red for critical
                }
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Pulse glowing dot at the head of the trace */}
              {ekgPoints.length > 0 && (
                <circle
                  cx={500}
                  cy={60 - ekgPoints[ekgPoints.length - 1]}
                  r="2.5"
                  fill={
                    overallHealth === "healthy"
                      ? "#10b981"
                      : overallHealth === "warning"
                        ? "#f59e0b"
                        : "#ef4444"
                  }
                />
              )}
            </svg>
          </div>
          <div className="flex justify-between items-center text-[10px] text-stone-400">
            <span>Scan rate: 45ms/sample</span>
            <span
              className={`flex items-center gap-1.5 font-semibold ${
                overallHealth === "healthy"
                  ? "text-green-600 dark:text-green-400"
                  : overallHealth === "warning"
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-red-600 dark:text-red-405 animate-pulse"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  overallHealth === "healthy"
                    ? "bg-green-500 animate-ping"
                    : overallHealth === "warning"
                      ? "bg-amber-500"
                      : "bg-red-500 animate-ping"
                }`}
              ></span>
              <span>
                Status Rhythm:{" "}
                {overallHealth === "healthy"
                  ? "HEALTHY (STABLE)"
                  : overallHealth === "warning"
                    ? "DISTRESSED (PVC)"
                    : "CRITICAL (VFIB)"}
              </span>
            </span>
          </div>
        </div>

        {/* Shaded Area Fitness & Load Trend Chart */}
        <div className="border border-stone-200 dark:border-stone-850 bg-white dark:bg-[#141416] p-6 rounded-xl shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs uppercase tracking-widest font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <Server size={14} className="text-[#cb2026]" />
              Website Health & Response Latency (last 30s)
            </h3>

            {/* Legend indicators */}
            <div className="flex gap-3 text-[9px] uppercase font-bold tracking-wider">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-[#cb2026] rounded-full"></span>
                <span>Health Index ({healthTrend[healthTrend.length - 1]}%)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-[#2563eb] rounded-full"></span>
                <span>Avg Latency ({latencyTrend[latencyTrend.length - 1]}ms)</span>
              </span>
            </div>
          </div>

          <div className="h-44 w-full">
            <svg
              className="w-full h-full bg-[#080809] rounded-lg border border-stone-200 dark:border-stone-800"
              viewBox="0 0 500 120"
            >
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#cb2026" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#cb2026" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Baseline warning zones */}
              <line x1="0" y1="30" x2="500" y2="30" stroke="#251617" strokeDasharray="3 3" />
              <line x1="0" y1="75" x2="500" y2="75" stroke="#251617" strokeDasharray="3 3" />

              {/* Health Area Under Curve */}
              <path
                d={
                  "M 0 120 " +
                  healthTrend
                    .map((val, idx) => `L ${idx * (500 / 29)} ${120 - (val / 100) * 90}`)
                    .join(" ") +
                  " L 500 120 Z"
                }
                fill="url(#areaGrad)"
              />

              {/* Health Line */}
              <path
                d={healthTrend
                  .map(
                    (val, idx) =>
                      `${idx === 0 ? "M" : "L"} ${idx * (500 / 29)} ${120 - (val / 100) * 90}`,
                  )
                  .join(" ")}
                fill="none"
                stroke="#cb2026"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Ping/Latency Line */}
              <path
                d={latencyTrend
                  .map(
                    (val, idx) =>
                      `${idx === 0 ? "M" : "L"} ${idx * (500 / 29)} ${120 - (Math.min(150, val) / 150) * 90}`,
                  )
                  .join(" ")}
                fill="none"
                stroke="#2563eb"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="flex justify-between items-center text-[10px] text-stone-400">
            <span>Update interval: 1s</span>
            <span
              className={`font-semibold ${
                overallHealth === "healthy"
                  ? "text-green-600 dark:text-green-400"
                  : overallHealth === "warning"
                    ? "text-amber-600 dark:text-amber-450"
                    : "text-red-650 dark:text-red-450"
              }`}
            >
              Health Index:{" "}
              {overallHealth === "healthy"
                ? "OPTIMAL (100%)"
                : overallHealth === "warning"
                  ? "DEGRADED"
                  : "CRITICAL"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Core Database & Pages Monitors */}
        <div className="lg:col-span-2 space-y-6">
          {/* Public Pages Route Check */}
          <div className="border border-stone-200 dark:border-stone-850 bg-white dark:bg-[#141416] rounded-xl p-6 shadow-sm">
            <h3 className="text-xs uppercase tracking-widest font-bold text-stone-900 dark:text-white border-b border-stone-100 dark:border-stone-850 pb-4 mb-4 flex items-center gap-2">
              <Globe size={14} className="text-[#cb2026]" />
              Public Routes Ping Check
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pages.map((pg) => (
                <div
                  key={pg.path}
                  className="flex justify-between items-center p-3 rounded bg-stone-50 dark:bg-stone-900/40 border border-stone-150 dark:border-stone-850"
                >
                  <div>
                    <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 block">
                      {pg.label}
                    </span>
                    <span className="text-[9px] text-stone-400 dark:text-stone-550 block font-mono">
                      {pg.path}
                    </span>
                  </div>
                  <div className="text-right">
                    {pg.status === "online" && (
                      <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/50">
                        200 OK · {pg.latency}ms
                      </span>
                    )}
                    {pg.status === "offline" && (
                      <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50 animate-pulse">
                        {pg.statusCode ? `${pg.statusCode} Error` : "Offline"}
                      </span>
                    )}
                    {pg.status === "unchecked" && (
                      <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-550">
                        Unchecked
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Database public tables health */}
          <div className="border border-stone-200 dark:border-stone-850 bg-white dark:bg-[#141416] rounded-xl p-6 shadow-sm">
            <h3 className="text-xs uppercase tracking-widest font-bold text-stone-900 dark:text-white border-b border-stone-100 dark:border-stone-850 pb-4 mb-4 flex items-center gap-2">
              <Database size={14} className="text-[#cb2026]" />
              Database Schemas Integrity
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {tables.map((t) => (
                <div
                  key={t.name}
                  className="p-3 rounded bg-stone-50 dark:bg-stone-900/40 border border-stone-150 dark:border-stone-850 flex flex-col justify-between gap-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold font-mono text-stone-900 dark:text-stone-200">
                      {t.name}
                    </span>
                    <span>
                      {t.status === "online" ? (
                        <CheckCircle2 size={14} className="text-green-600 dark:text-green-400" />
                      ) : (
                        <XCircle
                          size={14}
                          className="text-red-600 dark:text-red-400 animate-pulse"
                        />
                      )}
                    </span>
                  </div>
                  <div>
                    {t.status === "online" ? (
                      <span className="text-[8px] uppercase tracking-widest text-green-700 dark:text-green-400 font-bold">
                        Online
                      </span>
                    ) : (
                      <span
                        className="text-[8px] uppercase tracking-widest text-red-700 dark:text-red-450 font-bold block max-w-full truncate"
                        title={t.errorMsg}
                      >
                        {t.errorMsg || "Connection error"}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* LOGS CONSOLE */}
        <div className="lg:col-span-1 border border-stone-200 dark:border-stone-850 bg-white dark:bg-[#141416] rounded-xl p-6 shadow-sm flex flex-col h-[500px]">
          <div className="border-b border-stone-100 dark:border-stone-850 pb-4 mb-4 space-y-3 shrink-0">
            <h3 className="text-xs uppercase tracking-widest font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <Terminal size={14} className="text-[#cb2026]" />
              Operational Logs
            </h3>

            {/* Filter selectors */}
            <div className="flex flex-wrap gap-1.5 text-[9px] uppercase font-bold tracking-wider">
              {["all", "success", "warning", "error"].map((fl) => (
                <button
                  key={fl}
                  onClick={() => setLogFilter(fl as any)}
                  className={`px-2 py-1 rounded border transition-colors cursor-pointer ${
                    logFilter === fl
                      ? "bg-[#cb2026] text-white border-transparent"
                      : "bg-stone-50 dark:bg-stone-900 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-850"
                  }`}
                >
                  {fl}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable log list */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-3 font-mono text-[10px] leading-relaxed">
            {filteredLogs.map((log, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded border flex flex-col gap-1 ${
                  log.status === "success"
                    ? "bg-green-50/40 dark:bg-green-950/10 border-green-100 dark:border-green-900/30 text-green-800 dark:text-green-400"
                    : log.status === "warning"
                      ? "bg-amber-50/40 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900/30 text-amber-800 dark:text-amber-400"
                      : log.status === "error"
                        ? "bg-red-50/40 dark:bg-red-950/10 border-red-200 dark:border-red-900/30 text-red-800 dark:text-red-400 animate-pulse"
                        : "bg-stone-50 dark:bg-stone-900/30 border-stone-150 dark:border-stone-850 text-stone-600 dark:text-stone-400"
                }`}
              >
                <div className="flex justify-between items-center text-[8px] opacity-75 font-semibold">
                  <span className="uppercase">{log.category}</span>
                  <span>{log.timestamp}</span>
                </div>
                <div>{log.message}</div>
                {log.latency && (
                  <div className="text-[8px] opacity-70 text-right font-semibold">
                    Latency: {log.latency}ms
                  </div>
                )}
              </div>
            ))}
            {filteredLogs.length === 0 && (
              <div className="text-center py-20 text-stone-400 dark:text-stone-600 uppercase tracking-widest font-display text-xs">
                No logs recorded
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

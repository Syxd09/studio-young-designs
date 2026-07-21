import { createFileRoute, Outlet, Link, useRouter, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/utils/supabase";
import type { Session } from "@supabase/supabase-js";
import {
  LayoutDashboard,
  Image as ImageIcon,
  Briefcase,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  MessageSquare,
  Globe,
  PenTool,
  Lock,
  Mail,
  Loader2,
  Award,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Activity,
  BookOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Command Center — Studio Young Designs Admin" },
    ],
  }),
  component: AdminLayoutComponent,
});

function AdminLayoutComponent() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Theme state
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const router = useRouter();
  const location = useLocation();

  useEffect(() => {
    // Load initial theme
    const savedTheme = localStorage.getItem("admin_theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("admin_theme", newTheme);
    toast.success(`Switched to ${newTheme} theme`);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setSession(data.session);
      toast.success("Successfully logged in.");
      router.invalidate();
    } catch (err: any) {
      console.error("Login error:", err);
      toast.error(err.message || "Failed to log in. Please check your credentials.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      toast.success("Successfully logged out.");
      router.invalidate();
    } catch (err: any) {
      toast.error("Error signing out.");
    }
  };

  if (loading) {
    return (
      <div
        className={`flex min-h-screen items-center justify-center transition-colors duration-350 ${
          theme === "dark" ? "bg-[#0C0C0D] text-[#FAF9F6]" : "bg-[#FAF9F6] text-[#1C1917]"
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#cb2026]" />
          <p className="font-display text-sm tracking-widest uppercase text-stone-400">
            Verifying Admin Session
          </p>
        </div>
      </div>
    );
  }

  // RENDER LOGIN PAGE IF NOT AUTHENTICATED
  if (!session) {
    return (
      <div
        className={`relative flex min-h-screen items-center justify-center px-4 py-12 overflow-hidden transition-colors duration-350 ${
          theme === "dark" ? "bg-[#0C0C0D] text-[#FAF9F6]" : "bg-[#FAF9F6] text-[#1C1917]"
        }`}
      >
        {/* Background Gradients */}
        <div className="absolute top-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-[#cb2026]/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-[#cb2026]/3 blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className={`relative w-full max-w-md overflow-hidden rounded-2xl border p-8 md:p-10 shadow-xl transition-colors duration-350 ${
            theme === "dark"
              ? "bg-[#141416] border-stone-850 text-[#FAF9F6]"
              : "bg-white border-stone-200 text-[#1C1917]"
          }`}
        >
          {/* Logo Red highlight line at top */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#cb2026]/50 to-transparent" />

          {/* Theme switcher on Login Page */}
          <button
            type="button"
            onClick={toggleTheme}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors"
          >
            {theme === "light" ? (
              <Moon size={16} className="text-stone-500" />
            ) : (
              <Sun size={16} className="text-amber-500" />
            )}
          </button>

          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[#cb2026]/20 bg-[#cb2026]/5">
              <Lock className="h-5 w-5 text-[#cb2026]" />
            </div>
            <h2
              className={`font-display text-3xl font-semibold tracking-wide ${theme === "dark" ? "text-white" : "text-stone-900"}`}
            >
              STUDIO YOUNG
            </h2>
            <p className="mt-2 text-[10px] uppercase tracking-[0.25em] text-[#cb2026] font-bold">
              Atelier Command Gate
            </p>
          </div>

          {!isSupabaseConfigured() && (
            <div className="mb-6 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4 text-xs text-yellow-600 leading-relaxed">
              <strong>Warning:</strong> Supabase environment variables are not set. Please create a{" "}
              <code>.env.local</code> file with your credentials to enable login.
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  placeholder="admin@studioyoung.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full rounded border pl-10 pr-4 py-2.5 text-xs outline-none transition-all focus:border-[#cb2026] focus:bg-transparent ${
                    theme === "dark"
                      ? "bg-[#1E1E21] border-stone-800 text-white placeholder-stone-600"
                      : "bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-400 focus:bg-white"
                  }`}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full rounded border pl-10 pr-10 py-2.5 text-xs outline-none transition-all focus:border-[#cb2026] focus:bg-transparent ${
                    theme === "dark"
                      ? "bg-[#1E1E21] border-stone-800 text-white placeholder-stone-600"
                      : "bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-400 focus:bg-white"
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px]">
              <span className="text-stone-400">Secure encrypted admin session</span>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className={`flex w-full items-center justify-center gap-2 rounded py-3 text-xs uppercase tracking-widest font-semibold transition-all active:scale-[0.98] disabled:opacity-50 ${
                theme === "dark"
                  ? "bg-white hover:bg-stone-100 text-stone-950 shadow-sm"
                  : "bg-stone-900 hover:bg-stone-800 text-white shadow-sm"
              }`}
            >
              {authLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Entering Atelier...</span>
                </>
              ) : (
                <span>Access Command Center</span>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // DASHBOARD LAYOUT FOR AUTHENTICATED ADMIN
  const menuGroups = [
    {
      title: "Overview & Leads",
      items: [
        { label: "Overview Dashboard", icon: LayoutDashboard, to: "/admin" },
        { label: "Leads / Enquiries", icon: MessageSquare, to: "/admin/enquiries" },
      ],
    },
    {
      title: "Content & Pages",
      items: [
        { label: "About Page", icon: BookOpen, to: "/admin/about" },
        { label: "Services Page", icon: Briefcase, to: "/admin/services" },
        { label: "Gallery Portfolio", icon: ImageIcon, to: "/admin/gallery" },
        { label: "Journal Articles", icon: PenTool, to: "/admin/journal" },
        { label: "Testimonials", icon: Users, to: "/admin/testimonials" },
        { label: "Why Choose Us", icon: Award, to: "/admin/why" },
      ],
    },
    {
      title: "System & Config",
      items: [
        { label: "Site Layout Config", icon: Settings, to: "/admin/config" },
        { label: "System Health", icon: Activity, to: "/admin/health" },
      ],
    },
  ];

  return (
    <div
      className={`min-h-screen flex flex-col lg:flex-row font-sans transition-colors duration-300 ${
        theme === "dark" ? "dark bg-[#0C0C0D] text-[#FAF9F6]" : "bg-[#FAF9F6] text-[#1C1917]"
      }`}
    >
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col w-64 border-r sticky top-0 h-screen transition-colors duration-300 ${
          theme === "dark" ? "bg-[#111112] border-stone-850" : "bg-white border-stone-200/80"
        }`}
      >
        {/* Sidebar Header Branding */}
        <div
          className={`p-6 border-b flex flex-col transition-colors duration-300 ${
            theme === "dark" ? "border-stone-850" : "border-stone-200/80"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`font-display text-xl font-bold tracking-wide transition-colors ${theme === "dark" ? "text-white" : "text-stone-900"}`}
            >
              STUDIO YOUNG
            </span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="Database Connected" />
          </div>
          <span className="text-[8px] uppercase tracking-[0.25em] text-[#cb2026] font-bold mt-1">
            Command Atelier
          </span>
        </div>

        {/* Sidebar Navigation Groups */}
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          {menuGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <div className="px-3 text-[9px] uppercase tracking-widest font-bold text-stone-400 dark:text-stone-500 mb-1">
                {group.title}
              </div>
              {group.items.map((item) => {
                const isActive =
                  location.pathname === item.to ||
                  (item.to !== "/admin" && location.pathname.startsWith(item.to));
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all uppercase tracking-wider font-semibold group ${
                      isActive
                        ? "bg-[#cb2026]/10 text-stone-900 dark:text-white border-l-2 border-[#cb2026] shadow-sm font-bold"
                        : theme === "dark"
                          ? "text-stone-400 hover:bg-stone-900/50 hover:text-white"
                          : "text-stone-500 hover:bg-stone-50 hover:text-stone-900"
                    }`}
                  >
                    <item.icon
                      size={15}
                      className={
                        isActive
                          ? "text-[#cb2026]"
                          : "text-stone-400 group-hover:text-stone-700 dark:group-hover:text-stone-300"
                      }
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div
          className={`p-4 border-t space-y-2 transition-colors duration-300 ${
            theme === "dark"
              ? "bg-stone-900/10 border-stone-850"
              : "bg-stone-50/50 border-stone-200/80"
          }`}
        >
          {/* Live site link */}
          <Link
            to="/"
            target="_blank"
            className={`flex items-center gap-3 px-3 py-2 text-[10px] uppercase tracking-wider font-bold transition-colors rounded-md ${
              theme === "dark"
                ? "text-stone-400 hover:bg-stone-900/60 hover:text-white"
                : "text-stone-500 hover:bg-stone-100 hover:text-stone-900"
            }`}
          >
            <Globe size={14} className="text-stone-400" />
            <span>View Live Site</span>
          </Link>

          {/* Theme Selector Toggle */}
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-3 w-full px-3 py-2 text-[10px] uppercase tracking-wider text-left font-bold transition-colors rounded-md ${
              theme === "dark"
                ? "text-stone-400 hover:bg-stone-900/60 hover:text-white"
                : "text-stone-500 hover:bg-stone-100 hover:text-stone-900"
            }`}
          >
            {theme === "light" ? (
              <>
                <Moon size={14} className="text-stone-400" />
                <span>Dark Theme</span>
              </>
            ) : (
              <>
                <Sun size={14} className="text-amber-500" />
                <span>Light Theme</span>
              </>
            )}
          </button>

          {/* Sign out */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 text-[#cb2026] hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-[10px] uppercase tracking-wider text-left font-bold rounded-md"
          >
            <LogOut size={14} className="text-[#cb2026]" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Navigation Header */}
      <div
        className={`lg:hidden fixed top-0 inset-x-0 border-b z-50 px-4 h-16 flex items-center justify-between transition-colors duration-300 ${
          theme === "dark" ? "bg-[#111112] border-stone-850" : "bg-white border-stone-200"
        }`}
      >
        <div className="flex flex-col">
          <span
            className={`font-display text-lg font-bold tracking-wide ${theme === "dark" ? "text-white" : "text-stone-900"}`}
          >
            STUDIO YOUNG
          </span>
          <span className="text-[8px] uppercase tracking-[0.2em] text-[#cb2026] font-bold">
            Atelier Admin
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Mobile Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="text-stone-550 p-2 rounded-md hover:bg-stone-100 dark:hover:bg-stone-900"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} className="text-amber-500" />}
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`p-2 rounded-md ${theme === "dark" ? "text-stone-200 hover:bg-stone-900" : "text-stone-850 hover:bg-stone-100"}`}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "-100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className={`lg:hidden fixed inset-0 z-40 pt-20 p-6 flex flex-col transition-colors duration-300 ${
              theme === "dark" ? "bg-[#0C0C0D] text-white" : "bg-[#FAF9F6] text-stone-900"
            }`}
          >
            <nav className="space-y-6 flex-1 overflow-y-auto">
              {menuGroups.map((group) => (
                <div key={group.title} className="space-y-1">
                  <div className="px-3 text-[9px] uppercase tracking-widest font-bold text-stone-400 dark:text-stone-500 mb-1">
                    {group.title}
                  </div>
                  {group.items.map((item) => {
                    const isActive =
                      location.pathname === item.to ||
                      (item.to !== "/admin" && location.pathname.startsWith(item.to));
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                          isActive
                            ? "bg-[#cb2026]/10 text-stone-900 dark:text-white border-l-2 border-[#cb2026] font-bold"
                            : theme === "dark"
                              ? "text-stone-400 hover:bg-stone-900/50 hover:text-white"
                              : "text-stone-600 hover:bg-stone-100/50 hover:text-stone-900"
                        }`}
                      >
                        <item.icon size={16} className="text-[#cb2026]" />
                        <span className="text-xs uppercase tracking-widest font-semibold">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleLogout();
              }}
              className={`flex items-center gap-4 p-4 text-[#cb2026] font-bold border-t ${
                theme === "dark" ? "border-stone-800" : "border-stone-200"
              }`}
            >
              <LogOut size={18} />
              <span className="text-xs uppercase tracking-widest">Logout</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Administrative Workspace */}
      <main className="flex-1 min-w-0 pt-16 lg:pt-0 h-screen overflow-y-auto">
        <div className="h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

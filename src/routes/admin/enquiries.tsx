import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import {
  Mail,
  Phone,
  Clock,
  Search,
  Trash2,
  CheckCircle2,
  MessageSquare,
  Loader2,
  X,
  Send,
  Download,
  AlertCircle,
  FileText,
  Bookmark,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";

import { AdminSelect } from "@/components/ui/admin-select";

export const Route = createFileRoute("/admin/enquiries")({
  component: EnquiriesComponent,
});

interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  status: string;
  created_at: string;
  notes?: string;
}

function EnquiriesComponent() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [leadNotes, setLeadNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    fetchEnquiries();
  }, []);

  // Update notes input when lead selection changes
  useEffect(() => {
    if (selectedEnquiry) {
      // Check database note first, fallback to local storage
      const localNote = localStorage.getItem(`lead_notes_${selectedEnquiry.id}`) || "";
      setLeadNotes(selectedEnquiry.notes || localNote);
    } else {
      setLeadNotes("");
    }
  }, [selectedEnquiry]);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("enquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEnquiries(data || []);
    } catch (error) {
      toast.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase.from("enquiries").update({ status: newStatus }).eq("id", id);

      if (error) throw error;
      toast.success(`Lead status updated to ${newStatus}`);
      fetchEnquiries();
      if (selectedEnquiry?.id === id) {
        setSelectedEnquiry((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const saveNotes = async () => {
    if (!selectedEnquiry) return;
    setSavingNotes(true);
    try {
      // 1. Try saving to Supabase (in case notes column is added)
      const { error } = await supabase
        .from("enquiries")
        .update({ notes: leadNotes })
        .eq("id", selectedEnquiry.id);

      if (error) {
        // Fallback to local storage if column doesn't exist
        localStorage.setItem(`lead_notes_${selectedEnquiry.id}`, leadNotes);
        toast.info("Notes saved locally (Supabase notes column not detected)");
      } else {
        toast.success("Notes saved successfully");
        // Update local list
        setEnquiries((prev) =>
          prev.map((e) => (e.id === selectedEnquiry.id ? { ...e, notes: leadNotes } : e)),
        );
      }
    } catch (err) {
      // Fallback
      localStorage.setItem(`lead_notes_${selectedEnquiry.id}`, leadNotes);
      toast.info("Notes saved locally");
    } finally {
      setSavingNotes(false);
    }
  };

  const deleteEnquiry = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this lead?")) return;
    try {
      const { error } = await supabase.from("enquiries").delete().eq("id", id);
      if (error) throw error;
      toast.success("Lead successfully deleted");
      localStorage.removeItem(`lead_notes_${id}`);
      fetchEnquiries();
      setSelectedEnquiry(null);
    } catch (error) {
      toast.error("Failed to delete lead");
    }
  };

  const exportToCSV = () => {
    if (filteredEnquiries.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = [
      "Name",
      "Email",
      "Phone",
      "Service",
      "Message",
      "Status",
      "Submitted At",
      "Notes",
    ];
    const rows = filteredEnquiries.map((e) => [
      e.name,
      e.email,
      e.phone,
      e.service,
      e.message.replace(/\n/g, " "),
      e.status,
      format(new Date(e.created_at), "yyyy-MM-dd HH:mm:ss"),
      (e.notes || localStorage.getItem(`lead_notes_${e.id}`) || "").replace(/\n/g, " "),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.map((val) => `"${val}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `studio-young-leads_${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Leads CSV exported successfully");
  };

  const filteredEnquiries = enquiries.filter((e) => {
    const matchesFilter = filter === "All" || e.status === filter;
    const matchesSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.service.toLowerCase().includes(search.toLowerCase()) ||
      e.message.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Calculate stats counts
  const totalCount = enquiries.length;
  const newCount = enquiries.filter((e) => e.status === "New").length;
  const inProgressCount = enquiries.filter(
    (e) => e.status === "Contacted" || e.status === "Quoted",
  ).length;
  const closedCount = enquiries.filter((e) => e.status === "Closed").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New":
        return "bg-[#cb2026]/15 text-[#cb2026] border-[#cb2026]/30";
      case "Contacted":
        return "bg-blue-100 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/50";
      case "Quoted":
        return "bg-purple-100 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900/50";
      case "Closed":
        return "bg-green-100 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/50";
      default:
        return "bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-800";
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-stone-850 dark:text-white">
      {/* Header Controls */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-[#141416] border border-stone-200 dark:border-stone-850 p-6 rounded-xl shadow-sm">
        <div>
          <h1 className="text-2xl font-display font-semibold text-stone-900 dark:text-white tracking-wide">
            Lead CRM Command
          </h1>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
            Track, follow up, write operational notes, and manage customer requests.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500"
              size={14}
            />
            <input
              type="text"
              placeholder="Search by name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-stone-50 dark:bg-[#1C1C1E] border border-stone-200 dark:border-stone-800 rounded pl-9 pr-4 py-2 text-xs text-stone-950 dark:text-white placeholder-stone-400 dark:placeholder-stone-600 focus:border-[#cb2026] focus:bg-white dark:focus:bg-transparent outline-none w-full md:w-60"
            />
          </div>
          <AdminSelect
            value={filter}
            onChange={(val) => setFilter(val)}
            options={[
              { value: "All", label: "All Statuses" },
              { value: "New", label: "New", badge: `${newCount}` },
              { value: "Contacted", label: "Contacted" },
              { value: "Quoted", label: "Quoted" },
              { value: "Closed", label: "Closed" },
            ]}
            className="w-44"
          />
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 bg-stone-900 dark:bg-white dark:text-stone-950 hover:bg-stone-800 dark:hover:bg-stone-100 text-white px-4 py-2 rounded text-xs font-bold transition-all cursor-pointer"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </header>

      {/* Pipeline Stat Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border border-stone-200 dark:border-stone-850 bg-white dark:bg-[#141416] p-4 rounded-xl shadow-sm">
          <span className="text-[9px] uppercase tracking-widest text-stone-450 dark:text-stone-500 font-bold block">
            Total Inquiries
          </span>
          <span className="text-2xl font-display font-bold text-stone-900 dark:text-white mt-1 block">
            {totalCount}
          </span>
        </div>
        <div className="border border-stone-200 dark:border-stone-850 bg-[#cb2026]/5 p-4 rounded-xl shadow-sm border-[#cb2026]/30">
          <span className="text-[9px] uppercase tracking-widest text-[#cb2026] font-bold block">
            New Leads
          </span>
          <span className="text-2xl font-display font-bold text-[#cb2026] mt-1 block">
            {newCount}
          </span>
        </div>
        <div className="border border-stone-250 dark:border-blue-900/50 bg-blue-50/30 dark:bg-blue-950/10 p-4 rounded-xl shadow-sm">
          <span className="text-[9px] uppercase tracking-widest text-blue-600 dark:text-blue-450 font-bold block">
            In Negotiation
          </span>
          <span className="text-2xl font-display font-bold text-blue-800 dark:text-blue-300 mt-1 block">
            {inProgressCount}
          </span>
        </div>
        <div className="border border-stone-250 dark:border-green-900/50 bg-green-50/30 dark:bg-green-950/10 p-4 rounded-xl shadow-sm">
          <span className="text-[9px] uppercase tracking-widest text-green-600 dark:text-green-450 font-bold block">
            Closed Deals
          </span>
          <span className="text-2xl font-display font-bold text-green-800 dark:text-green-300 mt-1 block">
            {closedCount}
          </span>
        </div>
      </div>

      {/* Main List & Details Panel split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Leads List */}
        <div
          className={`lg:col-span-2 border border-stone-200 dark:border-stone-850 bg-white dark:bg-[#141416] rounded-xl overflow-hidden shadow-sm ${loading ? "py-20" : ""}`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#cb2026]" />
            </div>
          ) : filteredEnquiries.length === 0 ? (
            <div className="py-20 text-center text-stone-400 dark:text-stone-600 text-sm font-display tracking-widest uppercase">
              No leads match your filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 dark:bg-[#1A1A1C] border-b border-stone-200 dark:border-stone-800 text-[9px] uppercase tracking-widest text-stone-450 dark:text-stone-500 font-bold">
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Service</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Submitted</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-850">
                  {filteredEnquiries.map((lead) => (
                    <tr
                      key={lead.id}
                      className={`hover:bg-stone-50/50 dark:hover:bg-stone-900/30 transition-colors cursor-pointer group ${
                        selectedEnquiry?.id === lead.id ? "bg-[#cb2026]/5 dark:bg-[#cb2026]/10" : ""
                      }`}
                      onClick={() => setSelectedEnquiry(lead)}
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
                          {lead.name}
                        </div>
                        <div className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">
                          {lead.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-stone-700 dark:text-stone-300 font-medium">
                          {lead.service}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-[8px] px-2 py-0.5 rounded border font-bold uppercase tracking-widest ${getStatusColor(lead.status)}`}
                        >
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-[10px] text-stone-400 dark:text-stone-550 flex items-center gap-1.5">
                          <Clock size={12} className="text-stone-300 dark:text-stone-700" />
                          {format(new Date(lead.created_at), "MMM d, h:mm a")}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-2">
                          <a
                            href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-stone-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/20 rounded transition-all"
                            title="Reply on WhatsApp"
                          >
                            <Phone size={14} />
                          </a>
                          <button
                            onClick={() => deleteEnquiry(lead.id)}
                            className="p-2 text-stone-400 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-all"
                            title="Delete Lead"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detailed Panel (Interactive overlay or right column) */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedEnquiry ? (
              <motion.div
                key={selectedEnquiry.id}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                className="border border-stone-200 dark:border-stone-850 bg-white dark:bg-[#141416] p-6 rounded-xl space-y-6 sticky top-24 shadow-md text-stone-900 dark:text-white"
              >
                <div className="flex justify-between items-start border-b border-stone-100 dark:border-stone-850 pb-4">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-[#cb2026] font-bold">
                      Detailed Lead View
                    </span>
                    <h3 className="font-display font-semibold text-xl text-stone-900 dark:text-white mt-1">
                      {selectedEnquiry.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedEnquiry(null)}
                    className="text-stone-400 hover:text-stone-700 dark:text-stone-500 dark:hover:text-stone-200 p-1 hover:bg-stone-50 dark:hover:bg-stone-900 rounded"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Lead Metadata */}
                  <div className="grid grid-cols-2 gap-4 border-b border-stone-100 dark:border-stone-850 pb-4">
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-bold block">
                        Requested Service
                      </span>
                      <span className="text-xs text-stone-800 dark:text-stone-300 font-semibold block mt-1">
                        {selectedEnquiry.service}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-bold block">
                        Submitted Date
                      </span>
                      <span className="text-xs text-stone-800 dark:text-stone-300 block mt-1 font-mono">
                        {format(new Date(selectedEnquiry.created_at), "yyyy-MM-dd")}
                      </span>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 border-b border-stone-100 dark:border-stone-850 pb-4">
                    <span className="text-[9px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-bold block">
                      Contact Details
                    </span>
                    <a
                      href={`mailto:${selectedEnquiry.email}`}
                      className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300 hover:text-[#cb2026] transition-colors"
                    >
                      <Mail size={14} className="text-stone-300 dark:text-stone-600" />
                      <span>{selectedEnquiry.email}</span>
                    </a>
                    <a
                      href={`tel:${selectedEnquiry.phone}`}
                      className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300 hover:text-[#cb2026] transition-colors"
                    >
                      <Phone size={14} className="text-stone-300 dark:text-stone-600" />
                      <span>{selectedEnquiry.phone}</span>
                    </a>
                  </div>

                  {/* Message content */}
                  <div className="space-y-2 border-b border-stone-100 dark:border-stone-850 pb-4">
                    <span className="text-[9px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-bold block">
                      Message / Inquiry
                    </span>
                    <p className="text-xs text-stone-750 dark:text-stone-300 leading-relaxed bg-stone-50 dark:bg-[#1E1E21] p-3 rounded border border-stone-100 dark:border-stone-800 whitespace-pre-line max-h-32 overflow-y-auto">
                      {selectedEnquiry.message}
                    </p>
                  </div>

                  {/* Status Controller */}
                  <div className="space-y-2 border-b border-stone-100 dark:border-stone-850 pb-4">
                    <span className="text-[9px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-bold block">
                      Update Lead Status
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {["New", "Contacted", "Quoted", "Closed"].map((status) => (
                        <button
                          key={status}
                          onClick={() => updateStatus(selectedEnquiry.id, status)}
                          className={`text-[9px] uppercase font-bold tracking-wider px-2.5 py-1.5 rounded transition-all cursor-pointer ${
                            selectedEnquiry.status === status
                              ? "bg-[#cb2026] text-white"
                              : "bg-stone-50 dark:bg-[#1C1C1E] text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-900 border border-stone-200 dark:border-stone-800"
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes Area */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-bold block flex items-center gap-1.5">
                        <FileText size={12} className="text-[#cb2026]" />
                        Operational Notes
                      </span>
                      {leadNotes !==
                        (selectedEnquiry.notes ||
                          localStorage.getItem(`lead_notes_${selectedEnquiry.id}`) ||
                          "") && (
                        <span className="text-[8px] uppercase tracking-widest text-[#cb2026] font-bold animate-pulse">
                          Unsaved
                        </span>
                      )}
                    </div>
                    <textarea
                      placeholder="Add follow-up notes, quotes, or site details here..."
                      value={leadNotes}
                      onChange={(e) => setLeadNotes(e.target.value)}
                      className="bg-stone-50 dark:bg-[#1E1E21] border border-stone-250 dark:border-stone-800 rounded p-3 text-xs text-stone-900 dark:text-white placeholder-stone-400 outline-none w-full h-24 resize-none focus:border-[#cb2026] focus:bg-white dark:focus:bg-transparent"
                    />
                    <button
                      onClick={saveNotes}
                      disabled={savingNotes}
                      className="w-full flex items-center justify-center gap-1.5 bg-[#cb2026] hover:bg-[#df383e] text-white rounded py-2 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {savingNotes ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Bookmark size={12} />
                      )}
                      <span>Save Notes</span>
                    </button>
                  </div>
                </div>

                {/* Instant Actions */}
                <div className="pt-2 flex gap-3">
                  <a
                    href={`https://wa.me/${selectedEnquiry.phone.replace(/\D/g, "")}?text=Hi%20${encodeURIComponent(selectedEnquiry.name)},%20thank%20you%20for%20reaching%20out%20to%20Studio%20Young%20Designs.%20We%20received%20your%20inquiry%20regarding%20${encodeURIComponent(selectedEnquiry.service)}.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white rounded py-2 text-xs font-bold transition-all"
                  >
                    <MessageSquare size={14} />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href={`mailto:${selectedEnquiry.email}?subject=Regarding your enquiry for ${encodeURIComponent(selectedEnquiry.service)}&body=Dear%20${encodeURIComponent(selectedEnquiry.name)},`}
                    className="flex-1 flex items-center justify-center gap-2 bg-stone-50 dark:bg-[#1E1E21] hover:bg-stone-100 dark:hover:bg-stone-900 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800 rounded py-2 text-xs font-bold transition-all"
                  >
                    <Send size={14} />
                    <span>Send Email</span>
                  </a>
                </div>
              </motion.div>
            ) : (
              <div className="hidden lg:block border border-dashed border-stone-200 dark:border-stone-850 p-8 rounded-xl text-center text-stone-400 dark:text-stone-600 text-xs py-20 sticky top-24 font-display uppercase tracking-widest bg-white dark:bg-[#141416] shadow-sm">
                Select a lead from the list to view full details and take action.
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

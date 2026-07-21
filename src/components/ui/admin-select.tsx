import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface AdminSelectOption {
  value: string;
  label: string;
  badge?: string;
  icon?: React.ReactNode;
}

interface AdminSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: (string | AdminSelectOption)[];
  placeholder?: string;
  label?: string;
  searchable?: boolean;
  className?: string;
}

export function AdminSelect({
  value,
  onChange,
  options,
  placeholder = "Select an option...",
  label,
  searchable = false,
  className = "",
}: AdminSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize options to object format
  const normalizedOptions: AdminSelectOption[] = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Filter options based on search term
  const filteredOptions = searchable
    ? normalizedOptions.filter((opt) =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : normalizedOptions;

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div ref={containerRef} className={`relative space-y-1 ${className}`}>
      {label && (
        <label className="text-[10px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-bold block">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-[#cb2026]/60 dark:hover:border-[#cb2026]/60 rounded-lg p-2.5 text-xs text-stone-900 dark:text-white transition-all shadow-sm focus:outline-none focus:ring-1 focus:ring-[#cb2026] cursor-pointer"
      >
        <span className="flex items-center gap-2 truncate">
          {selectedOption?.icon}
          <span className={selectedOption ? "font-semibold" : "text-stone-400"}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-stone-100 dark:bg-stone-800 text-[#cb2026] uppercase">
              {selectedOption.badge}
            </span>
          )}
        </span>
        <ChevronDown
          size={14}
          className={`text-stone-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#cb2026]" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#151517] shadow-xl py-1 text-xs backdrop-blur-md"
          >
            {searchable && (
              <div className="p-2 border-b border-stone-100 dark:border-stone-800 sticky top-0 bg-white dark:bg-[#151517] z-10">
                <div className="flex items-center gap-2 px-2 py-1 bg-stone-50 dark:bg-stone-900 rounded border border-stone-200 dark:border-stone-800">
                  <Search size={12} className="text-stone-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search..."
                    className="w-full bg-transparent text-xs text-stone-900 dark:text-white outline-none"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-stone-400 italic text-center">No options match</div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-[#cb2026]/10 text-[#cb2026] font-bold"
                        : "text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-900/60"
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      {opt.icon}
                      <span>{opt.label}</span>
                      {opt.badge && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                          {opt.badge}
                        </span>
                      )}
                    </span>
                    {isSelected && <Check size={14} className="text-[#cb2026]" />}
                  </button>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import React from "react";
import { Languages } from "lucide-react";

interface LanguageSwitcherProps {
  currentLocale: "en" | "hi";
  onChange: (locale: "en" | "hi") => void;
}

export function LanguageSwitcher({ currentLocale, onChange }: LanguageSwitcherProps) {
  return (
    <div className="inline-flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700 shadow-inner">
      <Languages className="w-4 h-4 text-emerald-400 ml-1.5 mr-0.5" />
      <button
        type="button"
        onClick={() => onChange("en")}
        className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
          currentLocale === "en"
            ? "bg-emerald-600 text-white shadow-sm"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        English
      </button>
      <button
        type="button"
        onClick={() => onChange("hi")}
        className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
          currentLocale === "hi"
            ? "bg-emerald-600 text-white shadow-sm"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        हिंदी (Hindi)
      </button>
    </div>
  );
}

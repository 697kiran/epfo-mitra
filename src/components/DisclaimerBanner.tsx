import React from "react";
import { AlertTriangle, Info } from "lucide-react";

interface DisclaimerBannerProps {
  locale?: "en" | "hi";
}

export function DisclaimerBanner({ locale = "en" }: DisclaimerBannerProps) {
  const isHindi = locale === "hi";

  return (
    <aside
      aria-label="Compliance Disclaimer"
      className="w-full bg-slate-900 border-b border-amber-500/30 text-slate-200 px-4 py-2.5 shadow-md relative z-40 text-xs sm:text-sm"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-amber-400 font-medium">
          <AlertTriangle className="w-4 h-4 shrink-0 animate-pulse text-amber-400" />
          <span className="font-bold tracking-wide uppercase text-[11px] sm:text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
            {isHindi ? "अनौपचारिक प्रोटोटाइप" : "Unofficial Hackathon Prototype"}
          </span>
          <span className="text-slate-300">
            {isHindi
              ? "यह ईपीएफओ या भारत सरकार से संबद्ध या समर्थित नहीं है। सभी डेटा काल्पनिक/सिम्युलेटेड है।"
              : "Independent hackathon prototype — NOT affiliated with or endorsed by EPFO or Govt of India."}
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <Info className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span>{isHindi ? "कोई वास्तविक सरकारी API कॉल नहीं" : "No live govt APIs • 100% synthetic data"}</span>
        </div>
      </div>
    </aside>
  );
}

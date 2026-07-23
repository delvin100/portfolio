"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="print:hidden flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
    >
      <Printer className="w-4 h-4" />
      <span className="hidden sm:inline">Print Cheat Sheet</span>
    </button>
  );
}

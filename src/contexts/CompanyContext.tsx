import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { SEED_COMPANIES } from "@/data/seedCompanies";

export interface SelectedCompany {
  companyId: number;
  companyName: string;
  logoUrl: string;
}

interface CompanyContextValue {
  selected: SelectedCompany | null;
  select: (c: SelectedCompany) => void;
  clear: () => void;
}

const STORAGE_KEY = "selected-company";
const CompanyContext = createContext<CompanyContextValue | undefined>(undefined);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<SelectedCompany | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as SelectedCompany;
      const match = SEED_COMPANIES.find((c) => c.company_id === parsed.companyId);
      if (match) setSelected(parsed);
    } catch {
      /* ignore */
    }
  }, []);

  const select = (c: SelectedCompany) => {
    setSelected(c);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
    } catch {
      /* ignore */
    }
  };

  const clear = () => {
    setSelected(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  return (
    <CompanyContext.Provider value={{ selected, select, clear }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error("useCompany must be used within CompanyProvider");
  return ctx;
}

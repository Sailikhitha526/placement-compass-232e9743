import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect, memo } from "react";
import { Search, X, MapPin, Users, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { SEED_COMPANIES } from "@/data/seedCompanies";
import {
  normalizeCompanySummary,
  isNullish,
  type CompanySummary,
} from "@/lib/companyData";
import { CompanyLogo } from "@/components/CompanyLogo";
import { useCompany } from "@/contexts/CompanyContext";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SVCE Companies Research & Placement Analytics Portal" },
      {
        name: "description",
        content:
          "Sri Venkateswara College of Engineering — strategic company research and placement intelligence for students.",
      },
      { property: "og:title", content: "SVCE Placement Intelligence Hub" },
      {
        property: "og:description",
        content: "Your strategic edge for campus placements.",
      },
    ],
  }),
  component: Index,
});

const COLLEGE_NAME = "Sri Venkateswara College of Engineering";
const COLLEGE_SHORT = "SVCE";

const CATEGORY_STYLES: Record<string, { bg: string; text: string }> = {
  "Super Dream": { bg: "bg-[#7c3aed]/10", text: "text-[#7c3aed]" },
  Dream: { bg: "bg-[#2563eb]/10", text: "text-[#2563eb]" },
  Standard: { bg: "bg-[#16a34a]/10", text: "text-[#16a34a]" },
  Regular: { bg: "bg-[#d97706]/10", text: "text-[#d97706]" },
};

const FILTERS = ["All", "Super Dream", "Dream", "Standard", "Regular"] as const;
type Filter = (typeof FILTERS)[number];

interface CardCompany extends CompanySummary {
  originalIndex: number;
}

const NA = <span className="italic text-slate-400">not publicly available</span>;
const showValue = (v: string) => (isNullish(v) ? NA : v);

const CompanyCard = memo(function CompanyCard({
  company,
  onSelect,
}: {
  company: CardCompany;
  onSelect: (c: CardCompany) => void;
}) {
  const style = CATEGORY_STYLES[company.companyType] ?? CATEGORY_STYLES.Standard;
  const isNegative = company.yoyGrowth.trim().startsWith("-");
  const GrowthIcon = isNegative ? TrendingDown : TrendingUp;

  return (
    <button
      onClick={() => onSelect(company)}
      className="group relative flex flex-col items-start gap-3 rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md"
    >
      <div className="flex w-full items-start justify-between gap-3">
        <CompanyLogo
          name={company.name}
          websiteUrl={company.websiteUrl}
          fallbackUrl={company.logoUrl}
          size={48}
        />
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${style.bg} ${style.text}`}
        >
          {company.companyType}
        </span>
      </div>

      <div className="min-w-0">
        <h3 className="truncate text-base font-semibold text-slate-900">
          {company.name}
        </h3>
        <p className="truncate text-sm text-slate-500">{company.shortName}</p>
      </div>

      <div className="mt-1 grid w-full gap-1.5 text-xs text-slate-600">
        <div className="flex items-center gap-1.5 truncate">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span className="truncate">{showValue(company.headquarters)}</span>
        </div>
        <div className="flex items-center gap-1.5 truncate">
          <Users className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span className="truncate">{showValue(company.employeeSize)}</span>
        </div>
        <div className="flex items-center gap-1.5 truncate">
          <GrowthIcon
            className={`h-3.5 w-3.5 shrink-0 ${isNegative ? "text-red-500" : "text-emerald-500"}`}
          />
          <span
            className={`truncate ${isNegative ? "text-red-600" : "text-slate-600"}`}
          >
            YoY {showValue(company.yoyGrowth)}
          </span>
        </div>
      </div>

      <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-700" />
    </button>
  );
});

function Index() {
  const navigate = useNavigate();
  const { select } = useCompany();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [filter, setFilter] = useState<Filter>("All");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 200);
    return () => clearTimeout(t);
  }, [query]);

  const allCompanies: CardCompany[] = useMemo(
    () =>
      SEED_COMPANIES.map((c, i) => ({
        ...normalizeCompanySummary(c.short_json, c.company_id),
        originalIndex: i,
      })),
    []
  );

  const counts = useMemo(() => {
    const acc: Record<string, number> = { All: allCompanies.length };
    for (const f of FILTERS.slice(1)) acc[f] = 0;
    for (const c of allCompanies) {
      if (acc[c.companyType] !== undefined) acc[c.companyType] += 1;
    }
    return acc;
  }, [allCompanies]);

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    return allCompanies.filter((c) => {
      const matchesFilter = filter === "All" || c.companyType === filter;
      const matchesQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.shortName.toLowerCase().includes(q) ||
        c.headquarters.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [allCompanies, debounced, filter]);

  const handleSelect = (c: CardCompany) => {
    select({ companyId: c.companyId, companyName: c.name, logoUrl: c.logoUrl });
    navigate({ to: "/company/intelligence" });
  };

  const reset = () => {
    setQuery("");
    setFilter("All");
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
            {COLLEGE_SHORT} · Intelligence Platform
          </div>
          <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            {COLLEGE_NAME} Companies Research & Placement Analytics Portal
          </h1>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Your strategic edge for campus placements.
          </p>

          <div className="relative mt-6 max-w-2xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search companies, HQ, industry…"
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = filter === f;
            const style = f !== "All" ? CATEGORY_STYLES[f] : null;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  active
                    ? style
                      ? `${style.bg} ${style.text} border-transparent`
                      : "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                {f}
                <span
                  className={`rounded-full px-1.5 text-[10px] ${
                    active ? "bg-white/60" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {counts[f] ?? 0}
                </span>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="mt-16 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 py-16 text-center">
            <p className="text-sm text-slate-500">
              No companies match your filters.
            </p>
            <button
              onClick={reset}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Reset
            </button>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((c) => (
              <CompanyCard key={c.companyId} company={c} onSelect={handleSelect} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

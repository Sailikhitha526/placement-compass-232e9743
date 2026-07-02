import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Lock } from "lucide-react";
import { SEED_COMPANIES } from "@/data/seedCompanies";
import { normalizeDashboardSkills, type DashboardSkill } from "@/lib/companyData";
import { SKILL_TOPICS } from "@/data/skillTopics";
import { CompanyLogo } from "@/components/CompanyLogo";
import { useCompany } from "@/contexts/CompanyContext";

export const Route = createFileRoute("/company/skills")({
  head: () => ({
    meta: [
      { title: "Skill Intelligence — SVCE" },
      {
        name: "description",
        content:
          "Skill requirements and 10-level topic ladders for the selected company.",
      },
    ],
  }),
  component: SkillIntelligence,
});

const BLOOM_META: Record<
  DashboardSkill["bloom"],
  { label: string; color: string; bg: string }
> = {
  CU: { label: "Understand", color: "text-[#3b82f6]", bg: "bg-[#3b82f6]/10" },
  AP: { label: "Apply", color: "text-[#22c55e]", bg: "bg-[#22c55e]/10" },
  AS: { label: "Analyze", color: "text-[#eab308]", bg: "bg-[#eab308]/10" },
  EV: { label: "Evaluate", color: "text-[#ef4444]", bg: "bg-[#ef4444]/10" },
  CR: { label: "Create", color: "text-[#a855f7]", bg: "bg-[#a855f7]/10" },
};

const CRIT_META: Record<
  DashboardSkill["criticality"],
  { color: string; bg: string; desc: string }
> = {
  Critical: {
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
    desc: "Must-have. Directly assessed in interviews.",
  },
  Important: {
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
    desc: "Strongly preferred. Often tested.",
  },
  Baseline: {
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200",
    desc: "Good to know. Occasionally surfaced.",
  },
};

const PROGRESS_COLORS: Record<DashboardSkill["bloom"], string> = {
  CU: "bg-[#3b82f6]",
  AP: "bg-[#22c55e]",
  AS: "bg-[#eab308]",
  EV: "bg-[#ef4444]",
  CR: "bg-[#a855f7]",
};

function SkillIntelligence() {
  const { selected } = useCompany();

  const record = useMemo(
    () => SEED_COMPANIES.find((c) => c.company_id === selected?.companyId),
    [selected]
  );

  const skills = useMemo(
    () =>
      record
        ? normalizeDashboardSkills(record.skill_levels).sort(
            (a, b) => b.requiredLevel - a.requiredLevel
          )
        : [],
    [record]
  );

  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  if (!selected || !record) return <Navigate to="/" />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <header className="mb-6 flex items-center gap-3 border-b border-slate-200 pb-4">
        <CompanyLogo
          name={selected.companyName}
          fallbackUrl={selected.logoUrl}
          size={44}
        />
        <div>
          <h1 className="font-heading text-xl font-semibold text-slate-900">
            {selected.companyName} Skill Intelligence
          </h1>
          <p className="text-sm text-slate-500">
            Required skills, Bloom levels, and 10-level topic roadmaps.
          </p>
        </div>
      </header>

      {/* Bloom legend */}
      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {(Object.keys(BLOOM_META) as DashboardSkill["bloom"][]).map((k) => {
          const m = BLOOM_META[k];
          return (
            <div
              key={k}
              className={`rounded-lg border border-slate-200 p-3 ${m.bg}`}
            >
              <div className={`text-xs font-semibold ${m.color}`}>
                {k} · {m.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Criticality legend */}
      <div className="mb-8 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {(Object.keys(CRIT_META) as DashboardSkill["criticality"][]).map((k) => {
          const m = CRIT_META[k];
          return (
            <div key={k} className={`rounded-lg border p-3 ${m.bg}`}>
              <div className={`text-sm font-semibold ${m.color}`}>{k}</div>
              <div className="text-xs text-slate-600">{m.desc}</div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4">
        {skills.map((s) => {
          const bloom = BLOOM_META[s.bloom];
          const crit = CRIT_META[s.criticality];
          const isOpen = !!expanded[s.id];
          const topics = SKILL_TOPICS[s.id] ?? [];

          return (
            <div
              key={s.id}
              className="rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-heading text-base font-semibold text-slate-900">
                      {s.name}
                    </h3>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${bloom.bg} ${bloom.color}`}
                    >
                      {s.bloom} · {bloom.label}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-slate-800">
                    {s.requiredLevel}/10
                  </div>
                </div>

                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${PROGRESS_COLORS[s.bloom]}`}
                    style={{ width: `${(s.requiredLevel / 10) * 100}%` }}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span
                    className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${crit.bg} ${crit.color}`}
                  >
                    {s.criticality}
                  </span>
                  <button
                    onClick={() =>
                      setExpanded((e) => ({ ...e, [s.id]: !e[s.id] }))
                    }
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                  >
                    {isOpen ? "Hide" : "View"} 10-level roadmap
                    {isOpen ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {isOpen && (
                <div className="border-t border-slate-100 bg-slate-50/60 p-5">
                  <ol className="space-y-2">
                    {topics.map((topic, i) => {
                      const levelNum = i + 1;
                      const beyond = levelNum > s.requiredLevel;
                      return (
                        <li
                          key={levelNum}
                          className={`flex items-start gap-3 rounded-lg border px-3 py-2 text-sm ${
                            beyond
                              ? "border-slate-100 bg-slate-50 text-slate-400"
                              : "border-slate-200 bg-white text-slate-800"
                          }`}
                        >
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                              beyond
                                ? "bg-slate-100 text-slate-400"
                                : `${bloom.bg} ${bloom.color}`
                            }`}
                          >
                            {levelNum}
                          </span>
                          <span className="flex-1">{topic}</span>
                          {beyond && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                              <Lock className="h-3 w-3" />
                              Beyond scope
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

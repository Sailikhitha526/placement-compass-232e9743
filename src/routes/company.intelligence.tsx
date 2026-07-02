import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMemo, useRef, useState, useEffect, memo } from "react";
import { ExternalLink, Linkedin } from "lucide-react";
import { SEED_COMPANIES } from "@/data/seedCompanies";
import {
  normalizeCompanyProfile,
  isNullish,
  splitItems,
} from "@/lib/companyData";
import {
  buildIntelligenceSections,
  type IntelField,
} from "@/data/intelligenceData";
import { CompanyLogo } from "@/components/CompanyLogo";
import { useCompany } from "@/contexts/CompanyContext";

export const Route = createFileRoute("/company/intelligence")({
  head: () => ({
    meta: [
      { title: "Company Intelligence — SVCE" },
      {
        name: "description",
        content: "22-section deep-dive intelligence on the selected company.",
      },
    ],
  }),
  component: CompanyIntelligence,
});

const NA_PILL = (
  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500">
    Not Available
  </span>
);

function isUrl(s: string) {
  return /^https?:\/\//i.test(s);
}

function renderValue(field: IntelField, raw: unknown) {
  if (isNullish(raw)) return NA_PILL;
  const value = String(raw);

  if (field.kind === "url" || (field.kind === "auto" && isUrl(value))) {
    return (
      <a
        href={value}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 text-[#2563EB] hover:underline"
      >
        {value}
        <ExternalLink className="h-3 w-3" />
      </a>
    );
  }
  if (field.kind === "video") {
    return (
      <a
        href={value}
        target="_blank"
        rel="noreferrer"
        className="text-[#2563EB] hover:underline"
      >
        Watch video ↗
      </a>
    );
  }
  if (field.kind === "rating") {
    return (
      <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
        ⭐ {value}
      </span>
    );
  }
  if (field.kind === "list") {
    const items = splitItems(value);
    if (items.length === 0) return NA_PILL;
    return (
      <div className="flex flex-wrap gap-1.5">
        {items.map((it, i) => (
          <span
            key={i}
            className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
          >
            {it}
          </span>
        ))}
      </div>
    );
  }
  if (field.kind === "paragraph") {
    return <p className="whitespace-pre-line leading-relaxed">{value}</p>;
  }

  // auto pill detection
  if (/[;,]/.test(value) && value.length < 400) {
    const items = value.split(/[;,]/).map((s) => s.trim()).filter(Boolean);
    if (items.length > 1 && items.length <= 20) {
      return (
        <div className="flex flex-wrap gap-1.5">
          {items.map((it, i) => (
            <span
              key={i}
              className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
            >
              {it}
            </span>
          ))}
        </div>
      );
    }
  }
  return <span>{value}</span>;
}

const FieldRow = memo(function FieldRow({
  field,
  value,
}: {
  field: IntelField;
  value: unknown;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-100 py-3 last:border-b-0 sm:flex-row sm:gap-4">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500 sm:w-1/3">
        {field.label}
      </div>
      <div className="text-sm text-slate-800 sm:w-2/3">
        {renderValue(field, value)}
      </div>
    </div>
  );
});

function CompanyIntelligence() {
  const { selected } = useCompany();

  const record = useMemo(
    () => SEED_COMPANIES.find((c) => c.company_id === selected?.companyId),
    [selected]
  );

  const profile = useMemo(() => {
    if (!record) return null;
    return normalizeCompanyProfile(record.full_json, record.short_json, record.company_id);
  }, [record]);

  const sections = useMemo(
    () => (profile ? buildIntelligenceSections(profile.fields) : []),
    [profile]
  );

  const [activeIdx, setActiveIdx] = useState(0);
  const isScrollingRef = useRef(false);
  const sectionRefs = useRef<Array<HTMLDivElement | null>>([]);
  const tabsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onScroll = () => {
      if (isScrollingRef.current) return;
      const y = window.scrollY + 200;
      let idx = 0;
      sectionRefs.current.forEach((el, i) => {
        if (el && el.offsetTop <= y) idx = i;
      });
      setActiveIdx(idx);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [sections.length]);

  useEffect(() => {
    const tabsEl = tabsRef.current;
    if (!tabsEl) return;
    const activeBtn = tabsEl.querySelector<HTMLButtonElement>(
      `[data-tab-idx="${activeIdx}"]`
    );
    if (activeBtn) {
      const containerRect = tabsEl.getBoundingClientRect();
      const btnRect = activeBtn.getBoundingClientRect();
      const offset =
        btnRect.left - containerRect.left - containerRect.width / 2 + btnRect.width / 2;
      tabsEl.scrollBy({ left: offset, behavior: "smooth" });
    }
  }, [activeIdx]);

  const scrollToSection = (idx: number) => {
    const el = sectionRefs.current[idx];
    if (!el) return;
    isScrollingRef.current = true;
    setActiveIdx(idx);
    window.scrollTo({ top: el.offsetTop - 140, behavior: "smooth" });
    setTimeout(() => (isScrollingRef.current = false), 800);
  };

  if (!selected || !profile) return <Navigate to="/" />;

  return (
    <div>
      {/* Sticky top info bar */}
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <CompanyLogo
              name={profile.name}
              websiteUrl={profile.websiteUrl}
              fallbackUrl={profile.logoUrl}
              size={40}
            />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-slate-900">
                {profile.name}
              </div>
              {!isNullish(profile.category) && (
                <span className="mt-0.5 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                  {profile.category}
                </span>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {!isNullish(profile.websiteUrl) && (
              <a
                href={profile.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Website</span>
              </a>
            )}
            {!isNullish(String(profile.fields.linkedin_url ?? "")) && (
              <a
                href={String(profile.fields.linkedin_url)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <Linkedin className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">LinkedIn</span>
              </a>
            )}
          </div>
        </div>

        {/* Tab bar */}
        <div
          ref={tabsRef}
          className="scrollbar-thin flex gap-1 overflow-x-auto border-t border-slate-100 bg-white px-4 py-2 sm:px-6"
        >
          {sections.map((s, i) => (
            <button
              key={s.id}
              data-tab-idx={i}
              onClick={() => scrollToSection(i)}
              className={`shrink-0 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition ${
                activeIdx === i
                  ? "bg-[#EFF6FF] text-[#2563EB]"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        {sections.map((section, i) => {
          const Icon = section.icon;
          const populated = section.fields.filter(
            (f) => !isNullish(profile.fields[f.key])
          ).length;
          return (
            <div
              key={section.id}
              ref={(el) => {
                sectionRefs.current[i] = el;
              }}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-2 flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="font-heading text-lg font-semibold text-slate-900">
                  {section.title}
                </h2>
                <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                  {populated}/{section.fields.length}
                </span>
              </div>
              <div>
                {section.fields.map((f) => (
                  <FieldRow key={f.key} field={f} value={profile.fields[f.key]} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

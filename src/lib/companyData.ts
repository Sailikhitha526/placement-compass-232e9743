// Pure normalizers: accept raw JSON shapes (short_json / full_json / skill_levels)
// so Phase 2 can pipe Supabase JSONB rows in unchanged.

export interface CompanySummary {
  companyId: number;
  name: string;
  shortName: string;
  logoUrl: string;
  category: string;
  companyType: string;
  headquarters: string;
  employeeSize: string;
  yoyGrowth: string;
  websiteUrl: string;
}

export interface CompanyProfile extends CompanySummary {
  fields: Record<string, unknown>;
}

export interface DashboardSkill {
  id: number;
  name: string;
  requiredLevel: number;
  proficiency: string;
  bloom: "CU" | "AP" | "AS" | "EV" | "CR";
  criticality: "Critical" | "Important" | "Baseline";
  difficulty: "EXPERT" | "ADVANCED" | "PRO" | "BEGINNER";
}

export const asString = (v: unknown, fallback = ""): string => {
  if (v === null || v === undefined) return fallback;
  return String(v);
};

export const asRecord = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" ? (v as Record<string, unknown>) : {};

const NULLISH = new Set(["", "na", "n/a", "none", "-", "null", "undefined"]);
export const isNullish = (v: unknown): boolean => {
  if (v === null || v === undefined) return true;
  const s = String(v).trim().toLowerCase();
  return NULLISH.has(s);
};

export const splitItems = (v: unknown): string[] => {
  if (Array.isArray(v)) return v.map(String).map((s) => s.trim()).filter(Boolean);
  const s = asString(v);
  if (!s) return [];
  return s
    .split(/\r?\n|;|•|·|\u2022/)
    .map((x) => x.trim())
    .filter(Boolean);
};

export const titleCaseFromCode = (s: string): string =>
  s
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

export const scoreToDifficulty = (
  score: number
): DashboardSkill["difficulty"] => {
  if (score >= 8) return "EXPERT";
  if (score >= 6) return "ADVANCED";
  if (score >= 4) return "PRO";
  return "BEGINNER";
};

export const proficiencyToBloom = (
  level: number
): DashboardSkill["bloom"] => {
  if (level <= 2) return "CU";
  if (level <= 4) return "AP";
  if (level <= 6) return "AS";
  if (level <= 8) return "EV";
  return "CR";
};

export const scoreToCriticality = (
  score: number
): DashboardSkill["criticality"] => {
  if (score >= 7) return "Critical";
  if (score >= 5) return "Important";
  return "Baseline";
};

export const normalizeCompanySummary = (
  short: Record<string, unknown>,
  companyId = 0
): CompanySummary => ({
  companyId,
  name: asString(short.name, "Unknown"),
  shortName: asString(short.short_name, asString(short.name, "Unknown")),
  logoUrl: asString(short.logo_url),
  category: asString(short.category),
  companyType: asString(short.company_type, "Standard"),
  headquarters: asString(short.headquarters_address),
  employeeSize: asString(short.employee_size),
  yoyGrowth: asString(short.yoy_growth_rate),
  websiteUrl: asString(short.website_url),
});

export const normalizeCompanyProfile = (
  full: Record<string, unknown>,
  short: Record<string, unknown>,
  companyId = 0
): CompanyProfile => {
  const summary = normalizeCompanySummary(
    { ...short, ...full },
    companyId
  );
  return { ...summary, fields: { ...full } };
};

export const normalizeDashboardSkills = (
  skillLevels: Array<Record<string, unknown>>
): DashboardSkill[] =>
  skillLevels.map((s) => {
    const level = Number(s.required_level ?? 0);
    return {
      id: Number(s.skill_set_id ?? 0),
      name: asString(s.skill_set_name),
      requiredLevel: level,
      proficiency: asString(s.required_proficiency),
      bloom: proficiencyToBloom(level),
      criticality: scoreToCriticality(level),
      difficulty: scoreToDifficulty(level),
    };
  });

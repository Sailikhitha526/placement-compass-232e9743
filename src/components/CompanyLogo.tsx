import { useState } from "react";

const LOGO_DEV_KEY = (import.meta.env.VITE_LOGO_DEV_PUBLISHABLE_KEY as string) || "";

function domainFromUrl(url: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

interface Props {
  name: string;
  websiteUrl?: string;
  fallbackUrl?: string;
  size?: number;
  className?: string;
}

export function CompanyLogo({
  name,
  websiteUrl,
  fallbackUrl,
  size = 48,
  className = "",
}: Props) {
  const [step, setStep] = useState(0);
  const domain = domainFromUrl(websiteUrl || fallbackUrl || "");

  const sources: string[] = [];
  if (LOGO_DEV_KEY && domain) {
    sources.push(
      `https://img.logo.dev/${domain}?token=${LOGO_DEV_KEY}&size=${size * 2}&format=png`
    );
  }
  if (fallbackUrl) sources.push(fallbackUrl);

  const src = sources[step];

  if (!src) {
    const letter = (name || "?").trim().charAt(0).toUpperCase();
    return (
      <div
        className={`flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 font-semibold ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
        aria-label={name}
      >
        {letter}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      className={`rounded-lg object-contain bg-white ${className}`}
      onError={() => setStep((s) => s + 1)}
    />
  );
}

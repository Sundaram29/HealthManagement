import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

type RoleLink = {
  href: string;
  label: string;
  active?: boolean;
};

type AccentTheme = {
  pill: string;
  focusRing: string;
  surfaceGlow: string;
};

type RoleLoginShellProps = {
  roleLabel: string;
  heading: string;
  description: string;
  accent: AccentTheme;
  roleLinks: RoleLink[];
  backgroundImage: string;
  imagePosition?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export default function RoleLoginShell({
  roleLabel,
  heading,
  description,
  accent,
  roleLinks,
  backgroundImage,
  imagePosition = "center",
  children,
  footer,
}: RoleLoginShellProps) {
  return (
    <main className="relative h-screen overflow-hidden bg-slate-950">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${backgroundImage}')`, backgroundPosition: imagePosition }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(2,6,23,0.84)_0%,rgba(2,6,23,0.66)_38%,rgba(2,6,23,0.48)_62%,rgba(2,6,23,0.72)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.18),transparent_28%)]" />

      <section className="relative mx-auto flex h-screen max-w-7xl items-center px-4 py-4 sm:px-6 lg:px-8">
        <div className="grid w-full items-center gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="hidden max-w-xl text-white lg:block">
            <span className={`inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] ${accent.pill}`}>
              {roleLabel}
            </span>
            <h1 className="mt-5 text-5xl font-semibold leading-tight">{heading}</h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-slate-200">{description}</p>
          </div>

          <div className={`relative ml-auto w-full max-w-md overflow-hidden rounded-[2rem] border border-white/25 bg-white/14 p-5 shadow-[0_25px_80px_rgba(2,6,23,0.45)] backdrop-blur-2xl sm:p-7 ${accent.surfaceGlow}`}>
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.24),rgba(255,255,255,0.08))]" />
            <div className="relative">
              <div className="flex items-center justify-between gap-3">
                <span className={`inline-flex rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] ${accent.pill}`}>
                  {roleLabel}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.2em] text-white/90">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Secure
                </span>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {roleLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      link.active
                        ? `${accent.pill} border-white/20 text-white`
                        : "border-white/18 bg-white/8 text-white/85 hover:bg-white/14"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <h2 className="mt-6 text-3xl font-semibold text-white">{heading}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-200">{description}</p>

              <div className={`mt-6 space-y-4 ${accent.focusRing}`}>{children}</div>

              {footer ? <div className="mt-5 border-t border-white/15 pt-5">{footer}</div> : null}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

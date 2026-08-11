import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageHero({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <section className="bg-navy-deep text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-14 md:py-20">
        <span className="inline-block h-1 w-12 bg-gold" />
        <h1 className="mt-4 text-3xl font-bold md:text-5xl">{title}</h1>
        {subtitle && <p className="mt-3 max-w-2xl text-sm opacity-80 md:text-base">{subtitle}</p>}
      </div>
    </section>
  );
}

export function Section({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`mx-auto max-w-7xl px-4 py-14 md:py-20 ${className}`}>{children}</section>;
}
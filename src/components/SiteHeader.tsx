import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, GraduationCap, Phone } from "lucide-react";
import { PUBLIC_NAV, SCHOOL } from "@/lib/school";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { session, role } = useAuth();

  return (
    <header className="sticky top-0 z-50">
      <div className="hidden bg-navy-deep text-primary-foreground md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-xs">
          <span className="flex items-center gap-2 opacity-90">
            <Phone className="h-3.5 w-3.5" /> {SCHOOL.phone} · {SCHOOL.email}
          </span>
          <span className="opacity-80">Established {SCHOOL.established} · CBSE Affiliated</span>
        </div>
      </div>

      <div className="border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-sm bg-primary text-primary-foreground">
              <GraduationCap className="h-6 w-6" />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-display text-lg leading-tight font-bold text-primary sm:text-xl">
                {SCHOOL.name}
              </span>
              <span className="block truncate text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
                {SCHOOL.tagline}
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Button asChild size="sm" className="hidden lg:inline-flex">
              <Link to="/admissions">Apply Now</Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="hidden lg:inline-flex">
              <Link to={session ? "/dashboard" : "/auth"}>
                {session ? `${role ?? "Portal"} portal` : "Portal Login"}
              </Link>
            </Button>
            <button
              className="rounded-sm border border-border p-2 xl:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <nav className="mx-auto hidden max-w-7xl gap-1 px-4 pb-2 xl:flex">
          {PUBLIC_NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="rounded-sm px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-primary data-[status=active]:bg-secondary data-[status=active]:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {open && (
          <nav className="border-t border-border bg-card px-4 py-3 xl:hidden">
            <div className="grid gap-1">
              {PUBLIC_NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  activeOptions={{ exact: item.to === "/" }}
                  className="rounded-sm px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary data-[status=active]:bg-secondary data-[status=active]:text-primary"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to={session ? "/dashboard" : "/auth"}
                onClick={() => setOpen(false)}
                className="mt-2 rounded-sm bg-primary px-3 py-2 text-center text-sm font-semibold text-primary-foreground"
              >
                {session ? "Go to portal" : "Portal Login"}
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
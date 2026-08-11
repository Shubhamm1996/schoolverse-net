import { useEffect } from "react";
import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Newspaper,
  Images,
  ClipboardList,
  GraduationCap,
  LogOut,
  Home,
  Award,
} from "lucide-react";
import { useAuth, type Role } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { SCHOOL } from "@/lib/school";

export const Route = createFileRoute("/dashboard")({
  ssr: false,
  component: DashboardLayout,
});

const NAV: { to: string; label: string; icon: typeof Home; roles: Role[] }[] = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, roles: ["admin", "teacher", "student"] },
  { to: "/dashboard/news", label: "News", icon: Newspaper, roles: ["admin"] },
  { to: "/dashboard/gallery", label: "Gallery", icon: Images, roles: ["admin"] },
  { to: "/dashboard/admissions", label: "Admissions", icon: ClipboardList, roles: ["admin", "teacher"] },
  { to: "/dashboard/results", label: "Results", icon: Award, roles: ["admin", "teacher", "student"] },
];

function DashboardLayout() {
  const { session, role, fullName, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth", replace: true });
  }, [loading, session, navigate]);

  if (loading || !session) {
    return <div className="grid min-h-screen place-items-center text-muted-foreground">Loading portal…</div>;
  }

  const items = NAV.filter((n) => (role ? n.roles.includes(role) : false));

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="border-b border-border bg-navy-deep text-primary-foreground">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <GraduationCap className="h-6 w-6 shrink-0 text-gold" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{SCHOOL.short} portal</p>
              <p className="truncate text-xs opacity-70">
                {fullName} · <span className="capitalize">{role ?? "member"}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="secondary">
              <Link to="/">
                <Home className="mr-1.5 h-4 w-4" /> Website
              </Link>
            </Button>
            <Button size="sm" variant="destructive" onClick={handleSignOut}>
              <LogOut className="mr-1.5 h-4 w-4" /> Sign out
            </Button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-2">
          {items.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/dashboard" }}
              className="flex shrink-0 items-center gap-2 rounded-sm px-3 py-2 text-sm opacity-75 transition hover:bg-white/10 hover:opacity-100 data-[status=active]:bg-white/15 data-[status=active]:opacity-100"
            >
              <n.icon className="h-4 w-4" /> {n.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
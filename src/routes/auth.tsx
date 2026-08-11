import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SCHOOL } from "@/lib/school";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Portal Login — St. Aldrin Public School" },
      {
        name: "description",
        content: "Sign in to the St. Aldrin Public School portal for admin, teacher and student dashboards.",
      },
      { property: "og:title", content: "Portal Login" },
      { property: "og:description", content: "Access the school portal." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session) navigate({ to: "/dashboard", replace: true });
  }, [session, navigate]);

  async function signIn(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(fd.get("email")),
      password: String(fd.get("password")),
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    navigate({ to: "/dashboard" });
  }

  async function signUp(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: String(fd.get("email")),
      password: String(fd.get("password")),
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: String(fd.get("full_name")), role: String(fd.get("role") || "student") },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (!data.session) toast.success("Check your email to confirm your account.");
    else navigate({ to: "/dashboard" });
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-navy-deep p-12 text-primary-foreground lg:flex">
        <Link to="/" className="flex items-center gap-3">
          <GraduationCap className="h-8 w-8 text-gold" />
          <span className="font-display text-xl font-bold">{SCHOOL.name}</span>
        </Link>
        <div>
          <h2 className="font-display text-4xl leading-tight font-bold">School portal</h2>
          <p className="mt-4 max-w-sm opacity-80">
            One sign-in for administrators, teachers and students. Manage news, galleries, admissions
            and results from a single place.
          </p>
        </div>
        <p className="text-xs opacity-60">{SCHOOL.tagline}</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link to="/" className="text-sm text-muted-foreground hover:underline lg:hidden">
            ← Back to website
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-primary">Sign in to the portal</h1>
          <Tabs defaultValue="signin" className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={signIn} className="grid gap-4 pt-4">
                <div className="grid gap-2">
                  <Label htmlFor="si-email">Email</Label>
                  <Input id="si-email" name="email" type="email" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="si-pass">Password</Label>
                  <Input id="si-pass" name="password" type="password" required />
                </div>
                <Button type="submit" disabled={busy}>
                  {busy ? "Signing in…" : "Sign in"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={signUp} className="grid gap-4 pt-4">
                <div className="grid gap-2">
                  <Label htmlFor="su-name">Full name</Label>
                  <Input id="su-name" name="full_name" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="su-email">Email</Label>
                  <Input id="su-email" name="email" type="email" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="su-pass">Password</Label>
                  <Input id="su-pass" name="password" type="password" minLength={6} required />
                </div>
                <input type="hidden" name="role" value="student" />
                <Button type="submit" disabled={busy}>
                  {busy ? "Creating…" : "Create student account"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Staff accounts are created by the school administrator.
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
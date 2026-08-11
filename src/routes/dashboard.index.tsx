import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Newspaper, Images, ClipboardList, CalendarDays, Award, Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/dashboard/")({
  component: Overview,
});

function Overview() {
  const { role, fullName } = useAuth();

  const { data } = useQuery({
    queryKey: ["dash-stats", role],
    queryFn: async () => {
      const [news, drafts, albums, images, admissions, events, results, quote] = await Promise.all([
        supabase.from("news").select("id", { count: "exact", head: true }).eq("published", true),
        supabase.from("news").select("id", { count: "exact", head: true }).eq("published", false),
        supabase.from("gallery_albums").select("id", { count: "exact", head: true }),
        supabase.from("gallery_images").select("id", { count: "exact", head: true }),
        supabase.from("admissions").select("id", { count: "exact", head: true }),
        supabase.from("events").select("*").order("event_date").limit(4),
        supabase.from("exam_results").select("*").order("created_at", { ascending: false }).limit(4),
        supabase.from("daily_quotes").select("*").order("quote_date", { ascending: false }).limit(1).maybeSingle(),
      ]);
      return {
        news: news.count ?? 0,
        drafts: drafts.count ?? 0,
        albums: albums.count ?? 0,
        images: images.count ?? 0,
        admissions: admissions.count ?? 0,
        events: events.data ?? [],
        results: results.data ?? [],
        quote: quote.data,
      };
    },
  });

  const adminStats = [
    { label: "Published news", value: data?.news ?? 0, icon: Newspaper, to: "/dashboard/news" },
    { label: "Drafts", value: data?.drafts ?? 0, icon: Newspaper, to: "/dashboard/news" },
    { label: "Albums", value: data?.albums ?? 0, icon: Images, to: "/dashboard/gallery" },
    { label: "Photos", value: data?.images ?? 0, icon: Images, to: "/dashboard/gallery" },
    { label: "Applications", value: data?.admissions ?? 0, icon: ClipboardList, to: "/dashboard/admissions" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-primary md:text-3xl">
          {role === "admin" ? "Admin dashboard" : role === "teacher" ? "Teacher dashboard" : "Student dashboard"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Welcome back, {fullName}.</p>
      </div>

      {role === "admin" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {adminStats.map((s) => (
            <Link key={s.label} to={s.to}>
              <Card className="h-full transition-shadow hover:shadow-[var(--shadow-card)]">
                <CardContent className="pt-6">
                  <s.icon className="h-5 w-5 text-gold" />
                  <p className="mt-3 font-display text-3xl font-bold text-primary">{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {role === "teacher" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Link to="/dashboard/admissions">
            <Card className="h-full">
              <CardContent className="pt-6">
                <ClipboardList className="h-5 w-5 text-gold" />
                <p className="mt-3 font-display text-3xl font-bold text-primary">{data?.admissions ?? 0}</p>
                <p className="text-sm text-muted-foreground">Admission applications to review</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/dashboard/results">
            <Card className="h-full">
              <CardContent className="pt-6">
                <Award className="h-5 w-5 text-gold" />
                <p className="mt-3 font-display text-3xl font-bold text-primary">{data?.results.length ?? 0}</p>
                <p className="text-sm text-muted-foreground">Result sets you can publish</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <h2 className="flex items-center gap-2 font-semibold text-primary">
              <CalendarDays className="h-4 w-4 text-gold" /> Upcoming events
            </h2>
            <ul className="mt-4 space-y-3 text-sm">
              {(data?.events ?? []).map((e) => (
                <li key={e.id} className="flex justify-between gap-3 border-b border-border pb-2 last:border-0">
                  <span className="min-w-0 truncate font-medium text-foreground">{e.title}</span>
                  <span className="shrink-0 text-muted-foreground">
                    {new Date(e.event_date).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="flex items-center gap-2 font-semibold text-primary">
              <Award className="h-4 w-4 text-gold" /> Latest results
            </h2>
            <ul className="mt-4 space-y-3 text-sm">
              {(data?.results ?? []).map((r) => (
                <li key={r.id} className="flex justify-between gap-3 border-b border-border pb-2 last:border-0">
                  <span className="min-w-0 truncate font-medium text-foreground">{r.title}</span>
                  <span className="shrink-0 text-muted-foreground">{r.class_name}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {data?.quote && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="flex items-center gap-2 font-semibold text-primary">
              <Quote className="h-4 w-4 text-gold" /> Thought for the day
            </h2>
            <p className="mt-3 font-display text-lg text-foreground">“{data.quote.quote}”</p>
            <p className="mt-1 text-xs text-muted-foreground">— {data.quote.author}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
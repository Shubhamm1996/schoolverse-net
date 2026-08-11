import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PublicLayout, PageHero, Section } from "@/components/PublicLayout";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "School Events Calendar — St. Aldrin Public School" },
      {
        name: "description",
        content: "Upcoming meetings, sports meets, exhibitions and celebrations at St. Aldrin Public School.",
      },
      { property: "og:title", content: "School Events" },
      { property: "og:description", content: "What's coming up on the school calendar." },
    ],
  }),
  component: Events,
});

function Events() {
  const { data } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data } = await supabase.from("events").select("*").order("event_date");
      return data ?? [];
    },
  });

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = (data ?? []).filter((e) => e.event_date >= today);
  const past = (data ?? []).filter((e) => e.event_date < today).reverse();

  return (
    <PublicLayout>
      <PageHero title="Events" subtitle="Everything happening on campus this term." />
      <Section>
        <h2 className="text-2xl font-bold text-primary">Upcoming</h2>
        <div className="mt-6 grid gap-4">
          {upcoming.length === 0 && <p className="text-muted-foreground">No upcoming events listed.</p>}
          {upcoming.map((e) => (
            <article key={e.id} className="grid gap-4 rounded-md border border-border bg-card p-5 sm:grid-cols-[110px_1fr]">
              <div className="rounded-md bg-primary p-3 text-center text-primary-foreground">
                <p className="font-display text-2xl font-bold text-gold">
                  {new Date(e.event_date).getDate()}
                </p>
                <p className="text-xs tracking-widest uppercase">
                  {new Date(e.event_date).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
                </p>
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-primary">{e.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{e.description}</p>
                <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" /> {e.location}
                </p>
              </div>
            </article>
          ))}
        </div>

        {past.length > 0 && (
          <>
            <h2 className="mt-14 text-2xl font-bold text-primary">Past events</h2>
            <ul className="mt-6 grid gap-3">
              {past.map((e) => (
                <li key={e.id} className="flex items-center gap-3 rounded-md border border-border bg-muted/40 p-4 text-sm">
                  <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="font-medium text-primary">{e.title}</span>
                  <span className="text-muted-foreground">
                    {new Date(e.event_date).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </Section>
    </PublicLayout>
  );
}
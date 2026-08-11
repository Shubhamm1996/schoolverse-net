import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen, Users, Trophy, FlaskConical, Quote, CalendarDays } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PublicLayout, Section } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SCHOOL } from "@/lib/school";
import hero from "@/assets/campus-hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "St. Aldrin Public School — CBSE School in Nagpur" },
      {
        name: "description",
        content:
          "A CBSE co-educational school since 1974. Explore admissions, faculty, results, events and campus life at St. Aldrin Public School.",
      },
      { property: "og:title", content: "St. Aldrin Public School" },
      {
        property: "og:description",
        content: "Academic excellence, strong character and service since 1974.",
      },
    ],
  }),
  component: Index,
});

const highlights = [
  { icon: BookOpen, title: "CBSE Curriculum", text: "Nursery to Class XII with Science, Commerce and Humanities streams." },
  { icon: Users, title: "1:18 Ratio", text: "Small classes so every student is known, mentored and challenged." },
  { icon: FlaskConical, title: "Modern Labs", text: "Physics, chemistry, biology, robotics and two computer labs." },
  { icon: Trophy, title: "Sports & Arts", text: "Athletics, football, music, theatre and a competitive debate circuit." },
];

function Index() {
  const { data } = useQuery({
    queryKey: ["home-feed"],
    queryFn: async () => {
      const [news, events, quote] = await Promise.all([
        supabase
          .from("news")
          .select("id,title,slug,excerpt,published_at,category")
          .eq("published", true)
          .order("published_at", { ascending: false })
          .limit(3),
        supabase.from("events").select("*").order("event_date").limit(4),
        supabase.from("daily_quotes").select("*").order("quote_date", { ascending: false }).limit(1).maybeSingle(),
      ]);
      return { news: news.data ?? [], events: events.data ?? [], quote: quote.data };
    },
  });

  return (
    <PublicLayout>
      <section className="relative isolate">
        <img
          src={hero}
          alt="The main campus building of St. Aldrin Public School"
          width={1600}
          height={900}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[image:var(--gradient-hero)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 text-primary-foreground md:py-36">
          <span className="inline-block h-1 w-14 bg-gold" />
          <h1 className="mt-6 max-w-3xl text-4xl leading-tight font-bold md:text-6xl">
            Where curiosity grows into character
          </h1>
          <p className="mt-5 max-w-xl text-base opacity-90 md:text-lg">
            {SCHOOL.name} has educated generations of learners since {SCHOOL.established}, blending
            academic rigour with compassion, sport and service.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/admissions">
                Apply for admission <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link to="/about">Discover the school</Link>
            </Button>
          </div>
        </div>
      </section>

      <Section>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((h) => (
            <Card key={h.title} className="border-border shadow-[var(--shadow-card)]">
              <CardContent className="pt-6">
                <h.icon className="h-7 w-7 text-gold" />
                <h3 className="mt-4 text-lg font-semibold text-primary">{h.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{h.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      {data?.quote && (
        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto max-w-4xl px-4 py-14 text-center">
            <Quote className="mx-auto h-8 w-8 text-gold" />
            <p className="mt-5 font-display text-xl leading-relaxed md:text-2xl">“{data.quote.quote}”</p>
            <p className="mt-4 text-sm tracking-widest uppercase opacity-70">— {data.quote.author}</p>
          </div>
        </section>
      )}

      <Section>
        <div className="grid gap-12 lg:grid-cols-[2fr_1fr]">
          <div>
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-2xl font-bold text-primary md:text-3xl">Latest news</h2>
              <Link to="/news" className="text-sm font-medium text-gold hover:underline">
                All news
              </Link>
            </div>
            <div className="mt-6 grid gap-5">
              {(data?.news ?? []).map((n) => (
                <Link
                  key={n.id}
                  to="/news/$slug"
                  params={{ slug: n.slug }}
                  className="block rounded-md border border-border bg-card p-5 transition-shadow hover:shadow-[var(--shadow-card)]"
                >
                  <span className="text-xs font-semibold tracking-widest text-gold uppercase">
                    {n.category}
                  </span>
                  <h3 className="mt-2 text-lg font-semibold text-primary">{n.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{n.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-primary md:text-3xl">Upcoming</h2>
            <ul className="mt-6 space-y-4">
              {(data?.events ?? []).map((e) => (
                <li key={e.id} className="flex gap-4 rounded-md border border-border bg-card p-4">
                  <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                  <div className="min-w-0">
                    <p className="font-semibold text-primary">{e.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(e.event_date).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "long",
                      })}{" "}
                      · {e.location}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>
    </PublicLayout>
  );
}

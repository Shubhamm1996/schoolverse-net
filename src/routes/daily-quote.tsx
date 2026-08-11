import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PublicLayout, PageHero, Section } from "@/components/PublicLayout";

export const Route = createFileRoute("/daily-quote")({
  head: () => ({
    meta: [
      { title: "Thought for the Day — St. Aldrin Public School" },
      {
        name: "description",
        content: "The daily thought shared at morning assembly, plus our archive of past quotes.",
      },
      { property: "og:title", content: "Thought for the Day" },
      { property: "og:description", content: "Today's assembly quote and the archive." },
    ],
  }),
  component: DailyQuote,
});

function DailyQuote() {
  const { data } = useQuery({
    queryKey: ["quotes"],
    queryFn: async () => {
      const { data } = await supabase
        .from("daily_quotes")
        .select("*")
        .order("quote_date", { ascending: false })
        .limit(30);
      return data ?? [];
    },
  });

  const [today, ...archive] = data ?? [];

  return (
    <PublicLayout>
      <PageHero title="Thought for the day" subtitle="Shared every morning at assembly." />
      <Section>
        {today && (
          <div className="rounded-md bg-primary p-10 text-center text-primary-foreground md:p-16">
            <Quote className="mx-auto h-9 w-9 text-gold" />
            <p className="mx-auto mt-6 max-w-3xl font-display text-2xl leading-relaxed md:text-3xl">
              “{today.quote}”
            </p>
            <p className="mt-5 text-sm tracking-widest uppercase opacity-70">
              — {today.author} · {new Date(today.quote_date).toLocaleDateString()}
            </p>
          </div>
        )}

        {archive.length > 0 && (
          <>
            <h2 className="mt-14 text-2xl font-bold text-primary">Archive</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {archive.map((q) => (
                <blockquote key={q.id} className="rounded-md border-l-4 border-l-gold bg-card p-5">
                  <p className="text-sm text-foreground">“{q.quote}”</p>
                  <footer className="mt-2 text-xs text-muted-foreground">
                    {q.author} · {new Date(q.quote_date).toLocaleDateString()}
                  </footer>
                </blockquote>
              ))}
            </div>
          </>
        )}
      </Section>
    </PublicLayout>
  );
}
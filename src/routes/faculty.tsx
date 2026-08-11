import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PublicLayout, PageHero, Section } from "@/components/PublicLayout";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/faculty")({
  head: () => ({
    meta: [
      { title: "Our Faculty — St. Aldrin Public School" },
      {
        name: "description",
        content: "Meet the teachers and academic leadership of St. Aldrin Public School.",
      },
      { property: "og:title", content: "Our Faculty" },
      { property: "og:description", content: "Meet the teachers who guide our students every day." },
    ],
  }),
  component: Faculty,
});

function initials(name: string) {
  return name
    .replace(/^(Dr\.|Mr\.|Ms\.|Mrs\.)\s*/, "")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
}

function Faculty() {
  const { data, isLoading } = useQuery({
    queryKey: ["faculty"],
    queryFn: async () => {
      const { data } = await supabase.from("faculty").select("*").order("sort_order");
      return data ?? [];
    },
  });

  return (
    <PublicLayout>
      <PageHero
        title="Our faculty"
        subtitle="Experienced teachers, mentors and coaches who know every student by name."
      />
      <Section>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-md" />)}
          {(data ?? []).map((f) => (
            <article key={f.id} className="rounded-md border border-border bg-card p-6">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-primary font-display text-lg font-bold text-primary-foreground">
                {initials(f.name)}
              </div>
              <h2 className="mt-4 text-lg font-semibold text-primary">{f.name}</h2>
              <p className="text-sm font-medium text-gold">{f.designation}</p>
              {f.subject && <p className="text-xs tracking-wider text-muted-foreground uppercase">{f.subject}</p>}
              {f.bio && <p className="mt-3 text-sm text-muted-foreground">{f.bio}</p>}
            </article>
          ))}
        </div>
      </Section>
    </PublicLayout>
  );
}
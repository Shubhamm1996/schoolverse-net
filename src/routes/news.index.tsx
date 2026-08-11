import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PublicLayout, PageHero, Section } from "@/components/PublicLayout";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/news/")({
  head: () => ({
    meta: [
      { title: "School News & Notices — St. Aldrin Public School" },
      {
        name: "description",
        content: "Announcements, achievements and notices published by St. Aldrin Public School.",
      },
      { property: "og:title", content: "School News & Notices" },
      { property: "og:description", content: "Announcements, achievements and notices." },
    ],
  }),
  component: NewsList,
});

function NewsList() {
  const { data, isLoading } = useQuery({
    queryKey: ["news-public"],
    queryFn: async () => {
      const { data } = await supabase
        .from("news")
        .select("id,title,slug,excerpt,category,published_at")
        .eq("published", true)
        .order("published_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <PublicLayout>
      <PageHero title="News & notices" subtitle="What's happening at school, straight from the office." />
      <Section>
        <div className="grid gap-5">
          {isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-md" />)}
          {(data ?? []).map((n) => (
            <Link
              key={n.id}
              to="/news/$slug"
              params={{ slug: n.slug }}
              className="block rounded-md border border-border bg-card p-6 transition-shadow hover:shadow-[var(--shadow-card)]"
            >
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="secondary">{n.category}</Badge>
                <span className="text-xs text-muted-foreground">
                  {n.published_at ? new Date(n.published_at).toLocaleDateString() : ""}
                </span>
              </div>
              <h2 className="mt-3 text-xl font-semibold text-primary">{n.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{n.excerpt}</p>
            </Link>
          ))}
          {!isLoading && (data ?? []).length === 0 && (
            <p className="text-muted-foreground">No news published yet.</p>
          )}
        </div>
      </Section>
    </PublicLayout>
  );
}
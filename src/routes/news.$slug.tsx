import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PublicLayout, Section } from "@/components/PublicLayout";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/news/$slug")({
  head: () => ({
    meta: [
      { title: "News Article — St. Aldrin Public School" },
      { name: "description", content: "Read the latest announcement from St. Aldrin Public School." },
      { property: "og:title", content: "News Article" },
      { property: "og:description", content: "An announcement from St. Aldrin Public School." },
    ],
  }),
  component: NewsDetail,
});

function NewsDetail() {
  const { slug } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["news", slug],
    queryFn: async () => {
      const { data } = await supabase.from("news").select("*").eq("slug", slug).maybeSingle();
      return data;
    },
  });

  return (
    <PublicLayout>
      <Section className="max-w-3xl!">
        <Link to="/news" className="inline-flex items-center gap-2 text-sm text-gold hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to news
        </Link>
        {isLoading && <p className="mt-8 text-muted-foreground">Loading…</p>}
        {!isLoading && !data && <p className="mt-8 text-muted-foreground">This article was not found.</p>}
        {data && (
          <article className="mt-6">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary">{data.category}</Badge>
              <span className="text-xs text-muted-foreground">
                {data.published_at ? new Date(data.published_at).toLocaleDateString() : "Draft"}
              </span>
            </div>
            <h1 className="mt-4 text-3xl font-bold text-primary md:text-4xl">{data.title}</h1>
            {data.excerpt && <p className="mt-4 text-lg text-muted-foreground">{data.excerpt}</p>}
            <div className="mt-8 space-y-4 leading-relaxed whitespace-pre-line text-foreground">
              {data.content}
            </div>
          </article>
        )}
      </Section>
    </PublicLayout>
  );
}
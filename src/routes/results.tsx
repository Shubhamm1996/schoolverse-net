import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PublicLayout, PageHero, Section } from "@/components/PublicLayout";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Examination Results — St. Aldrin Public School" },
      {
        name: "description",
        content: "Board and internal examination results published by St. Aldrin Public School.",
      },
      { property: "og:title", content: "Examination Results" },
      { property: "og:description", content: "Board and internal examination results." },
    ],
  }),
  component: Results,
});

function Results() {
  const { data } = useQuery({
    queryKey: ["results"],
    queryFn: async () => {
      const { data } = await supabase
        .from("exam_results")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <PublicLayout>
      <PageHero title="Results" subtitle="Published board and internal examination outcomes." />
      <Section>
        <div className="grid gap-5 md:grid-cols-2">
          {(data ?? []).map((r) => (
            <article key={r.id} className="rounded-md border border-border bg-card p-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{r.class_name}</Badge>
                <span className="text-xs tracking-widest text-muted-foreground uppercase">
                  {r.exam_name}
                </span>
              </div>
              <h2 className="mt-3 text-lg font-semibold text-primary">{r.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{r.description}</p>
              {r.file_url && (
                <a
                  href={r.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-gold hover:underline"
                >
                  <FileText className="h-4 w-4" /> Download result sheet
                </a>
              )}
            </article>
          ))}
          {(data ?? []).length === 0 && <p className="text-muted-foreground">No results published yet.</p>}
        </div>
      </Section>
    </PublicLayout>
  );
}
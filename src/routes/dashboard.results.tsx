import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/results")({
  component: ResultsDash,
});

function ResultsDash() {
  const { role } = useAuth();
  const qc = useQueryClient();
  const canManage = role === "admin" || role === "teacher";

  const { data, isLoading } = useQuery({
    queryKey: ["results-dash", canManage],
    queryFn: async () => {
      let q = supabase.from("exam_results").select("*").order("created_at", { ascending: false });
      if (!canManage) q = q.eq("published", true);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const toggle = useMutation({
    mutationFn: async (r: { id: string; published: boolean }) => {
      const { error } = await supabase
        .from("exam_results")
        .update({ published: !r.published })
        .eq("id", r.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["results-dash"] });
      toast.success("Result updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Examination results</h1>
        <p className="text-sm text-muted-foreground">
          {canManage ? "Publish or hide result announcements." : "Results published for your classes."}
        </p>
      </div>

      {isLoading && <p className="text-muted-foreground">Loading…</p>}
      {!isLoading && (data ?? []).length === 0 && <p className="text-muted-foreground">No results yet.</p>}

      <div className="grid gap-3">
        {(data ?? []).map((r) => (
          <div
            key={r.id}
            className="grid gap-3 rounded-md border border-border bg-card p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={r.published ? "default" : "secondary"}>
                  {r.published ? "Published" : "Hidden"}
                </Badge>
                <span className="text-xs tracking-widest text-muted-foreground uppercase">
                  {r.exam_name} · Class {r.class_name}
                </span>
              </div>
              <h2 className="mt-2 truncate font-semibold text-primary">{r.title}</h2>
              <p className="truncate text-sm text-muted-foreground">{r.description}</p>
            </div>
            {canManage && (
              <Button size="sm" variant="outline" onClick={() => toggle.mutate(r)}>
                {r.published ? <EyeOff className="mr-1.5 h-4 w-4" /> : <Eye className="mr-1.5 h-4 w-4" />}
                {r.published ? "Hide" : "Publish"}
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
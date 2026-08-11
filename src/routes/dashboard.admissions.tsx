import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { signedUrl } from "@/lib/storage";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/dashboard/admissions")({
  component: AdmissionsAdmin,
});

const STATUSES = ["pending", "reviewing", "accepted", "rejected"] as const;

function AdmissionsAdmin() {
  const { role } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admissions-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admissions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: role === "admin" || role === "teacher",
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("admissions").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admissions-admin"] });
      toast.success("Application updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function openDoc(path: string) {
    const url = await signedUrl(path, "admission-docs");
    if (url) window.open(url, "_blank", "noopener");
    else toast.error("Could not open document");
  }

  if (role !== "admin" && role !== "teacher") {
    return <p className="text-muted-foreground">You do not have access to admission applications.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Admission applications</h1>
        <p className="text-sm text-muted-foreground">Review submitted applications and update their status.</p>
      </div>

      {isLoading && <p className="text-muted-foreground">Loading…</p>}
      {!isLoading && (data ?? []).length === 0 && (
        <p className="text-muted-foreground">No applications received yet.</p>
      )}

      <Accordion type="single" collapsible className="rounded-md border border-border bg-card px-4">
        {(data ?? []).map((a) => {
          const docs = Array.isArray(a.documents) ? (a.documents as { name?: string; path?: string }[]) : [];
          return (
            <AccordionItem key={a.id} value={a.id}>
              <AccordionTrigger>
                <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 pr-2 text-left">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-primary">{a.student_name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      Class {a.applying_for_class} · {new Date(a.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={a.status === "accepted" ? "default" : "secondary"} className="capitalize">
                    {a.status}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <dl className="grid gap-x-8 gap-y-3 py-2 text-sm sm:grid-cols-2">
                  <Row label="Date of birth" value={a.date_of_birth} />
                  <Row label="Gender" value={a.gender} />
                  <Row label="Address" value={a.student_address} />
                  <Row label="Father" value={a.father_name} />
                  <Row label="Mother" value={a.mother_name} />
                  <Row label="Occupation" value={a.guardian_occupation} />
                  <Row label="Phone" value={a.guardian_phone} />
                  <Row label="Email" value={a.guardian_email} />
                  <Row label="Previous school" value={a.previous_school} />
                  <Row label="Previous class" value={a.previous_class} />
                  <Row label="Previous score" value={a.previous_percentage} />
                </dl>

                {docs.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {docs.map((d, i) => (
                      <Button
                        key={i}
                        size="sm"
                        variant="outline"
                        onClick={() => d.path && openDoc(d.path)}
                      >
                        <FileText className="mr-1.5 h-4 w-4" /> {d.name ?? `Document ${i + 1}`}
                      </Button>
                    ))}
                  </div>
                )}

                <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
                  {STATUSES.map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant={a.status === s ? "default" : "outline"}
                      className="capitalize"
                      onClick={() => setStatus.mutate({ id: a.id, status: s })}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs tracking-wide text-muted-foreground uppercase">{label}</dt>
      <dd className="truncate text-foreground">{value || "—"}</dd>
    </div>
  );
}
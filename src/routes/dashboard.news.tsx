import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/dashboard/news")({
  component: NewsAdmin,
});

type NewsRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: string;
  published: boolean;
  published_at: string | null;
};

const empty = { id: "", title: "", slug: "", excerpt: "", content: "", category: "General" };

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function NewsAdmin() {
  const { role, user } = useAuth();
  const qc = useQueryClient();
  const [draft, setDraft] = useState<typeof empty | null>(null);
  const [toDelete, setToDelete] = useState<NewsRow | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["news-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as NewsRow[];
    },
    enabled: role === "admin",
  });

  const save = useMutation({
    mutationFn: async (values: typeof empty) => {
      const row = {
        title: values.title.trim(),
        slug: values.slug.trim() || slugify(values.title),
        excerpt: values.excerpt.trim() || null,
        content: values.content,
        category: values.category.trim() || "General",
      };
      if (values.id) {
        const { error } = await supabase.from("news").update(row).eq("id", values.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("news").insert({ ...row, author_id: user?.id ?? null });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["news-admin"] });
      setDraft(null);
      toast.success("Article saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const togglePublish = useMutation({
    mutationFn: async (row: NewsRow) => {
      const { error } = await supabase
        .from("news")
        .update({
          published: !row.published,
          published_at: !row.published ? new Date().toISOString() : null,
        })
        .eq("id", row.id);
      if (error) throw error;
    },
    onSuccess: (_d, row) => {
      qc.invalidateQueries({ queryKey: ["news-admin"] });
      toast.success(row.published ? "Moved to drafts" : "Article published");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("news").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["news-admin"] });
      setToDelete(null);
      toast.success("Article deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (role !== "admin") {
    return <p className="text-muted-foreground">Only administrators can manage news.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold text-primary">News management</h1>
          <p className="text-sm text-muted-foreground">Create, edit, publish and remove articles.</p>
        </div>
        <Button onClick={() => setDraft({ ...empty })}>
          <Plus className="mr-1.5 h-4 w-4" /> New article
        </Button>
      </div>

      {isLoading && <p className="text-muted-foreground">Loading…</p>}

      <div className="grid gap-3">
        {(data ?? []).map((n) => (
          <article
            key={n.id}
            className="grid gap-4 rounded-md border border-border bg-card p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={n.published ? "default" : "secondary"}>
                  {n.published ? "Published" : "Draft"}
                </Badge>
                <span className="text-xs tracking-widest text-muted-foreground uppercase">
                  {n.category}
                </span>
              </div>
              <h2 className="mt-2 truncate font-semibold text-primary">{n.title}</h2>
              <p className="truncate text-sm text-muted-foreground">{n.excerpt}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => togglePublish.mutate(n)}
                disabled={togglePublish.isPending}
              >
                {n.published ? <EyeOff className="mr-1.5 h-4 w-4" /> : <Eye className="mr-1.5 h-4 w-4" />}
                {n.published ? "Unpublish" : "Publish"}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  setDraft({
                    id: n.id,
                    title: n.title,
                    slug: n.slug,
                    excerpt: n.excerpt ?? "",
                    content: n.content,
                    category: n.category,
                  })
                }
              >
                <Pencil className="mr-1.5 h-4 w-4" /> Edit
              </Button>
              <Button size="sm" variant="destructive" onClick={() => setToDelete(n)}>
                <Trash2 className="mr-1.5 h-4 w-4" /> Delete
              </Button>
            </div>
          </article>
        ))}
        {!isLoading && (data ?? []).length === 0 && (
          <p className="text-muted-foreground">No articles yet — create the first one.</p>
        )}
      </div>

      <Dialog open={!!draft} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{draft?.id ? "Edit article" : "New article"}</DialogTitle>
          </DialogHeader>
          {draft && (
            <form
              className="grid gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (!draft.title.trim()) {
                  toast.error("A title is required");
                  return;
                }
                save.mutate(draft);
              }}
            >
              <div className="grid gap-2">
                <Label>Title</Label>
                <Input
                  value={draft.title}
                  maxLength={160}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      title: e.target.value,
                      slug: draft.id ? draft.slug : slugify(e.target.value),
                    })
                  }
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>URL slug</Label>
                  <Input value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Category</Label>
                  <Input
                    value={draft.category}
                    onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Summary</Label>
                <Textarea
                  rows={2}
                  maxLength={300}
                  value={draft.excerpt}
                  onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Content</Label>
                <Textarea
                  rows={10}
                  value={draft.content}
                  onChange={(e) => setDraft({ ...draft, content: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDraft(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={save.isPending}>
                  {save.isPending ? "Saving…" : "Save article"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this article?</AlertDialogTitle>
            <AlertDialogDescription>
              “{toDelete?.title}” will be removed permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => toDelete && remove.mutate(toDelete.id)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
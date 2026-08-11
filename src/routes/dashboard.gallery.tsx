import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2, Upload, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { signedUrl, uploadToBucket } from "@/lib/storage";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/dashboard/gallery")({
  component: GalleryAdmin,
});

type AlbumDraft = { id: string; title: string; description: string };
const emptyAlbum: AlbumDraft = { id: "", title: "", description: "" };

function GalleryAdmin() {
  const { role } = useAuth();
  const qc = useQueryClient();
  const [draft, setDraft] = useState<AlbumDraft | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ["gallery-admin"],
    queryFn: async () => {
      const [{ data: albums }, { data: images }] = await Promise.all([
        supabase.from("gallery_albums").select("*").order("created_at", { ascending: false }),
        supabase.from("gallery_images").select("*").order("created_at", { ascending: false }),
      ]);
      const withUrls = await Promise.all(
        (images ?? []).map(async (i) => ({ ...i, src: await signedUrl(i.url) })),
      );
      return { albums: albums ?? [], images: withUrls };
    },
    enabled: role === "admin",
  });

  const saveAlbum = useMutation({
    mutationFn: async (a: AlbumDraft) => {
      const row = { title: a.title.trim(), description: a.description.trim() || null };
      if (!row.title) throw new Error("Album title is required");
      const { error } = a.id
        ? await supabase.from("gallery_albums").update(row).eq("id", a.id)
        : await supabase.from("gallery_albums").insert(row);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gallery-admin"] });
      setDraft(null);
      toast.success("Album saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteAlbum = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("gallery_albums").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gallery-admin"] });
      toast.success("Album deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteImage = useMutation({
    mutationFn: async (img: { id: string; url: string }) => {
      await supabase.storage.from("site-images").remove([img.url]);
      const { error } = await supabase.from("gallery_images").delete().eq("id", img.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gallery-admin"] });
      toast.success("Photo removed");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function handleUpload(albumId: string, fileList: FileList | null) {
    const files = Array.from(fileList ?? []);
    if (files.length === 0) return;
    setUploading(albumId);
    try {
      const rows: { album_id: string; url: string; storage_path: string; caption: string }[] = [];
      for (const file of files) {
        const path = await uploadToBucket("site-images", file, "gallery/");
        rows.push({ album_id: albumId, url: path, storage_path: path, caption: file.name });
      }
      const { error } = await supabase.from("gallery_images").insert(rows);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["gallery-admin"] });
      toast.success(`${rows.length} photo${rows.length > 1 ? "s" : ""} uploaded`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(null);
    }
  }

  if (role !== "admin") {
    return <p className="text-muted-foreground">Only administrators can manage the gallery.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold text-primary">Gallery management</h1>
          <p className="text-sm text-muted-foreground">Create albums and upload multiple photos at once.</p>
        </div>
        <Button onClick={() => setDraft({ ...emptyAlbum })}>
          <Plus className="mr-1.5 h-4 w-4" /> New album
        </Button>
      </div>

      <div className="space-y-6">
        {(data?.albums ?? []).map((album) => {
          const items = (data?.images ?? []).filter((i) => i.album_id === album.id);
          return (
            <section key={album.id} className="rounded-md border border-border bg-card p-5">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
                <div className="min-w-0">
                  <h2 className="truncate font-semibold text-primary">{album.title}</h2>
                  <p className="truncate text-sm text-muted-foreground">
                    {album.description} · {items.length} photo{items.length === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-sm bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
                    <Upload className="h-4 w-4" />
                    {uploading === album.id ? "Uploading…" : "Upload photos"}
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      disabled={uploading === album.id}
                      onChange={(e) => {
                        void handleUpload(album.id, e.target.files);
                        e.currentTarget.value = "";
                      }}
                    />
                  </label>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      setDraft({ id: album.id, title: album.title, description: album.description ?? "" })
                    }
                  >
                    <Pencil className="mr-1.5 h-4 w-4" /> Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteAlbum.mutate(album.id)}>
                    <Trash2 className="mr-1.5 h-4 w-4" /> Delete
                  </Button>
                </div>
              </div>

              {items.length > 0 && (
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                  {items.map((img) => (
                    <div key={img.id} className="group relative aspect-square overflow-hidden rounded-sm border border-border">
                      {img.src && (
                        <img src={img.src} alt={img.caption ?? ""} loading="lazy" className="h-full w-full object-cover" />
                      )}
                      <button
                        onClick={() => deleteImage.mutate({ id: img.id, url: img.url })}
                        aria-label="Delete photo"
                        className="absolute top-1 right-1 rounded-sm bg-destructive p-1 text-destructive-foreground opacity-0 transition group-hover:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })}
        {(data?.albums ?? []).length === 0 && (
          <p className="text-muted-foreground">No albums yet — create one to start uploading.</p>
        )}
      </div>

      <Dialog open={!!draft} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{draft?.id ? "Edit album" : "New album"}</DialogTitle>
          </DialogHeader>
          {draft && (
            <form
              className="grid gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                saveAlbum.mutate(draft);
              }}
            >
              <div className="grid gap-2">
                <Label>Title</Label>
                <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Description</Label>
                <Textarea
                  rows={3}
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDraft(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saveAlbum.isPending}>
                  Save album
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
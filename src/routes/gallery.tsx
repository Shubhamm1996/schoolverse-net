import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Images } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PublicLayout, PageHero, Section } from "@/components/PublicLayout";
import { signedUrl } from "@/lib/storage";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Photo Gallery — St. Aldrin Public School" },
      {
        name: "description",
        content: "Photo albums from annual day, sports meets, exhibitions and everyday campus life.",
      },
      { property: "og:title", content: "Photo Gallery" },
      { property: "og:description", content: "Albums from school events and campus life." },
    ],
  }),
  component: Gallery,
});

function Gallery() {
  const [zoom, setZoom] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ["gallery-public"],
    queryFn: async () => {
      const [{ data: albums }, { data: images }] = await Promise.all([
        supabase.from("gallery_albums").select("*").order("created_at", { ascending: false }),
        supabase.from("gallery_images").select("*").order("created_at", { ascending: false }),
      ]);
      const withUrls = await Promise.all(
        (images ?? []).map(async (img) => ({ ...img, src: await signedUrl(img.url) })),
      );
      return { albums: albums ?? [], images: withUrls };
    },
  });

  const albums = data?.albums ?? [];
  const images = data?.images ?? [];

  return (
    <PublicLayout>
      <PageHero title="Gallery" subtitle="Moments from our classrooms, fields and stages." />
      <Section>
        {albums.length === 0 && <p className="text-muted-foreground">No albums yet.</p>}
        <div className="space-y-14">
          {albums.map((album) => {
            const items = images.filter((i) => i.album_id === album.id);
            return (
              <div key={album.id}>
                <h2 className="text-2xl font-bold text-primary">{album.title}</h2>
                {album.description && (
                  <p className="mt-1 text-sm text-muted-foreground">{album.description}</p>
                )}
                {items.length === 0 ? (
                  <p className="mt-4 flex items-center gap-2 rounded-md border border-dashed border-border p-6 text-sm text-muted-foreground">
                    <Images className="h-4 w-4" /> Photos will be added to this album soon.
                  </p>
                ) : (
                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {items.map((img) => (
                      <button
                        key={img.id}
                        onClick={() => img.src && setZoom(img.src)}
                        className="group relative aspect-4/3 overflow-hidden rounded-md border border-border"
                      >
                        {img.src && (
                          <img
                            src={img.src}
                            alt={img.caption ?? album.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      <Dialog open={!!zoom} onOpenChange={(o) => !o && setZoom(null)}>
        <DialogContent className="max-w-4xl p-2">
          {zoom && <img src={zoom} alt="Gallery photo" className="w-full rounded-sm" />}
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
}
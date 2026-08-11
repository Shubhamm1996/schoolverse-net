import { supabase } from "@/integrations/supabase/client";

const cache = new Map<string, string>();

/** Site images live in a private bucket, so reads go through signed URLs. */
export async function signedUrl(path: string | null | undefined, bucket = "site-images") {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const key = `${bucket}:${path}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60 * 24 * 7);
  if (!data?.signedUrl) return null;
  cache.set(key, data.signedUrl);
  return data.signedUrl;
}

export async function signedUrls(paths: (string | null | undefined)[], bucket = "site-images") {
  const out = await Promise.all(paths.map((p) => signedUrl(p, bucket)));
  return out;
}

export async function uploadToBucket(bucket: string, file: File, prefix = "") {
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${prefix}${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
  if (error) throw error;
  return path;
}
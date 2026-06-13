import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const ALLOWED_BUCKETS = ["avatars", "churches"] as const;
type Bucket = (typeof ALLOWED_BUCKETS)[number];

function adminStorage() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  ).storage;
}

async function ensureBucket(storage: ReturnType<typeof adminStorage>, bucket: Bucket) {
  const { data } = await storage.getBucket(bucket);
  if (!data) {
    await storage.createBucket(bucket, { public: true, fileSizeLimit: 5 * 1024 * 1024 });
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const bucket = formData.get("bucket") as string | null;
  const path = formData.get("path") as string | null;

  if (!file || !bucket || !path) {
    return NextResponse.json({ error: "Missing file, bucket, or path" }, { status: 400 });
  }

  if (!(ALLOWED_BUCKETS as readonly string[]).includes(bucket)) {
    return NextResponse.json({ error: "Invalid bucket" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large — max 5 MB" }, { status: 400 });
  }

  const storage = adminStorage();
  await ensureBucket(storage, bucket as Bucket);

  const buffer = await file.arrayBuffer();
  const { data, error } = await storage
    .from(bucket)
    .upload(path, buffer, { contentType: file.type, upsert: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: { publicUrl } } = storage.from(bucket).getPublicUrl(data.path);
  return NextResponse.json({ url: publicUrl });
}

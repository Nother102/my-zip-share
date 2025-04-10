import { NextRequest, NextResponse } from "next/server";
import { writeFile, appendFile } from "fs/promises";
import path from "path";
import { mkdirSync, existsSync } from "fs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !isAdmin(session.user?.email ?? '')) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await req.formData();
  const zip = formData.get("zip") as File;
  const preview = formData.get("preview") as File;
  const uploadedBy = formData.get("uploadedBy") as string;
  const description = formData.get("description") as string;
  const size = formData.get("size") as string;

  if (!zip || !preview) {
    return NextResponse.json({ error: "Missing file(s)" }, { status: 400 });
  }

  const zipBuffer = Buffer.from(await zip.arrayBuffer());
  const previewBuffer = Buffer.from(await preview.arrayBuffer());

  const filesDir = path.join(process.cwd(), "public", "files");
  const previewsDir = path.join(process.cwd(), "public", "previews");
  const logsDir = path.join(process.cwd(), "logs");

  if (!existsSync(filesDir)) mkdirSync(filesDir, { recursive: true });
  if (!existsSync(previewsDir)) mkdirSync(previewsDir, { recursive: true });
  if (!existsSync(logsDir)) mkdirSync(logsDir, { recursive: true });

  const zipPath = path.join(filesDir, zip.name);
  const previewPath = path.join(previewsDir, preview.name);
  const metaPath = path.join(filesDir, zip.name.replace(/\.zip$/, ".json"));
  const logPath = path.join(logsDir, "upload.log");

  try {
    await writeFile(zipPath, zipBuffer);
    await writeFile(previewPath, previewBuffer);

    const metadata = {
      uploadedBy,
      description,
      size
    };
    await writeFile(metaPath, JSON.stringify(metadata, null, 2), "utf8");

    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] 📤 อัปโหลดโดย: ${uploadedBy} | ไฟล์: ${zip.name}\n`;
    await appendFile(logPath, logEntry, "utf8");

    console.log("✅ อัปโหลดโดย:", uploadedBy);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Failed to save files" }, { status: 500 });
  }
}

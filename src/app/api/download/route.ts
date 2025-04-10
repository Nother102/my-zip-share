import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { existsSync, readFileSync, writeFileSync } from "fs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filename = searchParams.get("filename");

  if (!filename) {
    return new NextResponse("Missing filename", { status: 400 });
  }

  const filePath = path.join(process.cwd(), "public", "files", filename);
  const metaPath = path.join(process.cwd(), "public", "files", filename.replace(/\.zip$/, ".json"));

  if (!existsSync(filePath)) {
    return new NextResponse("File not found", { status: 404 });
  }

  // Update download count
  try {
    if (existsSync(metaPath)) {
      const raw = readFileSync(metaPath, "utf8");
      const meta = JSON.parse(raw);
      meta.downloadCount = (meta.downloadCount || 0) + 1;
      writeFileSync(metaPath, JSON.stringify(meta, null, 2), "utf8");
    }
  } catch (err) {
    console.error("Failed to update download count:", err);
  }

  const fileBuffer = readFileSync(filePath);
  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename=\"${filename}\"`
    }
  });
}

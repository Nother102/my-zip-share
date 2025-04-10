import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { readdir, readFile } from "fs/promises";
import { existsSync } from "fs";

export async function GET(req: NextRequest) {
  const filesDir = path.join(process.cwd(), "public", "files");
  const previewsDir = path.join(process.cwd(), "public", "previews");
  const filenames = await readdir(filesDir);

  const zipFiles = filenames.filter((name) => name.endsWith(".zip"));

  const data = await Promise.all(
    zipFiles.map(async (zipName) => {
      const id = zipName.replace(/\.zip$/, "");
      const previewPath = path.join(previewsDir, `${id}.png`);
      const metaPath = path.join(filesDir, `${id}.json`);

      let meta = {
        description: "",
        uploadedBy: "",
        size: "-",
        downloadCount: 0
      };

      if (existsSync(metaPath)) {
        try {
          const raw = await readFile(metaPath, "utf8");
          meta = JSON.parse(raw);
        } catch (err) {
          console.error("Failed to parse metadata for:", zipName);
        }
      }

      return {
        id,
        name: zipName,
        image: `/previews/${id}.png`,
        date: "2025-04-09",
        size: meta.size || "-",
        description: meta.description || "",
        uploadedBy: meta.uploadedBy || "",
        downloadCount: meta.downloadCount || 0
      };
    })
  );

  return NextResponse.json(data);
}
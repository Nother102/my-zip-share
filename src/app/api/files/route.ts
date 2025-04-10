import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { readdirSync, existsSync, readFileSync } from "fs";

export async function GET() {
  const filesDir = path.join(process.cwd(), "public", "files");
  const previewsDir = path.join(process.cwd(), "public", "previews");

  const files = readdirSync(filesDir).filter((f) => f.endsWith(".zip"));

  const fileData = await Promise.all(
    files.map(async (file, index) => {
      const id = String(index + 1);
      const baseName = file.replace(/\.zip$/, "");

      let uploadedBy = undefined;
      let description = "";
      let size = "";

      const metadataPath = path.join(filesDir, `${baseName}.json`);
      if (existsSync(metadataPath)) {
        try {
          const metaRaw = readFileSync(metadataPath, "utf8");
          const metadata = JSON.parse(metaRaw);
          uploadedBy = metadata.uploadedBy;
          description = metadata.description;
          size = metadata.size;
        } catch (e) {
          console.warn(`⚠️ ไม่สามารถอ่าน metadata สำหรับ ${file}`);
        }
      }

      return {
        id,
        name: file,
        image: `/previews/${baseName}.png`,
        date: new Date().toISOString().split("T")[0],
        size,
        description,
        uploadedBy
      };
    })
  );

  return NextResponse.json(fileData);
}

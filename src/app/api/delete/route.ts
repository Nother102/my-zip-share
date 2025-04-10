import { NextRequest, NextResponse } from "next/server"; 
import path from "path";
import fs from "fs/promises";
import { existsSync, mkdirSync } from "fs";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { isAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdmin(session.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const filename = body.filename;

  if (!filename) {
    return NextResponse.json({ error: "Missing filename" }, { status: 400 });
  }

  const zipPath = path.join(process.cwd(), "public", "files", filename);
  const previewName = filename.replace(/\.[^.]+$/, ".png");
  const previewPath = path.join(process.cwd(), "public", "previews", previewName);
  const jsonPath = path.join(process.cwd(), "public", "files", filename.replace(/\.zip$/, ".json"));
  const logsDir = path.join(process.cwd(), "logs");
  const logPath = path.join(logsDir, "delete.log");

  try {
    if (!existsSync(logsDir)) mkdirSync(logsDir, { recursive: true });

    console.log(`🗑️ ลบไฟล์โดย: ${session.user?.email}`);
    const timestamp = new Date().toISOString();
    const logLines = [`[${timestamp}] 🗑️ ลบโดย: ${session.user?.email}`];

    if (existsSync(zipPath)) {
      await fs.unlink(zipPath);
      logLines.push(`- ลบแล้ว: ${filename}`);
    }
    if (existsSync(previewPath)) {
      await fs.unlink(previewPath);
      logLines.push(`- ลบ preview: ${previewName}`);
    }
    if (existsSync(jsonPath)) {
      await fs.unlink(jsonPath);
      logLines.push(`- ลบ metadata: ${filename.replace(/\.zip$/, ".json")}`);
    }

    logLines.push("\n");
    await fs.appendFile(logPath, logLines.join("\n"), "utf8");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete error:", err);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}
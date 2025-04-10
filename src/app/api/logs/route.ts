import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !isAdmin(session.user?.email)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const logsDir = path.join(process.cwd(), "logs");
  const uploadPath = path.join(logsDir, "upload.log");
  const deletePath = path.join(logsDir, "delete.log");

  let combinedLogs = "";

  try {
    if (existsSync(uploadPath)) {
      const uploadLog = await fs.readFile(uploadPath, "utf8");
      combinedLogs += "📤 [UPLOAD LOG]\n" + uploadLog + "\n";
    }
    if (existsSync(deletePath)) {
      const deleteLog = await fs.readFile(deletePath, "utf8");
      combinedLogs += "🗑️ [DELETE LOG]\n" + deleteLog + "\n";
    }
    if (!combinedLogs) {
      combinedLogs = "⚠️ ไม่มีบันทึก log ให้แสดง";
    }
    return new NextResponse(combinedLogs, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  } catch (err) {
    return new NextResponse("เกิดข้อผิดพลาดในการอ่าน log", { status: 500 });
  }
}
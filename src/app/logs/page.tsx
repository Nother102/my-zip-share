"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function isAdmin(email?: string | null): boolean {
  if (!email) return false;
  const list = process.env.NEXT_PUBLIC_ADMIN_EMAILS || "";
  return list.split(",").map((e) => e.trim()).includes(email);
}

export default function LogsPage() {
  const { data: session, status } = useSession();
  const [logs, setLogs] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "upload" | "delete">("all");

  const isUserAdmin = isAdmin(session?.user?.email);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch("/api/logs");
        if (!res.ok) throw new Error("ไม่สามารถโหลด log ได้");
        const text = await res.text();
        setLogs(text);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (session && isUserAdmin) fetchLogs();
  }, [session, isUserAdmin]);

  const filteredLogs = () => {
    if (filter === "upload") {
      return logs
        .split("\n")
        .filter((line) => line.includes("📤") || line.startsWith("["))
        .join("\n");
    }
    if (filter === "delete") {
      return logs
        .split("\n")
        .filter((line) => line.includes("🗑️") || line.startsWith("["))
        .join("\n");
    }
    return logs;
  };

  if (status === "loading") {
    return <div className="p-6">🔄 กำลังโหลดข้อมูล...</div>;
  }

  if (!session || !isUserAdmin) {
    return (
      <div className="p-6 text-center">
        <p className="mb-4">🚫 เฉพาะผู้ดูแลระบบเท่านั้นที่เข้าถึงหน้านี้ได้</p>
        <Link href="/">
          <Button variant="outline">↩️ กลับหน้าแรก</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📜 บันทึกการอัปโหลดและลบไฟล์</h1>

      <div className="flex gap-2 mb-4">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          🔁 แสดงทั้งหมด
        </Button>
        <Button
          variant={filter === "upload" ? "default" : "outline"}
          onClick={() => setFilter("upload")}
        >
          📤 เฉพาะ Upload
        </Button>
        <Button
          variant={filter === "delete" ? "default" : "outline"}
          onClick={() => setFilter("delete")}
        >
          🗑️ เฉพาะ Delete
        </Button>
      </div>

      {loading ? (
        <p>⏳ กำลังโหลด log...</p>
      ) : error ? (
        <p className="text-red-600">❌ {error}</p>
      ) : (
        <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap text-sm overflow-auto max-h-[80vh]">
          {filteredLogs()}
        </pre>
      )}

      <div className="mt-6 text-center">
        <Link href="/">
          <Button variant="outline">↩️ กลับหน้าแรก</Button>
        </Link>
      </div>
    </div>
  );
}

"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { isAdmin } from "@/lib/auth";

interface FileData {
  id: string;
  name: string;
  image: string;
  date: string;
  size: string;
  description: string;
  uploadedBy?: string;
}

export default function FileDetailPage() {
  const params = useParams();
  const fileId = params?.id?.toString();
  const [file, setFile] = useState<FileData | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    async function fetchFile() {
      try {
        const res = await fetch("/api/files");
        const data: FileData[] = await res.json();
        const found = data.find((f) => f.id === fileId);
        setFile(found || null);
      } catch (err) {
        console.error("Error loading file detail:", err);
      } finally {
        setLoading(false);
      }
    }
    if (fileId) fetchFile();
  }, [fileId]);

  async function handleDelete() {
    if (!file) return;
    const confirmDelete = confirm("⚠️ ต้องการลบไฟล์นี้จริงหรือไม่?");
    if (!confirmDelete) return;

    const res = await fetch("/api/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: file.name })
    });

    if (res.ok) {
      alert("🗑️ ลบไฟล์เรียบร้อยแล้ว");
      router.push("/");
    } else {
      alert("❌ ไม่สามารถลบไฟล์ได้");
    }
  }

  if (loading) {
    return <div className="p-6">⏳ กำลังโหลดข้อมูลไฟล์...</div>;
  }

  if (!file) {
    return <div className="p-6 text-red-600">❌ ไม่พบไฟล์ที่ต้องการ</div>;
  }

  const isUserAdmin = isAdmin(session?.user?.email ?? '');


  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📦 {file.name}</h1>
      <Image
        src={file.image}
        alt={file.name}
        width={500}
        height={300}
        className="rounded mb-4 w-full max-h-96 object-cover"
      />
      <p className="text-gray-600 mb-2">📅 วันที่อัปโหลด: {file.date}</p>
      <p className="text-gray-600 mb-2">📏 ขนาดไฟล์: {file.size}</p>
      {file.uploadedBy && (
        <p className="text-gray-600 mb-2">👤 อัปโหลดโดย: {file.uploadedBy}</p>
      )}
      <p className="text-gray-700 mb-6">📝 คำอธิบาย: {file.description}</p>

      <a href={`/files/${file.name}`} download>
        <Button className="mb-4">⬇️ ดาวน์โหลดไฟล์</Button>
      </a>

      {isUserAdmin && (
        <Button
          variant="destructive"
          className="mb-4 ml-2"
          onClick={handleDelete}
        >
          🗑️ ลบไฟล์นี้
        </Button>
      )}

      <br />
      <Link href="/">
        <Button variant="outline">↩️ กลับหน้าแรก</Button>
      </Link>
    </div>
  );
}

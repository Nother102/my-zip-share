"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSession, signOut, signIn } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { User2Icon } from "lucide-react";

interface FileData {
  id: string;
  name: string;
  image: string;
  date: string;
  size: string;
  description: string;
  uploadedBy?: string;
}

export default function HomePage() {
  const [files, setFiles] = useState<FileData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { data: session } = useSession();
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    async function fetchFiles() {
      const res = await fetch("/api/files");
      const data = await res.json();
      setFiles(data);
    }
    fetchFiles();
  }, []);

  const isUserAdmin = session?.user?.isAdmin ?? false;

  const filteredFiles = files.filter((file) => {
    const q = searchTerm.toLowerCase();
    return (
      file.name.toLowerCase().includes(q) ||
      file.description.toLowerCase().includes(q) ||
      (file.uploadedBy?.toLowerCase().includes(q) ?? false)
    );
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">📁 My Zip Share</h1>
        <div className="flex gap-2 items-center relative">
          {isUserAdmin && (
            <>
              <Link href="/upload">
                <Button>📤 อัปโหลดไฟล์</Button>
              </Link>
              <Link href="/logs">
                <Button variant="outline">📜 ดูประวัติการจัดการไฟล์</Button>
              </Link>
            </>
          )}
          {!session && (
            <Button onClick={() => signIn()}>🔐 เข้าสู่ระบบ</Button>
          )}
          {session && (
            <>
              <Button
                variant="outline"
                onClick={() => setShowProfile(!showProfile)}
              >
                <User2Icon className="w-4 h-4 mr-2" /> ข้อมูลผู้ใช้
              </Button>
              {showProfile && (
                <div className="absolute top-14 right-0 bg-white shadow-xl rounded p-4 text-sm border z-10 min-w-[200px]">
                  <p className="font-medium">👤 {session.user?.name}</p>
                  <p className="text-gray-600 mb-2">📧 {session.user?.email}</p>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={() => signOut()}
                  >
                    🔓 ออกจากระบบ
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <input
        type="text"
        placeholder="🔍 ค้นหาไฟล์ตามชื่อ คำอธิบาย หรือชื่อผู้ส่ง..."
        className="w-full mb-6 p-2 border rounded"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredFiles.map((file) => (
          <Card key={file.id}>
            <Image
              src={file.image}
              alt={file.name}
              width={400}
              height={200}
              className="rounded-t w-full h-48 object-cover"
            />
            <CardContent className="space-y-2">
              <h2 className="text-lg font-semibold">{file.name}</h2>
              <p className="text-sm text-gray-500">📅 {file.date}</p>
              <p className="text-sm text-gray-500">📦 {file.size}</p>
              {file.uploadedBy && (
                <p className="text-sm text-gray-500">👤 โดย {file.uploadedBy}</p>
              )}
              <Link href={`/file/${file.id}`}>
                <Button className="w-full">🔎 ดูรายละเอียด</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
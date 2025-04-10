"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileArchive, Image, User, FileText, Ruler, Upload } from "lucide-react";

export default function UploadPage() {
  const { data: session, status } = useSession();
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<File | null>(null);
  const [uploadedBy, setUploadedBy] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [size, setSize] = useState<string>("");
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  if (status === "loading") {
    return <div className="p-6">🔄 กำลังตรวจสอบสิทธิ์...</div>;
  }

  if (!session) {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <h1 className="text-xl font-bold mb-4">🚫 ต้องเข้าสู่ระบบก่อนจึงจะอัปโหลดได้</h1>
        <Link href="/api/auth/signin">
          <Button>🔐 เข้าสู่ระบบด้วย Google</Button>
        </Link>
      </div>
    );
  }

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const handleZipChange = (file: File | null) => {
    setZipFile(file);
    if (file) {
      setSize(formatFileSize(file.size));
    } else {
      setSize("");
    }
  };

  const handleUpload = async () => {
    if (!zipFile || !previewImage || !uploadedBy.trim()) {
      setStatusMsg("❗ กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const formData = new FormData();
    formData.append("zip", zipFile);
    formData.append("preview", previewImage);
    formData.append("uploadedBy", uploadedBy);
    formData.append("description", description);
    formData.append("size", size);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData
    });

    if (res.ok) {
      setStatusMsg("✅ อัปโหลดสำเร็จ!");
      setZipFile(null);
      setPreviewImage(null);
      setUploadedBy("");
      setDescription("");
      setSize("");
    } else {
      setStatusMsg("❌ อัปโหลดล้มเหลว");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">📤 อัปโหลดไฟล์ ZIP</h1>

      <div className="bg-white p-6 rounded-xl shadow space-y-5">
        <div className="space-y-1">
          <label className="font-medium flex items-center gap-2">
            <FileArchive className="w-5 h-5" /> เลือกไฟล์ .zip
          </label>
          <input
            type="file"
            accept=".zip"
            onChange={(e) => handleZipChange(e.target.files?.[0] || null)}
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="space-y-1">
          <label className="font-medium flex items-center gap-2">
            <Image className="w-5 h-5" /> เลือกรูป preview (.png)
          </label>
          <input
            type="file"
            accept="image/png"
            onChange={(e) => setPreviewImage(e.target.files?.[0] || null)}
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="space-y-1">
          <label className="font-medium flex items-center gap-2">
            <User className="w-5 h-5" /> ชื่อผู้ส่ง
          </label>
          <input
            type="text"
            placeholder="กรอกชื่อของคุณ..."
            className="w-full p-2 border rounded"
            value={uploadedBy}
            onChange={(e) => setUploadedBy(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="font-medium flex items-center gap-2">
            <FileText className="w-5 h-5" /> คำอธิบายเพิ่มเติม
          </label>
          <textarea
            className="w-full p-2 border rounded"
            placeholder="อธิบายเกี่ยวกับไฟล์นี้..."
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        <div className="space-y-1">
          <label className="font-medium flex items-center gap-2">
            <Ruler className="w-5 h-5" /> ขนาดไฟล์ (คำนวณอัตโนมัติ)
          </label>
          <input
            type="text"
            className="w-full p-2 border rounded bg-gray-100"
            placeholder="ระบบจะคำนวณให้"
            value={size}
            readOnly
          />
        </div>

        <Button onClick={handleUpload} className="w-full text-base flex gap-2 items-center justify-center">
          <Upload className="w-5 h-5" /> ส่งไฟล์ขึ้นระบบ
        </Button>

        {statusMsg && <p className="text-center text-sm text-gray-700">{statusMsg}</p>}
      </div>

      <div className="text-center mt-6">
        <Link href="/">
          <Button variant="outline">↩️ กลับหน้าแรก</Button>
        </Link>
      </div>
    </div>
  );
}
"use client";

import Image from "next/image";
import task from "@/assets/task.png";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const id = useParams().id;

  //สร้างตัวแปร state สำหรับเก็บข้อมูลจากฟอร์ม
  const [title, setTitle] = useState<string>("");
  const [detail, setDetail] = useState<string>("");
  const [is_completed, setIsCompleted] = useState<boolean>(false);
  const [image_File, setImageFile] = useState<File | null>(null);
  const [preview_file, setPreviewFile] = useState<string>("");
  const [old_image_file, setOldImageFile] = useState<string | null>(null);

  //ดึงข้อมูลจาก supabase มาแสดงที่หน้าจอตาม id ที่ได้มาจาก url
  useEffect(() => {
    
    
  }, [id]);

//เลือกรูปภาพและแสดงตัวอย่างรูปภาพ
  function handleSelecImagePreview(e: React.ChangeEvent<HTMLInputElement>) {
    
  }

//อัพโหลดรูปภาพและบันทึกแก้ไขข้อมูลลงฐานข้อมูลSupabase
  async function handleUplodeAndUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    //อับโหลดรูปภาพ
    //สร้างตัวแปร image_url เพื่อเก็บ URL ของรูปภาพที่อัพโหลด เพื่อเอาไปบันทึกลงตาราง task_tb
    
    //แก้ไขข้อมูลในตาราง บน Supabase
    
  }

  return (
    <div className="flex flex-col items-center mt-20">
      <Image src={task} alt="Task App" width={150} height={150} priority />
      <h1 className="text-2xl font-bold mt-10">Manage Task App</h1>
      <h1 className="text-2xl font-bold">แก้ไขงาน</h1>
      {/* ส่วนเพิ่มงานใหม่ */}
      <div className="w-full max-w-lg border-2 border-gray-300 p-8 mt-10 rounded-xl space-y-6">
        <h1 className="text-center text-xl font-bold">✒️ แก้ไขงานเก่า</h1>

        <form onSubmit={handleUplodeAndUpdate}>
          <div>
            <label htmlFor="title" className="text-lg font-bold mb-2 block">
              งานที่ต้องทำ
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border-2 border-gray-300 rounded-lg p-2"
            />
          </div>

          <div>
            <label htmlFor="detail" className="text-lg font-bold mb-2 block">
              รายละเอียดงาน
            </label>
            <textarea
              id="detail"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              className="w-full border-2 border-gray-300 rounded-lg p-2"
            ></textarea>
          </div>

          <div className="flex flex-col">
            <label className="text-lg font-bold mb-2">อัปโหลดรูปภาพ</label>
            <div className="flex items-center gap-4">
              <input
                id="fileInput"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleSelecImagePreview}
              />
              <label
                htmlFor="fileInput"
                className="bg-blue-500 rounded-lg px-4 py-2 text-white cursor-pointer hover:bg-blue-600 transition"
              >
                เลือกรูป
              </label>

              {preview_file && (
                <div className="mt-3">
                  <Image
                    src={preview_file}
                    alt="preview"
                    width={100}
                    height={100}
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="status" className="text-lg font-bold mb-2 block">
              สถานะงาน
            </label>
            <select
              id="status"
              value={is_completed ? "1" : "0"}
              onChange={(e) => setIsCompleted(e.target.value === "1")}
              className="w-full border-2 border-gray-300 rounded-lg p-2"
            >
              <option value="0">ยังไม่เสร็จสิ้น</option>
              <option value="1">เสร็จสิ้น</option>
            </select>
          </div>

          <div className="flex justify-center pt-4">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 rounded-lg px-6 py-2 text-white font-bold transition"
            >
              บันทึกแก้ไขงานงาน
            </button>
          </div>
        </form>
      </div>
      <div className="flex justify-center mt-10">
        <Link href="/allTask" className="text-blue-600 font-bold">
          กลับไปหน้าตารางงาน
        </Link>
      </div>
    </div>
  );
}

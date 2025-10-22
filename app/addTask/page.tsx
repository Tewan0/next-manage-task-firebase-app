'use client';

import Image from "next/image";
import task from "../../assets/task.png";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { firebasedb } from "@/lib/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

export default function Page() {
  const router = useRouter();

  //สร้างตัวแปร state สำหรับเก็บข้อมูลจากฟอร์ม
  const [title, setTitle] = useState<string>("");
  const [detail, setDetail] = useState<string>("");
  const [is_completed, setIsCompleted] = useState<boolean>(false);
  const [image_file, setImageFile] = useState<File | null>(null);
  const [preview_file, setPreviewFile] = useState<string>("");

  //ฟังก์ชันเลือกรูปเพื่อพรีวิวก่อนอัปโหลด
  function handleSelectPreview(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      //set ค่า file เพื่อเอาไปอัปโหลด
      setImageFile(file);

      //สร้าง url เพื่อแสดงภาพตัวอย่าง
      setPreviewFile(URL.createObjectURL(file));
    }
  }

  //ฟังก์ชันอัปโหลดรูปไปเก็บที่ Firebase
  async function handleUploadAndSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Validate
    if (title.trim() === "" || detail.trim() === "") {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    // อัปโหลดรูป
    // โดยตรวจสอบว่าผู้ใช้เลือกไฟล์รูปหรือไม่ ถ้าเลือกให้ทำการอัปโหลด ถ้าไม่เลือกก็ไม่ต้องอัปโหลด
    //สร้างตัวแปรเพื่อเก็บ url ของรูปที่อัปโหลด เพื่อจะเอาไปบันทึกลงตาราง
      let image_url = "";
 
      //ตรวจสอบว่าได้มีการเลือกรูปเพื่อที่จะอัปโหลดหรือไม่
      if(image_file){
        //กรณีมีการเลือกรูป ก็จะทําการอัปโหลดรูปไปยัง Storage ของ Supabase
        //ตั้งชื่อไฟล์ใหม่ เพื่อไม่ให้รูปที่อัปโหลดมีชื่อซ้ํากัน
        const new_image_file_name = `${Date.now()}-${image_file.name}`;
 
        //อัปโหลดรูปไปยัง Storage
        const {data, error} = await supabase.storage
          .from("task_bk")
          .upload(new_image_file_name, image_file)
 
        //หลังจากอัปโหลดรูปไปยัง Storage ให้ตรวจสอบว่าสำเร็จหรือไม่
        //มี error แสดง Alert หากไม่มี error ให้ get url ของรูปที่อัปโหลดเก็บไว้ในตัวแปรที่สร้างไว้ image_url
        if( error ){
          //แสดง Alert
          alert("พบปัญหาในการอัปโหลด กรุณาตรวจสอบและลองใหม่อีกครั้ง")
          console.log(error.message);
          return;
        }else{
          // get url ของรูปที่
          const { data } =  supabase.storage
            .from("task_bk")
            .getPublicUrl(new_image_file_name)
         
          image_url = data.publicUrl
        }
      }
 
    //บันทึกข้อมูลลงคอลเลกชัน task ใน Firebase
    try {
      const result = await addDoc(collection(firebasedb, "task"), {
        title: title,
        detail: detail,
        is_completed: is_completed,
        image_url: image_url,
      });

      if (result.id) {
        alert("บันทึกข้อมูลเรียบร้อยแล้ว");
        //กลับไปหน้าตารางงาน
        router.push("/allTask");
      }else {
        alert("พบปัญหาในการบันทึกข้อมูล กรุณาตรวจสอบและลองใหม่อีกครั้ง");
      }

    } catch (error) {
      alert("พบปัญหาในการบันทึกข้อมูล กรุณาตรวจสอบและลองใหม่อีกครั้ง");
      console.log(error);
    }

  }


  return (
    <div className="flex flex-col items-center mt-20">
        <Image
          src={task}
          alt="Task App"
          width={150}
          height={150}
          priority
        />
        <h1 className="text-2xl font-bold mt-10">
          Manage Task App
        </h1>
        <h1 className="text-2xl font-bold">
          เพิ่มงานที่ต้องทำ
        </h1>
        {/* ส่วนเพิ่มงานใหม่ */}
        <div className="w-full max-w-lg border-2 border-gray-300 p-8 mt-10 rounded-xl space-y-6">
          <h1 className="text-center text-xl font-bold">➕ เพิ่มงานใหม่</h1>

          <form onSubmit={handleUploadAndSave}>
            <div>
              <label htmlFor="title" className="text-lg font-bold mb-2 block">งานที่ต้องทำ</label>
              <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border-2 border-gray-300 rounded-lg p-2" />
            </div>

            <div>
              <label htmlFor="detail" className="text-lg font-bold mb-2 block">รายละเอียดงาน</label>
              <textarea id="detail" value={detail} onChange={(e) => setDetail(e.target.value)} className="w-full border-2 border-gray-300 rounded-lg p-2"></textarea>
            </div>

            <div className="flex flex-col">
              <label className="text-lg font-bold mb-2">อัปโหลดรูปภาพ</label>
              <div className="flex items-center gap-4">
                  <input id="fileInput" type="file" className="hidden" accept="image/*" onChange={handleSelectPreview}/>
                  <label htmlFor="fileInput" className="bg-blue-500 rounded-lg px-4 py-2 text-white cursor-pointer hover:bg-blue-600 transition">เลือกรูป</label>

                  {preview_file && (
                    <div className="mt-3">
                      <Image src={preview_file} alt="preview" width={100} height={100} />
                    </div>
                  )}
              </div>
            </div>

            <div>
              <label htmlFor="status" className="text-lg font-bold mb-2 block">สถานะงาน</label>
              <select id="status"
                value={is_completed ? "1" : "0"}
                onChange={(e) => setIsCompleted(e.target.value === "1")}
                className="w-full border-2 border-gray-300 rounded-lg p-2">
                  <option value="0">ยังไม่เสร็จสิ้น</option>
                  <option value="1">เสร็จสิ้น</option>
              </select>
            </div>
            
            <div className="flex justify-center pt-4">
              <button type="submit" className="bg-green-600 hover:bg-green-700 rounded-lg px-6 py-2 text-white font-bold transition cursor-pointer">บันทึกเพิ่มงาน</button>
            </div>
          </form>

        </div>
        <div className="flex justify-center mt-10">
          <Link href="/allTask" className="text-blue-600 font-bold">กลับไปหน้าตารางงาน</Link>
        </div>
    </div>
  );
}
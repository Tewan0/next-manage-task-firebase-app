"use client";

import Image from "next/image";
import task from "../../assets/task.png";
import Link from "next/link";
import { useEffect, useState } from "react";
import { firebasedb } from "@/lib/firebaseConfig";
import { collection, getDocs , deleteDoc, doc } from "firebase/firestore";
import { supabase } from "@/lib/supabaseClient";

type Task = {
  id: string;
  title: string;
  detail: string;
  is_completed: boolean;
  image_url: string;
  created_at: string;
  update_at: string;
};

export default function Page() {
  //สร้างตัวแปร state สำหรับเก็บข้อมูลจาก supabase
  const [Tasks, setTasks] = useState<Task[]>([]);

  //เนื้อหาถูกโหลด ให้ดึงข้อมูลจาก supabase มาแสดงที่หน้าเพจ
  useEffect(() => {
    async function fetchTasks() {
      // ไปดึงข้อมูลจาก task ใน Firebase
      const result = await getDocs(collection(firebasedb, "task"));

      // เอาข้อมูลที่อยู่ใน result ไปกำหนดค่าให้กับตัวแปร state: tasks
      setTasks(
        result.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title,
          detail: doc.data().detail,
          is_completed: doc.data().is_completed,
          image_url: doc.data().image_url,
          created_at: doc.data().created_at,
          update_at: doc.data().update_at,
        }))
      );
    }
    // เรียกใช้งานฟังก์ชัน fetchTasks
    fetchTasks();
  }, []);

  //ฟังก์ชันลบงาน
  async function handleDeleteTaskClick(id: string, image_url: string) {
    // แสดง confirm dialog เพื่อให้ผู้ใช้ยืนยันการลบงาน
    if (window.confirm("คุณต้องการลบงานนี้ใช่หรือไม่?")) {
      try {
        // ลบข้อมูล document ใน Firestore
        await deleteDoc(doc(firebasedb, "task", id));

        // ตรวจสอบว่ามี image_url หรือไม่ ถ้ามีให้ลบรูปใน Storage ด้วย
        if (image_url) {
          // แยกชื่อไฟล์ออกจาก URL
          const fileName = image_url.split("/").pop();
          if (fileName) {
            const { error: storageError } = await supabase.storage
              .from("task_bk") // Ensure this bucket name is correct
              .remove([fileName]);

            if (storageError) {
              console.error("Error removing image from storage:", storageError.message);
              // Handle error, maybe notify user but don't block UI refresh
            }
          }
        }

        alert("ลบงานเรียบร้อยแล้ว");
        // Optional: Refetch tasks or remove the task from the local state
         setTasks(Tasks.filter(task => task.id !== id)); // Update local state directly
        // await fetchTasks(); // Or refetch all tasks

      } catch (error) {
        console.error("Error deleting task:", error);
        alert("เกิดข้อผิดพลาดในการลบงาน");
      }
    }
  }
  return (
    <div className="flex flex-col w-10/12 mx-auto">
      <div className="flex flex-col items-center mt-20">
        <Image src={task} alt="Task App" width={150} height={150} priority />
        <h1 className="text-2xl font-bold mt-10">Manage Task App</h1>
      </div>
      <div className="flex justify-end">
        <Link
          href="addTask"
          className="mt-10 bg-blue-600 text-white font-bold px-5 py-3 rounded hover:bg-blue-700 transition"
        >
          เพิ่มงาน
        </Link>
      </div>

      {/* แสดงข้อมูลตาราง */}
      <div>
        <table className="border-2 min-w-full border-black text-center text-xl mt-5">
          <thead>
            <tr>
              <th className="border-2 border-black p-2 bg-gray-300">รูป</th>
              <th className="border-2 border-black p-2 bg-gray-300">
                งานที่ต้องทำ
              </th>
              <th className="border-2 border-black p-2 bg-gray-300">
                รายละเอียด
              </th>
              <th className="border-2 border-black p-2 bg-gray-300">สถานะ</th>
              <th className="border-2 border-black p-2 bg-gray-300">
                วันที่เพิ่ม
              </th>
              <th className="border-2 border-black p-2 bg-gray-300">
                วันที่แก้ไข
              </th>
              <th className="border-2 border-black p-2 bg-gray-300">Action</th>
            </tr>
          </thead>
          <tbody>
            {Tasks.map((task) => (
              <tr key={task.id}>
                <td className="border-2 border-black p-2">
                  {task.image_url ? (
                    <Image
                      src={task.image_url}
                      alt="logo"
                      width={100}
                      height={100}
                      className="mx-auto"
                    />
                  ) : (
                    "-"
                  )}
                </td>
                <td className="border-2 border-black p-2">{task.title}</td>
                <td className="border-2 border-black p-2">{task.detail}</td>
                <td className="border-2 border-black p-2">
                  {task.is_completed ? (
                    <span className="text-green-600 font-bold">เสร็จสิ้น</span>
                  ) : (
                    <span className="text-red-600 font-bold">
                      ยังไม่เสร็จสิ้น
                    </span>
                  )}
                </td>
                <td className="border-2 border-black p-2">
                  {new Date(task.created_at).toLocaleDateString()}
                </td>
                <td className="border-2 border-black p-2">
                  {new Date(task.update_at).toLocaleDateString()}
                </td>
                <td className="border-2 border-black p-2">
                  <div className="flex items-center justify-center gap-2">
                    <Link
                      href={`editTask/${task.id}`}
                      className="bg-green-600 text-white font-bold px-4 py-2 rounded hover:bg-green-700 transition"
                    >
                      แก้ไข
                    </Link>
                    <button
                      onClick={() =>
                        handleDeleteTaskClick(task.id, task.image_url)
                      }
                      className="bg-red-600 text-white font-bold px-4 py-2 rounded hover:bg-red-700 transition cursor-pointer"
                    >
                      ลบ
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center mt-10">
        <Link href="/" className="text-blue-600 font-bold">
          กลับไปหน้าแรก
        </Link>
      </div>
    </div>
  );
}

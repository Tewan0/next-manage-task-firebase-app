// tewan0/next-manage-task-firebase-app/next-manage-task-firebase-app-4c527e1f0da85956da4c3d705d40a6c74afd25f7/app/editTask/[id]/page.tsx
"use client";

import Image from "next/image";
import task from "@/assets/task.png"; // Corrected import path
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { firebasedb } from "@/lib/firebaseConfig"; // Added import
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"; // Added necessary imports
import { supabase } from "@/lib/supabaseClient"; // Added import

export default function Page() {
  const router = useRouter();
  const params = useParams(); // Use useParams hook
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id; // Get id safely

  // สร้างตัวแปร state สำหรับเก็บข้อมูลจากฟอร์ม
  const [title, setTitle] = useState<string>("");
  const [detail, setDetail] = useState<string>("");
  const [is_completed, setIsCompleted] = useState<boolean>(false);
  const [image_File, setImageFile] = useState<File | null>(null);
  const [preview_file, setPreviewFile] = useState<string>("");
  const [old_image_file, setOldImageFile] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Add loading state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // Add submitting state

  // ดึงข้อมูลจาก Firestore มาแสดงที่หน้าจอตาม id ที่ได้มาจาก url
  useEffect(() => {
    async function fetchTaskData() {
        if (!id) {
            console.error("Task ID is missing");
            alert("ไม่พบ ID ของงาน");
            router.push("/allTask"); // Redirect if ID is missing
            return;
        }

      setIsLoading(true); // Start loading
      try {
        const docRef = doc(firebasedb, "task", id as string); // Ensure id is string
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setTitle(data.title ?? "");
          setDetail(data.detail ?? "");
          setIsCompleted(data.is_completed ?? false);
          setOldImageFile(data.image_url ?? null); // Store the old image URL
          setPreviewFile(data.image_url ?? "");    // Set preview to the existing image
        } else {
          console.log("No such document!");
          alert("ไม่พบข้อมูลงานที่ต้องการแก้ไข");
          router.push("/allTask"); // Redirect if document doesn't exist
        }
      } catch (error) {
        console.error("Error fetching document:", error);
        alert("เกิดข้อผิดพลาดในการดึงข้อมูลงาน");
        router.push("/allTask"); // Redirect on error
      } finally {
        setIsLoading(false); // End loading
      }
    }

    fetchTaskData();
  }, [id, router]); // Add router to dependency array

  // เลือกรูปภาพและแสดงตัวอย่างรูปภาพ
  function handleSelecImagePreview(e: React.ChangeEvent<HTMLInputElement>) {
      const file = e.target.files?.[0];
      if (file) {
          setImageFile(file); // Store the new file object
          setPreviewFile(URL.createObjectURL(file)); // Show preview of the new file
          URL.revokeObjectURL(old_image_file ?? ""); // Revoke old preview URL if exists
      } else {
          // If no file is selected, revert to the old image if it exists
          setImageFile(null);
          setPreviewFile(old_image_file ?? "");
      }
  }


  // อัพโหลดรูปภาพและบันทึกแก้ไขข้อมูลลงฐานข้อมูล Firebase
  async function handleUplodeAndUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting || !id) return; // Prevent multiple submissions or if id is missing

    setIsSubmitting(true);

    let new_image_url = old_image_file; // Start with the old image URL

    try {
        // 1. Handle image upload/replacement if a new image file is selected
        if (image_File) {
            // Delete the old image from Supabase Storage if it exists
            if (old_image_file) {
                const oldFileName = old_image_file.split('/').pop();
                if (oldFileName) {
                    const { error: deleteError } = await supabase.storage
                        .from("task_bk") // Ensure bucket name is correct
                        .remove([oldFileName]);
                    if (deleteError) {
                        console.error("Error deleting old image:", deleteError.message);
                        // Optional: Decide whether to proceed or show an error
                    }
                }
            }

            // Upload the new image to Supabase Storage
            const new_image_file_name = `${Date.now()}-${image_File.name}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from("task_bk") // Ensure bucket name is correct
                .upload(new_image_file_name, image_File);

            if (uploadError) {
                throw new Error(`เกิดปัญหาในการอัปโหลดรูปภาพใหม่: ${uploadError.message}`);
            }

            // Get the public URL of the newly uploaded image
            const { data: urlData } = supabase.storage
                .from("task_bk") // Ensure bucket name is correct
                .getPublicUrl(new_image_file_name);
            new_image_url = urlData.publicUrl;
        }

      // 2. Update the document in Firestore
      const docRef = doc(firebasedb, "task", id as string); // Ensure id is string
      await updateDoc(docRef, {
        title: title,
        detail: detail,
        is_completed: is_completed,
        image_url: new_image_url ?? "", // Use new URL or empty string if no image
        update_at: serverTimestamp(), // Use server timestamp for update time
      });

      alert("บันทึกการแก้ไขเรียบร้อยแล้ว");
      router.push("/allTask"); // Redirect after successful update

    } catch (error) { // Catch specific error types if needed
      console.error("Error updating task:", error);
      alert(`เกิดข้อผิดพลาดในการบันทึกการแก้ไข: ${(error as Error).message || error}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Show loading indicator
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">กำลังโหลด...</div>;
  }


  return (
    <div className="flex flex-col items-center mt-20">
      <Image src={task} alt="Task App" width={150} height={150} priority />
      <h1 className="text-2xl font-bold mt-10">Manage Task App</h1>
      <h1 className="text-2xl font-bold">แก้ไขงาน</h1>
      {/* ส่วนแก้ไขงาน */}
      <div className="w-full max-w-lg border-2 border-gray-300 p-8 mt-10 rounded-xl space-y-6">
        <h1 className="text-center text-xl font-bold">✒️ แก้ไขงาน</h1>

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
              required // Added required
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
              rows={4} // Added rows for better textarea size
              required // Added required
            ></textarea>
          </div>

          <div className="flex flex-col">
            <label className="text-lg font-bold mb-2">อัปโหลดรูปภาพ (เลือกรูปใหม่หากต้องการเปลี่ยน)</label>
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
                เลือกรูปใหม่
              </label>

              {/* Display current or new preview */}
              {preview_file && (
                <div className="mt-3">
                  <Image
                    src={preview_file}
                    alt="preview"
                    width={100}
                    height={100}
                    className="object-cover" // Added object-cover
                  />
                </div>
              )}
            </div>
             {/* Show old image filename if exists and no new file selected */}
             {!image_File && old_image_file && (
                <p className="text-sm text-gray-500 mt-2">รูปภาพปัจจุบัน: {old_image_file.split('/').pop()}</p>
             )}
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
              className={`bg-green-600 hover:bg-green-700 rounded-lg px-6 py-2 text-white font-bold transition ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              disabled={isSubmitting} // Disable button while submitting
            >
              {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
            </button>
          </div>
        </form>
      </div>
      <div className="flex justify-center mt-10">
        <Link href="/allTask" className="text-blue-600 font-bold"> {/* Corrected path */}
          กลับไปหน้าตารางงาน
        </Link>
      </div>
    </div>
  );
}
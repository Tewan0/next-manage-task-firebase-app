import Image from "next/image";
import task from "../assets/task.png";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
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
          บันทึกงานที่ต้องทำ
        </h1>
        <Link href="/allTask" className="mt-10 bg-blue-600 text-white font-bold px-20 py-3 rounded hover:bg-blue-700 transition">
          เข้าใช้งาน
        </Link>


      </div>
    </>
  );
}
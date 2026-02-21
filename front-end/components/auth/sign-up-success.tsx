"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { MdCheckCircle } from "react-icons/md";

export default function SignUpSuccess() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-4 items-center">
        <h1 className="text-4xl font-bold dark:text-white">LinkHub</h1>
        <div className="my-6 bg-white rounded-full">
          <MdCheckCircle className="text-7xl text-green-500/80" />
        </div>
        <h2 className="text-4xl font-bold text-indigo-600">
          Akun berhasil dibuat!
        </h2>
        <h3 className="text-xl text-slate-400 text-center font-semibold">
          Selamat bergabung di LinkHub. Silakan cek email untuk verifikasi atau
          langsung login mulai membangun profil Anda.
        </h3>
      </section>
      <Button
        onClick={() => router.push("/dashboard")}
        className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-xl text-white"
      >
        Dashboard
      </Button>
    </div>
  );
}

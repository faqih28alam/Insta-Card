"use client";

import { ThemeToggle } from "@/components/public-page/toggle";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen font-sans text-slate-900">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold tracking-tight text-indigo-600">
          LinkHub
        </h1>
        <div className="space-x-4">
          <Button variant="ghost">
            <Link href="/auth/login" className="dark:text-white">
              Sign in
            </Link>
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Link href="/auth/sign-up" className="text-white">
              Sign up for free
            </Link>
          </Button>
          <ThemeToggle />
        </div>
      </nav>

      {/* Hero Section */}
      <header className="px-8 pt-16 pb-24 text-center max-w-4xl mx-auto">
        <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 dark:text-white">
          Satu Link untuk{" "}
          <span className="text-indigo-600">Semua Ide Kamu.</span>
        </h2>
        <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto dark:text-slate-400">
          Satukan semua media sosial, portofolio, dan link penting dalam satu
          halaman profil yang elegan. Dibuat khusus untuk Kreator, UMKM, dan
          Profesional.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <div className="flex items-center border rounded-lg px-4 py-2 shadow-sm bg-white">
            <span className="text-slate-400 mr-2">linkhub.id/</span>
            <input
              type="text"
              placeholder="username"
              className="outline-none w-32 bg-transparent"
            />
          </div>
          <Button
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-700 px-8 text-white"
          >
            Claim Your Link
          </Button>
        </div>
      </header>

      {/* Footer */}
      <footer className="py-8 px-8 text-center text-sm text-slate-500">
        &copy; 2026 LinkHub. All rights reserved.
      </footer>
    </div>
  );
}

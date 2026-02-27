# 🔗 Link Hub

**Link Hub** adalah aplikasi *link-in-bio* modern yang dirancang untuk mengumpulkan semua media sosial dan tautan penting dalam satu halaman profil yang elegan. Solusi tepat untuk meningkatkan personal branding dan efektivitas promosi online bagi kreator, UMKM, dan profesional.

**Referensi:** Terinspirasi oleh platform seperti *Linktree* dan *Carrd*.

---

## 🚀 Tech Stack

### Frontend
* **Next.js** - Framework utama untuk performa maksimal.
* **Tailwind CSS + Shadcn UI** - Untuk styling yang responsif dan modern.
* **Lucide React** - Untuk set ikon yang minimalis.

### Backend & Infrastructure
* **Express.js** - Node.js framework untuk menangani logika API.
* **Supabase** - Backend-as-a-Service (BaaS) untuk Database & Autentikasi.
* **Vercel** - Hosting platform untuk frontend.

---

## ✨ Features

Aplikasi ini dilengkapi dengan fitur-fitur esensial untuk manajemen link:

* **🔐 Autentikasi Pengguna:** Pendaftaran dan login yang aman menggunakan Supabase Auth.
* **👤 Profil Kustom:** Form input untuk bio, upload avatar, dan headline profil.
* **🔗 Link Management:** Tambah, edit, hapus, dan atur urutan link dengan mudah.
* **🎨 Personalisasi Tampilan:**
    * Pilihan Template (1–2 variasi layout).
    * Custom background dan skema warna.
* **📱 Responsive Preview:** Lihat pratinjau halaman link-in-bio secara real-time.
* **🌐 Halaman Publik:** Akses profil melalui URL unik berdasarkan username.
* **📊 Analitik & Alat:**
    * Statistik klik link (Analitik klik).
    * **QR Code Generator** untuk mempermudah berbagi profil secara offline.
* **📱 Layout Responsive:** Optimal di perangkat mobile, tablet, maupun desktop.

---

## 📸 Live Demo: [LinkHub](https://link-hub-card.vercel.app/)

https://github.com/user-attachments/assets/773b03b0-503a-4556-8c97-ca4c72b5aa94


---

## 🛠️ Getting Started

### 1. Clone the repository
```bash
git clone [https://github.com/your-username/link-hub.git](https://github.com/your-username/link-hub.git)
cd link-hub
```
### 2. Install dependencies
```bash
# Untuk Frontend & Backend
npm install
# atau menggunakan bun
bun install
```
### 3. Create Environment Variables
Buat file .env.local di root directory dan isi dengan kredensial Anda:
```txt
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:port-backend-api

```
### 4. Run the development server
```bash
npm run dev
```

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

--- 


# Panduan & Alur Pengujian Sistem (GymFit SaaS)

Dokumen ini berisi panduan pengujian komprehensif untuk memastikan seluruh modul dan fitur pada sistem **GymFit SaaS** berjalan dengan baik, baik dari sisi fungsionalitas Backend maupun Frontend.

---

## 1. Pendaftaran & Langganan Tenant (SaaS Central)

### A. Registrasi Tenant Baru (Skema Trial)
* **Tujuan:** Memastikan pemilik gym dapat mendaftar dengan paket uji coba (trial) dan sistem otomatis membuatkan database tenant baru.
* **Tata Cara Uji:**
  1. Buka halaman utama central (Landing Page) dan klik tombol **"Mulai Trial 14 Hari"** atau buka langsung `/register-tenant`.
  2. Isi form registrasi dengan data lengkap (Nama Gym, Subdomain/Slug, Nama Owner, Email Owner, Password).
  3. Klik **"Daftar Sekarang"**.
* **Kriteria Keberhasilan:**
  * Pengguna dialihkan ke halaman loading pembuatan sistem (tenant provisioning).
  * Sistem sukses membuat database PostgreSQL baru dengan nama `gym_tenant_{tenant_uuid}`.
  * Tenant berhasil login pertama kali dan diarahkan ke `/owner/dashboard`.

### B. Registrasi Paid / Pembayaran Langganan (SaaS Central)
* **Tujuan:** Memastikan integrasi pembayaran Midtrans berjalan lancar untuk aktivasi paket premium.
* **Tata Cara Uji:**
  1. Lakukan pendaftaran dengan memilih opsi paket berbayar di halaman Pricing.
  2. Setelah mengisi form pendaftaran, Anda akan diarahkan ke halaman pembayaran Snap Midtrans.
  3. Lakukan pembayaran simulasi menggunakan **Midtrans Sandbox** (kartu kredit uji coba atau QRIS Simulator).
* **Kriteria Keberhasilan:**
  * Pembayaran terverifikasi sukses.
  * Endpoint Webhook `api/tenant-auth/register-paid` menerima notifikasi dari Midtrans.
  * Status subscription tenant berubah dari `pending` menjadi `active` di database central.
  * Invoice lunas terbuat secara otomatis dan dapat diunduh di dashboard billing central.

---

## 2. Platform SaaS (Super Admin Dashboard)

### A. Manajemen Domain Kustom & Verifikasi
* **Tujuan:** Memvalidasi pengajuan domain kustom dari tenant dan memastikan routing tidak bentrok dengan wildcard.
* **Tata Cara Uji:**
  1. Login sebagai super admin di `/admin/login`.
  2. Buka menu **Domain Requests** (`/admin/domain-requests`).
  3. Setujui (*Approve*) salah satu permintaan domain kustom tenant.
* **Kriteria Keberhasilan:**
  * Status domain kustom berubah menjadi `approved`.
  * Domain baru terdaftar di tabel `domains` central.
  * Tenant dapat mengakses sistem melalui domain baru (contoh: `member.namagym.com`).

### B. Validasi Laporan Keuangan SaaS
* **Tujuan:** Memeriksa keakuratan data pendapatan dan visualisasi grafik keuangan SaaS.
* **Tata Cara Uji:**
  1. Buka halaman `/admin/reports?tab=finance`.
  2. Ubah filter tanggal dan periode (Hari ini, 7 hari terakhir, Custom Range).
* **Kriteria Keberhasilan:**
  * Angka Total Revenue, SaaS MRR, SaaS ARR, dan AOV terhitung dengan benar.
  * Grafik Tren Pendapatan dan Pie Chart Metode Pembayaran terender dengan baik.
  * Tabel **"5 Tenant Paling Produktif"** (Lifetime Spend) dan **"Transaksi Terakhir"** tampil berdampingan secara presisi tanpa ada error JavaScript di console.

---

## 3. Manajemen Cabang & Staf (Tenant Dashboard)

### A. Tambah Cabang Baru (Multi-Branch)
* **Tujuan:** Memastikan pemilik gym dapat menambahkan cabang operasional baru sesuai limit paket langganan.
* **Tata Cara Uji:**
  1. Login sebagai Owner Tenant di subdomain tenant (misal: `atmagym.gymfit.id/owner/login`).
  2. Masuk ke menu **Cabang** (`/owner/branches`) dan klik **"Tambah Cabang"**.
  3. Isi nama cabang, alamat, kota, dan telepon. Klik **"Simpan"**.
* **Kriteria Keberhasilan:**
  * Cabang baru sukses tersimpan di database tenant.
  * Pilihan cabang aktif muncul pada selektor navigasi atas staff.

### B. Registrasi & Manajemen Staf (Role & Permission)
* **Tujuan:** Mengelola akun staf gym (resepsionis, kasir, trainer) dan membatasi akses menu.
* **Tata Cara Uji:**
  1. Masuk ke menu **Manajemen Staf** (`/owner/staffs`).
  2. Buat akun staf baru dan tentukan rolenya (contoh: Kasir).
  3. Login menggunakan akun staf tersebut di browser berbeda/incognito.
* **Kriteria Keberhasilan:**
  * Staf dengan role Kasir hanya bisa membuka modul POS dan tidak memiliki akses ke halaman laporan keuangan owner (`/owner/reports`).

---

## 4. Manajemen Member & Sistem Check-in (QR Code)

### A. Pendaftaran Member & Pembelian Membership Plan
* **Tujuan:** Mendaftarkan anggota baru dan mengaktifkan paket membership gym.
* **Tata Cara Uji:**
  1. Buka menu **Members** di dashboard staf.
  2. Klik **"Tambah Member"**, isi data diri lengkap, pilih **Membership Plan** yang diinginkan.
  3. Lakukan pembayaran di POS untuk mengaktifkan status membership.
* **Kriteria Keberhasilan:**
  * Member terdaftar di database dengan status `active`.
  * Kolom `member_since` terisi tanggal hari ini dan `qr_token` UUID terbuat secara otomatis.

### B. Check-in Kehadiran (Home Branch & Cross-Branch Access)
* **Tujuan:** Memvalidasi hak akses check-in member menggunakan QR Code di resepsionis.
* **Tata Cara Uji:**
  1. Login sebagai member di aplikasi member, tampilkan QR Code check-in.
  2. Di komputer resepsionis, lakukan scan QR Code member tersebut (atau input kode QR token secara manual).
  3. Coba lakukan check-in di cabang yang berbeda dengan cabang terdaftar (*Cross-Branch Check-in*).
* **Kriteria Keberhasilan:**
  * Jika membership bertipe `single_branch` dan check-in di cabang lain: Sistem menampilkan pesan **"Akses Ditolak (Hanya berlaku di Cabang Utama)"**.
  * Jika membership bertipe `cross_branch`: Sistem berhasil melakukan check-in, menampilkan nama member, mencatat log ke tabel `check_ins`, dan menambah jumlah `total_checkins` pada keanggotaan member.

---

## 5. Point of Sale (POS) & Manajemen Transaksi

### A. Penjualan Produk & Pengurangan Stok
* **Tujuan:** Melakukan transaksi penjualan barang di kasir dan memvalidasi pergerakan stok.
* **Tata Cara Uji:**
  1. Buka menu **POS** (`/pos`).
  2. Pilih kategori "Produk", tambahkan barang (misal: Air Mineral) ke keranjang.
  3. Selesaikan pembayaran dengan memilih metode tunai atau QRIS.
* **Kriteria Keberhasilan:**
  * Invoice penjualan tercetak (terbuat file PDF).
  * Stok produk tersebut di tabel `products` berkurang otomatis.
  * Log pergerakan stok terekam di tabel `stock_movements` dengan tipe `sale`.

### B. Checkout Membership & Paket Personal Trainer (PT)
* **Tujuan:** Menggabungkan penjualan paket jasa dan barang dalam satu keranjang belanja.
* **Tata Cara Uji:**
  1. Di halaman POS, tambahkan 1 Paket Membership Plan dan 1 Paket PT ke dalam keranjang belanja.
  2. Hubungkan transaksi ke data member tertentu.
  3. Lakukan pembayaran hingga sukses.
* **Kriteria Keberhasilan:**
  * Invoice terbuat mencakup seluruh item.
  * Paket membership member langsung aktif.
  * Kuota paket PT terbuat di tabel `pt_packages` dengan sisa sesi sesuai paket yang dibeli (misal: 10 sesi).

---

## 6. Kelas Olahraga (Group Class Scheduling)

### A. Penjadwalan Kelas & Pembatasan Kapasitas
* **Tujuan:** Admin membuat jadwal kelas group fitness dengan kapasitas maksimal tertentu.
* **Tata Cara Uji:**
  1. Buka menu **Jadwal Kelas** di dashboard admin.
  2. Buat jadwal baru (contoh: Yoga, Senin pukul 19:00, instruktur: PT Budi, Kapasitas: 10 orang).
* **Kriteria Keberhasilan:**
  * Jadwal kelas baru tampil di kalender dashboard staf dan portal member.

### B. Booking Kelas & Presensi Kehadiran
* **Tujuan:** Member melakukan booking kelas dan staf mencatat kehadiran member di lokasi kelas.
* **Tata Cara Uji:**
  1. Di portal member, pilih kelas Yoga tersebut lalu klik **"Book Class"**.
  2. Lakukan booking hingga kapasitas penuh (10 member).
  3. Coba lakukan booking ke-11 oleh member lain.
  4. Pada saat kelas dimulai, staf membuka daftar kehadiran kelas dan mengubah status member dari `booked` menjadi `attended`.
* **Kriteria Keberhasilan:**
  * Member ke-11 tidak bisa memesan kelas (muncul pesan kelas penuh).
  * Saat staf menandai `attended`, log kehadiran tercatat di `class_attendances`.
  * Total kehadiran kelas ter-update di data statistik kelas (`total_attended`).

---

## 7. Sesi Personal Training (PT)

### A. Booking Jadwal Sesi Latihan Mandiri (Portal Member)
* **Tujuan:** Member menjadwalkan sesi latihan 1-on-1 dengan Personal Trainer pribadi mereka.
* **Tata Cara Uji:**
  1. Login ke portal member, buka menu **Personal Training**.
  2. Pilih paket PT aktif Anda, lalu klik **"Request Session"**.
  3. Pilih Trainer, pilih tanggal dan jam latihan yang tersedia, lalu ajukan.
* **Kriteria Keberhasilan:**
  * Sesi latihan terdaftar di database dengan status `requested`.
  * Sesi latihan muncul di dashboard Trainer yang bersangkutan.

### B. Konfirmasi Trainer & Pengurangan Sisa Sesi (Sesi Selesai)
* **Tujuan:** Trainer memvalidasi request latihan dan menyelesaikan sesi untuk memotong kuota paket member.
* **Tata Cara Uji:**
  1. Login sebagai Trainer di dashboard staf.
  2. Buka daftar pengajuan sesi PT, klik **"Approve"** pada request member.
  3. Setelah latihan selesai, Trainer membuka kembali sesi tersebut lalu klik **"Mark Completed"**.
* **Kriteria Keberhasilan:**
  * Status sesi berubah menjadi `completed`.
  * Jumlah `used_sessions` pada paket PT member tersebut bertambah 1 sesi.
  * Sisa kuota sesi PT member berkurang secara otomatis.

---

## 8. Reservasi Fasilitas Gym (Facility Booking)

* **Tujuan:** Member melakukan booking fasilitas privat (sauna/pool) dengan pembatasan jam operasional.
* **Tata Cara Uji:**
  1. Buka menu **Fasilitas** di portal member.
  2. Pilih fasilitas "Sauna Room", pilih jam pemesanan di luar jam operasional (misal: jam 2 pagi).
  3. Ulangi dengan memilih jam pemesanan yang valid dan lakukan booking.
* **Kriteria Keberhasilan:**
  * Pemesanan di luar jam operasional otomatis ditolak oleh sistem.
  * Pemesanan di jam operasional berhasil dan mencatat status `booked` di tabel `facility_bookings`.

---

## 9. Integrasi Upload & Penyimpanan Gambar (Cloudflare R2 CDN)

* **Tujuan:** Memverifikasi bahwa unggahan gambar produk di dashboard tenant disimpan langsung di Cloudflare R2 dan dirender menggunakan CDN.
* **Tata Cara Uji:**
  1. Masuk ke halaman **Produk** (`/owner/products`), pilih salah satu produk lalu edit.
  2. Upload foto produk baru (.jpg atau .png) lalu simpan.
  3. Di browser, klik kanan pada gambar produk yang baru diupload, pilih **"Open Image in New Tab"**.
* **Kriteria Keberhasilan:**
  * Proses simpan produk berhasil tanpa error koneksi storage.
  * Gambar produk terunggah ke bucket R2 `gymfit-assets`.
  * URL gambar yang terbuka di tab baru memiliki format:
    `https://cdn.gymfit.id/tenant_{tenant_id}/products/images/{random_string}.jpg`
  * Gambar ter-render dengan sempurna di browser melalui CDN Cloudflare tanpa terblokir proteksi CORS.

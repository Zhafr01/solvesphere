# Struktur Kode & Fungsi - SolveSphere System

Dokumen ini menjelaskan struktur kode program secara mendetail, mencakup fungsi (method) dalam setiap file Controller (Backend) dan komponen Frontend.

## 1. Backend (Laravel 11) - `app/Http/Controllers`

Backend berfungsi sebagai REST API JSON. Berikut adalah daftar fungsi utama per file:

### A. Core / Authentication
**`AuthController.php`**
- `register(Request $r)`: Validasi input, membuat user baru, dan mengembalikan Token akses.
- `login(Request $r)`: Memeriksa email/password. Jika valid, return Sanctum Token.
- `logout()`: Menghapus (revoke) token sesi saat ini.

**`ProfileController.php`**
- `update(Request $r)`: Mengupdate nama, bio, atau foto profil user.
- `updatePassword(Request $r)`: Mengubah password dengan validasi password lama.

### B. Feature & CRUD Controllers
**`ReportController.php`** (Laporan Warga)
- `index()`: Mengambil daftar laporan (bisa difilter berdasarkan `partner_id`).
- `store(Request $r)`: Menyimpan laporan baru beserta bukti upload gambar.
- `show($id)`: Menampilkan detail laporan, status history, dan bukti.
- `update($id)`: Admin mengubah status laporan (Pending -> Processed -> Done).
- `destroy($id)`: Menghapus data laporan (Soft delete jika diaktifkan).

**`ForumTopicController.php`** (Diskusi Komunitas)
- `index()`: Menampilkan daftar topik diskusi dengan pagination.
- `store(Request $r)`: User membuat topik diskusi baru.
- `show($id)`: Menampilkan topik beserta seluruh komentarnya.
- `markAsBestAnswer($topicId, $commentId)`: Penulis menandai komentar sebagai solusi terbaik.

**`ChatController.php`** (Messaging Realtime)
- `index()`: Mengambil daftar riwayat chat (user yang baru dihubungi).
- `show($userId)`: Mengambil isi percakapan dengan user tertentu.
- `store(Request $r)`: Mengirim pesan teks atau gambar ke user lain.
- `search($query)`: Mencari user di sistem untuk memulai chat.

**`NewsController.php`** (Berita Lokal)
- `index()`: Daftar berita publik untuk mitra tertentu.
# Struktur Kode Project SolveSphere

Dokumen ini berisi inventaris lengkap dari seluruh file kode yang membangun aplikasi SolveSphere (Laravel + React), beserta fungsi mendetail dari masing-masing file.

## 1. Backend (Laravel Framework)

### A. Controllers (Logic & API)
Lokasi: `app/Http/Controllers`

#### Auth & User
- **`AuthController.php`**
  - **Fungsi**: Menangani otentikasi User General.
  - **Method Utama**:
    - `register(Request $r)`: Validasi input, create user DB, return Sanctum Token.
    - `login(Request $r)`: Cek email & password, issue token baru.
    - `logout()`: Revoke token user saat ini.
    - `me()`: Return data user yang sedang login.

- **`PartnerAuthController.php`**
  - **Fungsi**: Login khusus untuk Admin Mitra (Partner).
  - **Detail**: Memiliki logic redirect berbeda dan validasi role `partner_admin`.

- **`ForgotPasswordController.php`**
  - **Fungsi**: Reset password via Email.
  - **Method**: `sendResetLinkEmail()`, `reset()`.

- **`ProfileController.php`**
  - **Fungsi**: Manajemen profil user mandiri.
  - **Method**:
    - `update()`: Ganti nama, bio, avatar (storage link).
    - `updatePassword()`: Ganti password dengan konfirmasi password lama.

- **`DashboardController.php`**
  - **Fungsi**: Mengumpulkan statistik untuk halaman Dashboard.
  - **Detail**: Menghitung jumlah laporan, topik forum, dan pesan user.

#### Community Features
- **`ReportController.php`**
  - **Fungsi**: CRUD Laporan Warga.
  - **Method**:
    - `store()`: Upload laporan dengan Multi-part form (Foto Bukti).
    - `index()`: List laporan (bisa difilter per Partner).
    - `updateStatus()`: Admin mengubah status (Pending -> Done).

- **`ForumTopicController.php`**
  - **Fungsi**: Manajemen Topik Diskusi.
  - **Method**: `index()` (dgn Search/Filter), `store()`, `destroy()`.

- **`ForumCommentController.php`**
  - **Fungsi**: Komentar pada topik.
  - **Method**: `store()` (Simpan komentar), `like()` (Like komentar).

- **`NewsController.php`**
  - **Fungsi**: CMS Artikel/Berita oleh Partner.
  - **Method**: `index()` (Public List), `store()` (Admin Create), `publish()`.

- **`ChatController.php`**
  - **Fungsi**: Sistem Messaging Realtime.
  - **Method**:
    - `sendMessage()`: Kirim pesan.
    - `getConversation()`: Ambil history chat user A ke B.
    - `poll()`: API untuk client melakukan long-polling pesan baru.

- **`FriendController.php`**
  - **Fungsi**: Jejaring sosial (Follow/Friend).
  - **Method**: `sendRequest()`, `acceptRequest()`, `blockUser()`.

- **`NotificationController.php`**
  - **Fungsi**: Notifikasi User.
  - **Method**: `index()`, `markAsRead()`, `markAllRead()`.

#### Partner & System
- **`PartnerSiteController.php`**
  - **Fungsi**: Logic halaman publik Mitra (`solve.com/partners/jogja`).
  - **Detail**: Return data profil mitra, berita terkait, dan laporan terkait.

- **`PartnerApplicationController.php`**
  - **Fungsi**: Pendaftaran Mitra Baru.
  - **Method**: `submit()` (User apply), `approve()` (Super admin accept).

- **`PartnerRatingController.php`**
  - **Fungsi**: Review kinerja mitra.
  - **Detail**: Menghitung rata-rata bintang dari ulasan user.

- **`SubscriptionController.php`**
  - **Fungsi**: Monetisasi / Premium Partner.
  - **Method**: `subscribe()`, `handleWebhook()`.

- **`SuperAdmin\SettingsController.php`**
  - **Fungsi**: Utilitas Sistem.
  - **Detail**: `getSystemInfo()` (PHP Version check), `downloadLogs()`.

---

### B. Models (Eloquent ORM)
Lokasi: `app/Models`

Merepresentasikan tabel database dan relasinya.

- **`User.php`**: Tabel `users`. Relasi: `reports`, `topics`, `messages`.
- **`Partner.php`**: Tabel `partners`. Relasi: `news`, `subscribers`. Atribut: `domain`, `logo`.
- **`Report.php`**: Tabel `reports`. Relasi: `user` (pelapor), `partner` (tujuan).
- **`News.php`**: Tabel `news`. Artikel portal berita.
- **`ForumTopic.php`**: Tabel `forum_topics`. Diskusi komunitas.
- **`ForumComment.php`**: Tabel `forum_comments`. Balasan diskusi.
- **`Message.php`**: Tabel `messages`. Chat p2p.
- **`Notification.php`**: Built-in Laravel Notifications.
- **`Subscription.php`**: Tabel `subscriptions`. Histori pembayaran mitra.
- **`PartnerRating.php`**: Rating bintang 1-5.

---

## 2. Frontend (React JS + Vite)

### A. Pages (Tampilan / Halaman)
Lokasi: `src/pages`

- **Core**:
  - `LandingPage.jsx`: Halaman muka global. Intro & Search Mitra.
  - `AboutUs.jsx`: Profile Developer (Kelompok 4).
  - `NotFound.jsx`: 404 Page.

- **Auth**:
  - `Login.jsx` & `Register.jsx`: Form masuk dan daftar.
  - `ForgotPassword.jsx`: Request reset link.

- **Dashboard (User Area)**:
  - `Dashboard.jsx`: Pusat kontrol user. Grafik & Menu Cepat.
  - `Profile.jsx`: Edit profil & Ganti Password.

- **Features**:
  - `reports/CreateReport.jsx`: Wizard pembuatan laporan (Drag & Drop).
  - `forum/ForumIndex.jsx`: List diskusi (Infinite Scroll).
  - `forum/ForumDetail.jsx`: Baca topik & balas komentar.
  - `chat/ChatIndex.jsx`: Aplikasi Chatting Full-Page.
  - `news/NewsIndex.jsx`: Baca berita.

- **Partner**:
  - `PartnerSite.jsx`: Halaman profil dinamis Mitra (Branching). Mengubah tema/konten sesuai mitra yang dibuka.

- **Admin**:
  - `admin/settings/SystemDocs.jsx`: Dokumentasi Sistem ini (Mermaid + Code View).
  - `admin/settings/SystemInfo.jsx`: Monitoring Server Realtime.

### B. Components (Elemen UI)
Lokasi: `src/components`

- **Layout**:
  - `MainLayout.jsx`: Struktur utama (Navbar, Content, Footer). Handle Responsive Sidebar.
  - `GuestLayout.jsx`: Layout polos untuk Login/Register.

- **UI Elements (Reusable)**:
  - `NotificationPopover.jsx`: Dropdown notifikasi di navbar.
  - `MermaidDiagram.jsx`: Renderer diagram (ERD/Flowchart) dengan fitur Zoom/Pan.
  - `ThemeToggle.jsx`: Switcher Dark/Light Mode.
  - `ui/Card.jsx`, `Button.jsx`, `Badge.jsx`: Komponen atomik styling konsisten.

### C. Context (State Management)
Lokasi: `src/context`

- **`AuthContext.jsx`**:
  - Menyimpan data `user` yang sedang login.
  - Menyediakan fungsi global `login()`, `logout()`.
  - Cek token validitas saat aplikasi load.

- **`PartnerContext.jsx`**:
  - **Critical**: Mendeteksi jika user membuka URL mitra.
  - Menyediakan data `currentPartner` ke seluruh aplikasi untuk isolasi konten (Multi-tenancy).

- **`ThemeContext.jsx`**:
  - Menyimpan preferensi Dark Mode user di LocalStorage.
- `handleSubmit()`: Mengirim data form (Multipart/Form-Data) ke API.
- `handleImageChange()`: Preview gambar sebelum diupload.

**`pages/chat/ChatIndex.jsx`**
- `pollMessages()`: (Atau `useSWR`) Mengambil pesan baru secara berkala (Realtime simulation).
- `sendMessage()`: Mengirim pesan ke API chat.
- `scrollToBottom()`: Auto-scroll ke pesan terakhir.

### B. Core Logic (Context & Lib)
**`context/AuthContext.jsx`**
- `login(token, user)`: Set global state user logged in.
- `logout()`: Hapus token, redirect ke login.
- `checkUser()`: Memanggil API `/user` saat refresh halaman untuk persistensi sesi.

**`context/PartnerContext.jsx`**
- Menyimpan data Mitra (Partner) yang sedang dikunjungi user (berdasarkan URL slug).

**`lib/api.js`**
- **Axios Interceptor**: Otomatis menyisipkan `Authorization: Bearer <token>` di setiap request.
- **Error Handling**: Otomatis redirect ke login jika menerima error `401 Unauthorized`.

# Dokumentasi Skema Database Lengkap - SolveSphere

Dokumen ini berisi rincian **setiap tabel dan kolom** dalam database `solvesphere`. Daftar ini mencakup struktur dasar dan semua kolom tambahan yang ditambahkan melalui migrasi selanjutnya.

---

## 1. Tabel Utama (Core)

### `users`
Tabel pengguna aplikasi (General User, Partner Admin, Super Admin).
| Kolom | Tipe Data | Deskripsi |
| :--- | :--- | :--- |
| `id` | BigInteger (PK) | Primary Key. |
| `name` | String | Nama lengkap pengguna. |
| `email` | String | Email unik untuk login. |
| `password` | String | Password ter-hash (Bcrypt). |
| `role` | Enum/String | Peran user: `user`, `partner_admin`, `super_admin`. |
| `status` | String | Status akun: `active`, `banned`. |
| `profile_picture` | LongText | URL atau Base64 foto profil. |
| `partner_id` | Foreign Key | (Nullable) ID Mitra jika user adalah admin cabang. |
| `email_verified_at` | Timestamp | Waktu verifikasi email. |
| `created_at` | Timestamp | Tanggal pembuatan akun. |
| `updated_at` | Timestamp | Tanggal update terakhir. |

### `partners`
Tabel profil Mitra/Cabang (Branching System).
| Kolom | Tipe Data | Deskripsi |
| :--- | :--- | :--- |
| `id` | BigInteger (PK) | Primary Key. |
| `user_id` | Foreign Key | ID User pemilik/admin mitra ini. |
| `name` | String | Nama Mitra (misal: "Pemkot Jogja"). |
| `slug` | String | URL friendly ID (misal: `pemkot-jogja`). |
| `domain` | String | (Unique) Subdomain atau identifier unik. |
| `description` | Text | Deskripsi profil mitra. |
| `logo` | String | URL logo mitra. |
| `banner` | String | URL banner header halaman mitra. |
| `website` | String | Link website eksternal. |
| `status` | Enum | Status kemitraan: `pending`, `active`, `rejected`. |
| `created_at` | Timestamp | Tanggal registrasi. |

### `settings`
Tabel konfigurasi dinamis sistem (Key-Value Store).
| Kolom | Tipe Data | Deskripsi |
| :--- | :--- | :--- |
| `id` | BigInteger (PK) | Primary Key. |
| `key` | String | Nama setting (misal: `maintenance_mode`). |
| `value` | Text | Nilai setting (misal: `true`). |
| `group` | String | Kelompok setting (misal: `system`, `security`). |

---

## 2. Fitur Komunitas (Community)

### `reports`
Laporan pengaduan warga.
| Kolom | Tipe Data | Deskripsi |
| :--- | :--- | :--- |
| `id` | BigInteger (PK) | Primary Key. |
| `user_id` | Foreign Key | Pelapor. |
| `partner_id` | Foreign Key | Mitra tujuan laporan (Multi-tenant). |
| `title` | String | Judul laporan. |
| `content` | Text | Isi detail laporan. |
| `category` | String | Kategori (Infrastruktur, Sosial, dll). |
| `attachment` | String | URL foto bukti laporan. |
| `status` | String | `pending`, `processed`, `completed`, `rejected`. |
| `urgency` | String | Tingkat urgensi: `low`, `medium`, `high`. |
| `admin_note` | Text | Catatan balasan dari admin. |
| `location` | String | (Optional) Koordinat/Nama lokasi. |

### `forum_topics`
Topik diskusi di forum.
| Kolom | Tipe Data | Deskripsi |
| :--- | :--- | :--- |
| `id` | BigInteger (PK) | Primary Key. |
| `user_id` | Foreign Key | Pembuat topik. |
| `partner_id` | Foreign Key | Forum milik mitra mana. |
| `title` | String | Judul diskusi. |
| `slug` | String | URL slug topik. |
| `content` | Text | Isi topik. |
| `status` | String | `open`, `closed` (dikunci admin). |
| `best_answer_id` | Integer | ID komentar yang ditandai sebagai solusi. |
| `views` | Integer | Jumlah pembaca. |

### `forum_comments`
Balasan/Komentar di topik.
| Kolom | Tipe Data | Deskripsi |
| :--- | :--- | :--- |
| `id` | BigInteger (PK) | Primary Key. |
| `user_id` | Foreign Key | Penulis komentar. |
| `topic_id` | Foreign Key | Topik yang dikomentari. |
| `partner_id` | Foreign Key | (Redundant/Cache) Mitra pemilik topik. |
| `parent_id` | Foreign Key | ID komentar induk (untuk Reply bertingkat). |
| `content` | Text | Isi komentar. |

### `news`
Berita/Artikel dari Mitra.
| Kolom | Tipe Data | Deskripsi |
| :--- | :--- | :--- |
| `id` | BigInteger (PK) | Primary Key. |
| `partner_id` | Foreign Key | Penulis berita (Mitra). |
| `title` | String | Judul berita. |
| `slug` | String | URL slug berita. |
| `content` | Text | Isi artikel (Rich Text). |
| `image` | String | URL thumbnail berita. |
| `status` | String | `draft`, `published`. |

---

## 3. Fitur Sosial & Interaksi

### `messages`
Chat pribadi antar user (Direct Message).
| Kolom | Tipe Data | Deskripsi |
| :--- | :--- | :--- |
| `id` | BigInteger (PK) | Primary Key. |
| `sender_id` | Foreign Key | Pengirim pesan. |
| `receiver_id` | Foreign Key | Penerima pesan. |
| `message` | Text | Isi pesan teks. |
| `attachment` | String | URL file/gambar lampiran. |
| `is_read` | Boolean | Status sudah dibaca (0/1). |

### `friends`
Daftar teman (Social Network).
| Kolom | Tipe Data | Deskripsi |
| :--- | :--- | :--- |
| `id` | BigInteger (PK) | Primary Key. |
| `user_id` | Foreign Key | Pengirim request. |
| `friend_id` | Foreign Key | Penerima request. |
| `status` | Enum | `pending`, `accepted`, `rejected`. |

### `notifications`
Sistem notifikasi aplikasi.
| Kolom | Tipe Data | Deskripsi |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Unique ID (String). |
| `type` | String | Class notifikasi (e.g. `NewComment`). |
| `notifiable_type` | String | Model target (`App\Models\User`). |
| `notifiable_id` | BigInteger | ID target user. |
| `data` | Text | JSON data payload (pesan, link). |
| `read_at` | Timestamp | Waktu dibaca (Null = Belum baca). |

### `partner_ratings`
Rating bintang untuk Mitra.
| Kolom | Tipe Data | Deskripsi |
| :--- | :--- | :--- |
| `id` | BigInteger (PK) | Primary Key. |
| `partner_id` | Foreign Key | Mitra yang dinilai. |
| `user_id` | Foreign Key | Pemberi nilai. |
| `rating` | Integer | Skala 1-5. |
| `review` | Text | Ulasan teks. |

### `subscriptions`
Status berlangganan Mitra (Premium Features).
| Kolom | Tipe Data | Deskripsi |
| :--- | :--- | :--- |
| `id` | BigInteger (PK) | Primary Key. |
| `partner_id` | Foreign Key | Mitra pelanggan. |
| `type` | String | Tipe paket (e.g. `pro_monthly`). |
| `status` | String | `active`, `expired`, `cancelled`. |
| `ends_at` | Timestamp | Tanggal berakhir paket. |

---

## 4. Tabel Interaksi (Likes & Pivot)

- **`news_likes`**: `user_id`, `news_id`
- **`forum_topic_likes`**: `user_id`, `forum_topic_id`
- **`comment_likes`**: `user_id`, `comment_id`

## 5. System Utilities (Laravel Default)

### `migrations`
Mencatat histori migrasi database agar sinkron.
| Kolom | Tipe Data | Deskripsi |
| :--- | :--- | :--- |
| `id` | Integer (PK) | Primary Key. |
| `migration` | String | Nama file migrasi. |
| `batch` | Integer | Batch eksekusi migrasi. |

### `jobs`
Queue worker jobs untuk proses background (Email, Notifikasi).
| Kolom | Tipe Data | Deskripsi |
| :--- | :--- | :--- |
| `id` | BigInteger (PK) | Primary Key. |
| `queue` | String | Nama antrian (default). |
| `payload` | LongText | Data JSON job yang akan diproses. |
| `attempts` | TinyInteger | Jumlah percobaan gagal. |
| `reserved_at` | Integer | Timestamp saat job diambil worker. |
| `available_at` | Integer | Timestamp kapan job boleh dijalankan. |
| `created_at` | Integer | Waktu pembuatan job. |

### `job_batches`
Grouping untuk batch processing jobs.
| Kolom | Tipe Data | Deskripsi |
| :--- | :--- | :--- |
| `id` | String (PK) | UUID Batch. |
| `name` | String | Nama batch. |
| `total_jobs` | Integer | Total job dalam batch. |
| `pending_jobs` | Integer | Sisa job belum selesai. |
| `failed_jobs` | Integer | Jumlah job gagal. |
| `failed_job_ids` | LongText | ID job yang gagal. |

### `failed_jobs`
Log job yang gagal dieksekusi setelah max attempts.
| Kolom | Tipe Data | Deskripsi |
| :--- | :--- | :--- |
| `id` | BigInteger (PK) | Primary Key. |
| `uuid` | String | UUID unik job. |
| `connection` | Text | Koneksi queue (database/redis). |
| `queue` | Text | Nama queue. |
| `payload` | LongText | Data job. |
| `exception` | LongText | Stack trace error. |
| `failed_at` | Timestamp | Waktu kegagalan. |

### `cache`
Driver cache database untuk performa.
| Kolom | Tipe Data | Deskripsi |
| :--- | :--- | :--- |
| `key` | String (PK) | Unique Key Cache. |
| `value` | MediumText | Data yang dicache (Serialized). |
| `expiration` | Integer | Timestamp kadaluarsa. |

### `cache_locks`
Atomic lock untuk mencegah race condition.
| Kolom | Tipe Data | Deskripsi |
| :--- | :--- | :--- |
| `key` | String (PK) | Nama lock. |
| `owner` | String | Owner ID / Process ID. |
| `expiration` | Integer | Waktu lock berakhir. |

### `sessions`
Driver session database untuk login user.
| Kolom | Tipe Data | Deskripsi |
| :--- | :--- | :--- |
| `id` | String (PK) | Session ID (Cookie). |
| `user_id` | Foreign Key | ID User (Null jika guest). |
| `ip_address` | String | IP Address user. |
| `user_agent` | String | Browser info. |
| `payload` | LongText | Data session (Serialized). |
| `last_activity` | Integer | Timestamp aktivitas terakhir. |

### `password_reset_tokens`
Token sementara untuk reset password.
| Kolom | Tipe Data | Deskripsi |
| :--- | :--- | :--- |
| `email` | String (PK) | Email user. |
| `token` | String | Token hash validasi. |
| `created_at` | Timestamp | Waktu request reset. |

### `personal_access_tokens`
Token API (Sanctum) untuk autentikasi mobile/SPA.
| Kolom | Tipe Data | Deskripsi |
| :--- | :--- | :--- |
| `id` | BigInteger (PK) | Primary Key. |
| `tokenable_type` | String | Model User (`App\Models\User`). |
| `tokenable_id` | BigInteger | ID User. |
| `name` | String | Nama token (misal: "Browser Login"). |
| `token` | String | Hash SHA-256 token. |
| `abilities` | Text | Scope hak akses (e.g. `["*"]`). |
| `last_used_at` | Timestamp | Waktu terakhir dipakai. |

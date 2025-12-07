import React, { useState } from 'react';
import { Box, Database, Activity, Network, FileText, Shield, Code, Server, Layers, Globe, Lock } from 'lucide-react';
import MermaidDiagram from '../../../components/ui/MermaidDiagram';

export default function SystemDocs() {
    const [activeTab, setActiveTab] = useState('web'); // 'web' or 'code'

    // Mermaid Codes (Comprehensive)
    const erdCode = `
erDiagram
    %% --- MAIN TABLES (Business Logic) ---
    USERS {
        bigint id PK
        string name
        string email
        string password
        enum role "super_admin, partner_admin, general_user"
        string status "active, banned"
        string profile_picture
        foreign_key partner_id FK "Nullable"
        timestamp created_at
    }

    PARTNERS {
        bigint id PK
        string name
        string domain
        string slug
        string website
        text description
        string logo
        string banner
        enum status "active, pending"
        foreign_key user_id FK "Owner"
        timestamp created_at
    }

    REPORTS {
        bigint id PK
        string title
        text content
        string category
        string urgency
        string attachment
        string status "pending, in_progress, done"
        text admin_note
        foreign_key user_id FK
        foreign_key partner_id FK
        timestamp created_at
    }

    NEWS {
        bigint id PK
        string title
        text content
        string image
        timestamp published_at
        foreign_key admin_id FK
        foreign_key partner_id FK
        foreign_key report_id FK "Nullable"
        timestamp created_at
    }

    FORUM_TOPICS {
        bigint id PK
        string title
        text content
        string category
        boolean is_pinned
        string status
        foreign_key user_id FK
        foreign_key partner_id FK
        foreign_key best_answer_id FK
        timestamp created_at
    }

    FORUM_COMMENTS {
        bigint id PK
        text content
        foreign_key topic_id FK
        foreign_key user_id FK
        foreign_key parent_id FK
        timestamp created_at
    }

    MESSAGES {
        bigint id PK
        text message
        string attachment
        boolean is_read
        foreign_key sender_id FK
        foreign_key receiver_id FK
        timestamp created_at
    }

    NOTIFICATIONS {
        uuid id PK
        string type
        string notifiable_type
        bigint notifiable_id
        text data
        timestamp read_at
        timestamp created_at
    }

    FRIENDS {
        bigint id PK
        enum status "pending, accepted, rejected"
        foreign_key user_id FK
        foreign_key friend_id FK
        timestamp created_at
    }

    SUBSCRIPTIONS {
        bigint id PK
        enum status "pending, active, rejected, expired"
        string proof_image
        timestamp start_date
        timestamp end_date
        foreign_key partner_id FK
        timestamp created_at
    }

    PARTNER_RATINGS {
        bigint id PK
        integer rating
        text comment
        foreign_key user_id FK
        foreign_key partner_id FK
        timestamp created_at
    }

    SETTINGS {
        bigint id PK
        string key
        text value
        string group
    }

    %% --- INTERACTION & SYSTEM TABLES ---
    NEWS_LIKES {
        bigint id PK
        foreign_key user_id FK
        foreign_key news_id FK
        timestamp created_at
    }

    FORUM_TOPIC_LIKES {
        bigint id PK
        enum type "like, dislike"
        foreign_key user_id FK
        foreign_key forum_topic_id FK
        timestamp created_at
    }

    COMMENT_LIKES {
        bigint id PK
        foreign_key user_id FK
        foreign_key comment_id FK
        timestamp created_at
    }

    PASSWORD_RESET_TOKENS {
        string email PK
        string token
        timestamp created_at
    }

    SESSIONS {
        string id PK
        foreign_key user_id FK
        string ip_address
        string user_agent
        longtext payload
        integer last_activity
    }

    CACHE {
        string key PK
        mediumtext value
        integer expiration
    }

    CACHE_LOCKS {
        string key PK
        string owner
        integer expiration
    }

    JOBS {
        bigint id PK
        string queue
        longtext payload
        unsignedTinyInteger attempts
        unsignedInteger reserved_at
        unsignedInteger available_at
        unsignedInteger created_at
    }

    JOB_BATCHES {
        string id PK
        string name
        integer total_jobs
        integer pending_jobs
        integer failed_jobs
        longtext failed_job_ids
    }

    FAILED_JOBS {
        bigint id PK
        string uuid
        text connection
        text queue
        longtext payload
        longtext exception
        timestamp failed_at
    }

    PERSONAL_ACCESS_TOKENS {
        bigint id PK
        string tokenable_type
        bigint tokenable_id
        string name
        string token
        text abilities
        timestamp last_used_at
    }

    %% --- RELATIONSHIPS ---
    %% --- RELATIONSHIPS ---
    USERS ||--o{ REPORTS : "has (user_id)"
    USERS ||--o{ FORUM_TOPICS : "creates (user_id)"
    USERS ||--o{ FORUM_COMMENTS : "writes (user_id)"
    USERS ||--o{ MESSAGES : "sends (sender_id)"
    USERS ||--o{ MESSAGES : "receives (receiver_id)"
    USERS ||--o{ PARTNER_RATINGS : "rates (user_id)"
    USERS ||--o{ NEWS_LIKES : "likes (user_id)"
    USERS ||--o{ FORUM_TOPIC_LIKES : "likes (user_id)"
    USERS ||--o{ COMMENT_LIKES : "likes (user_id)"
    USERS ||--|{ PARTNERS : "owns (user_id)"
    USERS ||--o{ FRIENDS : "requests (user_id)"
    USERS ||--o{ FRIENDS : "accepts (friend_id)"
    USERS ||--o{ NOTIFICATIONS : "receives (notifiable_id)"
    
    PARTNERS ||--o{ REPORTS : "receives (partner_id)"
    PARTNERS ||--o{ NEWS : "publishes (partner_id)"
    PARTNERS ||--o{ FORUM_TOPICS : "hosts (partner_id)"
    PARTNERS ||--o{ SUBSCRIPTIONS : "offers (partner_id)"
    
    FORUM_TOPICS ||--o{ FORUM_COMMENTS : "contains (topic_id)"
    FORUM_TOPICS ||--o{ FORUM_TOPIC_LIKES : "has (forum_topic_id)"
    FORUM_COMMENTS ||--o{ COMMENT_LIKES : "has (comment_id)"
    NEWS ||--o{ NEWS_LIKES : "has (news_id)"

    %% --- SYSTEM TABLES (No Direct Relations) ---
    %% SETTINGS, JOBS, CACHE are Utility tables

    FRIENDS {
        bigint id PK
        foreign_key user_id FK
        foreign_key friend_id FK
        enum status "pending, accepted"
    }

    SETTINGS {
        bigint id PK
        string key
        text value
        string group
    }

    NOTIFICATIONS {
        uuid id PK
        string type
        string notifiable_type
        bigint notifiable_id
        text data
        timestamp read_at
    }

    JOBS {
        bigint id PK
        string queue
        longtext payload
        tinyint attempts
        int reserved_at
    }

    CACHE {
        string key PK
        mediumtext value
        int expiration
    }
`;

    const dfdLevel0 = `
flowchart TD
    User[General User] <-->|Input: Laporan, Komentar, Chat| System((Sistem Informasi<br/>SolveSphere))
    Partner[Partner Admin] <-->|Input: Berita, Manage Reports| System
    Super[Super Admin] <-->|Input: Settings, Approval| System
    
    System -->|Output: Berita, Feed Forum| User
    System -->|Output: Laporan Warga| Partner
    System -->|Output: System Logs| Super
`;

    const dfdLevel1 = `
flowchart TD
    User((User)) -->|1. Login/Register| Auth[1.0 Otentikasi]
    Auth -->|Token Valid| Dashboard[2.0 Dashboard]
    
    User -->|2. Input Laporan| Report[3.0 Manajemen Laporan]
    Report -->|Simpan Data| DB[(Database)]
    Partner((Partner Admin)) -->|3. Update Status| Report
    
    User -->|4. Buat Topik| Forum[4.0 Forum Diskusi]
    Forum -->|Simpan| DB
    
    Partner -->|5. Publish News| News[5.0 Manajemen Berita]
    News -->|Tampil| User
    
    User -->|6. Kirim Pesan| Chat[6.0 Social & Chat]
    User -->|7. Request Teman| Chat
    Chat -->|Realtime Update| User
    Chat <-->|Simpan History| DB
    
    System((System)) -->|8. Push Data| Notif[7.0 Notifikasi]
    Notif -->|Alert| User
    Notif -->|Alert| Partner
`;

    const dfdLevel2 = `
flowchart TB
    subgraph Process3 ["Process 3.0: Manajemen Laporan Detail"]
        direction TB
        Start((User Input)) -->|3.1| Validasi{Validasi Data?}
        Validasi -->|Tidak Lengkap| Reject[Tolak/Minta Revisi]
        Validasi -->|Lengkap| Savedb[(Simpan ke DB)]
        
        Savedb -->|3.2| NotifAdmin[Notifikasi Partner Admin]
        NotifAdmin -->|3.3| Review{Review Admin}
        
        Review -->|Set: Urgent| Priority[Prioritas Tinggi]
        Review -->|Set: Standard| Process[Proses Pengerjaan]
        
        Priority --> Process
        Process -->|3.4| UpdateStatus[Update: In Progress]
        UpdateStatus -->|3.5| Selesai[Update: Done + Bukti]
        
        Selesai -->|3.6| NotifUser[Notifikasi ke Pelapor]
    end
`;

    const flowchartSys = `
flowchart TB
    Start([Pengunjung]) --> AuthCheck{Halaman?}
    AuthCheck -- "Register" --> RegOpt{Tipe?}
    RegOpt -- "User" --> RegisterUser[Form Register User]
    RegOpt -- "Mitra" --> RegisterPartner[Form Daftar Mitra]
    
    AuthCheck -- "Login" --> InputCred[Input Email/Pass]
    InputCred --> Validate{Cek Kredensial}
    Validate -- Gagal --> ErrorMsg[Tampil Error]
    Validate -- Sukses --> RoleCheck{Cek Role}
    
    AuthCheck -- "Lupa Password" --> ResetReq[Input Email Reset]
    ResetReq --> SendMail[Kirim Link Token]
    SendMail --> NewPass[Form Password Baru]
    
    %% --- Flow General User ---
    subgraph UserFlow ["Alur General User"]
        direction TB
        RoleCheck -- "User" --> UserDash[User Dashboard]
        UserDash --> UserAct{Pilih Aktivitas}
        
        UserAct -- "Buat Laporan" --> CreateRep[Isi Form Laporan]
        CreateRep -->|Upload Bukti| SaveRep[(Simpan ke DB)]
        
        UserAct -- "Forum" --> ForumList[List Topik]
        ForumList --> ViewTopic[Lihat Detail Topik]
        ViewTopic --> InteractForum{Interaksi}
        InteractForum -- "Komentar" --> PostComm[Simpan Komentar]
        InteractForum -- "Like" --> LikeTopic[Update Likes]
        
        UserAct -- "Chat & Sosial" --> SocialList[List Teman/Chat]
        SocialList -->|Cari Teman| AddFriend[Request Friend]
        SocialList -->|Buka Chat| ChatRoom[Kirim Pesan]
        
        UserAct -- "Settings/Profil" --> EditProf[Update Profile/Avatar]
        EditProf --> SaveProf[Simpan Perubahan]
        
        UserDash -- "Notifikasi" --> ViewNotif[Lihat Notifikasi]
        ViewNotif --> ReadNotif[Tandai Dibaca]
    end
    
    %% --- Flow Partner Admin ---
    subgraph PartnerFlow ["Alur Partner Admin"]
        direction TB
        RoleCheck -- "Partner Admin" --> PartnerDash[Partner Dashboard]
        PartnerDash --> AdminAct{Kelola Fitur}
        
        AdminAct -- "Berita" --> ManageNews[CRUD Berita]
        ManageNews -- "Buat/Edit" --> FormNews[Form Berita]
        FormNews --> SaveNews[(Database)]
        ManageNews -- "Hapus" --> DelNews[Hapus Data]
        
        AdminAct -- "Laporan" --> ManageRep[List Laporan Masuk]
        ManageRep --> ViewRep[Detail Laporan]
        ViewRep --> UpdateStat[Update Status: Processed/Done]
        UpdateStat --> NotifUser[Notifikasi ke User]
        
        AdminAct -- "Settings Mitra" --> UpdateInfo[Update Nama/Logo/Banner]
        UpdateInfo --> SavePartner[Simpan Info Mitra]
    end
    
    %% --- Flow Super Admin ---
    subgraph SuperFlow ["Alur Super Admin"]
        direction TB
        RoleCheck -- "Super Admin" --> SuperDash[Super Dashboard]
        SuperDash --> SuperAct{Admin Tools}
        
        SuperAct -- "Kelola Mitra" --> ManagePartner[List Mitra]
        ManagePartner --> PartnerAct{Aksi}
        PartnerAct -- "Approve" --> ApprPartner[Set Status: Active]
        PartnerAct -- "Hapus/Edit" --> CRUDPartner[Update Data Partner]
        
        SuperAct -- "User Manager" --> ManageUsers[List All Users]
        ManageUsers --> BanUser[Ban/Delete User]
        
        SuperAct -- "System Info" --> Monitoring[Cek Server Health]
        SuperAct -- "System Logs" --> Download[Download Log & Monitoring]
    end
`;

    const DocsSection = ({ title, children, icon: Icon }) => (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
                {Icon && <Icon className="h-5 w-5 text-indigo-500" />}
                {title}
            </h3>
            <div className="space-y-4 text-slate-600 dark:text-slate-300 leading-relaxed">
                {children}
            </div>
        </div>
    );

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">System Documentation</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Comprehensive blueprint and code references.</p>
                </div>

                <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex gap-1">
                    <button
                        onClick={() => setActiveTab('web')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'web'
                            ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                    >
                        <Globe className="h-4 w-4" />
                        Struktur Web
                    </button>
                    <button
                        onClick={() => setActiveTab('code')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'code'
                            ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                    >
                        <Code className="h-4 w-4" />
                        Struktur Kode
                    </button>
                </div>
            </div>

            {activeTab === 'web' ? (
                <div className="space-y-6">
                    <DocsSection title="1. Arsitektur & Konsep Utama" icon={Box}>
                        <p>
                            SolveSphere menggunakan arsitektur <strong>Multi-Tenant Branching</strong>.
                            Website utama bertindak sebagai hub global, sementara setiap mitra memiliki portal "Branching" mereka sendiri.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800">
                                <h4 className="font-semibold text-indigo-700 dark:text-indigo-300 mb-2">1. Website Utama (Main Portal)</h4>
                                <ul className="list-disc ml-4 text-sm space-y-1">
                                    <li>URL: <code>/</code>, <code>/login</code>, <code>/super-admin</code></li>
                                    <li>Fungsi: Landing page, Auth gate, Super Admin control.</li>
                                    <li>Target: Pengunjung umum, Calon Mitra.</li>
                                </ul>
                            </div>
                            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800">
                                <h4 className="font-semibold text-emerald-700 dark:text-emerald-300 mb-2">2. Branching Website (Portal Mitra)</h4>
                                <ul className="list-disc ml-4 text-sm space-y-1">
                                    <li>URL: <code>/partners/:slug</code></li>
                                    <li>Fungsi: Portal khusus mitra dengan data terisolasi.</li>
                                    <li>Target: Warga lokal, Komunitas.</li>
                                </ul>
                            </div>
                        </div>
                    </DocsSection>

                    <DocsSection title="2. Detail 3 Role Pengguna" icon={Shield}>
                        <p>Hak akses dibagi secara ketat untuk menjaga keamanan dan privasi data antar mitra.</p>
                        <ul className="list-disc ml-5 space-y-2 mt-2">
                            <li><strong>Super Admin (Tuhan-nya Sistem)</strong>: Akses tak terbatas, Global Settings, Maintenance Mode, Logs.</li>
                            <li><strong>Partner Admin (Admin Cabang)</strong>: Mengelola satu mitra spesifik (Berita, Laporan, Forum lokal). Tidak bisa melihat data mitra lain.</li>
                            <li><strong>General User (Penguna Umum)</strong>: Bisa login (SSO) ke semua mitra, melapor, dan berdiskusi.</li>
                        </ul>
                    </DocsSection>

                    <DocsSection title="3. Struktur Database (ERD)" icon={Database}>
                        <p className="mb-4">
                            Diagram Hubungan Entitas (ERD) menggambarkan relasi antar tabel.
                            Setiap fitur utama (Berita, Laporan, Forum) terikat pada <code>Partner_ID</code> untuk memfasilitasi Multi-Tenancy.
                        </p>
                        <MermaidDiagram code={erdCode} />
                        <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-sm">
                            <p><strong>Kunci Multi-Tenancy:</strong> Hampir semua tabel (reports, news, forum_topics) memiliki kolom <code>partner_id</code> (Foreign Key) yang memisahkan data antar cabang.</p>
                        </div>
                    </DocsSection>

                    <DocsSection title="4. Alur Data (DFD Level 0 & 1)" icon={Activity}>
                        <p className="mb-4">Context Diagram: Interaksi Level Tertinggi antara 3 Aktor (User, Partner Admin, Super Admin) dengan Sistem.</p>
                        <MermaidDiagram code={dfdLevel0} />
                        <div className="my-6 border-t border-slate-200 dark:border-slate-700"></div>
                        <p className="mb-4">DFD Level 1: Penjabaran proses utama (Otentikasi, Laporan, Forum, Berita).</p>
                        <MermaidDiagram code={dfdLevel1} />
                        <div className="my-6 border-t border-slate-200 dark:border-slate-700"></div>
                        <p className="mb-4">DFD Level 2: Detail Proses 3.0 (Manajemen Laporan).</p>
                        <MermaidDiagram code={dfdLevel2} />
                    </DocsSection>

                    <DocsSection title="5. Flowchart Penggunaan (User Journey)" icon={Network}>
                        <p className="mb-4">Langkah demi langkah penggunaan aplikasi dari Login hingga Logout, termasuk logika Routing.</p>
                        <MermaidDiagram code={flowchartSys} />
                    </DocsSection>

                    <DocsSection title="6. Fitur Tersembunyi (Hidden Features)" icon={Lock}>
                        <ul className="list-disc ml-5 space-y-2">
                            <li><strong>Maintenance Mode</strong>: Memblokir akses user biasa saat perbaikan ("503 Service Unavailable").</li>
                            <li><strong>System Health Monitor</strong>: Menampilkan beban server real-time (Halaman Monitoring).</li>
                            <li><strong>Log Viewer</strong>: Super admin bisa mendownload <code>laravel.log</code> langsung dari browser.</li>
                            <li><strong>Auto-Redirect Context</strong>: Login di halaman mitra A akan mengembalikan user ke mitra A, bukan ke halaman utama.</li>
                        </ul>
                    </DocsSection>
                </div>
            ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                    <DocsSection title="1. Backend Structure (Laravel 11) - Controllers (Logic)" icon={Server}>
                        <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
                            Logic Layer: Menangani permintaan HTTP, validasi, dan komunikasi dengan Database.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Auth & User */}
                            <div className="space-y-4">
                                <h4 className="font-bold text-indigo-600 dark:text-indigo-400 border-b border-indigo-200 dark:border-indigo-800 pb-1">Authentication & User</h4>
                                <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                                    <li>
                                        <code className="block font-bold text-slate-800 dark:text-white">AuthController.php</code>
                                        Login (SSO), Register, Logout, GetCurrentUser. Menggunakan Sanctum untuk Token API.
                                    </li>
                                    <li>
                                        <code className="block font-bold text-slate-800 dark:text-white">PartnerAuthController.php</code>
                                        Login khusus untuk Partner Admin (Redirect logic berbeda).
                                    </li>
                                    <li>
                                        <code className="block font-bold text-slate-800 dark:text-white">ForgotPasswordController.php</code>
                                        SendResetLink (Email), ResetPassword (Token Validation).
                                    </li>
                                    <li>
                                        <code className="block font-bold text-slate-800 dark:text-white">ProfileController.php</code>
                                        UpdateProfile (Name, Bio), UpdatePassword, UploadAvatar (Storage Link).
                                    </li>
                                    <li>
                                        <code className="block font-bold text-slate-800 dark:text-white">DashboardController.php</code>
                                        Aggregation Data (Jml Laporan, Topik terbaru) untuk halaman Dashboard User/Admin.
                                    </li>
                                </ul>
                            </div>

                            {/* Community Features */}
                            <div className="space-y-4">
                                <h4 className="font-bold text-emerald-600 dark:text-emerald-400 border-b border-emerald-200 dark:border-emerald-800 pb-1">Community Features</h4>
                                <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                                    <li>
                                        <code className="block font-bold text-slate-800 dark:text-white">ReportController.php (Laporan)</code>
                                        CRUD Laporan. `store()` (Multipart/Form-data untuk bukti), `updateStatus()` (Admin flow).
                                    </li>
                                    <li>
                                        <code className="block font-bold text-slate-800 dark:text-white">ForumTopicController.php</code>
                                        Forum Diskusi utama. `index()` (Filter by Partner/Category), `pin()` (Sticky post).
                                    </li>
                                    <li>
                                        <code className="block font-bold text-slate-800 dark:text-white">ForumCommentController.php</code>
                                        Logic Komentar & Balasan (Nested Comments). `store()`, `destroy()`, `like()`.
                                    </li>
                                    <li>
                                        <code className="block font-bold text-slate-800 dark:text-white">NewsController.php</code>
                                        Manajemen Berita/Artikel oleh Partner. `publish()`, `archive()`.
                                    </li>
                                    <li>
                                        <code className="block font-bold text-slate-800 dark:text-white">ChatController.php</code>
                                        Realtime Messaging. `sendMessage()`, `getConversation()`, `pollMessages()` (Short Polling).
                                    </li>
                                    <li>
                                        <code className="block font-bold text-slate-800 dark:text-white">FriendController.php</code>
                                        Sistem Pertemanan. `sendRequest()`, `accept()`, `reject()`, `block()`.
                                    </li>
                                    <li>
                                        <code className="block font-bold text-slate-800 dark:text-white">NotificationController.php</code>
                                        List notifikasi user (Database Notification). `markAsRead()`, `readAll()`.
                                    </li>
                                </ul>
                            </div>

                            {/* Partner & System */}
                            <div className="space-y-4">
                                <h4 className="font-bold text-amber-600 dark:text-amber-400 border-b border-amber-200 dark:border-amber-800 pb-1">Partner & System Logic</h4>
                                <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                                    <li>
                                        <code className="block font-bold text-slate-800 dark:text-white">PartnerSiteController.php</code>
                                        Logic untuk halaman publik Mitra (`/partners/:slug`). GetPartnerDetails, ListNews, ListReports.
                                    </li>
                                    <li>
                                        <code className="block font-bold text-slate-800 dark:text-white">PartnerApplicationController.php</code>
                                        Flow pendaftaran Mitra baru. `submit()`, `approve()` (Super Admin), `reject()`.
                                    </li>
                                    <li>
                                        <code className="block font-bold text-slate-800 dark:text-white">PartnerRatingController.php</code>
                                        Sistem Rating/Review Mitra. `store()` (Limit 1 per user), `summary()` (Avg Rating).
                                    </li>
                                    <li>
                                        <code className="block font-bold text-slate-800 dark:text-white">SubscriptionController.php</code>
                                        Logic Berlangganan (Premium Partner). `subscribe()`, `checkStatus()`.
                                    </li>
                                    <li>
                                        <code className="block font-bold text-slate-800 dark:text-white">SuperAdmin\SettingsController.php</code>
                                        System Health Check (`php -v`, `db status`), Log Viewer, Cache Clearing.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </DocsSection>

                    <DocsSection title="2. Backend Structure (Laravel 11) - Models (Database)" icon={Database}>
                        <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
                            Data Layer: Representasi Tabel Database (Eloquent ORM).
                        </p>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                <strong className="block text-indigo-600 mb-1">User.php</strong>
                                HasMany: Reports, Topics, Comments. <br /> Scope: Active, Banned.
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                <strong className="block text-indigo-600 mb-1">Partner.php</strong>
                                HasMany: News, Subscribers. <br /> Attr: Logo, Banner, Domain.
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                <strong className="block text-emerald-600 mb-1">Report.php</strong>
                                BelongsTo: User, Partner. <br /> Status Enum: Pending, Done.
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                <strong className="block text-emerald-600 mb-1">ForumTopic.php</strong>
                                Relations: Comments (Recursive), Likes. <br /> Boolean: is_pinned.
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                <strong className="block text-amber-600 mb-1">News.php</strong>
                                Content Management System (CMS) article model.
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                <strong className="block text-amber-600 mb-1">Message.php</strong>
                                Chat bubble model. SenderID, ReceiverID, Content.
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                <strong className="block text-slate-600 dark:text-slate-400 mb-1">Notification.php</strong>
                                Standard Laravel Database Notification structure.
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                <strong className="block text-slate-600 dark:text-slate-400 mb-1">Subscription.php</strong>
                                Track Partner Premium status & History.
                            </div>
                        </div>
                    </DocsSection>

                    <DocsSection title="3. Frontend Structure (React + Vite) - Pages" icon={Layers}>
                        <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300">
                                    <tr>
                                        <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">Directory</th>
                                        <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">File</th>
                                        <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">Description</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                                    <tr>
                                        <td className="px-4 py-2 font-mono text-slate-500">/</td>
                                        <td className="px-4 py-2 font-bold">LandingPage.jsx</td>
                                        <td className="px-4 py-2">Halaman Utama (Global). Search Mitra, Animasi Hero, Features Showcase.</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 font-mono text-slate-500">/</td>
                                        <td className="px-4 py-2 font-bold">AboutUs.jsx</td>
                                        <td className="px-4 py-2">Profile Tim Pengembang (Animations, Hover effects).</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 font-mono text-slate-500">/</td>
                                        <td className="px-4 py-2 font-bold">Login.jsx / Register.jsx</td>
                                        <td className="px-4 py-2">Form Otentikasi User & Partner. Validasi Input.</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 font-mono text-slate-500">/</td>
                                        <td className="px-4 py-2 font-bold">PartnerSite.jsx</td>
                                        <td className="px-4 py-2">Halaman Dinamis Mitra (`/partners/:slug`). Memuat data spesifik cabang.</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 font-mono text-slate-500">/dashboard</td>
                                        <td className="px-4 py-2 font-bold">Dashboard.jsx</td>
                                        <td className="px-4 py-2">User/Admin Panel. Grafik Statistik, Shortcut Menu, Recent Activity.</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 font-mono text-slate-500">/reports</td>
                                        <td className="px-4 py-2 font-bold">CreateReport.jsx</td>
                                        <td className="px-4 py-2">Form Wizard Laporan. Drag-drop Image Upload, Location Picker.</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 font-mono text-slate-500">/forum</td>
                                        <td className="px-4 py-2 font-bold">ForumIndex.jsx / Detail.jsx</td>
                                        <td className="px-4 py-2">List Topik (Infinite Scroll), Detail percakapan, Rich Text Input.</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 font-mono text-slate-500">/chat</td>
                                        <td className="px-4 py-2 font-bold">ChatIndex.jsx</td>
                                        <td className="px-4 py-2">Layout Split (Kontak Kiri, Chat Kanan). Realtime UI updates/polling.</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 font-mono text-slate-500">/admin</td>
                                        <td className="px-4 py-2 font-bold">SystemDocs.jsx</td>
                                        <td className="px-4 py-2">**Self-Reference**. Halaman Dokumentsi ini (Mermaid Diagrams, Code Explorer).</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </DocsSection>

                    <DocsSection title="4. Core Components & Logic" icon={Code}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                                <h4 className="font-bold text-indigo-600 mb-2">Providers (Context)</h4>
                                <ul className="list-disc ml-4 text-xs space-y-2 text-slate-600 dark:text-slate-300">
                                    <li>
                                        <strong>AuthContext.jsx</strong>:
                                        Single Source of Truth untuk data User. Menangani persistensi Token JWT di LocalStorage.
                                    </li>
                                    <li>
                                        <strong>PartnerContext.jsx</strong>:
                                        Mendeteksi jika User sedang berada di URL Mitra (`/partners/...`) dan menyimpan state Partner tersebut global.
                                    </li>
                                    <li>
                                        <strong>ThemeContext.jsx</strong>:
                                        Toggle Dark/Light Mode (CSS Class manipulation pada `html` tag).
                                    </li>
                                </ul>
                            </div>
                            <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                                <h4 className="font-bold text-pink-600 mb-2">UI Components</h4>
                                <ul className="list-disc ml-4 text-xs space-y-2 text-slate-600 dark:text-slate-300">
                                    <li>
                                        <strong>MainLayout.jsx</strong>:
                                        Wrapper utama App. Navbar (Responsive), Sidebar (Mobile), Footer. Cek Auth state.
                                    </li>
                                    <li>
                                        <strong>MermaidDiagram.jsx</strong>:
                                        Renderer Diagram (ERD/Flowchart). Logic Zoom/Pan, Scaling fix, Syntax Error Handling.
                                    </li>
                                    <li>
                                        <strong>NotificationPopover.jsx</strong>:
                                        Dropdown notifikasi AJAX. Auto-refresh badge count.
                                    </li>
                                    <li>
                                        <strong>ui/Card.jsx, Button.jsx</strong>:
                                        Komponen atomik reusable dengan styling konsisten (Tailwind).
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </DocsSection>
                </div>
            )}
        </div>
    );
}

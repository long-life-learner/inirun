# AGENTS.md — INI RUN FEST Results & Podium App

Panduan ini ditujukan untuk AI coding agent (mis. Claude Code) yang akan membangun, memperluas, atau memelihara codebase aplikasi hasil lomba INI RUN FEST. Baca bersama `PRD.md` (apa yang dibangun & mengapa) dan `DESIGN.md` (bagaimana tampilannya) sebelum menulis kode.

---

## 1. Ringkasan Proyek

Aplikasi web menampilkan **hasil lomba INI RUN FEST 2026** (event lari oleh INI Pengda Kab. Bekasi, 28 Juni 2026, AEON Mall Deltamas) dalam bentuk:
1. Tabel hasil yang bisa dicari & difilter.
2. **Podium 3D interaktif** (Three.js) untuk Juara 1, 2, 3 tiap kategori/gender.

**Pembagian effort: ~90% frontend, ~10% backend.** Backend sengaja dibuat **sangat sederhana** — PHP polos (tanpa framework) + MySQL, hanya berperan sebagai **read-only API** yang menyajikan data hasil lomba dalam JSON. Jangan pernah menambah logic bisnis berat di PHP; PHP di proyek ini hanya "jembatan" MySQL → JSON. Frontend juga sengaja dibuat **tanpa framework UI** (tanpa React/Vue/Svelte/Next.js) — murni **HTML + CSS + JavaScript (ES Modules)**, plus Three.js sebagai satu-satunya library besar yang dipakai (Three.js adalah rendering library, bukan application framework, jadi tetap selaras dengan prinsip "tanpa framework"). Semua kompleksitas produk (filter, search, podium 3D, animasi, styling) tetap ada di sisi frontend — yang berubah hanya *caranya ditulis*, bukan *cakupannya*.

---

## 2. Tech Stack Wajib

| Layer | Pilihan | Catatan |
|-------|---------|---------|
| **Frontend** | **HTML5 + CSS3 + JavaScript murni (ES Modules)** — **tanpa framework** (tanpa React/Vue/Svelte/Next.js, tanpa build tool wajib seperti Webpack/Vite) | Lihat §3 & §5. Kode JS ditulis modular pakai native `import`/`export`, dijalankan langsung di browser via `<script type="module">`. Boleh pakai dev-server statis ringan saat development (mis. `php -S` atau `live-server`) sekadar untuk serve file, **bukan** bundler wajib. |
| 3D Rendering | **Three.js** (versi terbaru r1xx) via ES module (`import * as THREE from 'three'`, di-load lewat `<script type="importmap">` dari CDN atau folder `vendor/`) | Wajib sesuai instruksi user. Three.js dipakai vanilla murni (tanpa React Three Fiber, karena tidak ada React) — lihat §6 untuk struktur modul. |
| Styling | **CSS murni** dengan **CSS Custom Properties (variables)** sebagai design tokens dari `DESIGN.md` §10 | Tidak perlu Tailwind/Sass/PostCSS. File CSS terorganisir per area (`base.css`, `layout.css`, `results.css`, `podium.css`, dst), di-`@import` dari satu `main.css` atau di-link terpisah per halaman. |
| State Management | **Plain JavaScript module state** — variabel/objek di-encapsulate dalam ES module (closure), atau `CustomEvent` untuk komunikasi antar komponen UI | Tidak ada Redux/Zustand/Context API karena tidak ada framework. Lihat §5a untuk pola yang direkomendasikan. |
| **Backend** | **PHP polos (tanpa framework)**, beberapa file endpoint flat | Lihat §4. Sengaja minimal — tidak pakai Laravel/Symfony/Slim. Tugasnya hanya query MySQL → encode JSON. |
| **Database** | **MySQL 8** (atau MariaDB 10.x kompatibel) | 1 tabel utama `results` (lihat §4.2). Tidak perlu migration tool berat — cukup file `schema.sql`. |
| Data fetching di frontend | `fetch()` native browser ke endpoint PHP (mis. `/api/results.php`) | Tidak ada library HTTP client (axios dsb.) — `fetch()` bawaan browser sudah cukup untuk kebutuhan ini. |
| Font | Google Fonts: `Anton`, `Inter`, `Roboto Mono` (self-host atau `<link>` preconnect) | Sesuai `DESIGN.md` §3. |
| Icon | SVG inline atau sprite SVG (`<symbol>`/`<use>`) dari set ikon seperti **Phosphor** atau **Lucide** (unduh file SVG mentah, bukan package npm React) | Konsisten satu sumber gaya ikon saja, simpan di `assets/icons/sprite.svg`. |
| Deployment target | Frontend: folder statis (`frontend/public/`) disajikan langsung oleh Apache/Nginx, bisa satu hosting yang sama dengan PHP backend. Backend: shared hosting PHP+MySQL biasa (cPanel dsb.) sudah cukup. | Tidak butuh Node.js runtime, build step, container, atau queue sama sekali — `git pull` lalu langsung jalan. |

> **Mengapa tanpa framework?** Aplikasi ini pada dasarnya: 1 hero, 1 tabel dengan filter/search, dan 1 scene Three.js. Kompleksitas state yang dibutuhkan kecil, sehingga React/Vue hanya menambah build step & dependency tanpa manfaat sepadan. Vanilla JS modern (ES2020+, `fetch`, `Promise`, Custom Elements bila perlu) sudah cukup ekspresif untuk scope ini, dan deployment jadi jauh lebih sederhana (tidak ada `npm run build` yang bisa gagal di shared hosting).

---

## 3. Struktur Folder yang Direkomendasikan

Repo dipisah tegas jadi dua: `frontend/` (porsi besar effort) dan `backend/` (porsi kecil, sengaja tipis). Frontend adalah **multi-page static site** (HTML murni per halaman), bukan single-page app dengan router JS.

```
inirunfest-app/
├── frontend/
│   ├── index.html                 # Hero / landing
│   ├── results.html               # Halaman hasil lomba (tabel + search + filter)
│   ├── podium.html                # Halaman podium 3D
│   ├── assets/
│   │   ├── fonts/
│   │   ├── logo/                  # logo INI RUN FEST, logo sponsor (final, transparent PNG/SVG)
│   │   ├── icons/
│   │   │   └── sprite.svg         # sprite SVG ikon (lihat §2)
│   │   ├── textures/              # texture podium, pattern "iNi" watermark
│   │   └── models/                # file .glb low-poly jika dipakai (medali, avatar pelari)
│   ├── css/
│   │   ├── tokens.css             # design tokens (CSS variables) dari DESIGN.md §10 — di-import paling awal
│   │   ├── base.css               # reset, typography dasar, elemen native (button, input, table)
│   │   ├── layout.css             # navbar, footer, grid/container umum
│   │   ├── results.css            # khusus halaman hasil (search bar, filter chip, tabel)
│   │   ├── podium.css             # khusus halaman podium (canvas wrapper, label overlay, kontrol)
│   │   └── components.css         # button, badge, card — primitives dipakai lintas halaman
│   ├── js/
│   │   ├── api/
│   │   │   └── client.js          # wrapper fetch ke endpoint PHP, base URL dari config.js
│   │   ├── config.js              # konstanta global, mis. API_BASE_URL
│   │   ├── results/
│   │   │   ├── results-page.js    # entry point results.html: render tabel, search, filter
│   │   │   ├── search.js          # logic search/filter (panggil API dengan query param)
│   │   │   └── table-render.js    # render baris tabel dari array hasil
│   │   ├── podium/
│   │   │   ├── podium-page.js     # entry point podium.html: ambil data top-3, init scene
│   │   │   ├── category-selector.js # UI pemilih kategori/gender
│   │   │   └── fallback-2d.js     # render kartu 2D jika WebGL tidak tersedia (FR-11)
│   │   ├── three/
│   │   │   ├── scene.js           # setup scene, camera, renderer, lighting
│   │   │   ├── podium-geometry.js # builder mesh podium (3 blok + angka)
│   │   │   ├── lighting.js
│   │   │   ├── controls.js        # OrbitControls config + mobile constraints
│   │   │   ├── animations.js      # entrance animation, idle orbit, category transition
│   │   │   └── confetti.js        # particle effect juara 1
│   │   ├── components/
│   │   │   ├── navbar.js          # render/inject navbar (dipakai di semua halaman)
│   │   │   └── footer.js          # render/inject footer + logo sponsor
│   │   └── utils/
│   │       ├── share-image.js     # export canvas podium ke PNG
│   │       ├── webgl-check.js     # isWebGLAvailable() — lihat §6.9
│   │       └── format.js          # format waktu/pace, escape HTML untuk data dari API
│   └── vendor/                    # (opsional) salinan lokal three.module.js jika tidak pakai CDN
│       └── three/
├── backend/
│   ├── api/
│   │   ├── results.php           # GET semua hasil (dengan optional query param filter)
│   │   ├── categories.php        # GET daftar kategori+gender unik (untuk filter UI)
│   │   └── podium.php            # GET top 3 per kategori+gender (opsional, lihat §4.3)
│   ├── config/
│   │   └── db.php                # koneksi PDO MySQL, baca kredensial dari env/.env sederhana
│   ├── scripts/
│   │   └── import_csv.php        # script CLI sekali-jalan: import CSV vendor timing → tabel MySQL
│   ├── schema.sql                # DDL tabel `results`
│   └── .env.example               # DB_HOST, DB_NAME, DB_USER, DB_PASS
├── PRD.md
├── DESIGN.md
└── AGENTS.md
```

**Tidak ada `package.json`/`node_modules` yang wajib.** Jika perlu dependency JS (mis. Three.js dari npm registry untuk dapat tipe/versi terkunci saat development), boleh punya `package.json` device-only untuk `npm install` lokal lalu **salin hasil build/file `.js` final ke `vendor/`** — tapi **output akhir yang di-deploy harus file statis murni**, bukan proses build wajib di server produksi.

---

## 4. Backend — PHP + MySQL (Sederhana)

**Prinsip:** backend ini bukan aplikasi, hanya **API baca-saja** (read-only) tipis di atas satu tabel MySQL. Tidak ada autentikasi, tidak ada ORM, tidak ada routing framework. Tujuannya supaya bisa naik ke shared hosting murah/kampus tanpa konfigurasi server rumit, dan supaya effort tim tetap terpusat di frontend.

### 4.1 Prinsip Implementasi
- PHP native (versi 8.x), tanpa Composer/framework, tanpa Laravel/Slim.
- Koneksi DB pakai **PDO** (bukan `mysqli` lama), selalu **prepared statement** untuk apa pun yang menerima input dari query string (cegah SQL injection meski hanya endpoint baca).
- Setiap file di `backend/api/` adalah satu endpoint berdiri sendiri (`results.php`, `categories.php`, dst) — tidak perlu router custom.
- Semua endpoint mengembalikan **JSON** dengan `Content-Type: application/json` dan header CORS sederhana (`Access-Control-Allow-Origin`) agar bisa dipanggil dari domain frontend yang berbeda saat development.
- **Tidak ada endpoint write/update/delete di MVP** (PRD §4.2 — admin update data via re-import CSV, bukan via API). Ini sengaja menjaga backend tetap simpel dan aman.

### 4.2 Skema Database

```sql
-- backend/schema.sql
CREATE TABLE results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bib VARCHAR(20) NOT NULL,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(30) NOT NULL,        -- '5K', '10K', 'Half Marathon'
  gender ENUM('M','F') NOT NULL,
  age_group VARCHAR(20) NULL,
  gun_time TIME NOT NULL,
  net_time TIME NOT NULL,
  pace VARCHAR(20) NULL,
  rank_overall INT NULL,
  rank_category_gender INT NULL,        -- 1, 2, 3, dst — dasar podium
  city VARCHAR(100) NULL,
  photo_url VARCHAR(255) NULL,
  UNIQUE KEY uniq_bib_category (bib, category),
  INDEX idx_category_gender (category, gender),
  INDEX idx_rank_category_gender (category, gender, rank_category_gender)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

Mapping kolom `snake_case` (MySQL) ↔ `camelCase` (JSON/frontend) dilakukan **di PHP saat encode**, bukan dengan mengubah nama kolom — lihat §4.4.

### 4.3 Endpoint API

| Endpoint | Method | Query Param | Fungsi |
|----------|--------|--------------|--------|
| `GET /backend/api/results.php` | GET | `category`, `gender`, `search` (opsional, semua filter dilakukan via `WHERE` + `LIKE` sederhana) | Mengembalikan array hasil lomba, terurut `rank_overall ASC` |
| `GET /backend/api/categories.php` | GET | – | Mengembalikan daftar kategori & gender unik (untuk isi filter chip di frontend), hasil `SELECT DISTINCT` |
| `GET /backend/api/podium.php` | GET | `category` (wajib), `gender` (wajib) | Mengembalikan tepat 3 baris (`rank_category_gender IN (1,2,3)`) — dipakai langsung oleh scene Three.js agar payload kecil & cepat |

> **Catatan performa:** `podium.php` sengaja dipisah dari `results.php` supaya saat load scene 3D, frontend tidak perlu fetch ribuan baris hasil lengkap lalu filter di JS — cukup minta 3 baris yang relevan. Filter berat (search/pagination tabel besar) tetap di `results.php`.

### 4.4 Contoh Implementasi Endpoint

```php
// backend/config/db.php
<?php
$config = parse_ini_file(__DIR__ . '/.env'); // DB_HOST, DB_NAME, DB_USER, DB_PASS

$pdo = new PDO(
    "mysql:host={$config['DB_HOST']};dbname={$config['DB_NAME']};charset=utf8mb4",
    $config['DB_USER'],
    $config['DB_PASS'],
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
);
```

```php
// backend/api/podium.php
<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *'); // saat production, ganti '*' dengan domain frontend spesifik

require __DIR__ . '/../config/db.php';

$category = $_GET['category'] ?? null;
$gender   = $_GET['gender'] ?? null;

if (!$category || !$gender) {
    http_response_code(400);
    echo json_encode(['error' => 'category dan gender wajib diisi']);
    exit;
}

$stmt = $pdo->prepare(
    "SELECT bib, name, category, gender, gun_time, net_time, pace,
            rank_overall, rank_category_gender, city, photo_url
     FROM inirun_results
     WHERE category = :category AND gender = :gender
       AND rank_category_gender IN (1,2,3)
     ORDER BY rank_category_gender ASC"
);
$stmt->execute(['category' => $category, 'gender' => $gender]);
$rows = $stmt->fetchAll();

// map snake_case -> camelCase supaya kontrak JSON sama persis dengan skema PRD §8
$result = array_map(fn($r) => [
    'bib'                => $r['bib'],
    'name'                => $r['name'],
    'category'            => $r['category'],
    'gender'              => $r['gender'],
    'gunTime'             => $r['gun_time'],
    'netTime'             => $r['net_time'],
    'pace'                => $r['pace'],
    'rankOverall'         => (int) $r['rank_overall'],
    'rankCategoryGender'  => (int) $r['rank_category_gender'],
    'city'                => $r['city'],
    'photoUrl'            => $r['photo_url'],
], $rows);

echo json_encode($result);
```

`results.php` dan `categories.php` mengikuti pola yang sama: prepared statement, lalu map ke camelCase sebelum `json_encode`.

### 4.5 Import Data Pasca-Lomba

Karena tidak ada endpoint write, update data dilakukan via script CLI sekali-jalan setelah panitia/vendor timing memberi file final:

```
php backend/scripts/import_csv.php path/to/hasil_final.csv
```

Script ini cukup: baca CSV, `TRUNCATE TABLE results` (atau `INSERT ... ON DUPLICATE KEY UPDATE` jika ingin idempotent), lalu `INSERT` baris per baris pakai prepared statement. Tidak perlu queue/job — datanya kecil (ribuan baris, bukan jutaan).

### 4.6 Keamanan Minimal (tetap wajib meski "sederhana")
- Selalu prepared statement (tidak pernah concatenate `$_GET` langsung ke SQL).
- `categories.php`/`results.php`/`podium.php` hanya `SELECT` — tidak ada cara dari sisi API untuk mengubah data, jadi permukaan serangan kecil.
- Validasi `category`/`gender` terhadap whitelist nilai yang dikenal sebelum dipakai di query (defense in depth, meski sudah prepared statement).
- Jangan expose pesan error PDO mentah ke response (matikan `display_errors` di production, log ke file server saja).

---

## 5. Arsitektur Frontend Tanpa Framework (Vanilla JS)

### 5.1 Prinsip Umum
- Setiap halaman (`index.html`, `results.html`, `podium.html`) punya **satu entry point JS module** sendiri (`<script type="module" src="js/results/results-page.js">`), yang bertanggung jawab inisialisasi halaman tersebut.
- Komponen UI yang dipakai lintas halaman (navbar, footer) ditulis sebagai **fungsi render sederhana** yang menerima container element dan mengisi `innerHTML`/membuat elemen DOM, dipanggil dari tiap entry point — bukan custom router atau virtual DOM.
- Tidak ada state management global yang rumit. State per halaman cukup disimpan sebagai variabel di dalam module (closure JS sudah memberi encapsulation yang cukup untuk scope app ini).
- Komunikasi antar bagian UI dalam satu halaman (mis. filter berubah → tabel re-render) memakai **pola callback langsung** atau **`CustomEvent`** pada elemen DOM (`element.dispatchEvent(new CustomEvent('filterChange', { detail }))`), bukan event bus/store kompleks.
- Update DOM dilakukan dengan API native (`document.createElement`, `element.textContent`, `template.content.cloneNode(true)`) — **gunakan `<template>` HTML untuk baris tabel/kartu berulang** agar tidak menulis string HTML manual yang rawan XSS dan sulit dibaca.

### 5.2 Pola Wajib: Modul Data → Render (mengganti konsep "hooks")

Karena tidak ada React hooks, gunakan pola **fungsi async biasa** yang mengembalikan data, lalu fungsi render terpisah yang menerima data tersebut. Ini menjaga pemisahan "ambil data" vs "tampilkan data" tanpa butuh framework reaktif.

```js
// js/api/client.js
import { API_BASE_URL } from '../config.js';

export async function fetchResults({ category, gender, search } = {}) {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (gender) params.set('gender', gender);
  if (search) params.set('search', search);

  const res = await fetch(`${API_BASE_URL}/results.php?${params}`);
  if (!res.ok) throw new Error(`Gagal memuat hasil lomba (${res.status})`);
  return res.json(); // array ResultEntry, kontrak sama dengan PRD §8
}

export async function fetchTopThree(category, gender) {
  const params = new URLSearchParams({ category, gender });
  const res = await fetch(`${API_BASE_URL}/podium.php?${params}`);
  if (!res.ok) throw new Error(`Gagal memuat podium (${res.status})`);
  const rows = await res.json(); // maksimal 3 entri, terurut rank 1→3
  return {
    first: rows.find(r => r.rankCategoryGender === 1),
    second: rows.find(r => r.rankCategoryGender === 2),
    third: rows.find(r => r.rankCategoryGender === 3),
  };
}
```

```js
// js/podium/podium-page.js — entry point podium.html
import { fetchTopThree } from '../api/client.js';
import { initPodiumScene, updatePodiumData } from '../three/scene.js';
import { renderFallback2D } from './fallback-2d.js';
import { isWebGLAvailable } from '../utils/webgl-check.js';

async function loadAndRender(category, gender) {
  setLoadingState(true);
  try {
    const topThree = await fetchTopThree(category, gender);
    setLoadingState(false);

    if (isWebGLEnabled) {
      updatePodiumData(topThree); // lihat §6 — trigger animasi reveal
    } else {
      renderFallback2D(document.querySelector('#podium-fallback'), topThree);
    }
  } catch (err) {
    setErrorState(err.message); // tampilkan pesan ramah + tombol retry, sesuai §5.4
  }
}

const isWebGLEnabled = isWebGLAvailable();
if (isWebGLEnabled) initPodiumScene(document.querySelector('#podium-canvas-container'));

document.querySelector('#category-selector').addEventListener('change', (e) => {
  const [category, gender] = e.target.value.split('|');
  loadAndRender(category, gender);
});

loadAndRender('5K', 'M'); // default saat halaman dimuat
```

Kontrak fungsi `fetchTopThree` di atas (parameter & bentuk return) **tidak berubah secara konsep** dari rencana sebelumnya — hanya bentuknya sekarang fungsi `async` biasa di ES module, bukan React hook.

### 5.3 Alur Data Hasil Lomba (Konsumsi API)

1. Sumber data adalah endpoint PHP (§4), dipanggil lewat `js/api/client.js`.
2. `fetchResults({ category, gender, search })` dipakai oleh `results-page.js` untuk mengisi tabel; filter/search selalu dikirim sebagai query param ke backend (bukan filter di JS atas data yang sudah di-fetch semua).
3. `fetchTopThree(category, gender)` dipakai langsung oleh `podium-page.js` untuk mengambil data podium — payload kecil & cepat (lihat §4.3).
4. `rankCategoryGender = 1 | 2 | 3` tetap menjadi sumber kebenaran podium — **jangan hardcode nama juara di mana pun di JS**, semua selalu lewat fetch ke `podium.php`.
5. Jika field opsional (`photoUrl`, `city`, `ageGroup`) bernilai `null` dari API, kode render harus punya graceful fallback (placeholder avatar inisial nama, sembunyikan field kosong) — jangan tampilkan string `"null"`/`"undefined"` mentah ke DOM.
6. Tangani 3 state standar di setiap pemanggilan fetch: `loading` (skeleton sesuai DESIGN.md §8), `error` (pesan ramah + tombol retry), `empty` (mis. kategori belum ada juara — tampilkan state kosong, bukan layar putih/blank).

### 5.4 Keamanan Render (Pengganti Proteksi XSS Otomatis React)

React/Vue otomatis meng-escape teks saat render; di vanilla JS ini **harus dilakukan manual**:
- **Selalu** gunakan `element.textContent = value` untuk menampilkan data dari API (nama peserta, kota, dst), **jangan** `element.innerHTML = value` dengan data mentah dari server.
- Jika butuh membangun struktur HTML kompleks (kartu hasil, baris tabel), gunakan `<template>` + `cloneNode(true)` lalu isi field-nya satu per satu via `textContent`/`setAttribute`, bukan string concatenation/template literal yang langsung di-`innerHTML`-kan.
- Fungsi util `js/utils/format.js` sebaiknya menyediakan helper `escapeHtml()` sebagai jaring pengaman terakhir untuk kasus di mana `innerHTML` benar-benar tidak terhindarkan (mis. menyisipkan ikon SVG inline bersama teks).

---

## 6. Implementasi Podium 3D (Three.js) — Panduan Teknis

Spesifikasi visual lengkap ada di `DESIGN.md` §7. Bagian ini fokus ke **cara membangunnya dengan benar**.

### 6.1 Setup Dasar
- Gunakan `PerspectiveCamera` (fov ~45–50, agar podium tidak terdistorsi).
- `WebGLRenderer({ antialias: true, alpha: true })`, set `outputColorSpace = THREE.SRGBColorSpace`, `toneMapping = THREE.ACESFilmicToneMapping` untuk hasil lighting yang lebih sinematik (penting untuk mood "panggung penghargaan").
- Render loop via `requestAnimationFrame`; **wajib** `renderer.dispose()` dan cleanup listener saat komponen unmount (hindari memory leak terutama saat user pindah kategori berkali-kali).
- Resize handler responsif (`ResizeObserver` pada container, bukan `window.innerWidth` mentah, agar bekerja baik di layout split/card).

### 6.2 Geometri Podium
- 3 blok podium: gunakan `BoxGeometry` atau `ExtrudeGeometry` dengan tinggi berbeda — Juara 1 (tengah, tertinggi), Juara 2 (kiri, sedang), Juara 3 (kanan, terendah). Rasio tinggi disarankan 3 : 2 : 1.5 (unit Three.js bebas, jaga proporsi).
- Material: `MeshStandardMaterial` (mendukung PBR lighting) dengan warna dasar `--color-maroon-700`/`800` dan `roughness ~0.5`, `metalness ~0.1` (podium bukan logam, tapi sedikit metalness membantu highlight gold terlihat hidup).
- Angka "1"/"2"/"3" di tiap blok: gunakan `TextGeometry` (font Anton di-convert ke `.json` typeface via `facetype.js`) **atau** pendekatan lebih ringan: plane dengan texture canvas (render teks ke `<canvas>`, jadikan `CanvasTexture`) — pendekatan kedua lebih ringan untuk performa mobile, **rekomendasikan ini sebagai default**.
- Warna angka: gold (`--color-gold-500`) dengan sedikit emissive (`emissive: 0xFBF000, emissiveIntensity: 0.15`) agar terlihat "menyala" lembut.

### 6.3 Lighting Setup (wajib, sesuai DESIGN.md §7.1)
```
- AmbientLight: warna merah gelap (#3A0000), intensity rendah (~0.4) → menjaga mood maroon
- DirectionalLight / SpotLight "key": putih hangat (#FFF4E0), intensity tinggi, posisi atas-depan, target ke podium Juara 1, castShadow = true
- PointLight/RectAreaLight "rim gold": warna gold (#FBF000), intensity sedang, posisi belakang tiap podium untuk siluet keemasan
```
- Aktifkan shadow (`renderer.shadowMap.enabled = true`, `PCFSoftShadowMap`) hanya jika budget performa mengizinkan; sediakan flag untuk disable shadow di perangkat low-end (deteksi via `navigator.hardwareConcurrency` atau benchmark sederhana saat init).

### 6.4 Avatar/Label Juara
- **Opsi A (foto profil tersedia):** gunakan `THREE.Sprite` atau plane dengan `CanvasTexture`/`TextureLoader` menampilkan foto, dibingkai border gold (digambar di canvas sebelum jadi texture, atau pakai 2 layer mesh: foto + ring gold di depannya).
- **Opsi B (tanpa foto):** gunakan model low-poly silhouette pelari (`.glb`, < 50k triangle, lihat §6.6) atau fallback inisial nama di canvas texture dengan background gold/maroon.
- **Label nama/BIB/waktu:** JANGAN dirender sebagai geometry 3D (mahal & sulit dibaca). Gunakan **HTML overlay** murni: elemen `<div class="podium-label">` absolut-positioned di atas canvas, posisinya di-sync tiap frame ke world position podium dengan memproyeksikan koordinat 3D ke layar via `vector.project(camera)` lalu dikonversi ke koordinat piksel CSS (`(x*0.5+0.5)*canvasWidth`, dst) — sesuai DESIGN.md §7.1 "Label Informasi per Podium". Update posisi ini di dalam render loop yang sama dengan `requestAnimationFrame`.

### 6.5 Animasi (lihat DESIGN.md §7.2)
- Gunakan library tweening ringan: **GSAP** (direkomendasikan, kontrol easing presisi) atau Three.js built-in `THREE.Clock` + manual lerp jika ingin zero-dependency tambahan.
- Sequence saat scene/kategori dimuat:
  1. Camera dolly-in dari posisi jauh ke posisi default (~1.5–2s, easing `power2.out`).
  2. Podium scale-Y dari 0→1 berurutan: Juara 3 (delay 0ms) → Juara 2 (delay 300ms) → Juara 1 (delay 600ms), masing-masing durasi ~500ms `back.out` easing (sedikit overshoot untuk kesan "pop").
  3. Trigger particle/confetti gold singkat tepat setelah Juara 1 selesai animasi (lihat §6.7).
- Idle: auto-orbit kamera lambat (`azimuthAngle += 0.05 * deltaTime` radian/detik) saat tidak ada interaksi user selama >3 detik; hentikan saat user mulai drag (OrbitControls punya event `start`/`end` yang bisa di-hook).
- Transisi ganti kategori: animasi keluar (scale-Y 1→0, durasi 300ms) untuk podium lama → reset state → animasi masuk ulang seperti sequence awal.

### 6.6 Model 3D Tambahan (opsional, peningkatan kualitas)
- Jika menggunakan model `.glb` (medali, trofi, atau figur pelari low-poly): simpan di `public/models/`, load via `GLTFLoader`, pastikan total ukuran file < 1.5MB per model demi performa mobile.
- Gunakan `DRACOLoader` untuk kompresi jika model > 500KB.
- Selalu sediakan **fallback primitive geometry** (mis. `ConeGeometry` sebagai placeholder trofi) jika `.glb` gagal load (`onError` handler), agar scene tidak kosong/error ke user.

### 6.7 Confetti/Sparkle Effect
- Gunakan `THREE.Points` dengan `BufferGeometry` partikel kecil (50–150 partikel cukup, jangan berlebihan demi performa), warna campuran gold + putih, animasi jatuh dengan sedikit rotasi & fade-out (~1.5–2s lifespan), lalu dispose particle system agar tidak menumpuk di memory tiap kali kategori diganti.

### 6.8 Kontrol Kamera
- `OrbitControls` dari `three/examples/jsm/controls/OrbitControls`.
- Desktop: `enableRotate: true`, `minPolarAngle`/`maxPolarAngle` dibatasi (mis. 50°–85°) agar user tidak bisa melihat dari bawah lantai atau lurus dari atas (merusak komposisi).
- Mobile: `enableZoom` dengan `minDistance`/`maxDistance` ketat, pertimbangkan disable `enablePan` total (sering bikin user "kehilangan" objek di scene kecil).
- Selalu sediakan tombol UI "Reset View" yang men-tween kamera kembali ke posisi default (jangan `reset()` instan tanpa animasi, kasar secara UX).

### 6.9 Fallback Non-WebGL (wajib, FR-11)
```ts
function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}
```
- Jika `false`, panggil `renderFallback2D()` (lihat §5.2) — kartu statis 3 juara bersusun (lihat DESIGN.md §6.5 styling) ditampilkan ke dalam container `<div id="podium-fallback">`, alih-alih membuat canvas Three.js sama sekali. Entry point `podium-page.js` wajib melakukan pengecekan `isWebGLAvailable()` ini **sebelum** memanggil `initPodiumScene()`, bukan biarkan Three.js throw error di tengah jalan.

### 6.10 Export/Share Gambar
- Pastikan `renderer.preserveDrawingBuffer = true` (dibutuhkan agar `canvas.toDataURL()`/`toBlob()` bisa menangkap frame).
- Fungsi `js/utils/share-image.js`: capture canvas Three.js → composite dengan overlay teks (nama event, tanggal) dan logo dengan menggambar ulang langsung ke `CanvasRenderingContext2D` 2D di atas screenshot Three.js (`ctx.drawImage()` untuk canvas WebGL + `ctx.fillText()`/`ctx.drawImage()` untuk logo PNG) sebelum export — pendekatan ini lebih portable daripada `html2canvas` dan menghindari screenshot DOM penuh yang rawan blank di Safari.
- Output: PNG, sediakan 2 preset rasio (1:1 untuk feed, 9:16 untuk Story) sesuai DESIGN.md §7.4.

### 6.11 Performance Budget (Acuan, sesuai NFR-02 di PRD)
- Total triangle count scene podium (termasuk avatar) idealnya < 50.000 triangles.
- Texture: maksimal 1024×1024 per texture, kompres ke `.webp`/`.ktx2` jika ukuran jadi masalah.
- Hindari `shadowMap` resolusi tinggi (cukup 1024×1024), atau nonaktifkan shadow sepenuhnya pada device terdeteksi low-end.
- Lazy-load module Three.js & scene podium dengan **dynamic `import()`** native (`const { initPodiumScene } = await import('./three/scene.js')`) di dalam `podium-page.js` — jangan letakkan `<script type="module">` yang meng-import Three.js di `results.html`/`index.html` yang tidak butuh 3D.

---

## 7. Konvensi Kode

- **Bahasa kode & komentar teknis:** Inggris (standar industri), **konten/copy UI yang tampil ke user:** Bahasa Indonesia (sesuai konteks event & audiens — lihat PRD §3 persona).
- **JavaScript (ES2020+) dengan JSDoc** untuk dokumentasi tipe pada fungsi-fungsi kunci (terutama di `js/api/client.js` dan `js/three/`), sebagai pengganti TypeScript penuh — cukup untuk memberi sinyal tipe ke editor tanpa menambah build step compile. Contoh: `/** @param {string} category @param {'M'|'F'} gender */`.
- **Module per file, satu tanggung jawab per file** (lihat struktur §3) — hindari satu file JS raksasa berisi semua logic halaman.
- Tidak ada "komponen" dalam arti framework; yang ada adalah **fungsi render** (`renderResultsTable(container, data)`, `renderPodiumLabel(entry)`, dst) yang menerima target DOM element + data, dan tidak menyimpan state tersembunyi di luar parameter yang jelas.
- Jangan hardcode warna hex langsung di CSS/JS — selalu via CSS variable dari `css/tokens.css` (`var(--color-maroon-700)`, dst) sesuai `DESIGN.md` §10. Untuk warna yang dipakai di Three.js (material, light), definisikan konstanta hex di `js/three/` yang nilainya disalin manual dari token yang sama — beri komentar yang menunjuk ke DESIGN.md agar tetap sinkron.
- Jangan hardcode data juara/peserta di mana pun — semua harus melalui `fetchResults`/`fetchTopThree` (§5.2) yang fetch ke API PHP.
- Setiap fungsi render visual baru (card, button, badge) harus dicek terhadap `DESIGN.md` sebelum dianggap selesai — radius, warna, font, spacing harus match token, bukan perkiraan.
- **Backend PHP:** tetap satu file = satu endpoint, tidak menambah class/abstraction layer yang tidak perlu untuk app sekecil ini. Jika suatu saat butuh endpoint baru, ikuti pola `results.php`/`podium.php` yang sudah ada (§4.4), jangan introduce framework baru tanpa diskusi eksplisit.
- Commit kecil & deskriptif; pisahkan PR "backend API + schema", "results page (HTML/CSS/JS)", "podium 3D core", "podium 3D polish/animasi" sesuai milestone PRD §12.

---

## 8. Testing & QA Checklist

Sebelum menandai sebuah fitur selesai, verifikasi:

**Frontend & Podium 3D:**
- [ ] Tabel hasil tetap responsif (tidak lag) dengan dataset dummy ≥ 3.000 baris.
- [ ] Search by BIB & nama bekerja untuk data dengan karakter non-ASCII (nama Indonesia dengan tanda baca/spasi ganda).
- [ ] Podium 3D menampilkan juara yang benar sesuai `rankCategoryGender` saat kategori/gender filter diganti.
- [ ] Podium 3D tetap berjalan ≥ 30fps di throttle CPU 4x (Chrome DevTools Performance) untuk simulasi device mid-range.
- [ ] Fallback 2D podium tampil benar saat WebGL dipaksa mati (`chrome://flags` disable WebGL, atau mock `isWebGLAvailable()` return false).
- [ ] Tidak ada memory leak saat berpindah kategori podium berkali-kali (cek heap snapshot setelah 10x switch).
- [ ] Export gambar podium menghasilkan file PNG valid di Chrome, Safari, dan Safari iOS (WebKit punya quirk canvas berbeda).
- [ ] Semua teks gold di atas merah memenuhi ambang kontras large-text WCAG AA (lihat DESIGN.md §9).
- [ ] Layout mobile (360px width) tidak ada horizontal overflow di halaman manapun.
- [ ] Meta Open Graph (judul, deskripsi, gambar) tampil benar saat link di-share (cek via debugger Open Graph/Facebook Sharing Debugger atau preview WhatsApp).
- [ ] State `loading`/`error`/`empty` pada fetch ke API PHP tertangani di semua komponen yang fetch data (lihat §5 Alur Data di Frontend) — bukan hanya happy path.
- [ ] Aplikasi berjalan langsung dari folder `frontend/` yang disajikan web server statis biasa, **tanpa** menjalankan `npm run build` apa pun — buka `index.html`/`results.html`/`podium.html` langsung berfungsi (selama endpoint API dapat diakses).
- [ ] Tidak ada data dari API yang dirender via `innerHTML` tanpa escaping (lihat §5.4) — uji dengan nama peserta yang sengaja mengandung karakter `<script>` di data dummy, pastikan tertampil sebagai teks biasa, bukan tereksekusi.
- [ ] Setiap halaman (`index.html`, `results.html`, `podium.html`) tetap bisa diakses & ter-load benar saat dibuka langsung via URL (bukan hanya lewat navigasi dari halaman lain) — wajar untuk multi-page site, tapi tetap perlu diverifikasi.

**Backend PHP + MySQL:**
- [ ] Semua endpoint hanya `SELECT` — tidak ada query `INSERT/UPDATE/DELETE` yang dapat dipicu lewat HTTP request publik.
- [ ] Query parameter (`category`, `gender`, `search`) di-escape via prepared statement, dicoba pula dengan input jahil (`'; DROP TABLE results; --`) untuk memastikan tidak ada SQL injection.
- [ ] Response JSON konsisten camelCase sesuai skema PRD §8, walau kolom MySQL snake_case.
- [ ] `podium.php` mengembalikan tepat ≤3 baris dan terurut benar (`rank_category_gender` 1→2→3).
- [ ] Endpoint tetap merespons cepat (< 300ms) untuk dataset ≥ 3.000 baris (cek index `idx_category_gender` & `idx_rank_category_gender` di §4.2 terpakai, via `EXPLAIN`).
- [ ] Script `import_csv.php` diuji dengan file CSV nyata (atau dummy besar) tanpa duplikasi data saat dijalankan dua kali.
- [ ] Error dari PDO tidak ter-expose mentah ke response (cek dengan sengaja memutus koneksi DB sementara).

---

## 9. Hal yang Harus Dihindari

- ❌ Jangan gunakan font script/elegan atau warna pastel — bertentangan dengan brand sporty-bold INI RUN FEST.
- ❌ Jangan render geometry teks 3D penuh untuk nama panjang/waktu (mahal & sering pecah/glitch) — gunakan HTML overlay atau canvas texture sesuai §6.4.
- ❌ Jangan fetch seluruh tabel `results` tanpa filter/limit ke frontend sekaligus jika datanya besar tanpa pagination/virtualization. Karena tidak ada library virtual-scroll dari ekosistem framework (react-virtual dsb.), jika data > 2.000 baris dan rendering tabel terasa berat, implementasikan pagination sisi server (`LIMIT`/`OFFSET` di `results.php` + parameter `page` dari frontend) — ini juga lebih sederhana daripada virtual scrolling manual. Dorong filter (`category`, `gender`, `search`) ke query SQL, bukan filter di JS setelah fetch semua data.
- ❌ Jangan hardcode "Juara 1 = Nama X" di mana pun — selalu derive dari response `podium.php`, supaya aplikasi reusable untuk edisi INI RUN FEST tahun berikutnya (PRD G4).
- ❌ Jangan abaikan device low-end — mayoritas peserta lari Indonesia mengakses dari HP kelas menengah, bukan flagship.
- ❌ Jangan reproduksi logo/aset resmi sponsor (Gulf+, INI) dari hasil generate AI — gunakan placeholder jelas (`[LOGO SPONSOR]`) sampai panitia menyediakan aset vector resmi, untuk menghindari isu kualitas/hak merek.
- ❌ Jangan tambahkan endpoint write (`INSERT`/`UPDATE`/`DELETE`) yang bisa dipanggil publik tanpa autentikasi — di luar scope "sederhana" yang disepakati; update data tetap lewat `import_csv.php` di server/CLI.
- ❌ Jangan install framework PHP (Laravel/Symfony/CodeIgniter/Slim) atau ORM (Eloquent/Doctrine) — bertentangan dengan prinsip backend tipis di §4.1. Jika kebutuhan berkembang jauh melebihi 3 endpoint baca-saja ini, itu sinyal untuk diskusi ulang scope, bukan alasan diam-diam menambah dependency besar.
- ❌ Jangan install framework/library UI di frontend (React, Vue, Svelte, Angular, Alpine.js, htmx, jQuery) atau bundler wajib (Webpack, Vite, Parcel, Rollup) sebagai dependency produksi — bertentangan dengan keputusan eksplisit "tanpa framework" di §1 & §2. Jika suatu saat terasa butuh, itu sinyal untuk diskusi ulang scope dengan user, bukan keputusan sepihak agent.
- ❌ Jangan gunakan `element.innerHTML = data` langsung dengan data dari API tanpa escaping — lihat §5.4 untuk pola aman (`textContent`, `<template>`).
- ❌ Jangan tulis semua logic dalam satu file `app.js` raksasa — tetap modular sesuai struktur §3 meskipun tanpa framework yang "memaksa" struktur tersebut.

---

## 10. Referensi Silang

- Kebutuhan produk & fitur lengkap → `PRD.md`
- Warna, tipografi, spacing, spesifikasi visual podium → `DESIGN.md`
- Skema data hasil lomba (kontrak JSON yang harus dihasilkan backend) → `PRD.md` §8
- Skema tabel MySQL & endpoint PHP → `AGENTS.md` §4
- Identitas resmi event → instagram.com/inirunfest, "INI RUN Fest 28 Juni 2026, AEON Mall Deltamas, presented by Pengda Kabupaten Bekasi Ikatan Notaris Indonesia"

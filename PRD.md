# PRD — INI RUN FEST Results & Podium App

**Dokumen:** Product Requirements Document
**Event:** INI RUN FEST 2026 — Present by Pengurus Daerah Kabupaten Bekasi, Ikatan Notaris Indonesia (PENGDA INI Kab. Bekasi)
**Lokasi Event:** AEON Mall Deltamas, 28 Juni 2026
**Versi Dokumen:** 1.0
**Status:** Draft untuk Development

---

## 1. Latar Belakang

INI RUN FEST adalah ajang lari & festival olahraga yang diselenggarakan oleh INI Pengda Kabupaten Bekasi, didukung sponsor utama Gulf+. Edisi 2025 (INI RUN) sukses diikuti 1.420 peserta kategori 5K di AEON Mall Deltamas. INI RUN FEST 2026 hadir dengan skala lebih besar, konsep lebih matang, dan kebutuhan presentasi hasil lomba yang lebih modern dan engaging dibanding sekadar tabel PDF/Excel.

Saat ini, hasil lomba lari pada umumnya dipublikasikan dalam bentuk tabel statis (PDF/Excel/Google Sheet) yang membosankan, sulit dicari, dan tidak mencerminkan semangat selebrasi sebuah event lari. Dibutuhkan sebuah **web app hasil lomba (race results app)** yang:

1. Menampilkan hasil lomba secara cepat, mudah dicari, dan dapat difilter per kategori/gender/pelari.
2. Menghadirkan momen selebrasi juara 1–2–3 melalui **podium 3D interaktif** yang sesuai identitas visual INI RUN FEST.
3. Mudah dibagikan (shareable) ke media sosial oleh peserta maupun panitia/sponsor.

## 2. Tujuan Produk (Goals)

| # | Tujuan | Metrik Keberhasilan |
|---|--------|----------------------|
| G1 | Peserta & publik dapat melihat hasil lomba dengan cepat dan akurat | Waktu pencarian hasil < 5 detik (search by BIB/nama) |
| G2 | Podium juara terasa "wah" dan layak dibagikan ke media sosial | Podium 3D dapat di-screenshot/share, load < 3 detik di koneksi 4G rata-rata |
| G3 | Konsisten dengan brand INI RUN FEST (merah maroon + kuning emas) | 100% komponen UI mengikuti DESIGN.md |
| G4 | Dapat digunakan ulang (reusable) untuk event lari INI RUN FEST tahun berikutnya | Data kategori/tahun dikonfigurasi via data source, bukan hardcode UI |
| G5 | Aksesibel di mobile (mayoritas peserta cek hasil dari HP) | Responsive, podium 3D tetap smooth di mid-range Android |

## 3. Target Pengguna (Personas)

1. **Peserta Lari (Runner)** — ingin cek waktu/posisi/pace pribadinya, bandingkan dengan teman, screenshot untuk dibagikan ke Instagram/WhatsApp Story.
2. **Penonton / Keluarga Peserta** — ingin mencari nama peserta tertentu dan melihat progres/hasil akhir.
3. **Panitia INI RUN FEST (Notaris Pengda Kab. Bekasi)** — butuh tampilan hasil resmi yang representatif untuk dokumentasi dan laporan ke sponsor (Gulf+).
4. **Sponsor (Gulf+ & sponsor lain)** — ingin melihat aplikasi mencerminkan branding event secara profesional saat hasil di-share luas.
5. **Admin/Operator Lomba** — meng-input atau mengunggah hasil final lomba (CSV/Excel dari sistem timing) ke aplikasi.

## 4. Lingkup Produk (Scope)

### 4.1 In-Scope (MVP)

- **Halaman Beranda / Hero** — identitas event, tanggal, lokasi, CTA ke hasil lomba & podium.
- **Halaman Hasil Lomba (Results)**
  - Tabel hasil lengkap per kategori (5K, 10K, Half Marathon — sesuai kategori final yang dirilis panitia).
  - Filter: kategori jarak, gender (Putra/Putri), kelompok usia (jika tersedia dari data timing).
  - Search by nama / nomor BIB.
  - Kolom: Rank, BIB, Nama, Kategori, Gun Time, Chip/Net Time, Pace, Gender, Kota/Klub (opsional jika data tersedia).
  - Pagination atau infinite scroll untuk performa di data besar (>1.000 peserta).
- **Halaman/Section Podium 3D**
  - Podium 3 dimensi (Three.js) menampilkan Juara 1, 2, 3 per kategori & gender.
  - Selector untuk memilih kategori (5K Putra, 5K Putri, 10K Putra, dst).
  - Animasi kemunculan podium (juara naik podium / confetti / kamera bergerak).
  - Menampilkan nama, BIB, waktu finish, dan foto profil (jika tersedia) pada masing-masing posisi podium.
  - Tombol "Share" untuk export podium sebagai gambar (screenshot/canvas export) untuk dibagikan ke media sosial.
- **Halaman Detail Peserta** (opsional tapi direkomendasikan)
  - Klik satu peserta dari tabel hasil → kartu detail (bib card) dengan waktu, pace, rank kategori, rank gender, rank overall.
  - Tombol share kartu individu (mirip "race result card" ala Strava/MyRunningResults).
- **Data Loading**
  - Sumber data hasil lomba: **backend PHP sederhana + database MySQL**, diimpor sekali dari file CSV/Excel hasil export sistem timing/EO pasca-lomba (lihat AGENTS.md §4 untuk detail teknis).
  - Backend hanya menyediakan endpoint **baca (read-only)** — tidak ada fitur registrasi/login/CRUD publik di MVP. Update data dilakukan via script import oleh admin, bukan lewat UI admin.
  - Mayoritas effort produk tetap di **frontend** (tabel hasil, search/filter, podium 3D); backend sengaja dibuat setipis mungkin agar mudah di-deploy di shared hosting biasa.
- **Branding & Sponsor Section**
  - Footer/section menampilkan logo sponsor (Gulf+) dan logo INI (Ikatan Notaris Indonesia Pengda Kab. Bekasi).
- **Responsive Design** — mobile-first, mengingat mayoritas akses dari HP.

### 4.2 Out-of-Scope (MVP) — Kandidat Fase Berikutnya

- Live tracking GPS peserta saat lomba berlangsung.
- Sistem registrasi & pembayaran peserta (race registration).
- Backend admin panel untuk CRUD hasil lomba secara real-time (MVP cukup re-upload file data).
- Autentikasi/login peserta untuk akun pribadi.
- Notifikasi push / email hasil lomba otomatis.
- Multi-event/multi-tahun dashboard (MVP fokus 1 edisi: INI RUN FEST 2026).

## 5. Fitur & User Stories

### 5.1 Hero / Landing
- **Sebagai pengunjung**, saya ingin langsung melihat identitas INI RUN FEST 2026 (logo, tema warna, tanggal & lokasi) saat membuka aplikasi, agar saya yakin berada di tempat yang tepat.
- **Sebagai pengunjung**, saya ingin tombol jelas untuk "Lihat Hasil Lomba" dan "Lihat Podium Juara".

### 5.2 Pencarian & Tabel Hasil
- **Sebagai peserta**, saya ingin mencari nama/BIB saya untuk segera tahu posisi dan waktu finish saya.
- **Sebagai peserta**, saya ingin memfilter hasil berdasarkan kategori jarak dan gender agar hanya melihat ranking yang relevan dengan saya.
- **Sebagai pengunjung**, saya ingin tabel tetap mudah dibaca di layar HP kecil (mis. kolom dapat di-collapse/scroll horizontal).

### 5.3 Podium 3D
- **Sebagai pengunjung**, saya ingin melihat podium 3 dimensi yang menampilkan Juara 1, 2, 3 dengan animasi yang hidup dan sesuai nuansa merah-kuning INI RUN FEST.
- **Sebagai pengunjung**, saya ingin bisa berinteraksi dengan podium (rotate/drag kamera) di desktop, dan tetap kontrol sederhana (tap kategori) di mobile.
- **Sebagai juara**, saya ingin podium saya bisa di-screenshot/export sebagai gambar untuk dibagikan ke Instagram.
- **Sebagai panitia**, saya ingin podium otomatis mengikuti data hasil lomba (top 3 per kategori) tanpa perlu coding ulang.

### 5.4 Kartu Hasil Individu (opsional MVP+)
- **Sebagai peserta**, saya ingin kartu hasil personal yang bisa saya unduh/screenshot, berisi nama, waktu, rank, dan branding event.

## 6. Functional Requirements

| ID | Requirement | Prioritas |
|----|-------------|-----------|
| FR-01 | Sistem dapat memuat data hasil lomba dari backend PHP yang membaca database MySQL | Must |
| FR-02 | Sistem menampilkan tabel hasil dengan sort (by rank/time) dan filter (kategori, gender) | Must |
| FR-03 | Sistem menyediakan pencarian nama/BIB dengan hasil cepat (search query diteruskan ke endpoint backend) | Must |
| FR-04 | Sistem menampilkan podium 3D untuk top 3 tiap kombinasi kategori+gender | Must |
| FR-05 | Podium 3D menampilkan nama, BIB, waktu finish tiap juara | Must |
| FR-06 | Sistem menyediakan selector kategori pada halaman podium | Must |
| FR-07 | Podium 3D punya animasi masuk (entrance animation) saat kategori dipilih/halaman dimuat | Should |
| FR-08 | Pengguna dapat mengganti kategori podium tanpa reload halaman penuh | Should |
| FR-09 | Sistem menyediakan tombol export/share gambar podium | Should |
| FR-10 | Sistem responsif di breakpoint mobile (360px+), tablet, dan desktop | Must |
| FR-11 | Podium 3D memiliki fallback (mis. tampilan 2D/kartu statis) jika WebGL tidak didukung perangkat | Should |
| FR-12 | Branding sponsor (Gulf+, logo INI) tampil di header/footer | Must |
| FR-13 | Halaman detail/kartu individu peserta dapat diakses dari baris tabel hasil | Could |

## 7. Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-01 | **Performa:** First Contentful Paint < 2.5s pada koneksi 4G rata-rata Indonesia. |
| NFR-02 | **Performa 3D:** Scene podium berjalan ≥ 30fps di perangkat mid-range (RAM 4GB, GPU terintegrasi). |
| NFR-03 | **Skalabilitas data:** Tabel hasil tetap responsif untuk ≥ 3.000 baris data (lebih besar dari 1.420 peserta 2025). |
| NFR-04 | **Aksesibilitas:** Kontras warna teks memenuhi WCAG AA terhadap background merah maroon; tabel dapat dinavigasi keyboard. |
| NFR-05 | **Kompatibilitas Browser:** Mendukung Chrome, Safari, Edge versi 2 tahun terakhir (mobile & desktop). |
| NFR-06 | **Maintainability:** Data hasil lomba dan daftar kategori dipisah dari kode UI; frontend hanya bicara dengan backend lewat kontrak JSON, tidak pernah query MySQL langsung. |
| NFR-07 | **SEO/Share Preview:** Halaman memiliki meta Open Graph (judul, deskripsi, gambar) bertema INI RUN FEST untuk preview link yang baik saat dibagikan. |

## 8. Struktur Data Hasil Lomba (Kontrak JSON dari Backend)

Skema berikut adalah **kontrak response** yang harus dihasilkan oleh endpoint PHP (lihat AGENTS.md §4 untuk skema tabel MySQL & implementasi endpoint) — bukan lagi file statis. Field di level akun per-peserta sama persis terlepas dari endpoint mana yang dipanggil (`results.php` mengembalikan array banyak entri, `podium.php` mengembalikan maksimal 3 entri per kategori+gender).

```json
{
  "event": "INI RUN FEST 2026",
  "categories": ["5K", "10K", "Half Marathon"],
  "results": [
    {
      "bib": "1024",
      "name": "Nama Peserta",
      "category": "5K",
      "gender": "M",
      "ageGroup": "30-39",
      "gunTime": "00:24:15",
      "netTime": "00:23:58",
      "pace": "4:48/km",
      "rankOverall": 3,
      "rankCategoryGender": 1,
      "city": "Bekasi",
      "photoUrl": null
    }
  ]
}
```

Catatan: skema final menyesuaikan format export dari vendor timing yang dipakai panitia (umumnya CSV) yang diimpor ke MySQL via script `import_csv.php`. `categories` di atas adalah hasil sederhana dari endpoint `categories.php` (daftar distinct), bukan field tetap dalam array `results`. Lihat AGENTS.md §4 untuk detail skema tabel MySQL, endpoint, dan arsitektur teknis lengkap.

## 9. Konten & Identitas Visual (Ringkasan)

Detail lengkap ada di **DESIGN.md**, namun poin kunci untuk PRD:

- Warna dominan: **merah maroon (#9B0103-ish)** sebagai base, **kuning emas (#FBF000-ish)** sebagai aksen kemenangan/CTA, **putih** untuk teks utama di atas merah.
- Tipografi: bold, condensed, sporty — selaras dengan wordmark "INI RUN FEST" (huruf besar, tegas).
- Elemen ikon "pelari" dinamis (siluet kuning melengkung) dari logo dapat dipakai sebagai elemen dekoratif/transisi.
- Podium 3D harus terasa premium: gradasi merah gelap-terang, aksen emas pada nomor 1/2/3, lighting dramatis ala panggung penghargaan.

## 10. Asumsi & Dependensi

- Data hasil lomba final (CSV/JSON) disediakan oleh panitia/vendor timing setelah race selesai (28 Juni 2026).
- Tidak ada kebutuhan backend server kompleks di MVP; backend berupa PHP sederhana (tanpa framework) di atas MySQL, hanya menyajikan data lewat beberapa endpoint baca (lihat AGENTS.md §4). Update data dilakukan via script import oleh admin pasca-lomba, bukan API tulis publik.
- Frontend dibangun tanpa framework UI (HTML/CSS/JavaScript murni + Three.js) sesuai keputusan teknis di AGENTS.md §2 & §5 — keputusan ini tidak mengubah cakupan fitur di dokumen ini, hanya cara implementasinya.
- Logo & aset (INI RUN FEST, sponsor Gulf+, logo Ikatan Notaris Indonesia) disediakan dalam format vector/transparent PNG terpisah untuk produksi (gambar yang dikirim saat ini adalah referensi visual, bukan aset final siap pakai).
- Three.js dipakai sebagai library utama untuk render podium 3D (lihat AGENTS.md & DESIGN.md untuk detail implementasi).

## 11. Risiko

| Risiko | Dampak | Mitigasi |
|--------|--------|----------|
| Data hasil lomba terlambat/format tidak konsisten dari vendor timing | Penundaan rilis aplikasi | Definisikan skema data standar di awal (lihat §8), siapkan script import CSV→MySQL yang toleran terhadap variasi format kolom |
| Performa 3D buruk di HP low-end peserta | Pengalaman podium terasa patah-patah, share-ability turun | Optimasi model (low-poly), fallback 2D otomatis, lazy-load scene 3D |
| Volume akses tinggi serentak pasca-race (semua peserta cek bersamaan) | Endpoint PHP/MySQL lambat atau down | Index database yang tepat (lihat AGENTS.md §4.2), payload JSON ringan per endpoint, caching response di sisi hosting/CDN bila perlu |
| Branding tidak konsisten antar halaman | Kesan tidak profesional ke sponsor | Strict mengikuti DESIGN.md design tokens |

## 12. Milestone Usulan

1. **M1 — Setup & Design System**: tokenisasi warna/tipografi, skeleton halaman frontend, setup schema MySQL + 3 endpoint PHP dasar, integrasi data dummy via API.
2. **M2 — Results Table**: tabel hasil + search + filter berfungsi penuh, terhubung ke `results.php` dengan data dummy besar.
3. **M3 — Podium 3D MVP**: render podium statis 3 posisi dengan model dasar (geometri primitif/low-poly), styling sesuai brand, data dari `podium.php`.
4. **M4 — Podium 3D Polish**: animasi entrance, kategori selector, lighting/material final, export gambar.
5. **M5 — Integrasi Data Real**: import data hasil lomba resmi pasca-event ke MySQL (`import_csv.php`), QA menyeluruh (frontend + backend), rilis publik.

## 13. Referensi

- Instagram resmi: instagram.com/inirunfest
- Identitas event: "INI RUN Fest 28 Juni 2026, AEON Mall Deltamas", presented by Pengda Kabupaten Bekasi Ikatan Notaris Indonesia.
- Edisi sebelumnya: INI RUN 2025 (22 Juni 2025, AEON Mall Deltamas, 1.420 peserta kategori 5K).
- Aset visual: jersey design & logo INI RUN FEST 2026 (terlampir).

# DESIGN.md — INI RUN FEST Results & Podium App

Design system ini diturunkan langsung dari aset resmi INI RUN FEST 2026 (jersey event & logo). Tujuannya: setiap layar — dari tabel hasil sampai panggung podium 3D — terasa seperti satu kesatuan visual dengan materi promosi event.

---

## 1. Mood & Prinsip Desain

**Mood:** Energik, berani, premium, sporty — nuansa "panggung kemenangan" (championship stage) dengan basis merah maroon yang dalam dan aksen emas yang berkilau saat menyorot pemenang.

Prinsip:
1. **Merah sebagai panggung, kuning sebagai sorotan.** Merah maroon mendominasi sebagai kanvas; kuning emas dipakai sangat selektif — untuk hal yang layak dirayakan (rank, CTA, juara, highlight).
2. **Bold & condensed, bukan dekoratif.** Tipografi mengikuti karakter wordmark "INI RUN FEST": tegas, big, sedikit miring/dinamis — bukan font script atau elegan-tipis.
3. **Gerakan = kecepatan.** Elemen dekoratif (garis melengkung, siluet pelari) selalu mengarah secara diagonal, menyiratkan momentum lari, bukan elemen statis simetris.
4. **Podium = momen puncak.** Saat user sampai ke section podium 3D, kontras & drama visual (lighting, depth, gold accent) harus naik satu level dibanding halaman tabel yang lebih fungsional/flat.

---

## 2. Color Palette

Warna diekstrak langsung dari aset jersey & logo terlampir.

### 2.1 Primary — Maroon/Red (warna jersey & background utama)

| Token | Hex | Penggunaan |
|-------|-----|------------|
| `--color-maroon-900` | `#5E0103` | Shadow terdalam, background gradient bawah, depth podium |
| `--color-maroon-800` | `#7A0203` | Background section gelap, kartu di atas hero |
| `--color-maroon-700` | `#9B0103` | **Primary brand red** — base warna jersey, navbar, hero background |
| `--color-maroon-600` | `#B71C1C` | Hover state tombol merah, border aktif |
| `--color-maroon-500` | `#C62828` | Aksen sekunder, badge kategori |
| `--color-ember-400` | `#D9481E` | Gradient highlight (mengarah ke oranye, seperti glow background pada poster jersey) |

### 2.2 Accent — Gold/Yellow (logo & elemen kemenangan)

| Token | Hex | Penggunaan |
|-------|-----|------------|
| `--color-gold-500` | `#FBF000` | **Primary accent** — wordmark "FEST", motif pelari, highlight rank #1 |
| `--color-gold-600` | `#E8C400` | Hover state pada elemen gold, border medali |
| `--color-gold-700` | `#C99A00` | Shadow/depth pada elemen emas 3D (medali, trofi) |
| `--color-gold-200` | `#FFE873` | Glow/bloom highlight di sekitar podium juara 1 |

### 2.3 Neutral

| Token | Hex | Penggunaan |
|-------|-----|------------|
| `--color-white` | `#FFFFFF` | Teks utama di atas merah, wordmark "INI RUN" |
| `--color-cream-100` | `#FFF8EF` | Background section terang (mis. tabel hasil), agar tidak full putih datar |
| `--color-ink-900` | `#1A1212` | Teks pada background terang, garis tabel |
| `--color-ink-600` | `#4A3A3A` | Teks sekunder/caption pada background terang |
| `--color-line-200` | `#E8DCD2` | Divider/border halus pada background terang |

### 2.4 Semantic / Status

| Token | Hex | Penggunaan |
|-------|-----|------------|
| `--color-rank-gold` | `#FBF000` | Highlight Juara 1 |
| `--color-rank-silver` | `#D9D9D9` | Highlight Juara 2 |
| `--color-rank-bronze` | `#CD8A3F` | Highlight Juara 3 |
| `--color-success` | `#2E7D32` | Indikator data berhasil dimuat / chip "Finished" |
| `--color-danger` | `#FF3B30` | Error state (selaras dengan coret "X" merah cerah di poster Gulf+) |

### 2.5 Gradients

```css
/* Hero / Background utama — meniru glow oranye-merah pada poster jersey */
--gradient-hero: radial-gradient(120% 120% at 50% 0%,
    #D9481E 0%,
    #9B0103 45%,
    #5E0103 100%);

/* Podium stage background — lebih gelap & dramatis */
--gradient-stage: linear-gradient(180deg,
    #3A0000 0%,
    #7A0203 60%,
    #9B0103 100%);

/* Gold glow untuk juara 1 */
--gradient-gold-glow: radial-gradient(circle,
    rgba(251,240,0,0.55) 0%,
    rgba(251,240,0,0) 70%);
```

**Aturan kontras:** Teks putih (`--color-white`) wajib di atas maroon-700/800/900. Teks gold hanya untuk elemen besar/short label (angka rank, judul kategori) — jangan dipakai untuk paragraf panjang karena kontras AA lebih rendah di atas merah terang.

---

## 3. Typography

### 3.1 Font Pairing

Wordmark asli "INI RUN FEST" menggunakan huruf sans grotesk sangat tebal, sedikit condensed, dengan sudut tegas (terlihat dari huruf "R", "U", "N" yang blocky). Untuk web, gunakan pasangan berikut (tersedia via Google Fonts, free, lisensi aman):

| Role | Font | Fallback Stack |
|------|------|-----------------|
| **Display / Heading** (judul besar, angka rank, nama juara podium) | **Anton** atau **Archivo Black** | `'Anton', 'Archivo Black', Impact, sans-serif` |
| **UI / Body** (tabel, paragraf, navigasi) | **Inter** atau **Plus Jakarta Sans** | `'Inter', 'Plus Jakarta Sans', -apple-system, sans-serif` |
| **Numeric / Timer** (waktu finish, pace, BIB) | **Roboto Mono** atau **JetBrains Mono** (tabular nums) | `'Roboto Mono', monospace` |

> Gunakan font numerik monospace khusus untuk kolom waktu (`00:23:58`) agar digit selalu rata kolom — penting untuk tabel hasil lomba.

### 3.2 Type Scale

| Token | Size / Line-height | Font | Contoh Penggunaan |
|-------|---------------------|------|---------------------|
| `--text-display-xl` | 64px / 1.0, letter-spacing -1% | Anton | Hero title "INI RUN FEST 2026" |
| `--text-display-lg` | 40px / 1.05 | Anton | Judul section ("PODIUM JUARA") |
| `--text-display-md` | 28px / 1.1 | Anton | Nama juara di podium 3D, judul kartu |
| `--text-heading` | 20px / 1.3 | Inter SemiBold | Judul kategori filter, sub-header tabel |
| `--text-body` | 16px / 1.5 | Inter Regular | Paragraf, deskripsi |
| `--text-body-sm` | 14px / 1.5 | Inter Regular | Caption, label form |
| `--text-mono-lg` | 24px / 1.2 | Roboto Mono Bold | Waktu finish besar di kartu juara |
| `--text-mono-base` | 14px / 1.4 | Roboto Mono Medium | Waktu/pace di baris tabel |

Semua heading display memakai **uppercase** dan tracking sedikit lebar (letter-spacing 0–1%) agar konsisten dengan karakter wordmark asli yang block-caps.

---

## 4. Iconography & Motif Grafis

1. **Motif "pelari melengkung"** dari logo (garis kuning dinamis berbentuk seperti orang berlari) dipakai sebagai:
   - Divider section (versi tipis, opacity rendah, di background).
   - Elemen transisi saat podium berganti kategori (motion graphic).
   - Watermark berulang halus (pattern "iNi" kecil seperti pada jersey) untuk tekstur background card — gunakan opacity 4–8% saja agar tidak mengganggu keterbacaan.
2. **Ikon medali/trofi** digunakan minimal, hanya untuk rank 1–3, dengan warna sesuai `--color-rank-gold/silver/bronze`.
3. **Garis diagonal speed-lines** (15–20°) sebagai elemen dekoratif di hero & section break, menyiratkan kecepatan lari.
4. Gunakan icon set garis tegas (mis. **Phosphor Icons** bold/fill variant atau **Lucide**) — hindari icon outline tipis yang terlihat lemah di atas background merah.

---

## 5. Layout & Spacing

### 5.1 Grid
- Desktop: 12-column grid, max-width container `1200px`, gutter `24px`.
- Tablet: 8-column grid, gutter `20px`.
- Mobile: 4-column grid, gutter `16px`, margin tepi `16px`.

### 5.2 Spacing Scale (8px base)

`--space-1: 4px` · `--space-2: 8px` · `--space-3: 12px` · `--space-4: 16px` · `--space-5: 24px` · `--space-6: 32px` · `--space-7: 48px` · `--space-8: 64px` · `--space-9: 96px`

### 5.3 Radius & Elevation

| Token | Value | Penggunaan |
|-------|-------|------------|
| `--radius-sm` | 8px | Input, chip filter |
| `--radius-md` | 16px | Card hasil, modal |
| `--radius-lg` | 24px | Hero card, kartu juara individual |
| `--radius-pill` | 999px | Tombol CTA, badge kategori |
| `--shadow-card` | `0 8px 24px rgba(0,0,0,0.25)` | Card di atas background gelap |
| `--shadow-gold-glow` | `0 0 40px rgba(251,240,0,0.35)` | Highlight kartu juara 1 |

---

## 6. Komponen UI

### 6.1 Navbar
- Background maroon-700 solid atau gradient tipis, logo INI RUN FEST kiri, menu kanan ("Hasil", "Podium", tentang event).
- Sticky di scroll, sedikit drop shadow saat scroll > 0.
- Versi mobile: hamburger menu, logo tetap terlihat penuh (jangan dipotong).

### 6.2 Hero Section
- Background pakai `--gradient-hero` (radial oranye→merah→maroon gelap, identik dengan glow pada poster jersey).
- Wordmark besar "INI RUN FEST 2026" (Anton, putih + aksen "FEST"/tahun dalam gold).
- Sub-info: tanggal (28 Juni 2026), lokasi (AEON Mall Deltamas), presented by INI Pengda Kab. Bekasi.
- Dua CTA: primary (gold pill, teks maroon-900 — kontras tinggi) "Lihat Podium Juara", secondary (outline putih) "Cari Hasil Saya".
- Motif garis pelari kuning samar di sudut sebagai dekorasi, mengarah ke CTA (menuntun mata).

### 6.3 Search & Filter Bar
- Sticky di atas tabel hasil saat scroll.
- Input search: background cream-100, border line-200, ikon kaca pembesar gold saat focus.
- Filter berbentuk chip pill: kategori (5K/10K/HM), gender (Putra/Putri), default state outline putih/maroon, active state filled gold dengan teks maroon-900.

### 6.4 Tabel Hasil
- Background cream-100 (bukan putih polos) agar tidak silau dan kontras dengan section merah di sekitarnya.
- Header tabel: maroon-700 solid, teks putih uppercase, font Inter SemiBold ukuran kecil dengan letter-spacing.
- Baris ganjil/genap: cream-100 / white untuk readability (zebra striping halus).
- Baris rank 1–3 mendapat aksen kiri (left border 4px) sesuai warna rank gold/silver/bronze + ikon medali kecil.
- Kolom waktu pakai font mono, rata kanan.
- Klik baris → buka detail/kartu individu (modal atau halaman baru).

### 6.5 Kartu Hasil Individu (Bib Card)
- Card vertikal radius-lg, background `--gradient-stage`, motif pattern "iNi" watermark tipis di background (mengikuti tekstur jersey).
- Nomor BIB besar di pojok atas (mono font).
- Nama peserta (Anton, putih), kategori (badge pill gold outline).
- Waktu finish besar di tengah (mono-lg, gold).
- Rank kategori & rank overall sebagai dua stat kecil berdampingan.
- Footer card: logo INI RUN FEST kecil + logo sponsor Gulf+ (placeholder area), tombol "Bagikan" (download as image).

### 6.6 Tombol (Buttons)

| Variant | Background | Teks | Penggunaan |
|---------|-----------|------|------------|
| Primary | `--color-gold-500`, hover `--color-gold-600` | maroon-900, bold | CTA utama (Lihat Podium, Bagikan) |
| Secondary | transparent, border putih 1.5px | putih | CTA sekunder di atas merah |
| Tertiary/Ghost | transparent | maroon-700 | Aksi di atas background terang (cream) |
| Danger/Reset filter | transparent, border danger | danger | Reset filter pencarian |

Semua tombol: radius-pill, padding `12px 24px`, transisi 150ms ease-out pada hover (scale 1.02 + shadow gold-glow tipis untuk primary).

---

## 7. Podium 3D — Spesifikasi Visual Khusus

Ini adalah elemen sentral aplikasi (lihat AGENTS.md untuk spesifikasi teknis Three.js). Bagian ini fokus pada **bagaimana podium harus terlihat**.

### 7.1 Komposisi Panggung
- **Background scene:** gradient `--gradient-stage` sebagai backdrop, opsional particle/confetti halus berwarna gold & putih melayang pelan (ambient, bukan mengganggu).
- **Lantai panggung (floor):** material maroon gelap dengan sedikit reflektifitas (subtle reflection podium di lantai, seperti panggung penghargaan olahraga sungguhan), bisa pakai grid/spotlight circle di bawah podium juara 1.
- **3 Blok Podium:**
  - Posisi tengah (Juara 1) **paling tinggi**, kiri (Juara 2) tinggi sedang, kanan (Juara 3) terendah — urutan klasik kiri-tengah-kanan = 2-1-3.
  - Material blok podium: permukaan maroon-700/800 dengan **panel angka besar** ("1", "2", "3") berwarna gold (Anton font, di-extrude sebagai 3D text atau plane bertekstur).
  - Tepi/edge podium diberi aksen garis gold tipis (mengikuti motif garis pelari logo, melengkung di sisi podium juara 1 sebagai signature detail).
- **Lighting:**
  - Key light putih hangat dari atas-depan (spotlight ke podium juara 1, paling terang).
  - Rim light gold dari belakang tiap podium untuk siluet keemasan.
  - Ambient light merah gelap untuk menjaga mood maroon tanpa membuat scene gelap total.
- **Karakter/Avatar Juara:** dapat berupa model low-poly sederhana (silhouette pelari, terinspirasi dari ikon "pelari kuning" di logo) atau, jika foto profil peserta tersedia, gunakan **billboard/plane dengan foto** menghadap kamera di atas tiap podium, dibingkai frame gold melingkar.
- **Label Informasi per Podium:** nama, BIB, dan waktu finish ditampilkan sebagai HTML overlay (bukan geometry 3D) yang anchored ke posisi 3D tiap podium — gunakan style kartu kecil (background maroon-900/80% blur, teks putih + waktu gold mono).

### 7.2 Animasi
- **Entrance:** kamera mulai dari sudut wide/jauh lalu dolly-in ke podium saat scene load (durasi ~1.5–2s, easing ease-out).
- **Reveal juara:** podium "naik" dari bawah lantai (scale-Y atau translate-Y dari 0) secara berurutan: Juara 3 → Juara 2 → Juara 1 (delay staggered ~300ms), memberi efek dramatis menuju puncak.
- **Confetti/sparkle gold** muncul singkat (1–2s) tepat saat Juara 1 selesai naik.
- **Idle motion:** kamera melakukan slow auto-orbit halus (mis. 0.05 rad/s) saat tidak ada interaksi user, supaya scene tetap "hidup" tanpa user perlu drag.
- **Ganti kategori:** transisi crossfade/scale-out lalu reveal ulang (bukan jump-cut), agar terasa smooth.

### 7.3 Kontrol Interaksi
- Desktop: OrbitControls (drag untuk rotate, scroll untuk zoom dibatasi pada rentang aman agar tidak "tersesat" keluar scene).
- Mobile: kontrol disederhanakan — single-finger drag untuk rotate horizontal saja (batasi sumbu vertikal agar tidak membingungkan di layar kecil), pinch untuk zoom dengan batas wajar.
- Sediakan tombol "Reset View" mengembalikan kamera ke posisi default.

### 7.4 Export/Share
- Tombol "Bagikan Podium" meng-capture canvas pada frame terbaik (kamera di posisi default/hero angle) → render ke PNG dengan overlay nama event, tanggal, dan logo — siap diunggah ke Instagram Story (rasio 9:16) atau feed (1:1).

---

## 8. Motion & Micro-interactions (Non-3D)

| Elemen | Animasi |
|--------|---------|
| Card hasil saat hover (desktop) | translateY(-2px) + shadow-card naik, 150ms |
| Filter chip aktif | background fade ke gold 150ms + ikon check muncul |
| Search hasil muncul | fade + slight slide-up per baris, stagger 30ms (maks 8 baris pertama agar tidak lambat) |
| Page transition antar section | scroll-snap halus, tanpa hard cut |
| Loading state tabel/3D | skeleton shimmer warna cream/maroon muda, **bukan** spinner generik — gunakan bentuk garis pelari kuning sebagai loading indicator kustom jika memungkinkan |

---

## 9. Aksesibilitas

- Kontras teks putih di atas maroon-700 ke atas: pastikan rasio ≥ 4.5:1 (sudah terpenuhi untuk body text).
- Teks gold (`#FBF000`) di atas maroon-700 hanya untuk ukuran besar (≥ 24px bold) sesuai WCAG large-text threshold; hindari body text kecil warna gold di atas merah.
- Semua interaksi podium 3D memiliki alternatif non-3D (lihat FR-11 di PRD): tampilkan daftar Juara 1/2/3 dalam bentuk card 2D statis sebagai fallback bila WebGL gagal/disabled, dengan styling yang tetap mengikuti §6.5.
- Fokus keyboard terlihat jelas (outline gold 2px) pada semua elemen interaktif termasuk tombol kontrol podium.

---

## 10. Design Tokens (Ringkasan CSS Variables)

```css
:root {
  /* Colors */
  --color-maroon-900: #5E0103;
  --color-maroon-800: #7A0203;
  --color-maroon-700: #9B0103;
  --color-maroon-600: #B71C1C;
  --color-maroon-500: #C62828;
  --color-ember-400: #D9481E;

  --color-gold-500: #FBF000;
  --color-gold-600: #E8C400;
  --color-gold-700: #C99A00;
  --color-gold-200: #FFE873;

  --color-white: #FFFFFF;
  --color-cream-100: #FFF8EF;
  --color-ink-900: #1A1212;
  --color-ink-600: #4A3A3A;
  --color-line-200: #E8DCD2;

  --color-rank-gold: #FBF000;
  --color-rank-silver: #D9D9D9;
  --color-rank-bronze: #CD8A3F;

  /* Typography */
  --font-display: 'Anton', 'Archivo Black', Impact, sans-serif;
  --font-body: 'Inter', 'Plus Jakarta Sans', -apple-system, sans-serif;
  --font-mono: 'Roboto Mono', 'JetBrains Mono', monospace;

  /* Spacing */
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;

  /* Radius */
  --radius-md: 16px;
  --radius-lg: 24px;
  --radius-pill: 999px;

  /* Shadow */
  --shadow-card: 0 8px 24px rgba(0,0,0,0.25);
  --shadow-gold-glow: 0 0 40px rgba(251,240,0,0.35);
}
```

---

## 11. Sumber Visual

Palet & tipografi pada dokumen ini diturunkan langsung dari:
1. Desain jersey resmi "INI RUN FEST 2026 × Gulf+" (background gradient merah-oranye, wordmark putih-kuning, motif pelari kuning).
2. Logo utama INI RUN FEST (wordmark "INI RUN" putih + "FEST" kuning di atas background maroon bertekstur diagonal).

Setiap penambahan aset baru (foto venue, dokumentasi race, dsb.) harus tetap disaring lewat color grading merah-maroon agar konsisten dengan kedua sumber ini.

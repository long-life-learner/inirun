// js/results/bib-card.js
// Individual result card in a native <dialog>. No modal library needed.
// Includes e-certificate download via Canvas API, matching bg-certificate.png layout.

import { formatTime, formatPace, formatGender } from '../utils/format.js';

/** Lazily create the dialog (only one in the DOM). */
function getDialog() {
  let dlg = document.getElementById('bib-dialog');
  if (!dlg) {
    dlg = document.createElement('dialog');
    dlg.id = 'bib-dialog';
    dlg.className = 'bib-dialog';
    dlg.setAttribute('aria-modal', 'true');
    dlg.setAttribute('aria-label', 'Detail Hasil Peserta');
    document.body.appendChild(dlg);
    dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  }
  return dlg;
}

/**
 * Open the bib card dialog for a runner entry.
 * @param {import('../api/client.js').ResultEntry} entry
 */
export function openBibCard(entry) {
  const dlg = getDialog();

  const card = document.createElement('div');
  card.className = 'bib-card';

  // Header: BIB + close button
  const header = document.createElement('div');
  header.className = 'bib-card__header';

  const bib = document.createElement('div');
  bib.className = 'bib-card__bib';
  bib.textContent = `#${entry.bib}`;

  const close = document.createElement('button');
  close.className = 'bib-card__close';
  close.textContent = '×';
  close.setAttribute('aria-label', 'Tutup');
  close.addEventListener('click', () => dlg.close());

  header.append(bib, close);
  card.appendChild(header);

  // Name
  const name = document.createElement('div');
  name.className = 'bib-card__name';
  name.textContent = entry.name;
  card.appendChild(name);

  // Category + gender badges
  const meta = document.createElement('div');
  meta.className = 'bib-card__meta';
  const catBadge = document.createElement('span');
  catBadge.className = 'badge badge--category';
  catBadge.textContent = entry.category;
  const genBadge = document.createElement('span');
  genBadge.className = 'badge badge--category';
  genBadge.textContent = formatGender(entry.gender);
  meta.append(catBadge, genBadge);
  card.appendChild(meta);

  // Gun time (big)
  const timeEl = document.createElement('div');
  timeEl.className = 'bib-card__time mono';
  timeEl.textContent = formatTime(entry.gunTime);
  card.appendChild(timeEl);

  // Stats grid
  const stats = document.createElement('div');
  stats.className = 'bib-card__stats';

  const rank = entry._computedRank ?? entry.rankCategoryGender ?? entry.rankOverall ?? null;
  const statData = [
    ['Rank Overall', entry.rankOverall != null ? `#${entry.rankOverall}` : (rank ? `#${rank}` : '–')],
    ['Rank Kategori', entry.rankCategoryGender != null ? `#${entry.rankCategoryGender}` : (rank ? `#${rank}` : '–')],
    ['Net Time', formatTime(entry.netTime)],
    ['Pace', formatPace(entry.pace)],
    ['Checkpoint', formatTime(entry.checkpoint) || '–'],
  ];
  for (const [label, val] of statData) {
    const s = document.createElement('div');
    s.className = 'bib-card__stat';
    const lbl = document.createElement('div');
    lbl.className = 'bib-card__stat-label';
    lbl.textContent = label;
    const v = document.createElement('div');
    v.className = 'bib-card__stat-value mono';
    v.textContent = val;
    s.append(lbl, v);
    stats.appendChild(s);
  }
  card.appendChild(stats);

  // Footer: event name + download certificate button
  const foot = document.createElement('div');
  foot.className = 'bib-card__footer';

  const evName = document.createElement('div');
  evName.className = 'bib-card__event-name';
  evName.textContent = 'INI RUN FEST 2026';

  const dlBtn = document.createElement('button');
  dlBtn.className = 'btn btn--gold btn--sm bib-card__cert-btn';
  dlBtn.textContent = '⬇ E-Certificate';
  dlBtn.setAttribute('aria-label', 'Download e-certificate');
  dlBtn.addEventListener('click', () => {
    dlBtn.textContent = 'Memproses…';
    dlBtn.disabled = true;
    downloadCertificate(entry).finally(() => {
      dlBtn.textContent = '⬇ E-Certificate';
      dlBtn.disabled = false;
    });
  });

  foot.append(evName, dlBtn);
  card.appendChild(foot);

  dlg.innerHTML = '';
  dlg.appendChild(card);
  dlg.showModal();
}

/* ─────────────────────────────────────────────────────────────────────────────
   E-Certificate generation
   Canvas dimensions match bg-certificate.png aspect ratio: ~1754 × 1241 (landscape A4)
   ───────────────────────────────────────────────────────────────────────────── */

// Certificate canvas dimensions (landscape A4 proportional)
const CERT_W = 1491;
const CERT_H = 1000;

// Text area is the LEFT ~55% of the canvas (route map is on the right)
const TEXT_MAX_X = CERT_W * 0.56; // right boundary of text zone
const TEXT_LEFT = 72;            // left margin

/**
 * Draw and download the e-certificate as a PNG.
 */
async function downloadCertificate(entry) {
  const canvas = document.createElement('canvas');
  canvas.width = CERT_W;
  canvas.height = CERT_H;
  const ctx = canvas.getContext('2d');

  // ── 1. Background image ────────────────────────────────────────────────────
  try {
    const bg = await loadImage('/assets/bg-certificate.png');
    ctx.drawImage(bg, 0, 0, CERT_W, CERT_H);
  } catch {
    // Fallback gradient if image fails (e.g. CORS)
    const grad = ctx.createLinearGradient(0, 0, CERT_W, CERT_H);
    grad.addColorStop(0, '#C62828');
    grad.addColorStop(1, '#5E0103');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CERT_W, CERT_H);
  }

  // ── 2. Overlay to ensure text legibility in left zone ─────────────────────
  // Subtle dark veil only over the text area (left half)
  // const textVeil = ctx.createLinearGradient(0, 0, TEXT_MAX_X, 0);
  // textVeil.addColorStop(0, 'rgba(80,0,0,0.25)');
  // textVeil.addColorStop(0.8, 'rgba(80,0,0,0.08)');
  // textVeil.addColorStop(1, 'rgba(80,0,0,0.0)');
  // ctx.fillStyle = textVeil;
  // ctx.fillRect(0, 0, TEXT_MAX_X, CERT_H);

  // ── 3. Helpers ────────────────────────────────────────────────────────────
  // Helper: set font shorthand
  const font = (size, family = 'serif') => `${size}px ${family}`;
  // Helper: render multiline text with wrapping
  function wrapText(text, x, y, maxW, lineH, fnt) {
    ctx.font = fnt;
    const words = text.split(' ');
    let line = '';
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, x, y);
        line = word;
        y += lineH;
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line, x, y);
    return y;
  }

  // ── 4. Certificate text — positioned to match background layout ───────────

  // --- "This certificate is proudly presented to" ---
  // Positioned below the "Of appreciation" subtitle in the background image
  ctx.fillStyle = '#FFFFFF';
  ctx.font = font(32, 'Inter, Arial, sans-serif');
  ctx.textAlign = 'left';
  ctx.fillText('This certificate is proudly presented to', TEXT_LEFT, 488);

  // --- RUNNER NAME (large, bold) ---
  // Fills the prominent empty space between the "presented to" line and the divider
  const nameFontSize = entry.name && entry.name.length > 22 ? 64 : 80;
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${nameFontSize}px Anton, Impact, sans-serif`;
  ctx.textAlign = 'left';
  // Truncate name if too wide
  let displayName = (entry.name ?? '').toUpperCase();
  while (ctx.measureText(displayName).width > TEXT_MAX_X - TEXT_LEFT - 20 && displayName.length > 3) {
    displayName = displayName.slice(0, -1);
  }
  ctx.fillText(displayName, TEXT_LEFT, 600);

  // --- Horizontal divider line ---
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(TEXT_LEFT, 635);
  ctx.lineTo(TEXT_MAX_X - 30, 635);
  ctx.stroke();

  // --- BIB No. label (matches the "BIB No." label in the background) ---
  ctx.fillStyle = '#FFFFFF';
  ctx.font = font(26, 'Inter, Arial, sans-serif');
  ctx.textAlign = 'left';
  ctx.fillText(`BIB No. ${entry.bib}`, TEXT_LEFT, 672);

  // --- Checkpoint Text (drawn on the route map's white CHECKPOINT box at top-right) ---
  if (entry.checkpoint) {
    ctx.fillStyle = '#9B0103';
    ctx.font = 'bold 24px "Roboto Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(formatTime(entry.checkpoint), 1255, 170);
  }

  // --- Body text (matches "for successfully completing 5K at INI RUN FEST 2026...") ---
  const category = entry.category ?? '5K';
  const gender = formatGender(entry.gender);
  const bodyText = `for successfully completing ${category} at the INI RUN FEST 2026, held on 28 June 2026 with the following official race result:`;
  ctx.fillStyle = '#FFFFFF';
  ctx.font = font(24, 'Inter, Arial, sans-serif');
  ctx.textAlign = 'left';
  wrapText(bodyText, TEXT_LEFT, 720, TEXT_MAX_X - TEXT_LEFT - 20, 34, font(24, 'Inter, Arial, sans-serif'));

  // ── 5. Yellow stats box (matches the golden rounded box in the background) ──
  // Background image has the yellow box roughly at y=820–960, left=72, right=TEXT_MAX_X-20
  const boxX = TEXT_LEFT;
  const boxY = 810;
  const boxW = TEXT_MAX_X - TEXT_LEFT - 20;
  const boxH = 140;
  const boxR = 16; // corner radius

  // Draw rounded rect
  ctx.fillStyle = '#fcc72d';
  ctx.beginPath();
  ctx.moveTo(boxX + boxR, boxY);
  ctx.lineTo(boxX + boxW - boxR, boxY);
  ctx.quadraticCurveTo(boxX + boxW, boxY, boxX + boxW, boxY + boxR);
  ctx.lineTo(boxX + boxW, boxY + boxH - boxR);
  ctx.quadraticCurveTo(boxX + boxW, boxY + boxH, boxX + boxW - boxR, boxY + boxH);
  ctx.lineTo(boxX + boxR, boxY + boxH);
  ctx.quadraticCurveTo(boxX, boxY + boxH, boxX, boxY + boxH - boxR);
  ctx.lineTo(boxX, boxY + boxR);
  ctx.quadraticCurveTo(boxX, boxY, boxX + boxR, boxY);
  ctx.closePath();
  ctx.fill();

  // Draw divider lines inside the box (6 columns)
  const overallRank = entry.rankOverall != null ? String(entry.rankOverall) : (entry._computedRank ? String(entry._computedRank) : '–');
  const genderRank = entry.rankCategoryGender != null ? String(entry.rankCategoryGender) : '–';

  const cols = [
    { label: 'distance', value: category },
    { label: 'gun time', value: formatTime(entry.gunTime) },
    { label: 'net time', value: formatTime(entry.netTime) },
    { label: 'overall', value: `#${overallRank}` },
    { label: 'gender', value: `#${genderRank}` },
    { label: 'category', value: category },
  ];

  const colW = boxW / cols.length;
  const labelY = boxY + 38;
  const valueY = boxY + 100;

  for (let i = 0; i < cols.length; i++) {
    const { label, value } = cols[i];
    const cx = boxX + colW * i + colW / 2;

    // Divider line between columns (not before first)
    if (i > 0) {
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(boxX + colW * i, boxY + 16);
      ctx.lineTo(boxX + colW * i, boxY + boxH - 16);
      ctx.stroke();
    }

    // Label
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.font = font(18, 'Inter, Arial, sans-serif');
    ctx.textAlign = 'center';
    ctx.fillText(label, cx, labelY);

    // Value
    ctx.fillStyle = '#1A0000';
    ctx.font = `bold ${i === 0 ? 36 : 26}px Anton, Impact, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(value, cx, valueY);
  }

  const safeName = (entry.name ?? 'runner').replace(/[^a-zA-Z0-9]/g, '_');
  const dataURL = canvas.toDataURL('image/png');

  // Buat modal preview
  const overlay = document.createElement('div');
  overlay.id = 'cert-preview-overlay';
  overlay.style.cssText = `
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,0.85);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 16px;
  padding: 24px;
`;

  const img = document.createElement('img');
  img.src = dataURL;
  img.style.cssText = `
  max-width: 90vw; max-height: 75vh;
  border-radius: 8px; box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  object-fit: contain;
`;

  const btnRow = document.createElement('div');
  btnRow.style.cssText = `display: flex; gap: 12px;`;

  const btnDownload = document.createElement('button');
  btnDownload.textContent = '⬇ Download';
  btnDownload.style.cssText = `
  padding: 10px 24px; border-radius: 8px; border: none; cursor: pointer;
  background: #2563eb; color: #fff; font-size: 15px; font-weight: 500;
`;
  btnDownload.onclick = () => {
    const link = document.createElement('a');
    link.download = `certificate-${entry.bib}-${safeName}.png`;
    link.href = dataURL;
    link.click();
  };

  const btnClose = document.createElement('button');
  btnClose.textContent = '✕ Tutup';
  btnClose.style.cssText = `
  padding: 10px 24px; border-radius: 8px; cursor: pointer;
  background: transparent; color: #fff; font-size: 15px;
  border: 1.5px solid rgba(255,255,255,0.5);
`;
  btnClose.onclick = () => overlay.remove();

  // Klik area luar juga menutup modal
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });

  btnRow.append(btnDownload, btnClose);
  overlay.append(img, btnRow);

  // Append to the dialog instead of document.body so it renders in the top-layer
  const dlg = getDialog();
  dlg.appendChild(overlay);
}

/** Load an image and return Promise<HTMLImageElement>. */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// js/utils/share-image.js
// Captures the Three.js canvas, composites event overlay + labels, triggers download.

import { EVENT } from '../config.js';

/**
 * Export the podium canvas as PNG with event overlay and inline labels.
 * @param {HTMLCanvasElement} threeCanvas — the WebGL canvas
 * @param {HTMLElement} labelContainer — the .podium-labels div containing label cards
 * @param {'1:1'|'9:16'} ratio
 */
export function sharePodiumImage(threeCanvas, labelContainer, ratio = '1:1') {
  const is916 = ratio === '9:16';
  const W = is916 ? 1080 : 1080;
  const H = is916 ? 1920 : 1080;

  const out = document.createElement('canvas');
  out.width  = W;
  out.height = H;
  const ctx = out.getContext('2d');

  // Background — maroon gradient
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#3A0000');
  grad.addColorStop(0.6, '#7A0203');
  grad.addColorStop(1,   '#9B0103');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Three.js canvas — centred, letterboxed
  const cw = threeCanvas.width;
  const ch = threeCanvas.height;
  const scale = Math.min(W / cw, (H * 0.7) / ch);
  const dw = cw * scale, dh = ch * scale;
  const dx = (W - dw) / 2, dy = is916 ? H * 0.12 : (H - dh) / 2;

  try {
    ctx.drawImage(threeCanvas, dx, dy, dw, dh);
  } catch (_) { /* preserveDrawingBuffer might be false */ }

  // Draw label overlays onto the canvas
  const labels = labelContainer?.querySelectorAll('.podium-label');
  if (labels) {
    // Scale factor from Three.js canvas to output canvas
    const sx = dw / threeCanvas.width;
    const sy = dh / threeCanvas.height;
    // Stage offset within output canvas
    const ox = dx;
    const oy = dy;

    for (const label of labels) {
      // Read position from inline style (set by syncLabels)
      const left = parseFloat(label.style.left) || 0;
      const top  = parseFloat(label.style.top)  || 0;

      // Map to output canvas coordinates
      const lx = ox + left * sx;
      const ly = oy + top  * sy;

      // Read label data
      const rankEl = label.querySelector('.podium-label__rank');
      const nameEl = label.querySelector('.podium-label__name');
      const timeEl = label.querySelector('.podium-label__time');
      const bibEl  = label.querySelector('.podium-label__bib');

      if (!nameEl) continue;

      const rank = rankEl?.textContent || '';
      const name = nameEl.textContent || '';
      const time = timeEl?.textContent || '';
      const bib  = bibEl?.textContent || '';

      // Determine rank number for colour
      const rankNum = rank.replace('#', '');
      const colorMap = { '1': '#FBF000', '2': '#C0C0C0', '3': '#CD7F32' };
      const rankColor = colorMap[rankNum] || '#FBF000';

      // Draw label background card
      const cardW = Math.min(280, W * 0.32);
      const cardH = 120 * sy;
      const cardX = lx - cardW / 2;
      const cardY = ly - cardH;

      ctx.fillStyle = 'rgba(94,1,3,0.88)';
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, 12);
      ctx.fill();

      // Border
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, 12);
      ctx.stroke();

      // Rank
      ctx.fillStyle = rankColor;
      ctx.font = `bold 36px Anton, Impact, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(rank, lx, cardY + 42);

      // Name
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `600 16px Inter, sans-serif`;
      ctx.fillText(name, lx, cardY + 68);

      // Time
      ctx.fillStyle = '#FBF000';
      ctx.font = `500 14px "Roboto Mono", monospace`;
      ctx.fillText(time, lx, cardY + 88);

      // Bib
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = `12px Inter, sans-serif`;
      ctx.fillText(bib, lx, cardY + cardH - 10);
    }
  }

  // Event name overlay — bottom strip
  const stripH = is916 ? 220 : 140;
  const stripY = H - stripH;
  ctx.fillStyle = 'rgba(94,1,3,0.92)';
  ctx.fillRect(0, stripY, W, stripH);

  // Gold accent line
  ctx.fillStyle = '#FBF000';
  ctx.fillRect(0, stripY, W, 4);

  // Event name
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${is916 ? 64 : 48}px Anton, Impact, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('INI RUN', W / 2, stripY + (is916 ? 80 : 52));

  ctx.fillStyle = '#FBF000';
  ctx.fillText('FEST 2026', W / 2, stripY + (is916 ? 150 : 100));

  // Date + location
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = `${is916 ? 28 : 20}px Inter, sans-serif`;
  ctx.fillText(`${EVENT.date} · ${EVENT.location}`, W / 2, stripY + (is916 ? 195 : 130));

  // Trigger download
  out.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href     = url;
    a.download = `inirunfest2026-podium-${ratio.replace(':','-')}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }, 'image/png');
}

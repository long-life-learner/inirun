// js/podium/fallback-2d.js
// Renders 5 winner cards when WebGL is unavailable.

import { formatTime, formatGender } from '../utils/format.js';

/**
 * @param {HTMLElement} container — #podium-fallback
 * @param {Array} topFive — array of up to 5 runner entries (index 0 = rank 1)
 * @param {string} categoryLabel — e.g. "5K Putra"
 */
export function renderFallback2D(container, topFive, categoryLabel) {
  container.hidden = false;

  const title = document.createElement('h2');
  title.className = 'podium-fallback__title';
  title.innerHTML = `PODIUM <span>${categoryLabel}</span>`;

  const cards = document.createElement('div');
  cards.className = 'podium-fallback__cards';

  for (let i = 0; i < 5; i++) {
    const rank  = i + 1;
    const entry = topFive[i] || null;
    const card  = document.createElement('div');
    card.className = `podium-winner-card podium-winner-card--${rank}`;

    const pos = document.createElement('div');
    pos.className = 'podium-winner-card__pos';
    pos.textContent = String(rank);

    const info = document.createElement('div');

    const name = document.createElement('div');
    name.className = 'podium-winner-card__name';
    name.textContent = entry?.name ?? '–';

    const sub = document.createElement('div');
    sub.className = 'podium-winner-card__sub';
    sub.textContent = entry ? `BIB ${entry.bib}` : '';

    info.append(name, sub);

    const time = document.createElement('div');
    time.className = 'podium-winner-card__time mono';
    time.textContent = entry ? formatTime(entry.gunTime) : '–';

    card.append(pos, info, time);
    cards.appendChild(card);
  }

  container.innerHTML = '';
  container.append(title, cards);
}

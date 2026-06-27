// js/api/client.js
// Thin fetch wrappers for the PHP endpoints.
// All functions return plain JS objects matching PRD §8 contract.

import { API_BASE_URL } from '../config.js';

/**
 * Fetch race results (paginated).
 * @param {{ category?: string, gender?: string, search?: string, page?: number, limit?: number }} opts
 * @returns {Promise<{ total: number, page: number, pages: number, results: ResultEntry[] }>}
 */
export async function fetchResults({ category, gender, search, page = 1, limit = 50 } = {}) {
  const p = new URLSearchParams();
  if (category) p.set('category', category);
  if (gender)   p.set('gender',   gender);
  if (search)   p.set('search',   search);
  p.set('page',  String(page));
  p.set('limit', String(limit));

  const res = await fetch(`${API_BASE_URL}/results.php?${p}`);
  if (!res.ok) throw new Error(`Gagal memuat hasil lomba (${res.status})`);
  return res.json();
}

/**
 * Fetch top-3 finishers for a given category+gender.
 * @param {string} category
 * @param {'M'|'F'} gender
 * @returns {Promise<Array>} Array of up to 5 entries sorted by rank
 */
export async function fetchTopFive(category, gender) {
  const p = new URLSearchParams({ category, gender });
  const res = await fetch(`${API_BASE_URL}/podium.php?${p}`);
  if (!res.ok) throw new Error(`Gagal memuat podium (${res.status})`);
  /** @type {ResultEntry[]} */
  const rows = await res.json();
  // Sort by rankCategoryGender and return as array [rank1, rank2, ..., rank5]
  const sorted = [...rows].sort((a, b) => (a.rankCategoryGender ?? 99) - (b.rankCategoryGender ?? 99));
  return sorted.slice(0, 5);
}

/**
 * Fetch top-3 finishers (legacy format — kept for backward compat).
 * @param {string} category
 * @param {'M'|'F'} gender
 * @returns {Promise<{ first?: ResultEntry, second?: ResultEntry, third?: ResultEntry }>}
 */
export async function fetchTopThree(category, gender) {
  const topFive = await fetchTopFive(category, gender);
  return {
    first:  topFive[0] ?? null,
    second: topFive[1] ?? null,
    third:  topFive[2] ?? null,
  };
}

/**
 * Fetch distinct category+gender pairs for filter chips.
 * @returns {Promise<Array<{ category: string, gender: string }>>}
 */
export async function fetchCategories() {
  const res = await fetch(`${API_BASE_URL}/categories.php`);
  if (!res.ok) throw new Error(`Gagal memuat kategori (${res.status})`);
  return res.json();
}

/**
 * @typedef {{ bib:string, name:string, category:string, gender:string,
 *   ageGroup:string|null, gunTime:string, netTime:string, pace:string|null,
 *   rankOverall:number|null, rankCategoryGender:number|null,
 *   city:string|null, photoUrl:string|null }} ResultEntry
 */

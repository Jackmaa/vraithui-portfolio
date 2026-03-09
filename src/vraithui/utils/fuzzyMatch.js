/**
 * VraithUI Fuzzy Matching Engine
 * Pure-function utility shared by CommandPalette and VraithConsole.
 */

/**
 * Score a query against a target string.
 * Returns { score, matches } or null if no match.
 *
 * Scoring tiers (highest first):
 *   Exact match:              1000
 *   Starts-with:              800 + length bonus
 *   Word-boundary starts:     600
 *   Contains (substring):     400
 *   Acronym:                  300
 *   Fuzzy subsequence:        100 + bonuses
 */
export function fuzzyScore(query, target) {
  if (!query || !target) return null;

  const q = query.toLowerCase();
  const t = target.toLowerCase();

  // Exact match
  if (t === q) {
    return {
      score: 1000,
      matches: Array.from({ length: t.length }, (_, i) => i),
    };
  }

  // Starts-with
  if (t.startsWith(q)) {
    const lengthBonus = Math.round((q.length / t.length) * 100);
    return {
      score: 800 + lengthBonus,
      matches: Array.from({ length: q.length }, (_, i) => i),
    };
  }

  // Word-boundary starts-with — query matches start of any word in target
  const words = t.split(/[\s\-_]+/);
  let wordOffset = 0;
  for (const word of words) {
    const start = t.indexOf(word, wordOffset);
    if (word.startsWith(q)) {
      return {
        score: 600,
        matches: Array.from({ length: q.length }, (_, i) => start + i),
      };
    }
    wordOffset = start + word.length;
  }

  // Contains (substring)
  const subIdx = t.indexOf(q);
  if (subIdx !== -1) {
    return {
      score: 400,
      matches: Array.from({ length: q.length }, (_, i) => subIdx + i),
    };
  }

  // Acronym — query chars match first letter of each word
  const wordStarts = [];
  let ws = 0;
  for (const word of words) {
    const idx = t.indexOf(word, ws);
    wordStarts.push(idx);
    ws = idx + word.length;
  }
  if (q.length <= wordStarts.length) {
    const acronymMatches = [];
    let valid = true;
    for (let i = 0; i < q.length; i++) {
      if (i < wordStarts.length && t[wordStarts[i]] === q[i]) {
        acronymMatches.push(wordStarts[i]);
      } else {
        valid = false;
        break;
      }
    }
    if (valid && acronymMatches.length === q.length) {
      return { score: 300, matches: acronymMatches };
    }
  }

  // Fuzzy subsequence — all query chars appear in order
  const matches = [];
  let ti = 0;
  for (let qi = 0; qi < q.length; qi++) {
    let found = false;
    while (ti < t.length) {
      if (t[ti] === q[qi]) {
        matches.push(ti);
        ti++;
        found = true;
        break;
      }
      ti++;
    }
    if (!found) return null; // no match
  }

  // Subsequence bonuses
  let bonus = 0;
  for (let i = 0; i < matches.length; i++) {
    // Consecutive match bonus
    if (i > 0 && matches[i] === matches[i - 1] + 1) {
      bonus += 15;
    }
    // Word-boundary bonus
    const m = matches[i];
    if (m === 0 || t[m - 1] === ' ' || t[m - 1] === '-' || t[m - 1] === '_') {
      bonus += 10;
    }
    // Early position bonus
    if (m < 5) {
      bonus += 5;
    }
  }

  return { score: 100 + bonus, matches };
}

/**
 * Filter and rank items by fuzzy matching.
 * Empty query returns all items in original order.
 *
 * @param {string} query - Search query
 * @param {Array} items - Items to filter
 * @param {Function} keyFn - Extracts string to match from item
 * @returns {{ item, score, matches }[]}
 */
export function fuzzyFilter(query, items, keyFn) {
  if (!query || !query.trim()) {
    return items.map((item) => ({ item, score: 0, matches: [] }));
  }

  const q = query.trim();
  const results = [];

  for (const item of items) {
    const key = keyFn(item);
    const result = fuzzyScore(q, key);
    if (result) {
      results.push({ item, score: result.score, matches: result.matches });
    }
  }

  // Sort descending by score (stable)
  results.sort((a, b) => b.score - a.score);

  return results;
}

/**
 * Split text into highlighted/unhighlighted segments for rendering.
 *
 * @param {string} text - Original text
 * @param {number[]} matchIndices - Indices of matched chars
 * @returns {{ text: string, highlight: boolean }[]}
 */
export function highlightMatches(text, matchIndices) {
  if (!matchIndices || matchIndices.length === 0) {
    return [{ text, highlight: false }];
  }

  const set = new Set(matchIndices);
  const segments = [];
  let current = '';
  let currentHighlight = false;

  for (let i = 0; i < text.length; i++) {
    const isMatch = set.has(i);
    if (i === 0) {
      currentHighlight = isMatch;
      current = text[i];
    } else if (isMatch === currentHighlight) {
      current += text[i];
    } else {
      segments.push({ text: current, highlight: currentHighlight });
      current = text[i];
      currentHighlight = isMatch;
    }
  }

  if (current) {
    segments.push({ text: current, highlight: currentHighlight });
  }

  return segments;
}

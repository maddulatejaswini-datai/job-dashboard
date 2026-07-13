// Shared normalization helpers for the job-scraping pipeline.
// Used by scrape-jobs.mjs so the live scraper and any offline
// reprocessing produce identical output.

const MAX_DESCRIPTION_CHARS = 500;

/**
 * Collapse whitespace and cut to a clean sentence/word boundary near
 * maxChars, rather than truncating raw scraped text mid-sentence.
 */
export function cleanDescription(text, maxChars = MAX_DESCRIPTION_CHARS) {
  if (!text) return "";
  const collapsed = text.replace(/\s+/g, " ").trim();
  if (collapsed.length <= maxChars) return collapsed;

  const window = collapsed.slice(0, maxChars);
  const lastSentenceEnd = Math.max(
    window.lastIndexOf(". "),
    window.lastIndexOf("! "),
    window.lastIndexOf("? ")
  );
  if (lastSentenceEnd > maxChars * 0.4) {
    return window.slice(0, lastSentenceEnd + 1);
  }
  const lastSpace = window.lastIndexOf(" ");
  return `${window.slice(0, lastSpace > 0 ? lastSpace : maxChars)}...`;
}

export function mapIndeedItem(item) {
  if (!item.positionName || !item.company || !item.url) return null;
  if (item.isExpired) return null;
  return {
    title: item.positionName,
    company: item.company,
    location: item.location || "United States",
    applyUrl: item.url,
    description: cleanDescription(item.description),
    source: "Indeed",
  };
}

export function mapLinkedInItem(item) {
  if (!item.title || !item.companyName || !item.link) return null;
  return {
    title: item.title,
    company: item.companyName,
    location: item.location || "United States",
    applyUrl: item.link,
    description: cleanDescription(item.descriptionText),
    source: "LinkedIn",
  };
}

/**
 * Drop duplicate postings (same company + same title), keeping the
 * first occurrence, then assign clean sequential ids.
 */
export function dedupeAndNumber(jobs) {
  const seen = new Set();
  const deduped = [];
  for (const job of jobs) {
    const key = `${job.company.toLowerCase().trim()}|${job.title.toLowerCase().trim()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(job);
  }
  return deduped.map((job, i) => ({ id: String(i + 1), ...job }));
}

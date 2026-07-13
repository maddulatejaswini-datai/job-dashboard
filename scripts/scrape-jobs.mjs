#!/usr/bin/env node
// Refreshes src/lib/jobs-data.json with real, current job postings from
// Indeed and LinkedIn, scraped via Apify.
//
// Usage:
//   npm run scrape-jobs
//
// Requires APIFY_API_TOKEN in .env.local (see .env.local.example). Get a
// token at https://console.apify.com/settings/integrations
//
// Cost: roughly $0.40-0.80 per full run (pay-per-result Apify actors,
// ~10 postings per role per source). Re-run this periodically to keep
// the pool fresh - nothing here is automatic or scheduled.

import { ApifyClient } from "apify-client";
import dotenv from "dotenv";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mapIndeedItem, mapLinkedInItem, dedupeAndNumber } from "./lib/normalize.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, "..");
const OUTPUT_PATH = path.join(PROJECT_ROOT, "src", "lib", "jobs-data.json");

dotenv.config({ path: path.join(PROJECT_ROOT, ".env.local") });

const ROLES = [
  "Data Engineer",
  "Data Analyst",
  "Software Engineer",
  "Data Scientist",
  "Machine Learning Engineer",
  "BI Analyst",
  "Analytics Engineer",
];

const LOCATION = "United States";
const RESULTS_PER_ROLE_PER_SOURCE = 10; // LinkedIn actor enforces a minimum of 10

const token = process.env.APIFY_API_TOKEN;
if (!token) {
  console.error(
    "Missing APIFY_API_TOKEN.\n" +
      "Add it to .env.local (copy .env.local.example) - get a token at\n" +
      "https://console.apify.com/settings/integrations"
  );
  process.exit(1);
}

const client = new ApifyClient({ token });

async function scrapeIndeed(role) {
  const run = await client.actor("misceres/indeed-scraper").call({
    position: role,
    location: LOCATION,
    country: "US",
    maxItemsPerSearch: RESULTS_PER_ROLE_PER_SOURCE,
  });
  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  return items.map(mapIndeedItem).filter(Boolean);
}

async function scrapeLinkedIn(role) {
  const searchUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(
    role
  )}&location=${encodeURIComponent(LOCATION)}`;
  const run = await client.actor("curious_coder/linkedin-jobs-scraper").call({
    urls: [searchUrl],
    count: RESULTS_PER_ROLE_PER_SOURCE,
    scrapeCompany: false,
  });
  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  return items.map(mapLinkedInItem).filter(Boolean);
}

async function main() {
  console.log(`Scraping ${ROLES.length} roles from Indeed + LinkedIn...\n`);
  const all = [];

  for (const role of ROLES) {
    console.log(`${role}:`);

    const [indeedJobs, linkedinJobs] = await Promise.all([
      scrapeIndeed(role).catch((err) => {
        console.error(`  Indeed failed: ${err.message}`);
        return [];
      }),
      scrapeLinkedIn(role).catch((err) => {
        console.error(`  LinkedIn failed: ${err.message}`);
        return [];
      }),
    ]);

    console.log(`  Indeed: ${indeedJobs.length}, LinkedIn: ${linkedinJobs.length}`);
    all.push(...indeedJobs, ...linkedinJobs);
  }

  const final = dedupeAndNumber(all);
  await fs.writeFile(OUTPUT_PATH, JSON.stringify(final, null, 2) + "\n");

  console.log(
    `\nDone. ${all.length} scraped -> ${final.length} unique postings written to\n` +
      path.relative(PROJECT_ROOT, OUTPUT_PATH)
  );
  console.log(`Generated at ${new Date().toISOString()}`);
}

main().catch((err) => {
  console.error("Scrape failed:", err);
  process.exit(1);
});

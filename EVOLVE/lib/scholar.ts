import * as cheerio from "cheerio";
import { getDynamicFaculty, getPublications, savePublications } from "./store";
import type { Faculty, Publication } from "./types";

function absoluteScholarUrl(href: string) {
  if (!href || href === "#") return "#";
  if (href.startsWith("http")) return href;
  return `https://scholar.google.com${href}`;
}

export async function fetchScholarPublications(member: Faculty): Promise<Publication[]> {
  const scholarUrl = `https://scholar.google.com/citations?user=${member.scholarUser}&hl=en&view_op=list_works&sortby=pubdate`;
  const response = await fetch(scholarUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5"
    },
    next: { revalidate: 0 }
  });

  if (!response.ok) {
    throw new Error(`Scholar returned ${response.status} for ${member.name}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const rows = $("#gsc_a_b .gsc_a_tr").slice(0, 8);
  const updatedAt = new Date().toISOString();

  return rows
    .map((index, row) => {
      const titleLink = $(row).find(".gsc_a_at");
      const title = titleLink.text().trim();
      const meta = $(row)
        .find(".gs_gray")
        .map((_, element) => $(element).text().trim())
        .get();
      const citations = Number.parseInt($(row).find(".gsc_a_ac").text().trim(), 10) || 0;
      const year = Number.parseInt($(row).find(".gsc_a_y span").text().trim(), 10) || new Date().getFullYear();

      return {
        id: `${member.id}-${member.scholarUser}-${index}`,
        facultyId: member.id,
        title,
        authors: meta[0] || "Authors unavailable",
        venue: meta[1] || "Venue unavailable",
        year,
        citations,
        url: absoluteScholarUrl(titleLink.attr("href") || "#"),
        updatedAt
      };
    })
    .get()
    .filter((publication) => publication.title.length > 0);
}

export async function syncScholarPublications() {
  const existing = await getPublications();
  const synced: Publication[] = [];
  const errors: string[] = [];

  const dynamicFaculty = await getDynamicFaculty();
  for (const member of dynamicFaculty) {
    try {
      const publications = await fetchScholarPublications(member);
      if (publications.length > 0) {
        synced.push(...publications);
      }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
      synced.push(...existing.filter((publication) => publication.facultyId === member.id));
    }
  }

  if (synced.length > 0) {
    await savePublications(synced);
  }

  return {
    synced: synced.length,
    errors,
    updatedAt: new Date().toISOString()
  };
}

import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const siteUrl = "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl },
    { url: `${siteUrl}/books` },
    ...db.books.map((book) => ({
      url: `${siteUrl}/books/${book.id}`,
    })),
  ];
}

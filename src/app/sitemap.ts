import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { collections } from "@/lib/data/collections";
import { posts } from "@/lib/data/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const pages = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/collections", priority: 0.9, changeFrequency: "weekly" },
    { path: "/new-arrivals", priority: 0.9, changeFrequency: "weekly" },
    { path: "/brands", priority: 0.8, changeFrequency: "monthly" },
    { path: "/showrooms", priority: 0.8, changeFrequency: "monthly" },
    { path: "/calculator", priority: 0.7, changeFrequency: "yearly" },
    { path: "/about", priority: 0.7, changeFrequency: "yearly" },
    { path: "/trade", priority: 0.7, changeFrequency: "monthly" },
    { path: "/journal", priority: 0.7, changeFrequency: "weekly" },
    { path: "/downloads", priority: 0.6, changeFrequency: "monthly" },
    { path: "/videos", priority: 0.6, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.6, changeFrequency: "yearly" },
  ] as const;

  const staticRoutes: MetadataRoute.Sitemap = pages.map((r) => ({
    url: `${site.url}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const collectionRoutes: MetadataRoute.Sitemap = collections.map((c) => ({
    url: `${site.url}/collections/${c.slug}`,
    lastModified: new Date(c.addedOn),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${site.url}/journal/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...collectionRoutes, ...postRoutes];
}

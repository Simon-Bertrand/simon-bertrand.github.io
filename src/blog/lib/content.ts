import { getCollection, type CollectionEntry } from 'astro:content';
import matter from 'gray-matter';
import { estimateReadingTime } from './reading-time';
import { withBase } from './site';

export type ContentEntry = CollectionEntry<'posts'> | CollectionEntry<'notes'>;

export function isPublished(entry: ContentEntry) {
  return !entry.data.draft;
}

export function sortByDateDesc<T extends { data: { date: Date } }>(entries: T[]) {
  return [...entries].sort((left, right) => right.data.date.getTime() - left.data.date.getTime());
}

export function sortEntriesByDateDesc<T extends { data: { date: Date } }>(entries: T[]) {
  return sortByDateDesc(entries);
}

export async function getPublishedPosts() {
  const entries = await getCollection('posts', isPublished);
  return sortByDateDesc(entries) as CollectionEntry<'posts'>[];
}

export async function getPublishedNotes() {
  const entries = await getCollection('notes', isPublished);
  return sortByDateDesc(entries) as CollectionEntry<'notes'>[];
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(date);
}

export function slugFromEntry(entry: ContentEntry) {
  return entry.slug;
}

export function entryHref(entry: ContentEntry) {
  return withBase(entry.collection === 'posts' ? `/posts/${entry.slug}/` : `/notes/${entry.slug}/`);
}

export function entryKind(entry: ContentEntry) {
  return entry.collection === 'posts' ? 'Article' : 'Note';
}

export function summarizeContent(body: string, maxLength = 160) {
  const stripped = body
    .replace(/^---[\s\S]*?---/, '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^\)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^\)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return stripped.length <= maxLength ? stripped : `${stripped.slice(0, maxLength - 1).trimEnd()}…`;
}

export function parseFrontmatter(content: string) {
  return matter(content);
}

export function readingStats(body: string) {
  return estimateReadingTime(body);
}

export function headingsFromHtml(body: string) {
  return [...body.matchAll(/<h([1-6])\b[^>]*\bid=["']([^"']+)["'][^>]*>([\s\S]*?)<\/h\1>/gi)].map((match) => ({
    depth: Number(match[1]),
    slug: match[2],
    text: match[3]
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim(),
  }));
}

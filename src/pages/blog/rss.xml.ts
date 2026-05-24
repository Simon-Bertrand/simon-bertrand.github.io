import rss from '@astrojs/rss';
import { getCollection, type CollectionEntry } from 'astro:content';
import { site, withBase } from '@/lib/site';

export async function GET(context: { site: URL }) {
  const [posts, notes] = await Promise.all([
    getCollection('posts', ({ data }: CollectionEntry<'posts'>) => !data.draft),
    getCollection('notes', ({ data }: CollectionEntry<'notes'>) => !data.draft),
  ]);
  const sorted = [...posts, ...notes].sort((left, right) => right.data.date.getTime() - left.data.date.getTime());

  return rss({
    title: site.title,
    description: site.description,
    site: context.site,
    items: sorted.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.date,
      link: withBase(entry.collection === 'posts' ? `/posts/${entry.slug}/` : `/notes/${entry.slug}/`),
    })),
  });
}

import { getCollection, type CollectionEntry } from 'astro:content';
import { withBase } from '@/lib/site';

type Redirect = {
  params: { alias: string };
  props: { destination: string };
};

function normalizeAlias(alias: string) {
  return alias.replace(/^\/+/, '').replace(/\/+$/, '');
}

export async function getStaticPaths() {
  const [posts, notes] = await Promise.all([
    getCollection('posts', ({ data }: CollectionEntry<'posts'>) => !data.draft),
    getCollection('notes', ({ data }: CollectionEntry<'notes'>) => !data.draft),
  ]);
  const redirects: Redirect[] = [];

  for (const entry of [...posts, ...notes]) {
    const destination = withBase(entry.collection === 'posts' ? `/posts/${entry.slug}/` : `/notes/${entry.slug}/`);
    for (const alias of entry.data.aliases) {
      redirects.push({
        params: { alias: normalizeAlias(alias) },
        props: { destination },
      });
    }
  }

  return redirects;
}

export function GET({ props }: { props: { destination: string } }) {
  return new Response(null, {
    status: 301,
    headers: {
      Location: props.destination,
    },
  });
}

import fs from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import matter from 'gray-matter';

const root = process.cwd();
const outputFile = path.join(root, 'public', 'blog', 'generated', 'search-index.json');
const siteBase = (process.env.SITE_BASE ?? '/blog').replace(/\/$/, '');

function withSiteBase(value: string) {
  if (!siteBase || /^(?:[a-z]+:)?\/\//i.test(value) || value.startsWith('mailto:') || value.startsWith('#')) {
    return value;
  }

  return `${siteBase}${value.startsWith('/') ? value : `/${value}`}`;
}

function stripMarkdown(markdown: string) {
  return markdown
    .replace(/^---[\s\S]*?---/, '')
    .replace(/^import\s.+$/gm, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^\)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^\)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function excerpt(text: string, maxLength = 220) {
  return text.length <= maxLength ? text : `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

export async function buildSearchIndex() {
  const files = await fg(['src/content/posts/**/*.{md,mdx}', 'src/content/notes/**/*.{md,mdx}'], {
    cwd: root,
    absolute: true,
  });

  const index = [] as Array<{
    title: string;
    description: string;
    slug: string;
    href: string;
    tags: string[];
    kind: 'post' | 'note';
    date: string;
    draft: boolean;
    text: string;
  }>;

  for (const file of files) {
    const raw = await fs.readFile(file, 'utf8');
    const { data, content } = matter(raw);
    const kind = file.includes('/posts/') ? 'post' : 'note';
    const slug = path.basename(file).replace(/\.(md|mdx)$/i, '');

    if (data.draft) {
      continue;
    }

    index.push({
      title: String(data.title ?? slug),
      description: String(data.description ?? ''),
      slug,
      href: withSiteBase(kind === 'post' ? `/posts/${slug}/` : `/notes/${slug}/`),
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      kind,
      date: data.date instanceof Date ? data.date.toISOString() : String(data.date ?? ''),
      draft: Boolean(data.draft),
      text: excerpt(stripMarkdown(`${String(data.title ?? '')} ${String(data.description ?? '')} ${content}`)),
    });
  }

  await fs.mkdir(path.dirname(outputFile), { recursive: true });
  await fs.writeFile(outputFile, JSON.stringify(index, null, 2), 'utf8');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await buildSearchIndex();
}

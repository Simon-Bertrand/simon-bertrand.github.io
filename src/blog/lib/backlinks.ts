import type { ContentEntry } from './content';

const wikilinkPattern = /\[\[([^\]]+)\]\]/g;
const markdownLinkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;

function normalizeTarget(target: string) {
  return target
    .split('#')[0]
    .split('?')[0]
    .replace(/^\.\//, '')
    .replace(/^\/+/, '')
    .replace(/\/index$/i, '')
    .replace(/\/$/, '');
}

function targetCandidates(slug: string) {
  const target = normalizeTarget(slug);
  return new Set([target, `posts/${target}`, `notes/${target}`]);
}

export function extractOutgoingLinks(body: string) {
  const links = new Set<string>();

  for (const match of body.matchAll(wikilinkPattern)) {
    links.add(normalizeTarget(match[1].trim()));
  }

  for (const match of body.matchAll(markdownLinkPattern)) {
    const target = match[2].trim();
    if (target.startsWith('http://') || target.startsWith('https://') || target.startsWith('mailto:')) {
      continue;
    }

    links.add(normalizeTarget(target));
  }

  return [...links];
}

export function findBacklinks(targetSlug: string, entries: ContentEntry[]) {
  const targets = targetCandidates(targetSlug);

  return entries.filter((entry) => {
    const outgoing = extractOutgoingLinks(entry.body);
    return outgoing.some((link) => targets.has(normalizeTarget(link)));
  });
}

import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import fg from 'fast-glob';
import matter from 'gray-matter';

type NotebookBlogMetadata = {
  title: string;
  description: string;
  date: string;
  updated?: string;
  draft?: boolean;
  tags?: string[];
  kind?: 'post' | 'note';
  slug?: string;
  source?: string;
  bibliography?: Array<{
    id: string;
    author: string;
    title: string;
    year: string;
    url?: string;
  }>;
  aliases?: string[];
  featured?: boolean;
};

type NotebookCell = {
    cell_type: 'markdown' | 'code' | 'raw';
    source?: string[] | string;
    metadata?: {
      tags?: string[];
    } & Record<string, unknown>;
    outputs?: Array<Record<string, unknown>>;
};

type NotebookFile = {
  metadata?: {
    blog?: NotebookBlogMetadata;
  };
  cells?: NotebookCell[];
};

type NotebookEntry = {
  notebookPath: string;
  source: string;
  metadata: NotebookBlogMetadata & { slug: string };
  kind: 'post' | 'note';
  slug: string;
  href: string;
  contentPath: string;
  mtimeMs: number;
  hash: string;
};

const root = process.cwd();
const generatedDir = path.join(root, 'public', 'blog', 'generated', 'notebooks');
const contentPostsDir = path.join(root, 'src', 'content', 'posts');
const contentNotesDir = path.join(root, 'src', 'content', 'notes');
const executeNotebooks = process.env.NOTEBOOK_EXECUTE === 'true';
const siteBase = (process.env.SITE_BASE ?? '/blog').replace(/\/$/, '');

function withSiteBase(value: string) {
  if (!siteBase || /^(?:[a-z]+:)?\/\//i.test(value) || value.startsWith('mailto:') || value.startsWith('#')) {
    return value;
  }

  return `${siteBase}${value.startsWith('/') ? value : `/${value}`}`;
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function assertMetadata(metadata: NotebookBlogMetadata, notebookPath: string) {
  const missing = ['title', 'description', 'date'].filter((key) => !metadata[key as keyof NotebookBlogMetadata]);
  if (missing.length > 0) {
    throw new Error(`${path.relative(root, notebookPath)} is missing metadata.blog fields: ${missing.join(', ')}`);
  }
}

async function hashFile(file: string) {
  const raw = await fs.readFile(file);
  return createHash('sha256').update(raw).digest('hex');
}

function contentDirForKind(kind: 'post' | 'note') {
  return kind === 'post' ? contentPostsDir : contentNotesDir;
}

function hrefForEntry(kind: 'post' | 'note', slug: string) {
  return withSiteBase(kind === 'post' ? `/posts/${slug}/` : `/notes/${slug}/`);
}

function frontmatter(entry: NotebookEntry) {
  const { metadata } = entry;
  const kind = metadata.kind ?? 'post';
  const slug = metadata.slug ?? toSlug(metadata.title);
  const lines = [
    '---',
    `title: ${JSON.stringify(metadata.title)}`,
    `description: ${JSON.stringify(metadata.description)}`,
    `date: ${metadata.date}`,
    metadata.updated ? `updated: ${metadata.updated}` : null,
    `draft: ${metadata.draft ?? false}`,
    `tags: ${JSON.stringify(metadata.tags ?? [])}`,
    'generated: true',
    `source: ${JSON.stringify(entry.source)}`,
    `notebook: ${JSON.stringify(path.basename(entry.source))}`,
    `sourceMtimeMs: ${JSON.stringify(entry.mtimeMs)}`,
    `sourceHash: ${JSON.stringify(entry.hash)}`,
    `generator: ${JSON.stringify(process.env.NOTEBOOK_FALLBACK_CONVERSION === 'true' ? 'ipynb-fallback' : 'quarto-html')}`,
    `bibliography: ${JSON.stringify(metadata.bibliography ?? [])}`,
    `aliases: ${JSON.stringify(metadata.aliases ?? [])}`,
    `featured: ${metadata.featured ?? false}`,
    '---',
    '',
  ].filter((line): line is string => line !== null);

  return { slug, kind, text: lines.join('\n') };
}

function normalizeMarkdownForQuarto(source: string) {
  let inDisplayMath = false;
  const lines = source.split(/(?<=\n)/).flatMap((line) => {
    const newline = line.endsWith('\r\n') ? '\r\n' : line.endsWith('\n') ? '\n' : '';
    const body = newline ? line.slice(0, -newline.length) : line;
    const trimmed = body.trim();

    if (trimmed === '$' || trimmed === '$$') {
      inDisplayMath = !inDisplayMath;
      return `${body.replace(/\${1,2}/, '$$$$')}${newline}`;
    }

    if (inDisplayMath && trimmed === '') {
      return [];
    }

    return line;
  });

  return lines.join('').replace(/\\\((.+?)\\\)/g, (_match, math: string) => `$${math}$`);
}

function normalizeNotebookForQuarto(raw: NotebookFile) {
  return {
    ...raw,
    cells: raw.cells?.map((cell) => {
      if (cell.cell_type !== 'markdown') {
        return cell;
      }

      const source = cellSource(cell.source);
      return {
        ...cell,
        source: normalizeMarkdownForQuarto(source).split(/(?<=\n)/),
      };
    }),
  };
}

async function prepareNotebookForQuarto(notebookPath: string, destinationPath: string) {
  const raw = JSON.parse(await fs.readFile(notebookPath, 'utf8')) as NotebookFile;
  const normalized = normalizeNotebookForQuarto(raw);
  await fs.writeFile(destinationPath, `${JSON.stringify(normalized, null, 2)}\n`, 'utf8');
}

async function renderNotebook(notebookPath: string) {
  const notebookName = path.basename(notebookPath, '.ipynb');
  const tempDir = path.join(root, '.tmp', 'quarto', notebookName);
  const preparedNotebookPath = path.join(tempDir, `${notebookName}.ipynb`);
  await fs.rm(tempDir, { recursive: true, force: true });
  await fs.mkdir(tempDir, { recursive: true });
  await prepareNotebookForQuarto(notebookPath, preparedNotebookPath);

  await new Promise<void>((resolve, reject) => {
    const child = spawn('quarto', ['render', preparedNotebookPath, '--to', 'html', '-M', 'html-math-method=mathml', executeNotebooks ? '--execute' : '--no-execute'], {
      stdio: 'inherit',
      cwd: root,
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Quarto failed for ${notebookPath} with exit code ${code ?? 'unknown'}`));
      }
    });

    child.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'ENOENT') {
        reject(new Error('Quarto CLI was not found. Install Quarto and ensure the `quarto` binary is on PATH before syncing notebooks.'));
        return;
      }

      reject(error);
    });
  });

  return tempDir;
}

async function findRenderedHtml(renderedDir: string, notebookPath: string) {
  const expected = path.join(renderedDir, `${path.basename(notebookPath, '.ipynb')}.html`);

  try {
    await fs.access(expected);
    return expected;
  } catch {
    const candidates = await fg(['**/*.html'], { cwd: renderedDir, absolute: true });
    if (candidates.length === 1) {
      return candidates[0];
    }

    throw new Error(`Unable to find deterministic Quarto HTML output for ${notebookPath}`);
  }
}

async function findArtifactDir(renderedDir: string, notebookPath: string) {
  const artifactName = `${path.basename(notebookPath, '.ipynb')}_files`;
  const expected = path.join(renderedDir, artifactName);

  try {
    await fs.access(expected);
    return expected;
  } catch {
    const candidates = await fg([`**/${artifactName}`], {
      cwd: renderedDir,
      absolute: true,
      onlyDirectories: true,
    });

    return candidates[0];
  }
}

function rewriteAssetReferences(markdown: string, notebookPath: string, slug: string) {
  const notebookName = path.basename(notebookPath, '.ipynb');
  return markdown.replaceAll(`${notebookName}_files/`, withSiteBase(`/generated/notebooks/${slug}/`));
}

function extractNotebookHtml(html: string) {
  const mainMatch = html.match(/<main\b[^>]*id=["']quarto-document-content["'][^>]*>([\s\S]*?)<\/main>/i);
  const body = mainMatch?.[1] ?? html;

  return body
    .replace(/<header\b[^>]*id=["']title-block-header["'][\s\S]*?<\/header>/i, '')
    .replace(/<button\b[^>]*class=["'][^"']*\bcode-copy-button\b[^"']*["'][\s\S]*?<\/button>/gi, '')
    .replace(/\sclass=["'](?:[^"']*\s)?code-with-copy(?:\s[^"']*)?["']/gi, '')
    .trim();
}

function withBlankLinkTargets(html: string) {
  return html.replace(/<a\b([^>]*)>/gi, (match, attrs: string) => {
    if (/\shref=["']#/i.test(attrs)) {
      return match;
    }

    const withTarget = /\starget=/i.test(attrs) ? attrs : `${attrs} target="_blank"`;
    const relValue = 'noopener noreferrer';
    const withRel = /\srel=/i.test(withTarget)
      ? withTarget.replace(/\srel=(["'])(.*?)\1/i, (_relMatch, quote: string, value: string) => {
          const parts = new Set(`${value} ${relValue}`.split(/\s+/).filter(Boolean));
          return ` rel=${quote}${[...parts].join(' ')}${quote}`;
        })
      : `${withTarget} rel="${relValue}"`;

    return `<a${withRel}>`;
  });
}

async function replaceWikilinks(markdown: string, knownSlugs: Map<string, string>) {
  return markdown.replace(/\[\[([^\]]+)\]\]/g, (_match, rawTarget) => {
    const [rawHref, rawLabel] = String(rawTarget).split('|');
    const target = rawHref.trim();
    const label = rawLabel?.trim() || target;
    const href = knownSlugs.get(target) ?? (target.startsWith('/') ? withSiteBase(target) : withSiteBase(`/notes/${target}/`));
    return `[${label}](${href})`;
  });
}

async function loadNotebookEntries() {
  const notebookPaths = (await fg(['blog/notebooks/**/*.ipynb'], { cwd: root, absolute: true })).sort();
  const entries: NotebookEntry[] = [];
  const seen = new Map<string, string>();

  for (const notebookPath of notebookPaths) {
    const raw = JSON.parse(await fs.readFile(notebookPath, 'utf8')) as NotebookFile;
    const metadata = raw.metadata?.blog;
    if (!metadata) {
      continue;
    }

    assertMetadata(metadata, notebookPath);

    const slug = metadata.slug ?? toSlug(metadata.title);
    const kind = metadata.kind ?? 'post';
    const duplicate = seen.get(slug);
    if (duplicate) {
      throw new Error(`Duplicate notebook slug "${slug}" in ${path.relative(root, notebookPath)} and ${duplicate}`);
    }

    seen.set(slug, path.relative(root, notebookPath));

    const source = path.relative(root, notebookPath);
    const stat = await fs.stat(notebookPath);
    const resolvedMetadata = { ...metadata, slug };

    entries.push({
      notebookPath,
      source,
      metadata: resolvedMetadata,
      kind,
      slug,
      href: hrefForEntry(kind, slug),
      contentPath: path.join(contentDirForKind(kind), `${slug}.md`),
      mtimeMs: stat.mtimeMs,
      hash: await hashFile(notebookPath),
    });
  }

  return entries;
}

async function cleanupStaleGeneratedContent(entries: NotebookEntry[]) {
  const expectedContentPaths = new Set(entries.map((entry) => path.normalize(entry.contentPath)));
  const expectedAssetDirs = new Set(entries.map((entry) => path.join(generatedDir, entry.slug)));
  const contentFiles = await fg(['src/content/posts/**/*.{md,mdx}', 'src/content/notes/**/*.{md,mdx}'], {
    cwd: root,
    absolute: true,
  });

  for (const file of contentFiles) {
    const raw = await fs.readFile(file, 'utf8');
    const { data } = matter(raw);
    if (data.generated !== true) {
      continue;
    }

    if (!expectedContentPaths.has(path.normalize(file))) {
      await fs.rm(file, { force: true });
    }
  }

  const assetDirs = await fg(['*'], {
    cwd: generatedDir,
    absolute: true,
    onlyDirectories: true,
  });

  for (const dir of assetDirs) {
    if (!expectedAssetDirs.has(path.normalize(dir))) {
      await fs.rm(dir, { recursive: true, force: true });
    }
  }
}

function cellSource(source: string[] | string | undefined) {
  return Array.isArray(source) ? source.join('') : source ?? '';
}

function shouldHideCode(source: string, metadata: NotebookCell['metadata'] = {}) {
  const tags = metadata.tags ?? [];
  return tags.includes('hide-code') || tags.includes('remove-input') || /^#\|\s*echo:\s*false/m.test(source);
}

function renderFallbackOutput(output: Record<string, unknown>) {
  const data = output.data as Record<string, unknown> | undefined;
  const text = output.text ?? data?.['text/plain'] ?? data?.['text/markdown'];
  if (!text) {
    return '';
  }

  const rendered = Array.isArray(text) ? text.join('') : String(text);
  return `\n\n\`\`\`text\n${rendered.trim()}\n\`\`\`\n`;
}

function renderNotebookFallbackMarkdown(raw: NotebookFile) {
  const parts: string[] = [];

  for (const cell of raw.cells ?? []) {
    const source = cellSource(cell.source);
    if (!source.trim()) {
      continue;
    }

    if (cell.cell_type === 'markdown') {
      parts.push(source.trimEnd());
      continue;
    }

    if (cell.cell_type === 'code') {
      if (!shouldHideCode(source, cell.metadata)) {
        parts.push(`\`\`\`python\n${source.trimEnd()}\n\`\`\``);
      }

      const outputs = (cell.outputs ?? []).map(renderFallbackOutput).filter(Boolean).join('\n');
      if (outputs) {
        parts.push(outputs.trimEnd());
      }
    }
  }

  return `${parts.join('\n\n')}\n`;
}

export async function runNotebookFallbackConversion() {
  process.env.NOTEBOOK_FALLBACK_CONVERSION = 'true';
  const entries = await loadNotebookEntries();

  await fs.mkdir(contentPostsDir, { recursive: true });
  await fs.mkdir(contentNotesDir, { recursive: true });
  await fs.mkdir(generatedDir, { recursive: true });
  await cleanupStaleGeneratedContent(entries);

  if (entries.length === 0) {
    return;
  }

  const notebookIndex = new Map<string, string>();
  for (const entry of entries) {
    notebookIndex.set(entry.slug, entry.href);
    for (const alias of entry.metadata.aliases ?? []) {
      notebookIndex.set(alias.replace(/^\//, '').replace(/\/$/, ''), entry.href);
    }
  }

  for (const entry of entries) {
    const raw = JSON.parse(await fs.readFile(entry.notebookPath, 'utf8')) as NotebookFile;
    const markdown = await replaceWikilinks(renderNotebookFallbackMarkdown(raw), notebookIndex);
    const { text: header } = frontmatter(entry);

    await fs.mkdir(path.dirname(entry.contentPath), { recursive: true });
    await fs.writeFile(entry.contentPath, `${header}${markdown}`, 'utf8');
    await fs.mkdir(path.join(generatedDir, entry.slug), { recursive: true });
  }
}

export async function runNotebookConversion() {
  process.env.NOTEBOOK_FALLBACK_CONVERSION = 'false';
  const entries = await loadNotebookEntries();

  await fs.mkdir(contentPostsDir, { recursive: true });
  await fs.mkdir(contentNotesDir, { recursive: true });
  await fs.mkdir(generatedDir, { recursive: true });

  await cleanupStaleGeneratedContent(entries);

  if (entries.length === 0) {
    return;
  }

  const notebookIndex = new Map<string, string>();
  for (const entry of entries) {
    notebookIndex.set(entry.slug, entry.href);
    for (const alias of entry.metadata.aliases ?? []) {
      notebookIndex.set(alias.replace(/^\//, '').replace(/\/$/, ''), entry.href);
    }
  }

  for (const entry of entries) {
    const renderedDir = await renderNotebook(entry.notebookPath);
    const htmlFile = await findRenderedHtml(renderedDir, entry.notebookPath);
    const html = await fs.readFile(htmlFile, 'utf8');
    const htmlWithAssets = rewriteAssetReferences(withBlankLinkTargets(extractNotebookHtml(html)), entry.notebookPath, entry.slug);
    const normalizedMarkdown = await replaceWikilinks(htmlWithAssets, notebookIndex);
    const { text: header } = frontmatter(entry);

    await fs.mkdir(path.dirname(entry.contentPath), { recursive: true });
    await fs.writeFile(entry.contentPath, `${header}${normalizedMarkdown}\n`, 'utf8');

    const artifactDir = await findArtifactDir(renderedDir, entry.notebookPath);
    const destinationDir = path.join(generatedDir, entry.slug);
    await fs.rm(destinationDir, { recursive: true, force: true });
    await fs.mkdir(path.dirname(destinationDir), { recursive: true });

    try {
      if (artifactDir) {
        await fs.cp(artifactDir, destinationDir, {
          recursive: true,
          filter: (source) => path.basename(source) !== 'libs' && !source.includes(`${path.sep}libs${path.sep}`),
        });
      } else {
        await fs.mkdir(destinationDir, { recursive: true });
      }
    } catch {
      await fs.mkdir(destinationDir, { recursive: true });
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await runNotebookConversion();
}

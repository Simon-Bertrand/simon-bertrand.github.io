import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dist = path.join(root, 'dist');
const host = process.env.HOST ?? '127.0.0.1';
const preferredPort = Number(process.env.PORT ?? 4321);
const pollMs = Number(process.env.WATCH_POLL_MS ?? 1000);
const debounceMs = Number(process.env.WATCH_DEBOUNCE_MS ?? 350);

const ignoredDirs = new Set([
  '.astro',
  '.git',
  '.quarto',
  '.tmp',
  'coverage',
  'dist',
  'node_modules',
]);

const watchedRoots = [
  'astro.config.mjs',
  'package.json',
  'postcss.config.js',
  'public',
  'scripts',
  'src',
  'tailwind.config.js',
  'tsconfig.json',
  'blog/notebooks',
];

const ignoredPathPrefixes = [
  'public/blog/generated',
  'src/content/posts',
  'src/content/notes',
];

const mimeTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.gif', 'image/gif'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.jpeg', 'image/jpeg'],
  ['.jpg', 'image/jpeg'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.pdf', 'application/pdf'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.webmanifest', 'application/manifest+json; charset=utf-8'],
  ['.xml', 'application/xml; charset=utf-8'],
]);

let lastSnapshot = '';
let buildRunning = false;
let rebuildQueued = false;
let debounceTimer;
let servedPort = preferredPort;

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = execFile(command, args, {
      cwd: root,
      env: {
        ...process.env,
        SITE_URL: process.env.SITE_URL ?? 'https://simon-bertrand.github.io',
        SITE_BASE: '/blog',
      },
    });

    child.stdout?.pipe(process.stdout);
    child.stderr?.pipe(process.stderr);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} ${args.join(' ')} exited with ${code ?? 'unknown'}`));
      }
    });
    child.on('error', reject);
  });
}

async function exists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

async function snapshotPath(relativePath) {
  if (ignoredPathPrefixes.some((prefix) => relativePath === prefix || relativePath.startsWith(`${prefix}${path.sep}`))) {
    return [];
  }

  const absolutePath = path.join(root, relativePath);
  if (!(await exists(absolutePath))) {
    return [];
  }

  const stat = await fs.stat(absolutePath);
  if (stat.isFile()) {
    return [`${relativePath}:${stat.mtimeMs}:${stat.size}`];
  }

  if (!stat.isDirectory()) {
    return [];
  }

  const entries = await fs.readdir(absolutePath, { withFileTypes: true });
  const rows = [];

  for (const entry of entries) {
    if (entry.name.endsWith('.Zone.Identifier') || entry.name.endsWith(':Zone.Identifier')) {
      continue;
    }

    const childRelativePath = path.join(relativePath, entry.name);
    if (entry.isDirectory() && ignoredDirs.has(entry.name)) {
      continue;
    }

    rows.push(...(await snapshotPath(childRelativePath)));
  }

  return rows;
}

async function createSnapshot() {
  const rows = [];
  for (const watchedRoot of watchedRoots) {
    rows.push(...(await snapshotPath(watchedRoot)));
  }

  return rows.sort().join('\n');
}

async function build(reason) {
  if (buildRunning) {
    rebuildQueued = true;
    return;
  }

  buildRunning = true;
  console.log(`\n[dev] Building static site (${reason})...`);

  try {
    await run('npm', ['run', 'build']);
    lastSnapshot = await createSnapshot();
    console.log('[dev] Build complete.');
  } catch (error) {
    console.error('[dev] Build failed; watching for the next change.');
    console.error(error instanceof Error ? error.message : error);
  } finally {
    buildRunning = false;
    if (rebuildQueued) {
      rebuildQueued = false;
      await build('queued change');
    }
  }
}

function scheduleBuild() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    void build('source change');
  }, debounceMs);
}

async function watch() {
  lastSnapshot = await createSnapshot();

  setInterval(async () => {
    if (buildRunning) {
      return;
    }

    try {
      const nextSnapshot = await createSnapshot();
      if (nextSnapshot !== lastSnapshot) {
        lastSnapshot = nextSnapshot;
        scheduleBuild();
      }
    } catch (error) {
      console.error('[dev] Watch scan failed.');
      console.error(error instanceof Error ? error.message : error);
    }
  }, pollMs);
}

function safeJoin(urlPath) {
  const decodedPath = decodeURIComponent(urlPath);
  const normalizedPath = path.normalize(decodedPath).replace(/^(\.\.[/\\])+/, '');
  return path.join(dist, normalizedPath);
}

async function fileForRequest(requestUrl = '/') {
  const url = new URL(requestUrl, `http://${host}:${servedPort}`);
  let filePath = safeJoin(url.pathname);

  try {
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }
  } catch {
    filePath = path.join(filePath, 'index.html');
  }

  if (!(await exists(filePath)) && !path.extname(url.pathname)) {
    filePath = path.join(safeJoin(url.pathname), 'index.html');
  }

  return filePath;
}

function listen(server, port) {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, () => {
      server.off('error', reject);
      resolve(port);
    });
  });
}

async function startServer() {
  const server = http.createServer(async (request, response) => {
    const filePath = await fileForRequest(request.url);

    if (!filePath.startsWith(dist) || !(await exists(filePath))) {
      response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      response.end('Not found');
      return;
    }

    const ext = path.extname(filePath);
    response.writeHead(200, {
      'cache-control': 'no-store',
      'content-type': mimeTypes.get(ext) ?? 'application/octet-stream',
    });
    response.end(await fs.readFile(filePath));
  });

  for (let nextPort = preferredPort; nextPort < preferredPort + 20; nextPort += 1) {
    try {
      servedPort = await listen(server, nextPort);
      console.log(`[dev] Serving dist at http://${host}:${servedPort}/ and http://${host}:${servedPort}/blog/`);
      break;
    } catch (error) {
      if (error?.code !== 'EADDRINUSE') {
        throw error;
      }

      console.warn(`[dev] Port ${nextPort} is already in use, trying ${nextPort + 1}.`);
    }
  }

  process.on('SIGINT', () => {
    server.close();
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    server.close();
    process.exit(0);
  });
}

await build('startup');
await startServer();
await watch();

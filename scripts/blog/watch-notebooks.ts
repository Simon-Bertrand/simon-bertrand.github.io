import fs from 'node:fs/promises';
import fg from 'fast-glob';
import { syncNotebookContent } from './notebook-sync.js';

type Snapshot = Map<string, string>;

const root = process.cwd();
const intervalMs = Number.parseInt(process.env.NOTEBOOK_WATCH_INTERVAL_MS ?? '1000', 10);
const optionalQuarto = process.env.NOTEBOOK_SYNC_OPTIONAL === 'true';
const watchPatterns = ['notebooks/**/*.ipynb', 'notebooks/**/*.yml', 'notebooks/**/*.yaml', 'quarto.yml', '_quarto.yml'];

async function snapshotFiles() {
  const files = await fg(watchPatterns, {
    cwd: root,
    absolute: true,
    ignore: ['**/.ipynb_checkpoints/**'],
  });
  const snapshot: Snapshot = new Map();

  for (const file of files.sort()) {
    const stat = await fs.stat(file);
    snapshot.set(file, `${stat.mtimeMs}:${stat.size}`);
  }

  return snapshot;
}

function changed(previous: Snapshot, next: Snapshot) {
  if (previous.size !== next.size) {
    return true;
  }

  for (const [file, signature] of next) {
    if (previous.get(file) !== signature) {
      return true;
    }
  }

  return false;
}

export async function startNotebookWatcher() {
  let current = await snapshotFiles();
  let running = false;
  let pending = false;
  let stopped = false;

  async function sync(reason: string) {
    if (running) {
      pending = true;
      return;
    }

    running = true;
    try {
      await syncNotebookContent({ optionalQuarto, reason });
    } finally {
      running = false;
      if (pending && !stopped) {
        pending = false;
        await sync('queued notebook change');
      }
    }
  }

  console.info(`[notebooks] Watching ${watchPatterns.join(', ')} every ${intervalMs}ms.`);

  const timer = setInterval(async () => {
    try {
      const next = await snapshotFiles();
      if (!changed(current, next)) {
        return;
      }

      current = next;
      await sync('notebook change');
    } catch (error) {
      console.error(error);
    }
  }, intervalMs);

  return {
    stop() {
      stopped = true;
      clearInterval(timer);
    },
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await syncNotebookContent({ optionalQuarto, reason: 'initial watch sync' });
  await startNotebookWatcher();
}

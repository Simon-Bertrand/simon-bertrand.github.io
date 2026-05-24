import { spawn } from 'node:child_process';
import { startNotebookWatcher } from './watch-notebooks.js';
import { syncNotebookContent } from './notebook-sync.js';

process.env.NOTEBOOK_SYNC_OPTIONAL ??= 'true';

await syncNotebookContent({ optionalQuarto: true, reason: 'dev startup' });
const watcher = await startNotebookWatcher();

const astro = spawn('astro', ['dev', ...process.argv.slice(2)], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

function shutdown(signal?: NodeJS.Signals) {
  watcher.stop();
  if (!astro.killed) {
    astro.kill(signal);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

astro.on('exit', (code, signal) => {
  watcher.stop();
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});

astro.on('error', (error) => {
  watcher.stop();
  console.error(error);
  process.exit(1);
});

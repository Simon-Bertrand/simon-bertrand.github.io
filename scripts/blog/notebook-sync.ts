import { runNotebookConversion, runNotebookFallbackConversion } from './convert-notebooks.js';
import { buildSearchIndex } from './build-search-index.js';

type SyncOptions = {
  optionalQuarto?: boolean;
  reason?: string;
};

function isMissingQuarto(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes('Quarto CLI was not found');
}

export async function syncNotebookContent({ optionalQuarto = false, reason = 'manual sync' }: SyncOptions = {}) {
  try {
    console.info(`[notebooks] Syncing content (${reason})...`);
    await runNotebookConversion();
    await buildSearchIndex();
    console.info('[notebooks] Sync complete.');
  } catch (error) {
    if (!optionalQuarto || !isMissingQuarto(error)) {
      throw error;
    }

    console.warn('[notebooks] Quarto CLI was not found; using fallback ipynb preview conversion.');
    console.warn('[notebooks] Install Quarto and run `npm run sync:content` for production-grade notebook conversion.');
    await runNotebookFallbackConversion();
    await buildSearchIndex();
  }
}

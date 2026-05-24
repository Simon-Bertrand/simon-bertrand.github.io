import { syncNotebookContent } from './notebook-sync.js';

await syncNotebookContent({
  optionalQuarto: process.env.NOTEBOOK_SYNC_OPTIONAL === 'true',
  reason: 'sync command',
});

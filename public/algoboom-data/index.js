// Generated helper: server-side Node/Next.js usage.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const dataDir = dirname(fileURLToPath(import.meta.url));
export const datasets = ['company-problems', 'algorithms', 'coding-patterns'];
export function loadDataset(name) { if (!datasets.includes(name)) throw new Error('Unknown AlgoBoom dataset: ' + name); return JSON.parse(readFileSync(join(dataDir, name + '.json'), 'utf8')); }
export function loadDetail(detailPath) { if (!detailPath || detailPath.includes('..')) throw new Error('Invalid detail path'); return JSON.parse(readFileSync(join(dataDir, detailPath), 'utf8')); }
export { dataDir };

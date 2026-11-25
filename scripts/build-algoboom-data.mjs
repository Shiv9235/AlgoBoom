#!/usr/bin/env node
/**
 * Build lightweight AlgoBoom datasets from the local DSA repositories.
 * Run: node scripts/build-algoboom-data.mjs [source-root] [output-dir]
 */
import { readdir, readFile, rm, mkdir, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = process.argv[2] || '/Users/shivrajupadhyay/Downloads/DSA - Practice';
const out = process.argv[3] || join(here, '..', 'algoboom-data');
const repos = {
  company: join(root, 'CompanyWiseDSA'), hello: join(root, 'Algorithms'),
  visualizer: join(root, 'AlgoVisualizer'), java: join(root, 'AlgorithmsJAVA'),
  patterns: join(root, 'CodingPatternsForInterviews'),
};
const SKIP = new Set(['.git', 'node_modules', 'dist', 'build', 'coverage', 'vendor', '.next']);
const titleCase = (s) => s.replace(/[_-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).trim();
const clean = (s = '') => s.replace(/<[^>]*>/g, '').replace(/[`*_#]/g, '').replace(/\s+/g, ' ').trim();
const slug = (s = '') => clean(s).toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'untitled';
const json = (value) => JSON.stringify(value, null, 2) + '\n';
async function walk(dir, allowed, found = []) {
  let entries = []; try { entries = await readdir(dir, { withFileTypes: true }); } catch { return found; }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) { if (!SKIP.has(entry.name)) await walk(full, allowed, found); }
    else if (allowed.has(extname(entry.name).toLowerCase())) found.push(full);
  }
  return found;
}
async function text(path) { try { return await readFile(path, 'utf8'); } catch { return ''; } }
async function save(path, value) { await mkdir(dirname(path), { recursive: true }); await writeFile(path, json(value)); }
function csvLine(line) { const cells = []; let value = '', quoted = false; for (let i = 0; i < line.length; i++) { const c = line[i]; if (c === '"') { if (quoted && line[i + 1] === '"') { value += c; i++; } else quoted = !quoted; } else if (c === ',' && !quoted) { cells.push(value.trim()); value = ''; } else value += c; } cells.push(value.trim()); return cells; }
function timeframe(name) { const n = name.toLowerCase(); return n.includes('thirty') ? '30-days' : n.includes('three') ? '3-months' : n.includes('six') && !n.includes('more') ? '6-months' : n.includes('more') ? 'more-than-6-months' : 'all'; }
async function companyData() {
  const files = await walk(repos.company, new Set(['.csv'])); const problems = new Map(); const companies = new Set();
  for (const file of files) {
    const company = basename(dirname(file)); companies.add(company); const lines = (await text(file)).split(/\r?\n/).filter(Boolean); const headers = csvLine(lines.shift() || '').map(x => x.toLowerCase());
    for (const line of lines) { const row = csvLine(line); const get = (name) => row[headers.indexOf(name)] || ''; const title = clean(get('title')); const url = get('link').trim(); if (!title) continue;
      const key = url || slug(title); const record = problems.get(key) || { id: (url.match(/problems\/([^/]+)/)?.[1]) || slug(title), slug: (url.match(/problems\/([^/]+)/)?.[1]) || slug(title), title, difficulty: titleCase(get('difficulty').toLowerCase()), leetcodeUrl: url || null, topics: get('topics').split(',').map(clean).filter(Boolean), companies: [] };
      const item = { name: company, frequency: Number(get('frequency')) || null, timeframe: timeframe(basename(file)) }; const existing = record.companies.find(x => x.name === company && x.timeframe === item.timeframe); if (!existing) record.companies.push(item); problems.set(key, record);
    }
  }
  return { companies: [...companies].sort(), problems: [...problems.values()].sort((a, b) => a.title.localeCompare(b.title)) };
}
function markdownTitle(body, fallback) { return clean((body.match(/^\s{0,3}#\s+(.+)$/m) || [])[1] || fallback); }
async function buildContentIndex() {
  const records = [], details = [];
  const add = (source, category, title, file, body, extra = {}) => { const id = `${source}:${slug(relative(repos[source] || root, file))}`; const s = slug(title); const detailPath = `details/${source}/${slug(relative(repos[source] || root, file))}.json`; records.push({ id, slug: s, title, source, category, detailPath, ...extra }); details.push([detailPath, { id, slug: s, title, source, category, sourcePath: relative(root, file), content: body }]); };
  for (const file of await walk(join(repos.hello, 'en', 'docs'), new Set(['.md']))) { const body = await text(file); const rel = relative(join(repos.hello, 'en', 'docs'), file); add('hello', rel.split('/')[0].replace(/^chapter_/, ''), markdownTitle(body, basename(file, '.md')), file, body); }
  for (const file of await walk(join(repos.java, 'src', 'main', 'java'), new Set(['.java']))) { const body = await text(file); const rel = relative(join(repos.java, 'src', 'main', 'java'), file); add('java', dirname(rel).replaceAll('/', ' / '), titleCase(basename(file, '.java')), file, body, { language: 'java' }); }
  for (const file of await walk(repos.patterns, new Set(['.md']))) { if (basename(file).toLowerCase() === 'readme.md') continue; const body = await text(file); const title = markdownTitle(body, basename(file, '.md').replace(/^✅|🙃/g, '')); add('patterns', 'interview-pattern', title, file, body); }
  // This checkout is an editor shell; include its own useful modules, excluding styling and skeletons.
  for (const file of await walk(join(repos.visualizer, 'src'), new Set(['.js', '.jsx']))) { const rel = relative(join(repos.visualizer, 'src'), file); if (rel.includes('skeletons/') || rel.includes('stylesheet')) continue; const body = await text(file); add('visualizer', dirname(rel).replaceAll('/', ' / '), titleCase(basename(file, extname(file))), file, body, { language: extname(file).slice(1) }); }
  return { records, details };
}
async function main() {
  await rm(out, { recursive: true, force: true }); await mkdir(out, { recursive: true });
  const company = await companyData(); const { records, details } = await buildContentIndex();
  const algorithms = records.filter(x => ['hello', 'java', 'visualizer'].includes(x.source)); const patterns = records.filter(x => x.source === 'patterns');
  await save(join(out, 'company-problems.json'), company); await save(join(out, 'algorithms.json'), { algorithms }); await save(join(out, 'coding-patterns.json'), { patterns });
  for (const [path, detail] of details) await save(join(out, path), detail);
  await writeFile(join(out, 'index.js'), `// Generated helper: server-side Node/Next.js usage.\nimport { readFileSync } from 'node:fs';\nimport { join, dirname } from 'node:path';\nimport { fileURLToPath } from 'node:url';\nconst dataDir = dirname(fileURLToPath(import.meta.url));\nexport const datasets = ['company-problems', 'algorithms', 'coding-patterns'];\nexport function loadDataset(name) { if (!datasets.includes(name)) throw new Error('Unknown AlgoBoom dataset: ' + name); return JSON.parse(readFileSync(join(dataDir, name + '.json'), 'utf8')); }\nexport function loadDetail(detailPath) { if (!detailPath || detailPath.includes('..')) throw new Error('Invalid detail path'); return JSON.parse(readFileSync(join(dataDir, detailPath), 'utf8')); }\nexport { dataDir };\n`);
  const manifest = { generatedAt: new Date().toISOString(), sourceRoot: root, counts: { companies: company.companies.length, companyProblems: company.problems.length, algorithms: algorithms.length, patterns: patterns.length, details: details.length }, files: ['company-problems.json', 'algorithms.json', 'coding-patterns.json', 'index.js'] };
  await save(join(out, 'manifest.json'), manifest); console.log(json(manifest));
}
main().catch(error => { console.error(error); process.exitCode = 1; });

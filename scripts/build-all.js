#!/usr/bin/env node
import { readdirSync, statSync, cpSync, mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = dirname(__dirname);
const appsDir = join(root, 'apps');
const docsDir = join(root, 'docs');
const appsDocsDir = join(docsDir, 'apps');

mkdirSync(docsDir, { recursive: true });
mkdirSync(appsDocsDir, { recursive: true });

const apps = readdirSync(appsDir).filter(app =>
  statSync(join(appsDir, app)).isDirectory()
);

for (const app of apps) {
  const appPath = join(appsDir, app);
  const outDir = join(appsDocsDir, app);
  mkdirSync(outDir, { recursive: true });
  if (existsSync(join(appPath, 'src'))) {
    console.log(`Building ${app} with Vite...`);
    execSync('vite build', { stdio: 'inherit', cwd: root, env: { ...process.env, APP: app } });
  } else {
    console.log(`Copying static ${app}...`);
    cpSync(appPath, outDir, { recursive: true });
  }
}

cpSync(join(root, 'index.html'), join(docsDir, 'index.html'));
cpSync(join(root, 'app-index.html'), join(docsDir, 'app-index.html'));
cpSync(join(root, 'app-index.html'), join(appsDocsDir, 'index.html'));
const appIndexCsv = readFileSync(join(root, 'app-index.csv'), 'utf8');
const normalizedIndexCsv = appIndexCsv
  .split(/\r?\n/)
  .map((line, index) => {
    if (!line.trim() || index === 0) {
      return line;
    }
    const lastComma = line.lastIndexOf(',');
    if (lastComma === -1) {
      return line;
    }
    const prefix = line.slice(0, lastComma + 1);
    const path = line.slice(lastComma + 1);
    const normalizedPath = path.startsWith('apps/') ? path.slice('apps/'.length) : path;
    return `${prefix}${normalizedPath}`;
  })
  .join('\n');
writeFileSync(join(appsDocsDir, 'app-index.csv'), normalizedIndexCsv);
writeFileSync(join(docsDir, 'app-index.csv'), appIndexCsv);
cpSync(join(root, 'pics'), join(docsDir, 'pics'), { recursive: true });
cpSync(join(root, 'common.css'), join(docsDir, 'common.css'));
cpSync(join(root, 'pics'), join(appsDocsDir, 'pics'), { recursive: true });
cpSync(join(root, 'common.css'), join(appsDocsDir, 'common.css'));

#!/usr/bin/env node
import { readdirSync, statSync, cpSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = dirname(__dirname);
const appsDir = join(root, 'apps');
const docsDir = join(root, 'docs');

mkdirSync(docsDir, { recursive: true });

const apps = readdirSync(appsDir).filter(app =>
  statSync(join(appsDir, app)).isDirectory()
);

for (const app of apps) {
  const appPath = join(appsDir, app);
  const outDir = join(docsDir, 'apps', app);
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
cpSync(join(root, 'app-index.csv'), join(docsDir, 'app-index.csv'));
cpSync(join(root, 'pics'), join(docsDir, 'pics'), { recursive: true });
cpSync(join(root, 'common.css'), join(docsDir, 'common.css'));


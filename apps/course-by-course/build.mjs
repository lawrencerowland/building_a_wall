// Keep the app directly openable from disk while testing its same source model.
import { readFileSync, writeFileSync } from 'node:fs';
const here = new URL('./', import.meta.url);
const model = readFileSync(new URL('model.mjs', here), 'utf8').replace(/^export /gm, '');
const app = readFileSync(new URL('app.mjs', here), 'utf8').replace(/^import .*?;\n/, '');
const target = new URL('index.html', here);
const html = readFileSync(target, 'utf8');
const bundled = `<!-- COURSE-BUNDLE-START -->\n<script>\n(()=>{\n${model}\n${app}\n})();\n</script>\n<!-- COURSE-BUNDLE-END -->`;
writeFileSync(target, html.replace(/<!-- COURSE-BUNDLE-START -->[\s\S]*?<!-- COURSE-BUNDLE-END -->/, bundled));

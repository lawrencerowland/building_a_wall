// Keep the published teaching essay usable as a local HTML file too.
// The maintained JS modules remain testable; this deterministic bundle has no imports.
import {readFileSync,writeFileSync} from 'node:fs';
const base=new URL('../apps/wall-roof-wiring-smc/',import.meta.url);
const model=readFileSync(new URL('model.mjs',base),'utf8').replace(/^export /gm,'');
const ui=readFileSync(new URL('app.mjs',base),'utf8').replace(/^import[^\n]+\n/,'');
const script=`<script>\n(()=>{\n${model}\n${ui}\n})();\n</script>`;
const path=new URL('index.html',base);
const html=readFileSync(path,'utf8');
const pattern=/<!-- WIRING-BUNDLE-START -->[\s\S]*?<!-- WIRING-BUNDLE-END -->/;
if(!pattern.test(html))throw new Error('Essay bundle markers missing');
writeFileSync(path,html.replace(pattern,`<!-- WIRING-BUNDLE-START -->${script}<!-- WIRING-BUNDLE-END -->`));

/** Refresh the inline bundle so index.html also works when opened as a local file. */
import {readFileSync,writeFileSync} from 'node:fs';
const read=name=>readFileSync(new URL(name,import.meta.url),'utf8');
const start='<!-- ALGEBRA-BUNDLE-START -->',end='<!-- ALGEBRA-BUNDLE-END -->';
const original=read('index.html');
if(original.split(start).length!==2||original.split(end).length!==2)throw Error('Expected exactly one algebra bundle region.');
const model=read('model.mjs').replace(/^export /gm,'');
const app=read('app.mjs').replace(/^import .*?;\n/,'');
const script=`(()=>{\n${model}\n${app}\n})();`;
if(/<\/script/i.test(script))throw Error('Unexpected closing script tag in source.');
const result=original.split(start)[0]+`${start}\n<script>\n${script}\n</script>\n${end}`+original.split(end)[1];
writeFileSync(new URL('index.html',import.meta.url),result);

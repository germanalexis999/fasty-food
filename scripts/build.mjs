import {cp,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
await import('./check.mjs');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
await mkdir(path.join(root,'dist'),{recursive:true});
await cp(path.join(root,'public'),path.join(root,'dist'),{recursive:true});
console.log('Web lista para Cloudflare Pages en dist/.');

import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createInterface} from 'node:readline/promises';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const input=createInterface({input:process.stdin,output:process.stdout});
try{
 const projectId=(process.argv[2]||await input.question('ID público del proyecto Sanity: ')).trim();
 if(!/^[a-z0-9]+$/.test(projectId))throw new Error('El ID de proyecto no es válido.');
 const dataset=(process.argv[3]||'production').trim();if(!/^[a-z0-9_-]+$/.test(dataset))throw new Error('Dataset inválido.');
 const studioUrl=(process.argv[4]||await input.question('Dirección del panel publicado (https://...sanity.studio): ')).trim();
 const parsed=new URL(studioUrl);if(parsed.protocol!=='https:'||!parsed.hostname.endsWith('.sanity.studio'))throw new Error('Usá la dirección HTTPS de tu panel Sanity Studio.');
 const config={projectId,dataset,apiVersion:'2026-11-06',studioUrl};
 await writeFile(path.join(root,'public/config.json'),JSON.stringify(config,null,2)+'\n');
 await writeFile(path.join(root,'studio/.env'),`SANITY_STUDIO_PROJECT_ID=${projectId}\nSANITY_STUDIO_DATASET=${dataset}\nSANITY_STUDIO_HOST=${parsed.hostname.replace(/\.sanity\.studio$/,'')}\n`);
 console.log('Configuración guardada. Importá el contenido inicial y volvé a ejecutar npm run build. No se guardaron claves ni contraseñas.');
}finally{input.close();}

// Ejecutar una sola vez: npx sanity exec import-content.mjs --with-user-token
import {getCliClient} from 'sanity/cli';
import {readFile} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const publicDir=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../public');
const content=JSON.parse(await readFile(path.join(publicDir,'content.json'),'utf8'));
const client=getCliClient({apiVersion:'2026-11-06'});
const uploaded=new Map();
async function asset(file,type){
 if(!file)return undefined;
 if(!uploaded.has(file))uploaded.set(file,(await client.assets.upload(type,createReadStream(path.join(publicDir,file)),{filename:path.basename(file)}))._id);
 return {asset:{_type:'reference',_ref:uploaded.get(file)},_type:type};
}
await client.createIfNotExists({_id:'site-settings',_type:'settings',...content.settings});
for(const c of content.categories){const {id,image,...rest}=c;await client.createIfNotExists({_id:id,_type:'category',...rest,image:await asset(image,'image')});}
for(const p of content.products){const {id,category,video,...rest}=p;await client.createIfNotExists({_id:id,_type:'product',...rest,category:{_type:'reference',_ref:category},video:await asset(video,'file')});}
for(const p of content.promotions){const {id,category,image,...rest}=p;await client.createIfNotExists({_id:id,_type:'promotion',...rest,category:{_type:'reference',_ref:category},image:await asset(image,'image')});}
for(const v of content.videos){const {id,src,poster,...rest}=v;await client.createIfNotExists({_id:id,_type:'video',...rest,file:await asset(src,'file'),poster:await asset(poster,'image')});}
console.log('Menú inicial importado. Los documentos existentes se conservaron sin sobrescribir tus cambios.');

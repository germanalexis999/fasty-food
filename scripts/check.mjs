import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../public');
const data=JSON.parse(await readFile(path.join(root,'content.json'),'utf8'));
const all=[...data.categories,...data.products,...data.promotions,...data.videos];
assert.equal(new Set(all.map(x=>x.id)).size,all.length,'IDs duplicados');
for(const p of data.products){assert(Number.isInteger(p.price)&&p.price>0,`Precio inválido: ${p.name}`);assert(data.categories.some(c=>c.id===p.category),`Categoría inexistente: ${p.name}`);}
for(const item of all)for(const field of ['image','video','src','poster'])if(item[field]&&!item[field].startsWith('https://')){const info=await stat(path.join(root,item[field]));assert(info.size>0);assert(info.size<25*1024*1024,'Archivo excede límite de Pages');}
const expected={'burgers-simple-jr':9000,'burgers-smash-doble':18000,'burgers-mega-cuadruple':26000,'panchos-mexicano':13500,'panchos-super-pancho-fasty':2500,'papas-bandeja-familiar':12500,'milkshakes-milkshake-de-chocolate':6000,'smoothies-smoothie-de-frutilla':5000,'cajita-cajita-fasty':12000};
for(const [id,price]of Object.entries(expected))assert.equal(data.products.find(p=>p.id===id)?.price,price,`Precio no coincide con menú: ${id}`);
assert.match(data.settings.whatsapp,/^549\d{10}$/);
console.log(`Contenido verificado: ${data.products.length} productos, ${data.promotions.length} promociones, ${data.videos.length} videos. Archivos y precios de referencia correctos.`);

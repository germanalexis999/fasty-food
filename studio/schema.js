import {defineType,defineField} from 'sanity';

const field=(name,title,type,extra={})=>defineField({name,title,type,...extra});
const order=()=>field('order','Orden en el menú','number',{initialValue:0,validation:R=>R.required().integer().min(0)});
const visible=()=>field('visible','Mostrar en la web','boolean',{initialValue:true});
const price=()=>field('price','Precio en pesos argentinos','number',{description:'Ingresá el importe sin puntos ni signo $. Ejemplo: 18000.',validation:R=>R.required().integer().positive()});
const category=()=>field('category','Categoría','reference',{to:[{type:'category'}],validation:R=>R.required()});
const photo=(name='image',title='Imagen')=>field(name,title,'image',{options:{hotspot:true},fields:[field('alt','Descripción de la imagen','string')]});
const video=(name='video',title='Video (opcional)')=>field(name,title,'file',{options:{accept:'video/mp4,video/webm'},description:'Para celular: preferí un video corto, MP4, de menos de 10 MB. Si el precio está escrito en el video, hay que reemplazar el archivo cuando cambie.'});

export const schemaTypes=[
 defineType({name:'category',title:'Categoría',type:'document',fields:[field('name','Nombre','string',{validation:R=>R.required()}),field('description','Aclaración de la categoría','string'),photo(),order()],preview:{select:{title:'name',media:'image'}},orderings:[{title:'Orden del menú',name:'menuOrder',by:[{field:'order',direction:'asc'}]}]}),
 defineType({name:'product',title:'Producto',type:'document',groups:[{name:'general',title:'Producto',default:true},{name:'media',title:'Foto y video'},{name:'visibility',title:'Disponibilidad y orden'}],fields:[
  field('name','Nombre del producto','string',{group:'general',validation:R=>R.required()}),
  {...category(),group:'general'},
  {...price(),group:'general'},
  field('description','Ingredientes o descripción','text',{rows:3,group:'general'}),
  field('group','Familia dentro de la categoría','string',{description:'Por ejemplo: Clásicas, Smash, Gratinados o Súper panchos.',group:'general'}),
  field('includes','Qué incluye','string',{description:'Ejemplo: Incluye papas medianas.',group:'general'}),
  {...photo(),group:'media'}, {...video(),group:'media'},
  field('available','Disponible para pedir','boolean',{initialValue:true,description:'Desactivá para mostrarlo como AGOTADO sin eliminarlo.',group:'visibility'}),
  {...visible(),group:'visibility'},
  {...order(),group:'visibility'},
 ],preview:{select:{title:'name',price:'price',available:'available',visible:'visible'},prepare:s=>({title:s.title,subtitle:`$ ${Number(s.price||0).toLocaleString('es-AR')}${s.visible===false?' · Oculto':s.available===false?' · Agotado':''}`})},orderings:[{title:'Orden del menú',name:'menuOrder',by:[{field:'order',direction:'asc'}]}]}),
 defineType({name:'promotion',title:'Promoción',type:'document',fields:[
  field('title','Título','string',{validation:R=>R.required()}),field('subtitle','Sabores y condiciones','text',{rows:3,description:'Aclaraciones visibles para el cliente.'}),
  field('quantity','Cantidad incluida','number',{initialValue:2,validation:R=>R.required().integer().positive()}),{...price(),description:'Precio TOTAL de la promoción. Por ejemplo, 8000 para 2 por $8.000.'},photo(),category(),visible(),order(),
 ],preview:{select:{title:'title',quantity:'quantity',price:'price',media:'image'},prepare:s=>({title:s.title,subtitle:`${s.quantity} por $ ${Number(s.price||0).toLocaleString('es-AR')}`,media:s.media})}}),
 defineType({name:'video',title:'Publicidad en video',type:'document',fields:[field('title','Título','string',{validation:R=>R.required()}),{...video('file','Archivo de video'),validation:R=>R.required()},photo('poster','Portada del video'),visible(),order()],preview:{select:{title:'title',media:'poster'}}}),
 defineType({name:'settings',title:'Datos del local',type:'document',fields:[
  field('name','Nombre del local','string',{validation:R=>R.required()}),field('tagline','Bajada de marca','string'),
  field('whatsapp','WhatsApp internacional','string',{description:'Solo números. Argentina: 549 + código de área + número, sin 15. Ejemplo: 5491123337893.',validation:R=>R.required().regex(/^\d{10,15}$/,{name:'número internacional sin espacios'})}),
  field('phoneDisplay','Teléfono para mostrar','string'),field('address','Dirección (opcional)','string'),field('hours','Horarios (opcional)','text',{rows:2}),field('mapsUrl','Enlace de Google Maps (opcional)','url'),field('instagramUrl','Instagram (opcional)','url'),
  field('heroTitle','Título de la portada','text',{rows:2,description:'Usá un salto de línea para separar las dos líneas.'}),field('heroSubtitle','Texto de presentación','text',{rows:3}),photo('heroImage','Foto de la portada (opcional)'),photo('logo','Logo (opcional)'),
 ]}),
];

export function structure(S){return S.list().title('FastyFood').items([
 S.listItem().title('Productos y precios').child(S.documentTypeList('product').title('Productos y precios').defaultOrdering([{field:'order',direction:'asc'}])),
 S.listItem().title('Promociones').child(S.documentTypeList('promotion').title('Promociones').defaultOrdering([{field:'order',direction:'asc'}])),
 S.listItem().title('Publicidades en video').child(S.documentTypeList('video').title('Publicidades en video').defaultOrdering([{field:'order',direction:'asc'}])),
 S.divider(),S.listItem().title('Categorías').child(S.documentTypeList('category').title('Categorías').defaultOrdering([{field:'order',direction:'asc'}])),
 S.listItem().title('Datos del local').child(S.document().schemaType('settings').documentId('site-settings').title('Datos del local')),
]);}

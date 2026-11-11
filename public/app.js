import {loadContent} from './content-source.js';

const $=s=>document.querySelector(s);
const money=new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0});
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalize=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const safeUrl=value=>{try{const u=new URL(value,location.href);return ['http:','https:'].includes(u.protocol)?u.href:'';}catch{return '';}};
let content,activeCategory='burgers',search='',lastFocus;

function whatsapp(message='¡Hola FastyFood! Quería hacer una consulta.'){return `https://wa.me/${content.settings.whatsapp.replace(/\D/g,'')}?text=${encodeURIComponent(message)}`;}
function setupSettings(){
  const s=content.settings;
  document.querySelectorAll('.whatsapp-link').forEach(a=>{a.href=whatsapp();a.target='_blank';a.rel='noopener noreferrer';});
  $('#phone-link').textContent=s.phoneDisplay||s.whatsapp;
  $('#phone-link').href=`tel:+${s.whatsapp.replace(/\D/g,'')}`;
  if(s.heroTitle){const lines=s.heroTitle.split('\n');$('#hero-title').innerHTML=lines.map((line,i)=>i===lines.length-1?`<em>${esc(line)}</em>`:esc(line)).join('<br>');}
  if(s.heroSubtitle)$('#hero-description').textContent=s.heroSubtitle;
  if(s.heroImage&&safeUrl(s.heroImage)){$('.hero-art>img').src=safeUrl(s.heroImage);$('.hero-art>img').alt=s.heroImageAlt||'FastyFood';}
  if(s.logo&&safeUrl(s.logo)){$('.brand-mark').src=safeUrl(s.logo);$('.brand-mark').style.filter='none';$('.brand-mark').style.mixBlendMode='normal';}
  const details=$('#location-details');details.replaceChildren();
  if(s.address){const p=document.createElement('p');p.textContent=s.address;details.append(p);}
  if(s.hours){const p=document.createElement('p');p.textContent=s.hours;details.append(p);}
  if(s.mapsUrl&&safeUrl(s.mapsUrl)){const a=document.createElement('a');a.textContent='Cómo llegar ↗';a.href=safeUrl(s.mapsUrl);a.target='_blank';a.rel='noopener noreferrer';details.append(a);}
}

function renderCategories(){
  const cats=[{id:'all',name:'Todo'},...content.categories];
  $('#categories').innerHTML=cats.map(c=>`<button type="button" class="category-button" data-category="${esc(c.id)}" aria-pressed="${activeCategory===c.id}">${esc(c.name)}<span>${content.products.filter(p=>p.visible!==false&&(c.id==='all'||p.category===c.id)).length}</span></button>`).join('');
}
function renderMenu(){
  const visible=content.products.filter(p=>p.visible!==false&&(activeCategory==='all'||p.category===activeCategory)&&normalize(`${p.name} ${p.description} ${p.group} ${content.categories.find(c=>c.id===p.category)?.name||''}`).includes(normalize(search)));
  $('#menu-status').textContent=`${visible.length} ${visible.length===1?'opción':'opciones'}${search?` para “${search}”`:''} · Precios en pesos argentinos`;
  if(!visible.length){$('#menu-content').innerHTML='<div class="empty-state"><h3>PROBÁ CON OTRO ANTOJO.</h3><p>No encontramos productos con esa búsqueda.</p><button class="clear-search" type="button">Ver todo el menú</button></div>';return;}
  $('#menu-content').innerHTML=content.categories.map(c=>{
    const products=visible.filter(p=>p.category===c.id);if(!products.length)return '';
    return `<section class="menu-category" aria-labelledby="category-${esc(c.id)}"><div class="category-heading"><h3 id="category-${esc(c.id)}">${esc(c.name)}</h3><p>${esc(c.description)}</p></div><div class="menu-grid">${products.map(p=>`<button type="button" class="product-card ${p.available===false?'sold-out':''}" data-product="${esc(p.id)}" aria-label="Ver ${esc(p.name)}, ${esc(money.format(p.price))}${p.available===false?', agotado':''}"><span class="product-copy">${p.group?`<span class="product-label">${esc(p.group.toUpperCase())}</span>`:''}<h4>${esc(p.name)}</h4>${p.description?`<p>${esc(p.description)}</p>`:''}${p.includes?`<span class="include-badge">${esc(p.includes)}</span>`:''}</span><span class="product-price">${c.id==='bebidas'?'+ ':''}${esc(money.format(p.price))}<small>${p.available===false?'AGOTADO':'VER DETALLE ↗'}</small></span></button>`).join('')}</div></section>`;
  }).join('');
}
function renderPromotions(){
  const promos=content.promotions.filter(p=>p.visible!==false);
  $('#promos').hidden=!promos.length;
  $('#promotions').innerHTML=promos.map(p=>`<button type="button" class="promo-card" data-promo="${esc(p.id)}" aria-label="Ver promoción ${esc(p.title)}, ${esc(p.quantity)} por ${esc(money.format(p.price))}">${p.image&&safeUrl(p.image)?`<img src="${esc(safeUrl(p.image))}" width="640" height="360" alt="Publicidad de ${esc(p.title)}" loading="lazy">`:''}<span class="promo-body"><span class="promo-title">${esc(p.title)}</span><span class="promo-subtitle">${esc(p.subtitle)}</span><span class="promo-bottom"><span class="promo-price">${esc(p.quantity)} POR ${esc(money.format(p.price))}</span><span class="promo-link">VER PROMO ↗</span></span></span></button>`).join('');
}
function renderVideos(){
  const videos=content.videos.filter(v=>v.visible!==false&&safeUrl(v.src));
  $('#antojos').hidden=!videos.length;
  $('#videos').innerHTML=videos.map(v=>`<button class="video-card" type="button" data-video="${esc(v.id)}" aria-label="Reproducir video: ${esc(v.title)}"><img src="${esc(safeUrl(v.poster)||'assets/burger-hero.webp')}" width="400" height="300" alt="" loading="lazy"><span class="video-play" aria-hidden="true">▶</span><span class="video-title">${esc(v.title)}</span></button>`).join('');
}

function openDetail({title,description='',includes='',price,label='',image='',video='',poster='',message='',available=true}){
  lastFocus=document.activeElement;
  $('#detail-title').textContent=title;$('#detail-description').textContent=description;$('#detail-includes').textContent=includes;$('#detail-label').textContent=label;
  $('#detail-price').textContent=price===undefined?'':typeof price==='string'?price:money.format(price);
  const media=$('#detail-media');media.replaceChildren();
  if(video&&safeUrl(video)){const el=document.createElement('video');el.controls=true;el.playsInline=true;el.preload='metadata';el.src=safeUrl(video);if(poster&&safeUrl(poster))el.poster=safeUrl(poster);media.append(el);}
  else if(image&&safeUrl(image)){const el=document.createElement('img');el.src=safeUrl(image);el.alt=title;media.append(el);}
  const contact=$('#detail-contact');contact.href=whatsapp(message||`¡Hola FastyFood! Quería consultar por ${title}.`);contact.target='_blank';contact.rel='noopener noreferrer';contact.textContent=available?'CONSULTAR POR WHATSAPP ↗':'CONSULTAR DISPONIBILIDAD ↗';
  $('#detail-dialog').showModal();document.body.style.overflow='hidden';$('#close-dialog').focus();
}
function closeDetail(){$('#detail-dialog').close();}
$('#detail-dialog').addEventListener('close',()=>{const video=$('#detail-media video');if(video){video.pause();video.removeAttribute('src');video.load();}$('#detail-media').replaceChildren();document.body.style.overflow='';lastFocus?.focus();});
$('#close-dialog').addEventListener('click',closeDetail);
$('#detail-dialog').addEventListener('click',e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDetail();}});
$('#categories').addEventListener('click',e=>{const b=e.target.closest('[data-category]');if(!b||!content)return;activeCategory=b.dataset.category;renderCategories();renderMenu();});
$('#search').addEventListener('input',e=>{search=e.target.value;if(content)renderMenu();});
$('#menu-content').addEventListener('click',e=>{
  if(e.target.closest('.clear-search')){activeCategory='all';search='';$('#search').value='';renderCategories();renderMenu();$('#search').focus();return;}
  const b=e.target.closest('[data-product]');if(!b)return;const p=content.products.find(p=>p.id===b.dataset.product);if(!p)return;
  const v=content.videos.find(v=>v.src===p.video);openDetail({title:p.name,description:p.description,includes:p.includes,price:p.price,label:content.categories.find(c=>c.id===p.category)?.name,image:p.image,video:p.video,poster:p.image||v?.poster,available:p.available!==false});
});
$('#promotions').addEventListener('click',e=>{const b=e.target.closest('[data-promo]');if(!b)return;const p=content.promotions.find(p=>p.id===b.dataset.promo);if(p)openDetail({title:p.title,description:p.subtitle,price:`${p.quantity} por ${money.format(p.price)}`,label:'Promoción',image:p.image,message:`¡Hola FastyFood! Quería consultar por la promo de ${p.quantity} ${p.title.toLowerCase()} por ${money.format(p.price)}.`});});
$('#videos').addEventListener('click',e=>{const b=e.target.closest('[data-video]');if(!b)return;const v=content.videos.find(v=>v.id===b.dataset.video);if(v)openDetail({title:v.title,video:v.src,poster:v.poster,label:'Dale play al sabor'});});

try{content=await loadContent();setupSettings();renderCategories();renderMenu();renderPromotions();renderVideos();}
catch(error){console.error('No se pudo cargar el menú',error);$('#menu-status').textContent='El menú no se pudo actualizar. Recargá la página o consultanos por WhatsApp.';$('#promos').hidden=true;$('#antojos').hidden=true;content={settings:{whatsapp:'5491123337893',phoneDisplay:'11 2333-7893'}};setupSettings();}

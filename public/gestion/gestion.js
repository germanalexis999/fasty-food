try{
 const response=await fetch('../config.json',{cache:'no-store'});if(!response.ok)throw new Error();
 const config=await response.json();
 if(config.projectId&&config.studioUrl){const u=new URL(config.studioUrl);if(u.protocol!=='https:'||!u.hostname.endsWith('.sanity.studio'))throw new Error();const link=document.querySelector('#open-studio');link.href=u.href;link.hidden=false;document.querySelector('#status').textContent='Ingresá con tu cuenta para cambiar precios, productos, promociones y videos.';}
 else document.querySelector('#status').textContent='El panel está preparado. Falta conectar la cuenta de Sanity para activar la edición online.';
}catch{document.querySelector('#status').textContent='No pudimos comprobar el acceso. Volvé a intentar en unos minutos.';}

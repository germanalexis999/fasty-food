export const menuQuery=`{
 "settings": *[_type == "settings" && _id == "site-settings"][0]{name,tagline,whatsapp,phoneDisplay,address,hours,mapsUrl,instagramUrl,heroTitle,heroSubtitle,"heroImage":heroImage.asset->url,"heroImageAlt":heroImage.alt,"logo":logo.asset->url},
 "categories": *[_type == "category"] | order(order asc){"id": _id,name,description,"image": image.asset->url,order},
 "products": *[_type == "product"] | order(order asc){"id":_id,"category":category._ref,name,price,description,group,includes,available,visible,order,"image":image.asset->url,"video":video.asset->url,featured},
 "promotions": *[_type == "promotion"] | order(order asc){"id":_id,title,subtitle,quantity,price,"image":image.asset->url,"category":category._ref,visible,order},
 "videos": *[_type == "video"] | order(order asc){"id":_id,title,"src":file.asset->url,"poster":poster.asset->url,visible,order}
}`;

export async function loadContent(){
  const configResponse=await fetch('config.json',{cache:'no-store'});
  if(!configResponse.ok)throw new Error('Configuración no disponible');
  const config=await configResponse.json();
  let result;
  if(config.projectId){
    if(!/^[a-z0-9]+$/.test(config.projectId)||!/^[-a-z0-9]+$/.test(config.dataset))throw new Error('Configuración inválida');
    const endpoint=new URL(`https://${config.projectId}.apicdn.sanity.io/v${config.apiVersion}/data/query/${config.dataset}`);
    endpoint.searchParams.set('query',menuQuery);endpoint.searchParams.set('perspective','published');
    const response=await fetch(endpoint,{signal:AbortSignal.timeout(12000)});
    if(!response.ok)throw new Error('Menú online no disponible');
    result=(await response.json()).result;
  }else{
    const response=await fetch('content.json',{cache:'no-store'});
    if(!response.ok)throw new Error('Menú no disponible');
    result=await response.json();
  }
  if(!result?.settings||!Array.isArray(result.products)||!Array.isArray(result.categories))throw new Error('El menú no tiene datos completos');
  return {...result,promotions:result.promotions||[],videos:result.videos||[]};
}

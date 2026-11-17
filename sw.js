// Есенина — офлайн-копия для приложения с экрана «Домой»: при установке сохраняет сайт и все документы.
const V='1.3.5', C='esenina-'+V;
self.addEventListener('install',e=>{e.waitUntil((async()=>{
  const c=await caches.open(C);
  const list=await fetch('files.json?v='+V,{cache:'no-store'}).then(r=>r.json());
  await Promise.all(['./'].concat(list.filter(f=>f!=='sw.js')).map(f=>
    fetch(f+(f==='./'?'':'?v='+V),{cache:'no-store'}).then(r=>{if(r.ok)return c.put(f==='./'?'./':f,r);})));
  await self.skipWaiting();})());});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{
  for(const k of await caches.keys())if(k.startsWith('esenina-')&&k!==C)await caches.delete(k);
  await self.clients.claim();})());});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin)return;
  const base=new URL('./',self.registration.scope).pathname, rel=u.pathname.startsWith(base)?u.pathname.slice(base.length):u.pathname;
  if(rel==='version.json'||rel==='files.json'){e.respondWith(fetch(r).catch(()=>caches.match(rel,{ignoreSearch:true})));return;}
  if(r.mode==='navigate'||rel===''||rel==='index.html'){e.respondWith(fetch(r).then(res=>{if(res.ok){const cl=res.clone();caches.open(C).then(c=>c.put('./',cl));}return res;}).catch(()=>caches.match('./')));return;}
  e.respondWith(caches.match(rel,{ignoreSearch:true}).then(hit=>hit||fetch(r).then(res=>{if(res.ok){const cl=res.clone();caches.open(C).then(c=>c.put(rel,cl));}return res;})));
});

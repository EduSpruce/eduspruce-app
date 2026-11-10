/* EduSpruce · service worker
   - notificações (obrigatório no iPhone/iPad: só um service worker pode mostrá-las)
   - abre a secção certa ao tocar numa notificação
   - guarda uma cópia da app para abrir sem internet (rede primeiro, cópia só se falhar)
   Não guarda dados de alunos: esses ficam no armazenamento da app e na conta do professor. */
const CACHE='eduspruce-app-v1';
const APP=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(APP)).catch(()=>{}).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{const K=await caches.keys();await Promise.all(K.filter(k=>k!==CACHE).map(k=>caches.delete(k)));await self.clients.claim()})())});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==location.origin)return;
  if(/eduspruce-config\.json$/.test(u.pathname))return; /* sempre da rede */
  if(r.mode==='navigate'||APP.some(p=>u.pathname.endsWith(p.replace('./','/')))){
    e.respondWith(fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r.mode==='navigate'?'./':r,cp))}return res}).catch(()=>caches.match(r.mode==='navigate'?'./':r).then(x=>x||caches.match('./'))))}});
self.addEventListener('notificationclick',e=>{e.notification.close();const d=e.notification.data||{};const v=d.v||'inicio',t=d.t||'';
  e.waitUntil((async()=>{const L=await self.clients.matchAll({type:'window',includeUncontrolled:true});for(const c of L){try{await c.focus();c.postMessage({es:'ir',v,t});return}catch(_){}}
    await self.clients.openWindow('./?ir='+encodeURIComponent(v)+(t?'&t='+encodeURIComponent(t):''))})())});

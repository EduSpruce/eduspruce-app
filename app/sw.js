/* EduSpruce · a versão antiga em eduspruce.app/app/ foi retirada: este service worker apaga a cópia guardada, desliga-se e leva para eduspruce.pt */
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil((async()=>{try{for(const k of await caches.keys())await caches.delete(k)}catch(_){}
  try{await self.registration.unregister()}catch(_){}
  try{for(const c of await self.clients.matchAll({type:'window'}))c.navigate('https://eduspruce.pt/')}catch(_){}})()));
self.addEventListener('fetch',e=>{if(e.request.mode==='navigate')e.respondWith(Response.redirect('https://eduspruce.pt/',302))});

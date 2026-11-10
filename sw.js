"use strict";
const SHELL="pp-test-shell-v1", CONTENT="pp-test-content-v1", SCOPE=self.registration.scope;
function isAsset(u){return u.origin===self.location.origin&&u.href.startsWith(SCOPE)&&/\/data\/(teks|media)\//.test(u.pathname)}
self.addEventListener("install",e=>e.waitUntil((async()=>{const c=await caches.open(SHELL);for(const p of ["./","index.html"])try{const r=await fetch(new URL(p,SCOPE));if(r.ok)await c.put(new URL(p,SCOPE),r)}catch(_){}await self.skipWaiting()})()));
self.addEventListener("activate",e=>e.waitUntil((async()=>{await self.clients.claim()})()));
self.addEventListener("fetch",e=>{const req=e.request;if(req.method!=="GET")return;const u=new URL(req.url);if(!isAsset(u)){e.respondWith((async()=>{try{const r=await fetch(req);if(r.ok)(await caches.open(SHELL)).put(req,r.clone());return r}catch(_){return (await caches.open(SHELL)).match(req)||Response.error()}})());return}
e.respondWith((async()=>{const c=await caches.open(CONTENT);const saved=await c.match(req);try{const r=await fetch(req);if(r.ok)return r}catch(_){}return saved||Response.error()})())});
async function report(d){for(const c of await self.clients.matchAll({type:"window",includeUncontrolled:true}))c.postMessage(d)}
self.addEventListener("message",e=>{const m=e.data||{};if(m.jenis!=="SINKRON_PEKAN"||!Array.isArray(m.urls))return;e.waitUntil((async()=>{
const urls=[...new Set(m.urls.map(v=>{try{return new URL(v,SCOPE)}catch(_){return null}}).filter(u=>u&&isAsset(u)).map(u=>u.href))],allowed=new Set(urls),c=await caches.open(CONTENT);
if(!urls.length){for(const r of await c.keys())await c.delete(r);await report({jenis:"SINKRON_PEKAN_SELESAI",sukses:true,total:0,tersimpan:0,gagal:0});return}
let downloaded=0,failed=0;for(const u of urls){if(await c.match(u))continue;try{const r=await fetch(u,{cache:"no-store"});if(!r.ok)throw Error("HTTP "+r.status);await c.put(u,r);downloaded++}catch(_){failed++;break}}
if(failed===0){for(const r of await c.keys())if(!allowed.has(r.url))await c.delete(r)}
await report({jenis:"SINKRON_PEKAN_SELESAI",sukses:failed===0,pekanAktif:m.pekanAktif||0,tersimpan:downloaded,gagal:failed,total:urls.length});
})())});

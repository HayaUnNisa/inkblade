const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {root,entries,catalog,origin}=require('./catalog.cjs');
const guides=require('../src/data/reading-guides.json');
const routing=JSON.parse(fs.readFileSync(path.join(root,'vercel.json'),'utf8'));
for(const s of catalog){
 assert.equal(guides[s.slug].chapters.length,s.chapters.length,`Guide coverage: ${s.slug}`);
 assert.equal(s.author.startsWith('InkBlade'),true);
 for(const c of s.chapters){assert(c.pages.length>0);assert(Number.isFinite(Date.parse(c.date)));}
}
for(const e of entries){
 const file=path.join(root,'dist',e.url==='/'?'index.html':e.url.slice(1)+'/index.html');
 const html=fs.readFileSync(file,'utf8');
 assert(html.includes('<main id="static-content">'),e.url+' missing readable HTML');
 assert(html.includes(`href="${origin+e.url}"`),e.url+' missing canonical');
 const schema=html.match(/id="inkblade-schema">(.*?)<\/script>/s);
 assert(schema,e.url+' missing schema');JSON.parse(schema[1]);
 assert(!html.includes('<div id="root"></div>'),e.url+' empty shell');
 const route=routing.routes.find(r=>r.src===(e.url==='/'?'/':e.url+'/?'));
 assert(route,e.url+' missing deployment route');
 assert(fs.existsSync(path.join(root,'dist',route.dest)));
}
assert(routing.routes.some(r=>r.src==='/.*'&&r.status===404));
assert(fs.readFileSync(path.join(root,'dist/404.html'),'utf8').includes('noindex, follow'));
assert.equal(fs.readFileSync(path.join(root,'dist/ads.txt'),'utf8').trim(),'google.com, pub-2067386260959577, DIRECT, f08c47fec0942fa0');
console.log(`PASS: ${entries.length} rendered routes, canonical URLs, valid schema, ${catalog.reduce((n,s)=>n+s.chapters.length,0)} chapter notes, ads.txt and 404 routing. This is a technical check, not an AdSense approval or copyright certification.`);

const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {catalog,entries,origin,root}=require('./catalog.cjs');
const urls=new Set(entries.map(e=>e.url));assert.equal(urls.size,entries.length,'Duplicate URLs');
for(const s of catalog){for(const asset of [s.cover,s.banner,...s.chapters.flatMap(c=>c.pages)].filter(Boolean))assert(fs.existsSync(path.join(root,'public',asset)),`Missing asset: ${asset}`);}
for(const file of ['sitemap.xml','rss.xml']){const text=fs.readFileSync(path.join(root,'public',file),'utf8');for(const m of text.matchAll(/<(?:loc|link)>([^<]+)</g)){const url=new URL(m[1]);assert.equal(url.origin,origin);assert(urls.has(url.pathname),`Unknown route: ${url.pathname}`);}}
for(const e of JSON.parse(fs.readFileSync(path.join(root,'public/search-index.json'),'utf8')))assert(urls.has(e.url),`Unknown search URL: ${e.url}`);
for(const f of ['og-image.png','manifest.json','robots.txt'])assert(fs.existsSync(path.join(root,'public',f)),`Missing ${f}`);
console.log(`PASS: ${urls.size} catalog/static routes, feed links and all comic assets. External URLs are not checked.`);

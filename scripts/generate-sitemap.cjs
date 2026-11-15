const {entries,origin,xml,write}=require('./catalog.cjs');
write('sitemap.xml','<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+entries.map(e=>`<url><loc>${xml(origin+e.url)}</loc></url>`).join('\n')+'\n</urlset>\n');
console.log(`Sitemap: ${entries.length} URLs`);

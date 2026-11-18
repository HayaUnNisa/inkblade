const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const { root, catalog, entries, origin, xml } = require('./catalog.cjs');
const guides = require('../src/data/reading-guides.json');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { StaticRouter } = require('react-router-dom/server');
const ts = require('typescript');
const dist = path.join(root, 'dist');
const shell = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const link = (url, title) => `<a href="${xml(url)}">${xml(title)}</a>`;
const paras = text => `<p>${xml(text)}</p>`;
const navigation = `<nav aria-label="Main navigation">${[['/','InkBlade'],['/browse','Browse'],['/about','About'],['/contact','Contact'],['/privacy','Privacy'],['/terms','Terms']].map(([u,t])=>link(u,t)).join(' · ')}</nav>`;
function information(kind) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(path.join(root,'src/pages/Information.tsx'),'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
  vm.runInNewContext(code, {exports, require:n => n==='@/data/catalog'?{catalog}:n==='@/data/faq.json'?require('../src/data/faq.json'):require(n)});
  return renderToStaticMarkup(React.createElement(StaticRouter,{location:'/'+kind},React.createElement(exports.default,{kind})));
}
function guide(s) {
  const g=guides[s.slug];
  return `<h2>Inside the story</h2>${paras(g.introduction)}<h3>Characters</h3><ul>${g.characters.map(c=>`<li>${xml(c)}</li>`).join('')}</ul><h3>What to look for</h3>${paras(g.themes)}<h3>Reading this series</h3>${paras(g.reading)}`;
}
function page(url) {
  const parts=url.split('/').filter(Boolean), s=catalog.find(s=>s.slug===parts[1]);
  if (parts[0]==='series' && s) return `<h1>${xml(s.title)}</h1>${paras(s.synopsis)}${paras('Published by InkBlade. Ongoing. Updates as published.')}${guide(s)}<h2>Chapters</h2><ol>${s.chapters.map(c=>`<li>${link(`/read/${s.slug}/${c.number}`,`Chapter ${c.number}: ${c.title}`)}</li>`).join('')}</ol>`;
  if(parts[0]==='read' && s) {
    const c=s.chapters.find(c=>c.number===Number(parts[2]));
    if(!c) throw Error('Unknown chapter '+url);
    const g=guides[s.slug];
    if(!g.chapters[c.number-1]) throw Error('Missing chapter notes '+url);
    return `<h1>${xml(s.title)} — Chapter ${c.number}: ${xml(c.title)}</h1>${link('/series/'+s.slug,'Series and chapter list')}<h2>Chapter ${c.number} reading notes</h2>${paras(g.chapters[c.number-1])}${paras(g.reading)}${c.pages.map((src,i)=>`<img src="${xml(src)}" width="1024" height="1536" loading="${i?'lazy':'eager'}" alt="${xml(s.title)}, chapter ${c.number}, page ${i+1}">`).join('')}${c.number<s.chapters.length?link(`/read/${s.slug}/${c.number+1}`,'Next chapter'):paras('You are caught up with the published chapters.')}`;
  }
  if (['about','privacy','terms','creators'].includes(parts[0])) return information(parts[0]);
  if(parts[0]==='contact') return '<h1>Contact & feedback</h1><p>Send a private message to InkBlade about a story, a technical issue, privacy or copyright. Include the relevant page URL. Messages are processed by Formspree and are not public comments.</p><form method="POST" action="https://formspree.io/f/mgakeybq"><label>Email <input required type="email" name="email"></label><label>Message <textarea required minlength="10" maxlength="5000" name="message"></textarea></label><button type="submit">Send message</button></form>'+link('/privacy','Read the privacy policy');
  return `<h1>${url==='/'?'InkBlade — Illustrated stories':url==='/rankings'?'Series by published chapter count':'Browse comics'}</h1><p>Read published chapters, explore each story and keep your place in your browser's library. Choose a series below.</p>${(url==='/rankings'?[...catalog].sort((a,b)=>b.chapters.length-a.chapters.length):catalog).map(s=>`<section><h2>${link('/series/'+s.slug,s.title)}</h2>${paras(s.synopsis)}<p>${s.chapters.length} published chapters · ${xml(s.genres.join(', '))}</p>${link('/read/'+s.slug+'/1','Start reading')}</section>`).join('')}`;
}
function write(url,title,description,body,noindex=false) {
  const canonical=origin+url;
  const parts=url.split('/').filter(Boolean), s=catalog.find(s=>s.slug===parts[1]), c=s?.chapters.find(c=>String(c.number)===parts[2]);
  const graph=[{'@type':'WebSite','@id':origin+'/#website',name:'InkBlade',url:origin+'/',inLanguage:'en'}];
  if(s) graph.push({'@type':c?'ComicStory':'ComicSeries',name:title,url:canonical,description,inLanguage:'en',isAccessibleForFree:true,publisher:{'@type':'Organization',name:'InkBlade'},...(c?{image:c.pages.map(u=>origin+u),isPartOf:{'@type':'ComicSeries',name:s.title,url:origin+'/series/'+s.slug}}:{image:origin+s.cover,genre:s.genres})});
  if(url==='/about') graph.push({'@type':'FAQPage',mainEntity:require('../src/data/faq.json').map(f=>({'@type':'Question',name:f.question,acceptedAnswer:{'@type':'Answer',text:f.answer}}))});
  const structured=JSON.stringify({'@context':'https://schema.org','@graph':graph}).replace(/</g,'\\u003c');
  let html=shell.replace(/<title>.*?<\/title>/s,`<title>${xml(title)}</title>`).replace(/<meta name="description"[^>]*>/,`<meta name="description" content="${xml(description)}">`);
  html=html.replace('</head>',`<script type="application/ld+json" id="inkblade-schema">${structured}</script></head>`);
  html=html.replace('</head>',`<link rel="canonical" href="${xml(canonical)}"><meta name="robots" content="${noindex?'noindex, follow':'index, follow'}"><style>#static-content{max-width:960px;margin:auto;padding:32px 20px;font:18px/1.8 system-ui}#static-content h1{font-size:2rem}#static-content h2{font-size:1.5rem;margin-top:28px}#static-content a{color:#e11d48;text-decoration:underline}#static-content img{max-width:100%;height:auto;display:block;margin:20px auto}#static-content input,#static-content textarea{display:block;width:100%;border:1px solid #888;padding:10px}#static-content label{display:block;margin:16px 0}</style></head>`);
  html=html.replace('<div id="root"></div>',`<div id="root"><main id="static-content">${navigation}${body}</main></div>`);
  const target=url==='/'?path.join(dist,'index.html'):url==='/404'?path.join(dist,'404.html'):path.join(dist,url.slice(1),'index.html');
  fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,html);
}
for(const e of entries) write(e.url,e.title+' | InkBlade',e.description,page(e.url));
write('/library','My library | InkBlade','Bookmarks are saved in your browser.','<h1>My library</h1><p>Your saved series and reading progress are stored in this browser. Enable JavaScript to use your library.</p>'+link('/browse','Browse comics'),true);
write('/404','Page not found | InkBlade','This page does not exist.','<h1>Page not found</h1><p>This address does not match a published page.</p>'+link('/browse','Browse the published comics'),true);
console.log(`Prerendered ${entries.length} public pages and a 404. Content is served to all visitors, then enhanced by React.`);

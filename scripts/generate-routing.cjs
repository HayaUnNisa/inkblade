const fs=require('node:fs'),path=require('node:path');
const {root,entries}=require('./catalog.cjs');
const routes=[{handle:'filesystem'},...entries.map(e=>({src:e.url==='/'?'/':e.url+'/?',dest:e.url==='/'?'/index.html':e.url+'/index.html'})),{src:'/library/?',dest:'/library/index.html'},{src:'/.*',dest:'/404.html',status:404}];
fs.writeFileSync(path.join(root,'vercel.json'),JSON.stringify({routes},null,2)+'\n');
console.log('Generated explicit Vercel routes with a real 404 fallback.');

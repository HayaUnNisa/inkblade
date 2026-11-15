const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const root=path.resolve(__dirname,'..');
function load(file){if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,{exports,require:n=>load(n.startsWith('@/')?path.join(root,'src',n.slice(2)+'.ts'):path.resolve(path.dirname(file),n)),Date,Math,Intl,Set,Array});return exports;}
const {catalog}=load(path.join(root,'src/data/catalog.ts'));
const origin='https://inkblade.xyz';
const pages=['/','/browse','/rankings','/about','/contact','/privacy','/terms','/creators'];
const entries=[...pages.map(url=>({url,title:url==='/'?'InkBlade':url.slice(1),description:'Read illustrated stories on InkBlade.'})),...catalog.flatMap(s=>[{url:'/series/'+s.slug,title:s.title,description:s.synopsis},...s.chapters.filter(c=>c.pages.length).map(c=>({url:`/read/${s.slug}/${c.number}`,title:`${s.title} — Chapter ${c.number}: ${c.title}`,description:s.synopsis,date:c.date}))])];
const xml=s=>String(s).replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));
const write=(name,content)=>fs.writeFileSync(path.join(root,'public',name),content);
module.exports={root,catalog,origin,entries,xml,write};

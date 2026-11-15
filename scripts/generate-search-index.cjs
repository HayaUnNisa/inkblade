const {entries,write}=require('./catalog.cjs');
write('search-index.json',JSON.stringify(entries,null,2)+'\n');
console.log(`Search index: ${entries.length} records`);

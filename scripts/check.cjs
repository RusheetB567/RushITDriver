const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
let checked=0;
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  const file=path.join(dir,entry.name);
  if(entry.isDirectory()){if(!['.git','.data','node_modules'].includes(entry.name))walk(file);}
  else if(/\.(cjs|js)$/.test(file)){new vm.Script(fs.readFileSync(file,'utf8'),{filename:file});checked++;}
}}
walk(path.resolve(__dirname,'..'));console.log(`Syntax verified: ${checked} JavaScript modules.`);

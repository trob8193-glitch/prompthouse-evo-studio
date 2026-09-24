import { execFileSync } from 'node:child_process';

const root=process.cwd();
const productionRoots=['src','apps','packages','desktop','bin','scripts'];
const banned=[
  {name:'mock',re:/\bmock(?:s|ed|ing)?\b/i},
  {name:'placeholder',re:/\bplaceholders?\b/i},
  {name:'stub',re:/\bstubs?\b/i},
  {name:'fake',re:/\bfakes?\b/i},
  {name:'todo',re:/\bTODO\b/},
  {name:'fixme',re:/\bFIXME\b/}
];

let files=[];
for(const rootDir of productionRoots){
  try{
    const out=execFileSync('git',['ls-files',rootDir],{cwd:root,encoding:'utf8'});
    files.push(...out.split('\n').filter(Boolean));
  }catch{}
}
files=[...new Set(files)].filter(f=>!/(^|\/)tests?\//i.test(f)&&!/(^|\/)(fixtures?|__tests__)(\/|$)/i.test(f));

const violations=[];
for(const file of files){
  let source='';
  try{source=execFileSync('git',['show','HEAD:'+file],{cwd:root,encoding:'utf8',maxBuffer:8*1024*1024});}catch{continue;}
  source.split(/\r?\n/).forEach((line,index)=>{
    for(const rule of banned){
      if(rule.re.test(line)) violations.push({file,line:index+1,rule:rule.name,text:line.trim().slice(0,240)});
    }
  });
}

const result={
  schemaVersion:1,
  gate:'NO_MOCK_PRODUCTION',
  scannedFiles:files.length,
  violations,
  passed:violations.length===0,
  policy:{
    productionCode:'No mocks, placeholders, stubs, fake implementations, TODOs, or FIXMEs.',
    testCode:'Test fixtures/mocks may exist only in explicitly isolated test/fixture paths.',
    proof:'A clean scan proves only that banned production-path markers were not found; runtime behavior still requires execution tests.'
  }
};
console.log(JSON.stringify(result,null,2));
process.exitCode=result.passed?0:1;

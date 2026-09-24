import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const started=Date.now();
const receiptDir=path.join(root,'.prompthouse-data','proof',new Date().toISOString().replace(/[:.]/g,'-'));
mkdirSync(receiptDir,{recursive:true});
const commands=[['npm',['run','build']],['npm',['run','test']],['npm',['run','verify:studio']],['npm',['run','maturity:strict']],['npm',['run','cost:check']],['npm',['run','platform:strict']],['npm',['run','tevo:evidence:test']]];
function run(command,args){return new Promise(resolve=>{const p=spawn(command,args,{cwd:root,shell:process.platform==='win32'});let out='',err='';p.stdout.on('data',d=>out+=d);p.stderr.on('data',d=>err+=d);p.on('close',code=>resolve({command:[command,...args].join(' '),code,out,err}));});}
const results=[];
for(const [command,args] of commands){const r=await run(command,args);results.push({command:r.command,passed:r.code===0,exitCode:r.code});writeFileSync(path.join(receiptDir,results.length+'-'+command+'.log'),r.out+'\n'+r.err);if(r.code!==0)break;}
const passed=results.length===commands.length&&results.every(r=>r.passed);
const receipt={schemaVersion:1,proofType:'tevo_production_readiness',startedAt:new Date(started).toISOString(),completedAt:new Date().toISOString(),durationMs:Date.now()-started,passed,results,scaleStatus:'NOT_PROVEN',scaleReason:'Meaningful production scale requires real multi-user traffic, reliability telemetry, retention, and production workload evidence. Local proof never fabricates those measurements.',verdict:passed?'ENGINEERING_GATES_PASSED_SCALE_NOT_PROVEN':'ENGINEERING_GATES_FAILED'};
writeFileSync(path.join(receiptDir,'receipt.json'),JSON.stringify(receipt,null,2));
console.log(JSON.stringify(receipt,null,2));
process.exitCode=passed?0:1;
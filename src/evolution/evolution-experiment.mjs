import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {spawnSync} from "node:child_process";
const root=path.resolve(".prompthouse-data/evolution/experiments");fs.mkdirSync(root,{recursive:true});
const sha=v=>crypto.createHash("sha256").update(v).digest("hex");
export function runExperiment({name,command,args=[],cwd=process.cwd(),env={}}){
 if(!name||!command)throw new Error("name and command are required");
 const started=new Date().toISOString(),r=spawnSync(command,args,{cwd,env:{...process.env,...env},encoding:"utf8",shell:false}),finished=new Date().toISOString();
 const receipt={schema:"tevo.evolution.experiment.v1",name,command,args,cwd,startedAt:started,finishedAt:finished,exitCode:r.status,signal:r.signal??null,stdout:r.stdout??"",stderr:r.stderr??"",verified:r.status===0};
 receipt.receiptHash=sha(JSON.stringify(receipt));const file=path.join(root,Date.now()+"-"+name.replace(/[^a-z0-9_-]/gi,"_")+".json");fs.writeFileSync(file,JSON.stringify(receipt,null,2)+"\n");return{...receipt,file};
}

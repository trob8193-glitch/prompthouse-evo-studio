import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
const root=path.resolve(".prompthouse-data/evolution");
const registryPath=path.join(root,"capabilities.json");
const ensure=()=>fs.mkdirSync(root,{recursive:true});
const read=()=>{ensure();if(!fs.existsSync(registryPath))return [];return JSON.parse(fs.readFileSync(registryPath,"utf8"));};
const write=v=>{ensure();fs.writeFileSync(registryPath,JSON.stringify(v,null,2)+"\n");};
const hash=v=>crypto.createHash("sha256").update(JSON.stringify(v)).digest("hex");
export function registerCapability(input){
 if(!input?.id||!input?.name||!input?.version)throw new Error("id, name and version are required");
 const all=read(),now=new Date().toISOString();
 const record={...input,status:input.status??"candidate",createdAt:input.createdAt??now,updatedAt:now,recordHash:null};
 record.recordHash=hash(record);write([...all.filter(x=>x.id!==record.id),record]);return record;
}
export function getCapabilities(){return read();}
export function getCapability(id){return read().find(x=>x.id===id)||null;}
export function promoteCapability(id,evidence){
 const all=read(),i=all.findIndex(x=>x.id===id);if(i<0)throw new Error("capability not found");
 if(!evidence?.receiptId||evidence.verified!==true)throw new Error("promotion requires verified proof receipt");
 all[i]={...all[i],status:"promoted",proof:evidence,updatedAt:new Date().toISOString()};all[i].recordHash=hash(all[i]);write(all);return all[i];
}
export function capabilitySnapshot(){return{registry:registryPath,count:read().length,capabilities:read().map(x=>({id:x.id,name:x.name,version:x.version,status:x.status}))};}

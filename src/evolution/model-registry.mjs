import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
const root=path.resolve(".prompthouse-data/evolution"),file=path.join(root,"models.json");
const hash=v=>crypto.createHash("sha256").update(JSON.stringify(v)).digest("hex");
export function registerModel(model){
 if(!model?.id||!model?.provider||!model?.version)throw new Error("id, provider and version are required");
 fs.mkdirSync(root,{recursive:true});const all=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,"utf8")):[];
 const record={...model,registeredAt:new Date().toISOString()};record.recordHash=hash(record);
 fs.writeFileSync(file,JSON.stringify([...all.filter(x=>x.id!==model.id),record],null,2)+"\n");return record;
}
export function listModels(){return fs.existsSync(file)?JSON.parse(fs.readFileSync(file,"utf8")):[];}

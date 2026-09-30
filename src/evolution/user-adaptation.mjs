import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
const root=path.resolve(".prompthouse-data/evolution/users");const file=id=>path.join(root,encodeURIComponent(id)+".json");
const hash=v=>crypto.createHash("sha256").update(JSON.stringify(v)).digest("hex");
export function recordUserObservation(userId,observation){
 if(!userId||!observation?.type)throw new Error("userId and observation.type are required");
 fs.mkdirSync(root,{recursive:true});const p=file(userId),current=fs.existsSync(p)?JSON.parse(fs.readFileSync(p,"utf8")):{schema:"tevo.user.adaptation.v1",userId,observations:[]};
 current.observations.push({...observation,observedAt:new Date().toISOString()});current.hash=hash(current);fs.writeFileSync(p,JSON.stringify(current,null,2)+"\n");return current;
}
export function getUserProfile(userId){const p=file(userId);return fs.existsSync(p)?JSON.parse(fs.readFileSync(p,"utf8")):null;}

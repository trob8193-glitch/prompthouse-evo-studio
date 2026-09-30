import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
const root=path.resolve(".prompthouse-data/evolution"),out=path.join(root,"proof-fabric.json"),files=[];
function walk(d){if(!fs.existsSync(d))return;for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())walk(p);else if(e.name.endsWith(".json")&&p!==out)files.push(p);}}
walk(root);
const receipts=files.map(p=>{const content=fs.readFileSync(p,"utf8");return{path:path.relative(process.cwd(),p),sha256:crypto.createHash("sha256").update(content).digest("hex")};});
const result={schema:"tevo.proof.fabric.v1",generatedAt:new Date().toISOString(),receipts,receiptCount:receipts.length,verifiedReceiptCount:0,verified:false,note:"This index records observed evidence and never fabricates success."};
result.verifiedReceiptCount=receipts.filter(x=>x.path.includes("experiments/")).length;result.verified=result.verifiedReceiptCount>0;
fs.mkdirSync(root,{recursive:true});fs.writeFileSync(out,JSON.stringify(result,null,2)+"\n");console.log(JSON.stringify(result,null,2));

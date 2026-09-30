import fs from "node:fs";
import path from "node:path";
import {promoteCapability} from "../src/evolution/capability-fabric.mjs";
const id=process.env.TEVO_CAPABILITY_ID,receipt=process.env.TEVO_PROOF_RECEIPT;
if(!id||!receipt)throw new Error("TEVO_CAPABILITY_ID and TEVO_PROOF_RECEIPT are required");
const p=path.resolve(receipt);if(!fs.existsSync(p))throw new Error("proof receipt not found: "+p);
const evidence=JSON.parse(fs.readFileSync(p,"utf8"));if(evidence.verified!==true||evidence.exitCode!==0)throw new Error("receipt is not verified");
console.log(JSON.stringify(promoteCapability(id,{receiptId:path.relative(process.cwd(),p),verified:true,hash:evidence.receiptHash}),null,2));

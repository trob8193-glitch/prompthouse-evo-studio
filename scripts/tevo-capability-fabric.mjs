import {registerCapability,capabilitySnapshot} from "../src/evolution/capability-fabric.mjs";
const cmd=process.argv[2]||"status";
if(cmd==="status"){console.log(JSON.stringify(capabilitySnapshot(),null,2));process.exit(0);}
if(cmd==="register"){const raw=process.env.TEVO_CAPABILITY_JSON;if(!raw)throw new Error("TEVO_CAPABILITY_JSON is required");console.log(JSON.stringify(registerCapability(JSON.parse(raw)),null,2));process.exit(0);}
console.error("Usage: status|register");process.exit(2);

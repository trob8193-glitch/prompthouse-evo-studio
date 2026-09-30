import {registerModel} from "../src/evolution/model-registry.mjs";
const raw=process.env.TEVO_MODEL_JSON;if(!raw)throw new Error("TEVO_MODEL_JSON is required");
console.log(JSON.stringify(registerModel(JSON.parse(raw)),null,2));

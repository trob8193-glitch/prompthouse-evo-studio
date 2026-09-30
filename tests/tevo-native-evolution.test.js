import {describe,it,expect,beforeEach} from "vitest";
import fs from "node:fs";
import path from "node:path";
import {registerCapability,getCapability,promoteCapability} from "../src/evolution/capability-fabric.mjs";
const root=path.resolve(".prompthouse-data/evolution");
beforeEach(()=>{fs.rmSync(root,{recursive:true,force:true});});
describe("TEVO native capability evolution",()=>{
 it("registers a real capability record",()=>{const c=registerCapability({id:"test.cap",name:"Test Capability",version:"1.0.0"});expect(c.status).toBe("candidate");expect(getCapability("test.cap").id).toBe("test.cap");});
 it("rejects promotion without verified evidence",()=>{registerCapability({id:"test.promote",name:"Promotion",version:"1.0.0"});expect(()=>promoteCapability("test.promote",{receiptId:"x",verified:false})).toThrow();});
 it("promotes only with verified evidence",()=>{registerCapability({id:"test.proven",name:"Proven",version:"1.0.0"});const c=promoteCapability("test.proven",{receiptId:"proof.json",verified:true});expect(c.status).toBe("promoted");});
});

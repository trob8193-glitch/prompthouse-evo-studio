import {runExperiment} from "../src/evolution/evolution-experiment.mjs";
const name=process.env.TEVO_EXPERIMENT_NAME||"tevo-real-verification",command=process.env.TEVO_EXPERIMENT_COMMAND;
const args=process.env.TEVO_EXPERIMENT_ARGS?JSON.parse(process.env.TEVO_EXPERIMENT_ARGS):[];
if(!command)throw new Error("TEVO_EXPERIMENT_COMMAND is required; simulated commands are not permitted");
console.log(JSON.stringify(runExperiment({name,command,args}),null,2));

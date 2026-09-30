import {runTraining} from "../src/evolution/training-orchestrator.mjs";
const command=process.env.TEVO_TRAIN_COMMAND;if(!command)throw new Error("TEVO_TRAIN_COMMAND is required; no simulated training is permitted");
const args=process.env.TEVO_TRAIN_ARGS?JSON.parse(process.env.TEVO_TRAIN_ARGS):[];
console.log(JSON.stringify(runTraining({name:process.env.TEVO_TRAIN_NAME||"local-training",command,args}),null,2));

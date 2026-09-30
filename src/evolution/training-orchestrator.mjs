import {runExperiment} from "./evolution-experiment.mjs";
export function runTraining({name,command,args=[]}){return runExperiment({name:"training-"+name,command,args});}

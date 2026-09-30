import {getUserProfile} from "../src/evolution/user-adaptation.mjs";
const id=process.env.TEVO_USER_ID;if(!id)throw new Error("TEVO_USER_ID is required");console.log(JSON.stringify(getUserProfile(id),null,2));

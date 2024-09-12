import { sleep } from "bun";
import rcc from "./core/rcc";

let connection = new rcc.connection("127.0.0.1", 64989, false, "http://roblox.com");
let job_count = 0;

const current_job_id = "jobf";
let [_1err, resp, _u, _HEY] = await connection.job().open(current_job_id, `print("hello!")`, 200);
let [_2err, exp_resp, _b, _BYE] = await connection.job().expiration(current_job_id);

console.log(`${current_job_id} \`open\` response:`, resp, "\n", 
`${current_job_id} \`expiration\` response:`, exp_resp);
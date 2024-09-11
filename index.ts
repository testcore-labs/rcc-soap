import { sleep } from "bun";
import rcc from "./core/rcc";

let connection = new rcc.connection("127.0.0.1", 64989, false, "http://roblox.com/");
let job_count = 0;

const current_job_id = "job" + Date.now();
let [iserr, resp] = await connection.job().open(current_job_id, `print("hello! ${ Date.now() }")`, 100);
let [eiserr, eresp] = await connection.job().expiration(current_job_id);

console.log(resp, "\n", eresp)
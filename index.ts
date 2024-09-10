import rcc from "./core/rcc";

let connection = new rcc.connection("127.0.0.1", 60000);
let custom_job = new connection.job("faggot_job", "");
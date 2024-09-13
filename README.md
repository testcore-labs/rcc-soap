# RCC-SOAP
Interact with your R* Cloud Compute Service executable with ease!\
Here's how you can run a job with a custom Lua script! 
```typescript
import rcc from "rcc-soap";

const conn = new rcc.connection("127.0.0.1", 64989, false);
// job_id, script (lua or json), expiration (in seconds)
const response = conn.job().open("job_id", "print('script here')", 10);

console.log(response);
```
import console from "../utils/console";

class job {
  job_id: string;
  script: { [key: string]: number|string|boolean|undefined };
  expiration: number;

  constructor(job_id: string, script: { [key: string]: number|string|boolean|undefined }|string, expiration: number = (10 * 60)) {
    console.debug(true, job_id, script, expiration)
    this.job_id = job_id;
    this.script = script;
    this.expiration = (expiration / 60);
  }

  
}
export default job;
import job from "./job";
import _string from "../utils/string";

class connection {
  baseurl: string = "http://roblox.com";
  ip: string = "127.0.0.1";
  port: number = 64989;
  secure: boolean = false;

  constructor(
    ip: typeof this.ip = this.ip, 
    port: typeof this.port = this.port, 
    secure: typeof this.secure = this.secure, 
    baseurl: typeof this.baseurl = this.baseurl
  ) {
    if(_string.is_ip(ip)) this.ip = ip;
    this.port = port;
    this.secure = secure;
    this.baseurl = baseurl;
    return this;
  }

  job() {
    let new_job = new job;
    new_job.connection.ip = this.ip;
    new_job.connection.port = this.port;
    new_job.connection.secure = this.secure;
    new_job.connection.baseurl = this.baseurl;

    return new_job;
  }
}

export default connection;
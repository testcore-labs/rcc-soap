import job from "./job";
import _string from "../utils/string";

class connection {
  ip: string = "127.0.0.1";
  port: number = 64989;

  constructor(ip: string, port: number) {
    if(_string.is_ip(ip)) this.ip = ip;
    this.port = port;
    return this;
  }

  job = job;
}

export default connection;
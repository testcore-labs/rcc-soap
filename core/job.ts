import console from "../utils/console";

type job_types = { 
  job_id: string|number
  script: {[key: string]: number|string|boolean|undefined}|string|null;
  expiration: number;
  cores: number;
}

class job {
  connection = {
    ip: "",
    port: 0,
    secure: false,
    baseurl: ""
  }

  async soap(xml: string) {
    try {
      let url = `${this.connection.secure ? "https" : "http" }://${this.connection.ip}:${this.connection.port}`;
      const response = await fetch(url, { 
        method: 'POST', 
        body: xml, 
        headers: { 
          "content-type": "text/xml;charset=UTF-8" 
        } 
      }).then(async response => await response.text());
      
      return [false, response];
    } catch(e) {
      return [e, ""];
    }
  }

  open = this.open_job_ex;
  async open_job_ex(
    job_id: job_types["job_id"], 
    script: job_types["script"] = null, 
    expiration: job_types["expiration"], 
    cores: job_types["cores"] = 1
  ) {
		let result = await this.soap(`<?xml version="1.0" encoding="UTF-8"?>
<SOAP-ENV:Envelope 
  xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" 
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:xsd="http://www.w3.org/2001/XMLSchema"
  xmlns:ns1="${this.connection.baseurl}" 
  xmlns:ns2="${this.connection.baseurl}/RCCServiceSoap"
  xmlns:ns1="${this.connection.baseurl}"
  xmlns:ns3="${this.connection.baseurl}/RCCServiceSoap12">
  <SOAP-ENV:Body>
    <ns1:OpenJob>
      <ns1:job>
        <ns1:id>${job_id}</ns1:id>
        <ns1:expirationInSeconds>${expiration}</ns1:expirationInSeconds>
        <ns1:category>0</ns1:category>
        <ns1:cores>${cores}</ns1:cores>
      </ns1:job>
      <ns1:script>
        <ns1:name>${job_id}-Script</ns1:name>
        <ns1:script>${script}</ns1:script>
        <ns1:arguments/>
      </ns1:script>
    </ns1:OpenJob>
  </SOAP-ENV:Body>
</SOAP-ENV:Envelope>`);
		return result;
	}

  expiration = this.get_expiration;
  async get_expiration(job_id: job_types["job_id"]) {
		let result = await this.soap(`<?xml version="1.0" encoding="UTF-8"?>
      <SOAP-ENV:Envelope 
        xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" 
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:xsd="http://www.w3.org/2001/XMLSchema"
        xmlns:ns1="${this.connection.baseurl}" 
        xmlns:ns2="${this.connection.baseurl}/RCCServiceSoap"
        xmlns:ns1="${this.connection.baseurl}"
        xmlns:ns3="${this.connection.baseurl}/RCCServiceSoap12">
        <SOAP-ENV:Body>
          <ns1:GetExpiration>
            <ns1:jobID>${job_id}</ns1:jobID>
          </ns1:GetExpiration>
        </SOAP-ENV:Body>
      </SOAP-ENV:Envelope>`);
    return result;
  }
}
export default job;
import parser from "xml-js";

type job_types = { 
  job_id: string|number
  script: {[key: string]: any}|string|null;
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

  script_luajson(script: job_types["script"]): string {
    if(typeof script === "object") {
      let json = JSON.stringify(script, null, 0);
      return json;
    } else {
      return script;
    }
  }

  async soap(xml: string|{[key: string|number]: any}) {
    try {
      let pure_xml = ""; 
      if(typeof xml == "string") {
        pure_xml = xml;
      } else {
        if(xml._declaration) {
          pure_xml = parser.js2xml(xml, { compact: true, spaces: 2 });
        }
      }
      let url = `${this.connection.secure ? "https" : "http" }://${this.connection.ip}:${this.connection.port}`;
      const response = await fetch(url, { 
        method: 'POST', 
        body: pure_xml, 
        headers: { 
          "content-type": "text/xml;charset=UTF-8" 
        } 
      }).then(async response => await response.text());
      
      const parsed_resp = parser.xml2js(response, {compact: true}); 
      return [false, parsed_resp, response];
    } catch(e) {
      return [e, null, null];
    }
  }

  open = this.open_job_ex;
  async open_job_ex(
    job_id: job_types["job_id"], 
    script: job_types["script"] = null, 
    expiration: job_types["expiration"] = 10, 
    cores: job_types["cores"] = 1
  ) {
		let [err, parsed, raw] = await this.soap({
      _declaration: {
        _attributes: {
          version: "1.0",
          encoding: "UTF-8",
        },
      },
      "SOAP-ENV:Envelope": {
        _attributes: {
          "xmlns:SOAP-ENV": "http://schemas.xmlsoap.org/soap/envelope/",
          "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
          "xmlns:xsd": "http://www.w3.org/2001/XMLSchema",
          "xmlns:ns1": `${this.connection.baseurl}/`,
          "xmlns:ns2": `${this.connection.baseurl}/RCCServiceSoap`,
          "xmlns:ns3": `${this.connection.baseurl}/RCCServiceSoap12`,
        },
        "SOAP-ENV:Body": {
          'ns1:OpenJob': {
            'ns1:job': {
              'ns1:id': { _text: String(job_id) },
              'ns1:expirationInSeconds': { _text: String(expiration) },
              'ns1:category': { _text: '0' },
              'ns1:cores': { _text: String(cores) }
            },
            'ns1:script': {
              'ns1:name': { _text: `${String(job_id)}-Script` },
              'ns1:script': {
                _text: this.script_luajson(script)
              },
              'ns1:arguments': {}
            }
          }
        },
      },
    }); 
    try {
      let soap_response = (parsed as {[key: string]: any})["SOAP-ENV:Envelope"]["SOAP-ENV:Body"];
      
      let output; 
      if(soap_response["ns1:OpenJobResponse"]) output = soap_response["ns1:OpenJobResponse"];
      if(output == undefined) output = soap_response["SOAP-ENV:Fault"]["faultstring"]["_text"];
      return [err, output, parsed, raw];
    } catch(e) {
      return [e, null, parsed, raw];
    }
	}

  close = this.close_job;
  async close_job(job_id: job_types["job_id"]) {
		let result = await this.soap(`<?xml version="1.0" encoding="UTF-8"?>
      <SOAP-ENV:Envelope 
        xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" 
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:xsd="http://www.w3.org/2001/XMLSchema"
        xmlns:ns1="${this.connection.baseurl}/" 
        xmlns:ns2="${this.connection.baseurl}/RCCServiceSoap"
        xmlns:ns1="${this.connection.baseurl}/"
        xmlns:ns3="${this.connection.baseurl}/RCCServiceSoap12">
        <SOAP-ENV:Body>
          <ns1:CloseJob>
            <ns1:jobID>${job_id}</ns1:jobID>
          </ns1:CloseJob
        </SOAP-ENV:Body>
      </SOAP-ENV:Envelope>`);
    return result;
  }

  expiration = this.get_expiration;
  async get_expiration(job_id: job_types["job_id"]) {
		let [err, parsed, raw] = await this.soap(`<?xml version="1.0" encoding="UTF-8"?>
      <SOAP-ENV:Envelope 
        xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" 
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:xsd="http://www.w3.org/2001/XMLSchema"
        xmlns:ns1="${this.connection.baseurl}/" 
        xmlns:ns2="${this.connection.baseurl}/RCCServiceSoap"
        xmlns:ns1="${this.connection.baseurl}/"
        xmlns:ns3="${this.connection.baseurl}/RCCServiceSoap12">
        <SOAP-ENV:Body>
          <ns1:GetExpiration>
            <ns1:jobID>${job_id}</ns1:jobID>
          </ns1:GetExpiration>
        </SOAP-ENV:Body>
      </SOAP-ENV:Envelope>`);

    try {
      let soap_response = (parsed as {[key: string]: any})["SOAP-ENV:Envelope"]["SOAP-ENV:Body"];

      let output; 
      if(soap_response["ns1:GetExpirationResponse"]) output = Number(soap_response["ns1:GetExpirationResponse"]["ns1:GetExpirationResult"]._text);
      if(output == undefined) output = soap_response["SOAP-ENV:Fault"]["faultstring"]["_text"];
      return [err, output, parsed, raw];
    } catch(e) {
      console.log(e);
      return [e, null, parsed, raw];
    }
  }


  async close_expired() {
		let result = await this.soap(`<?xml version="1.0" encoding="UTF-8"?>
      <SOAP-ENV:Envelope 
        xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" 
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:xsd="http://www.w3.org/2001/XMLSchema"
        xmlns:ns1="${this.connection.baseurl}/" 
        xmlns:ns2="${this.connection.baseurl}/RCCServiceSoap"
        xmlns:ns1="${this.connection.baseurl}/"
        xmlns:ns3="${this.connection.baseurl}/RCCServiceSoap12">
        <SOAP-ENV:Body>
          <ns1:CloseExpiredJobs></ns1:CloseExpiredJobs>
        </SOAP-ENV:Body>
      </SOAP-ENV:Envelope>`);
    return result;
  }
  async close_all() {
		let result = await this.soap(`<?xml version="1.0" encoding="UTF-8"?>
      <SOAP-ENV:Envelope 
        xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" 
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:xsd="http://www.w3.org/2001/XMLSchema"
        xmlns:ns1="${this.connection.baseurl}/" 
        xmlns:ns2="${this.connection.baseurl}/RCCServiceSoap"
        xmlns:ns1="${this.connection.baseurl}/"
        xmlns:ns3="${this.connection.baseurl}/RCCServiceSoap12">
        <SOAP-ENV:Body>
          <ns1:CloseAllJobs></ns1:CloseAllJobs>
        </SOAP-ENV:Body>
      </SOAP-ENV:Envelope>`);
    return result;
  }
  async get_all() {
		let result = await this.soap(`<?xml version="1.0" encoding="UTF-8"?>
      <SOAP-ENV:Envelope 
        xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" 
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:xsd="http://www.w3.org/2001/XMLSchema"
        xmlns:ns1="${this.connection.baseurl}/" 
        xmlns:ns2="${this.connection.baseurl}/RCCServiceSoap"
        xmlns:ns1="${this.connection.baseurl}/"
        xmlns:ns3="${this.connection.baseurl}/RCCServiceSoap12">
        <SOAP-ENV:Body>
          <ns1:GetAllJobsEx></ns1:GetAllJobsEx>
        </SOAP-ENV:Body>
      </SOAP-ENV:Envelope>`);
    return result;
  }
}
export default job;
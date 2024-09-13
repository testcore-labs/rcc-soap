import rcc from "../../index";
import fs from "fs";

// YOUR RCC SHOULD SUPPORT JSON SCRIPTS!! else this wont work
let conn = new rcc.connection("127.0.0.1", 64989, false, "http://roblox.com");
let user_id = 1; // the user ofc
let new_job = await conn.job().open("job" + Date.now(), {
  Mode: "Thumbnail",
  Settings: {
    Type: "Closeup",
    PlaceId: 1,
    UserId: user_id,
    BaseUrl: "roblox.com",
    MatchmakingContextId: 1,
    Arguments: ["https://www.roblox.com", `https://www.roblox.com/v1.1/avatar-fetch?userId=${user_id}&placeId=1`, "PNG", 768, 768, true, 40, 100, 0, 0]
  },
  Arguments: {
    MachineAddress: "127.0.0.1"
  }
});
if(new_job[1]["ns1:OpenJobResult"]) {
  const thumb = new_job[1]["ns1:OpenJobResult"][0]["ns1:value"]["_text"];
  let buffer = Buffer.from(thumb, "base64");
  fs.writeFileSync("./render-closeup.png", buffer);
  console.log(`> saved render to \`render-closeup.png\``)
} else {
  console.log(new_job);
}
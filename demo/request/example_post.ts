import { listen, Conn } from "deno";
import { Request, ReqGeneral, RequestReader } from "./mod.ts";

const decoder = new TextDecoder();

function createResponse (bodyStr: string): Uint8Array {
  const CRLF = "\r\n";
  const encoder = new TextEncoder();
  const ctxBody = encoder.encode(bodyStr);
  const resHeaders = [
    `HTTP/1.1 200`,
    `content-length: ${ctxBody.byteLength}`,
    CRLF
  ];
  const ctxHeader = encoder.encode(resHeaders.join(CRLF));
  const data = new Uint8Array(ctxHeader.byteLength + ctxBody.byteLength);
  data.set(ctxHeader, 0);
  data.set(ctxBody, ctxHeader.byteLength);
  return data;
}

async function response(conn: Conn) {
  const requestReader: Request = new RequestReader(conn);
  const headers: Headers = await requestReader.getHeaders();
  const headerObj = {};
  if (headers) {
    for(const key of headers.keys()) {
      headerObj[key] = headers.get(key); 
    }
  }
  
  const generalObj: ReqGeneral = await requestReader.getGeneral();
  const bodyBuf = await requestReader.getBodyStream();
  const method = generalObj.method;
  let ctxBody = `
    <html>
      <body>
        <form method="POST" action="/">
          <p>userName</p>
          <input name="nickName" /><br/>
          <p>email</p>
          <input name="email" /><br/>
          <button type="submit">submit</button>
        </form>
      </body>
    </html>
  `;
  if (method === "POST") {
    const body = decoder.decode(bodyBuf);
    ctxBody = JSON.stringify({ general: generalObj, headers: headerObj, body });
  }
  const ctx = createResponse(ctxBody);
  conn.write(ctx);
  conn.close();
}

async function server(addr: string) {
  const listener = listen("tcp", addr);
  console.log("listening on", addr);
  while (true) {
    const conn = await listener.accept();
    await response(conn);
  }
}

const addr = "127.0.0.1:3001";
server(addr);
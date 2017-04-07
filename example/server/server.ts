import * as Proxy from "./../../src/index"
import { info } from "logez/dist";

function init(){
  onLoad((evt)=>{
    startServer();
  });
}

function onGet(req: Proxy.Request, _sender: Proxy.ResponseSender){
  info("got req", req);
  setTimeout(()=>{
    _sender({
      code: Proxy.Status.SUC,
      msg: "success",
      payload: {
        msg: "received request " + req.url, 
        params: req.payload["parameter"]
      }
    } as Proxy.Response);
  }, 200);
}

function startServer(){
  let server = new Proxy.Server();
  server.setRequestHandler("GET", null, onGet);
}

function onLoad(h: EventListener){
  if(document.readyState == "ready"){
    h(null);
  }else{
    document.onload = h;
    window.onload = h;
  }
}

init();
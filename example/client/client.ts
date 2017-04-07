import * as log from 'logez'

import {OnResponse} from '../../src';

import * as Proxy from './../../src/index'


function onResponse(pld: any) {
  document.body.innerHTML +=  `received: <em>${JSON.stringify(pld)}</em> <br>`;
}

function sendDummyRequest(client: Proxy.Client) {
  let req = {
    method: 'GET',
    url: serverUrl + '/GetNewToy',
    payload: {parameter: [1, 2, 3, 4, 5]},
  } as Proxy.Request;
  let counter = 0;
  setInterval(()=>{
    document.body.innerHTML+= `${counter++}. sending request ${JSON.stringify(req)} <br>`;
    client.sendRequest(req, onResponse);
  }, 2000);
}

function
init() {
  onLoad((evt) => {
    let client = new Proxy.Client(serverUrl, () => {
      sendDummyRequest(client);
    });
  });
}

function onLoad(h: EventListener) {
  if (document.readyState == 'ready') {
    h(null);
  } else {document.onload = h; window.onload = h;}
} const serverUrl = 'http://localhost:30001/example/server/server.html';
init();
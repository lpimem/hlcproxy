import {debug, error, warn} from 'logez';

export interface Request {
  method: string
  url: string
  payload?: any
  _callback: string
}

export interface Response {
  code: number
  msg: string
  payload?: any
  _callback: string
}

export interface OnResponse { (pld: any): void }

export interface ResponseSender { (resp: Response): void }

export interface RequestHandler {
  (req: Request, _sender: ResponseSender): void
}

export class Server {
  constructor() {
    this.m_s = window;
    this.m_origin = window.location.origin;
    this.register();
  }

  public setRequestHandler(
      method: string, url: string, handler: RequestHandler) {
    const key = Server.getKey(method, url);
    this.m_handlers[key] = handler;
  }

  private static getKey(method: string, url: string) {
    if (!url) {
      url = '';
    }
    return `${method}_${url}`;
  }

  private onRequest(req: Request, source: Window, origin: string) {
    debug('get request from', this.m_origin, req);
    let key = Server.getKey(req.method, req.url);
    let handle = this.m_handlers[key];
    if (!handle) {
      key = Server.getKey(req.method, null);
      handle = this.m_handlers[key];
    }
    if (handle) {
      handle(req, this.send.bind(this, source, origin, req._callback));
    }
  }

  private send(to: Window, origin: string, _callback:string, resp: Response) {
    debug('responding to', origin, resp);
    resp._callback = _callback;
    to.postMessage(resp, origin);
  }

  private onMessage(evt: MessageEvent) {
    debug('got message', evt);
    if (!isRequest(evt.data)) {
      warn('rejected msg from', evt.origin);
      return;
    }
    this.onRequest(evt.data as Request, evt.source, evt.origin);
  }

  private register() {
    this.m_s.addEventListener('message', this.onMessage.bind(this));
    debug('server handler registered');
  }

  private m_s: Window;
  private m_origin: string;
  private m_handlers = {} as RequestHandlerDict;
}

export class Client {
  /**
   * Create a new Client instance.
   * Assumes the current window is loaded.
   * @param server Reference to proxy server's window
   * @param timeout [optional] milliseconds for the request to timeout.
   */
  constructor(serverUrl: string, onReady: () => void, timeout?: number) {
    this.m_serverUrl = serverUrl;
    this.m_timeout = timeout;
    this.m_c = window;
    this.patch(onReady);
  }

  sendRequest(req: Request, callback: OnResponse) {
    let uuid = generateRandomUUID();
    this.m_cbdict[uuid] = callback;
    req._callback = uuid;
    debug('sending request to', this.m_origin, req);
    this.m_s.postMessage(req, this.m_origin);
  }

  private onMessage(evt: MessageEvent) {
    if (evt.origin != this.m_origin) {
      warn(`rejected message from ${evt.origin}`);
      return;
    }
    let resp = evt.data as Response;
    if (resp.code == Status.SUC) {
      try {
        this.m_cbdict[resp._callback](resp.payload);
      } catch (e) {
        error(e);
        error(this.m_cbdict);
        error(resp._callback);
        error(this.m_cbdict[resp._callback]);
      }
    } else {
      error(resp.msg);
    }
    delete this.m_cbdict[resp._callback];
  }

  private register() {
    this.m_c.addEventListener('message', this.onMessage.bind(this));
  }

  private patch(onReady: () => void) {
    this.m_origin = getOrigin(this.m_serverUrl);
    this.m_s = this.m_c.open(this.m_serverUrl);
    setTimeout(() => {
      this.register();
      onReady();
    }, 2000);
  }

  private m_cbdict = {} as CallbackDict;
  private m_serverUrl: string;
  private m_timeout: number;
  private m_s: Window;
  private m_c = window;
  private m_origin: string;
}

export enum Status {
  FAIL = 0,
  SUC = 1
}

function getOrigin(url: string) {
  let a = document.createElement('a');
  a.href = url;
  return `${a.protocol}//${a.host}`;
}

interface CallbackDict {
  [key: string]: OnResponse
}

function isRequest(obj: any): obj is Request {
  return obj.method && obj.url && obj._callback;
}

interface RequestHandlerDict {
  [methodAndUrl: string]: RequestHandler
}

// from stackoverflow.
function generateRandomUUID() {
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() +
      s4() + s4();
}

function s4() {
  return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}
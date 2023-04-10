import express, { Express, Request, Response } from 'express';

import { NotificationMsg } from '../common/common';

const PORT = Number(process.env.PORT) || 3010;

interface PeerInfo {
  id: string;
  res: Response;
  begin: Date;
}

const Log = (msg: string) => {
  console.log(new Date().toISOString() + ' ' + msg);
};

class Server {
  private _express: Express;
  private _count = 0;
  private _sequence = 0;
  private readonly _clientList = new Map<string, PeerInfo>();
  constructor(private _port: number) {}
  start() {
    Log(`Starting... port=${PORT}`);
    this._express = express();
    this._express.use(express.json());
    this._express.use(express.urlencoded({ extended: true }));

    // index.html
    this._express.use(express.static('dist'));

    setInterval(() => {
      this.sendPing();
    }, 30000);

    // sse
    this._express.get('/sse', (req: Request, res: Response) => {
      const id = (this._count++).toString();
      const headers = {
        'Content-Type': 'text/event-stream',
        Connection: 'keep-alive',
        'Cache-Control': 'no-store',
        'X-client-id': id,
      };
      res.writeHead(200, headers);
      res.flushHeaders();
      res.write('retry: 10000\n\n');

      const begin = new Date();
      Log(`[start] id: ${id}  ${begin.toISOString()}`);

      this._clientList.set(id, { id: id, res: res, begin: begin });
      this.broadcastClientList();

      req.on('close', () => {
        const entry = this._clientList.get(id);
        Log(
          `[close]: ${id}  ${
            entry && entry.begin ? entry.begin.toISOString() : ''
          }`
        );
        this._clientList.delete(id);
        this.broadcastClientList();
      });
    });

    this._express.post('/send', (req: Request, res: Response) => {
      const input = req.body as { message: string };
      if (input.message) {
        this.broadcastMessage({
          mode: 'notify',
          message: input.message,
        });
      }
    });

    // start.
    this._express.listen(this._port);
  }

  private sendMessage(id: string, body: NotificationMsg) {
    const data = JSON.stringify(body);
    const c = this._clientList.get(id);
    if (c) {
      c.res.write(`data: ${data}\n\n`);
      Log(`[sendMessage]: ${this._sequence}`);
      this._sequence++;
    }
  }

  private broadcastMessage(body: NotificationMsg) {
    const data = JSON.stringify(body);
    this._clientList.forEach((v) => {
      v.res.write(`data: ${data}\n\n`);
    });
    Log(`[broadcastMessage]: ${data}`);
    this._sequence++;
  }

  private sendPing() {
    this.broadcastMessage({
      mode: 'ping',
      message: 'validate',
    });
  }
  private broadcastClientList() {
    const list = Array.from(this._clientList).map((v) => {
      return { id: v[1].id, begin: v[1].begin };
    });
    this.broadcastMessage({
      mode: 'clientList',
      message: 'clientList',
      data: JSON.stringify(list),
    });
  }
}

const server = new Server(PORT);

try {
  server.start();
} catch (e) {
  if (e instanceof Error) {
    console.error(e.message);
  }
}

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const PORT = 3010;
const Log = (msg) => {
    console.log(new Date().toISOString() + ' ' + msg);
};
class Server {
    constructor(_port) {
        this._port = _port;
        this._count = 0;
        this._sequence = 0;
        this._clientList = new Map();
    }
    start() {
        this._express = (0, express_1.default)();
        this._express.use(express_1.default.json());
        this._express.use(express_1.default.urlencoded({ extended: true }));
        // index.html
        this._express.use(express_1.default.static('dist'));
        setInterval(() => {
            this.sendPing();
        }, 30000);
        // sse
        this._express.get('/sse', (req, res) => {
            const remoteAddress = req.socket.remoteAddress;
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
                Log(`[close]: ${id}  ${entry && entry.begin ? entry.begin.toISOString() : ''}`);
                this._clientList.delete(id);
                this.broadcastClientList();
            });
        });
        this._express.post('/send', (req, res) => {
            const input = req.body;
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
    sendMessage(id, body) {
        const data = JSON.stringify(body);
        const c = this._clientList.get(id);
        if (c) {
            c.res.write(`data: ${data}\n\n`);
            Log(`[sendMessage]: ${this._sequence}`);
            this._sequence++;
        }
    }
    broadcastMessage(body) {
        const data = JSON.stringify(body);
        this._clientList.forEach((v) => {
            v.res.write(`data: ${data}\n\n`);
        });
        Log(`[broadcastMessage]: ${data}`);
        this._sequence++;
    }
    sendPing() {
        this.broadcastMessage({
            mode: 'ping',
            message: 'validate',
        });
    }
    broadcastClientList() {
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
}
catch (e) {
    if (e instanceof Error) {
        console.error(e.message);
    }
}
//# sourceMappingURL=server.js.map
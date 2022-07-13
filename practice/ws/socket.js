const WebSocket = require('ws');

module.exports = (server) => {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws, req) => {
        const ip = req.headers['x-forwarded-for'] ||
                    req.connection.remoteAddress;
        console.log('New client' + ip);
        ws.on('message', (message) => {             // 클라이언트로부터 받은 메세지
            console.log(message.toString());
        });

        ws.on('error', (err) => {
            console.error(err);
        });

        ws.on('close', () => {
            console.log('접속 해제');
            clearInterval(ws.interval);
        });

        ws.interval = setInterval(() => {      // 서버에서 보내는 메세지 3초마다.
            if (ws.readyState === ws.OPEN){             // OPEN, CLOSE, CLOSING, CONNECTING
                ws.send('Message from server')
            }
        }, 3000);
    });
}
const http = require('http');

const server = http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.write('<h1> Node로 Server 만들기 실습</h1>');
    res.end('<p> http모듈 사용법 공부 중...');
})
    .listen(8085, () => {
        console.log('server만들기 실습중');
    });

// Listening Event Listener

server.on('listening', () => {
    console.log('8085 포트 리스닝 중')
});

/* Error Event Listener */

server.on('error', () => {
    console.log(error);
})
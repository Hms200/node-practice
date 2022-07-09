const http = require('http');

http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8'});
    res.write('<h1> Node로 Server 만들기 실습</h1>');
    res.end('<p> http모듈 사용법 공부 중...');
})
    .listen(8085, () => {
        console.log('8085포트 listening')
    });
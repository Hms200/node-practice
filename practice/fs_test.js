const http = require('http');
const fs = require('fs').promises;

http.createServer(async (req, res) => {
    try {
        const f = await fs.readFile('./fs-test.html');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8'});
        res.end(f);
    } catch (err){
        console.log(err);
        res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8'});
        res.end(err.message);
    }
})
    .listen(8085, () => {
        console.log('8085 포트 리스닝.... nodemon test 해봅시다')
    })
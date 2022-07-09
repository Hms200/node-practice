const express = require('express');
const app = express();
app.set('port', process.env.PORT || 8085);
app.use(express.static(__dirname + '/statics'));

app.get('/', (req, res) => {
    const output = `
                    <h2>express로 웹페이지 만들기</h2><br>
                    <p>메인 페이지 입니다.</p>
                    <img src="./111.jpg" width="50%" />
                    `
    res.send(output);
});

app.get('/user/:id', (req, res) => {
    res.send(req.params.id + '님의 개인 페이지 입니다.');
});

app.listen(app.get('port'), ()=>{
    console.log(app.get('port') + ' is listening...');
});
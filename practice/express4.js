const express = require('express');
const app = express();
// error 처리 미들웨어는 뒤에 작성해야 정상 작동. js는 코드가 쓰여진 순서대로 동작하기 때문.
app.use(function(err, req, res, next){
    console.log(err.stack);
    res.status(500).send('something broken');
});

app.listen(3000);

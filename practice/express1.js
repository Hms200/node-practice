const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(8085, () => {
    console.log('8085포트 리스닝');
})
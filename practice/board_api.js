const morgan = require('morgan');

// express
const express = require('express');
const app = express();

// set port
app.set('port', process.env.PORT || 8085);

// middle ware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded( { extended: true }));

// test data
let boardList = [];
let numOfBoard = 0;

// set route
app.get('/', (req, res) => {
    res.send('This is board API');
})

// board API
app.get('/board', (req, res) => {
    res.send(boardList);
});

app.post('/board', (req, res) => {
    const board = {
        "id": ++numOfBoard,
        "user_id": req.body.user_id,
        "date": new Date(),
        "title": req.body.title,
        "content": req.body.content,
    };
    boardList.push(board);

    res.redirect('/board');
});

app.put('/board/:id', (req, res) => {
    // req.param.id 찾아서 삭제
    const findItem = boardList.find((item) => {
        return item.id == req.params.id
    });
    console.log(findItem.toString())
    const idx = boardList.indexOf(findItem);
    boardList.splice(idx, 1);

    // add item on the list
    const board = {
        "id": req.params.id,
        "user_id": req.body.user_id,
        "date": new Date(),
        "title": req.body.title,
        "content": req.body.content,
    };
    boardList.push(board);

    res.redirect('/board');
});

app.delete('/board/:id', (req, res) => {
    const findItem = boardList.find((item) => {
        return item.id == req.params.id
    });

    const idx = boardList.indexOf(findItem);
    boardList.splice(idx, 1);

    res.redirect('/board');
});

// port listening
app.listen(app.get('port'), () => {
    console.log(app.get('port') + ' port is listening');
});
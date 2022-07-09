const express = require('express');
const app = express();

app.set('port', process.env.PORT || 8085);

app.use(express.static(__dirname + '/statics'));

app.get('/', (req,res) => {
    res.sendFile(__dirname + '/static_text.html');
});

app.listen(app.get('port'), () =>{
    console.log(app.get('port') + ' listening...')
});
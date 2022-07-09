const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const app = express();

// set port
app.set('port', process.env.PORT || 8085);

// 공통 미들웨어
app.use(express.static(__dirname + '/statics'));
app.use(morgan('dev'));
app.use(cookieParser('secret@1234'));
app.use(session({
    secret: 'secret@1234',   // 암호화
    resave: false,          // 새로운 요청 시 세션에 변동 사항이 없어도 다시 저장할지 설정
    saveUninitialized: true,// 새션에 저장할 내용이 없어서 저장할지 설정
    cookie: {               // 세션 쿠키 옵션 설정. httpOnly, expires, domain, path, secure, sameSite
        httpOnly: true,     // login 구현 시 필수. js 로 접근 방지
    },
    // name : 'connect.sid'           세션 쿠키의 name 지정. 기본설정이 connect.sid
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// 라우팅 설정
app.get('/', (req,res) => {
    if(req.session.name){
        const output = `
                        <h2>로그인한 사용자 님</h2><br>
                        <p>${req.session.name}님 안녕하세요.</p><br>
                        `
        res.send(output);
    }else{
        const output = `
                        <h2>로그인 하지 않은 사용자님</h2><br>
                        <p>로그인 후 이용해 주세요</p><br>
                        `
        res.send(output);
    }
});

app.get('/login', (req, res) => {
    console.log(req.session);
    //쿠키를 사용할 경우 쿠키에 값 설정
    // res.cookie(name, value, options)
    // 세션 쿠키를 사용할 경우
    req.session.name = '뿡뿡';
    res.end('Login OK');
});

app.get('/logout', (req, res) => {
    res.clearCookie('connect.sid');   // 세션 쿠키 삭제
    res.end('LOGOUT OK');
});

// 서버 포트 리스닝
app.listen(app.get('port'), () => {
    console.log(app.get('port') + ' is listening');
});
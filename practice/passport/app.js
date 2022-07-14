const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const app = express();
app.set('port', process.env.PORT || 8085);

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser('passport'));
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: 'passport',
    cookie: {
        httpOnly: true,
        secure: false
    }
}));
app.use(passport.initialize()); // passport 초기화
app.use(passport.session());    // passport session 연동

let fakeUser = {
    username: 'test@test.test',
    password: 'test'
};

passport.serializeUser(function (user, done) {      // 로그인 성공한 경우 session에 저장
    console.log('serializeUser', user);
    done(null, user.username);
});

passport.deserializeUser(function (id, done) {
    console.log('deserializeuser', id);
    done(null, fakeUser)                                // req.user에 전달
});

passport.use(new LocalStrategy(
    function (username, password, done) {
        if(username === fakeUser.username) {
            if(password === fakeUser.password) {
                return done(null, fakeUser)
            } else {
                return done(null, false, { message: 'incorrect password'})
            }
        } else {
            return done(null, false, { message: 'incorrect username'})
        }
    }
));

 app.get('/', (req, res) => {
     if(!req.user) {
         res.sendFile(__dirname + '/index.html');
     } else {
         const user = req.user.username;
         const html = `
            <!DOCTYPE html>
            <html lang="ko">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title> welcome </title>
            </head>
            <body>
                <p>${ user } 님 안녕하세요!</p>
                <button type="button" onclick="location.href='/logout'">Log Out</button>
            </body>
            </html>
            `;
         res.send(html);
     }
 });

// passport login : stratege-local
app.post('/login',
    passport.authenticate('local', { failureRedirect: '/'}),
    function (req, res) {
    res.send('login success');
});

app.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if(err) {
            return next(err)
        }
    });
    res.redirect('/');
});

// error handling 404
app.use((req, res, next) => {
    const error = new Error(`${ req.method } ${ req.url } 해당 주소가 없습니다.`);
    error.status = 404;
    next(error);
});

// error handling 그 외 오류
app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_ENV !== 'development' ? err : {};
    console.error(err);
    res.status(err.status || 500);
    res.send('error Occurred');
});

app.listen(app.get('port'), () => {
    console.log(app.get('port') + ' is listening')
});



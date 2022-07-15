const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const socket = require('socket.io');
const dotenv = require('dotenv');
const flash = require('connect-flash');


const port = process.env.PORT || 3000;
dotenv.config();
const app = express();

// routes
const postRoutes = require('~/routes/posts');
const userRoutes = require('~/routes/users');

// model
const User = require('./models/User');
const Post = require('./models/Post')

// 채팅 유저
const onlineChatUser = {};

// cookie, session, flash
app.use(cookieParser(process.env.SECRET));
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
}));
app.use(flash());

// passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static('/bbs/public'));

// MongoDB Connection
mongoose
    .connect('mongodb://root:example@localhost:27017/roadbook?authSource=admin', {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('mongoDB connected');
    })
    .catch((err) => {
        console.error(err)
    });

// 전역변수
app.use((req, res, next) => {
    res.locals.user = req.user;
    res.locals.login = req.isAuthenticated();
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
});

// routers
app.use('/', userRoutes);
app.use('/', postRoutes);

const server = app.listen(port, () => {
    console.log(port + 'is listening...');
});

// websocket
const io = socket(server);

const room = io.of('/chat');
room.on('connection', socket => {
    console.log('new User : ', socket.id);
    room.emit('newUser', { socketID: socket.id });

    socket.on('newUser', data => {
        if(!(data.name in onlineChatUser)) {
            onlineChatUser[data.name] = data.socketID;
            socket.name = data.name;
            room.emit('updateUserList', Object.keys((onlineChatUser)));
            console.log('Online users : ' + Object.keys(onlineChatUser));
        }
    });

    socket.on('disconnect', () => {
        delete onlineChatUser[socket.name];
        room.emit('updateUserList', Object.keys(onlineChatUser));
        console.log(`user ${ socket.name } is disconnected`);
    });

    socket.on('chat', data => {
        console.log(data);
        if(data.to === 'Global Chat') {
            room.emit('chat', data);
        } else if(data.to) {
            room.to(onlineChatUser[data.name].emit('chat', data));
            room.to(onlineChatUser[data.to].emit('chat', data));
        }
    });
});


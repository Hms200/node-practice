const express = require('express');
const User = require('../models/User');
const passport = require('passport');
const multer = require('multer');
const isLoggedIn = require('../isLoggedIn')

const router = express.Router();

// multer setting
const storage = multer.diskStorage({
    filename: (req, file, callback) => {
        callback(null, Date.now() + file.originalname);             // file명은 현제날짜 + 오리지날 파일명
    },
    destination: function(req, file ,callback){
        callback(null, "public/")
    },
});

const imageFilter = (req, file, callback) => {
    if(!file.originalname.match(/\.(jpg|jpeg|png)$/i)) {
        return callback(new Error('jpg, jpeg, png 파일만 가능합니다.'), false);
    }
    callback(null, true);
};

const uploade = multer({ storage: storage, fileFilter: imageFilter });

// router
router.post('/bbs/user/register', uploade.single('image'), (req, res) => {
    if(
        req.body.username &&
        req.body.firstName &&
        req.body.lastName &&
        req.body.password
    ) {
        let newUser = new User({
            username: req.body.username,
            firstName: req.body.firstName,
            lastName: req.body.lastName
        });
        if(req.file) {
            newUser.profile = `/bbs/public/${ req.file.filename }`
            return createUser(newUser, req.body.password, req, res);
        } else {
            newUser.profile = process.env.DEFAULT_PROFILE_PIC;
            return createUser(newUser, req.body.password, req, res);
        }
    }
});

// create user
function createUser(newUser, password, req, res) {
    User.register(newUser, password, (err, user) => {
        if(err) {
            req.flash('error', err.message);
            res.redirect('/');
        } else {
            passport.authenticate('local', { failureRedirect: '/' }, function (req, res){
                console.log(req.user);
                req.flash('success', 'logged in!');
                res.redirect('/');
            });
        }
    });
}

// login
router.get('/user/login', (req, res) => {
    res.render('users/login');
});

router.post('/user/login',
            passport.authenticate('local', { successRedirect: '/', failureRedirect: '/' },
            function (req, res) {}),
            (req, res) => {}
            );

// all users
router.get('/user/all', isLoggedIn, (req, res) => {
    User.find({}, (err, users) => {
        if(err) {
            console.error(err);
            req.flash('error', 'couldnt get all user list');
            res.redirect('/')
        } else {
            res.render('users/users', { users: users })
        }
    });
});

// logout
router.get('/user/logout', (req, res) => {
    req.logout();
    res.redirect('back')
});

// user profile
router.get('/user/:id/profile', isLoggedIn, (req, res) => {
    User.findById(req.params.id)
        .populate('friends')
        .populate('friendRequests')
        .populate('posts')
        .exec((err, user) => {
            if(err) {
                console.error(err);
                req.flash('error', 'an error has been occured');
                res.redirect('back');
            } else {
                console.log(user);
                res.render('users/user', { userData: user });
            }
        });
})

// add friend
router.get('/user/:id/add', isLoggedIn, (req, res) => {
    User.findById(req.user._id, (err, user) => {
        if(err) {
            console.error(err);
            req.flash('error', 'an error has been occured');
            res.redirect('back');
        } else {
            User.findById(req.params.id, (err, foundUser) => {
                if(err) {
                    console.error(err);
                    req.flash('error', 'couldnt find person');
                    res.redirect('back');
                } else {
                    if(foundUser.friendRequests.find(o => o._id.equals(user._id))){
                        req.flash('error', `youve already sent request to ${ user.firstName }`);
                        return res.redirect('back')
                    } else if(foundUser.friends.find(o => o._id.equals(user._id))){
                        req.flash('error', `the user ${ foundUser.firstName } is already in your friends list`);
                        return res.redirect('back');
                    }
                    let currentUser = {
                        _id: user._id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                    };
                    foundUser.friendRequests.push(currentUser);
                    foundUser.save();
                    req.flash('success', `sent a request to ${ foundUser.firstName }`);
                    res.redirect('back');

                }
            });
        }
    });
});

// accept request
router.get('/user/:id/accept', isLoggedIn, (req, res) => {
    User.findById(req.user._id, (err, user) => {
        if(err) {
            console.error(err);
            req.flash('error', 'an error occured when finding your profile. check the connection');
            res.redirect('back');
        } else {
            User.findById(req.params.id, (err, foundUser) => {
                let r = user.friendRequests.find(o => o._id.equals(req.params.id));
                if(r) {
                    let index = user.friendRequests.indexOf(r);
                    user.friendRequests.splice(index, 1);
                    let friend = {
                        _id: foundUser._id,
                        firstName: foundUser.firstName,
                        lastName: foundUser.lastName,
                    };
                    user.friends.push(friend);
                    user.save();

                    let currentUser = {
                        _id: user._id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                    };
                    foundUser.friends.push(currentUser);
                    foundUser.save();
                    req.flash('success', `${ foundUser.firstName } is now your friend`);
                    res.redirect('back');
                } else {
                    req.flash('error', 'error occured when accepting request');
                    res.redirect('back');
                }
            });
        }
    });
});

// decline friend request
router.get('/user/:id/decline', isLoggedIn, (req, res) => {
    User.findById(req.user._id, (err, user) => {
        if(err) {
            console.error(err);
            req.flash('error', 'there has been an error declining the request');
            res.redirect('back');
        } else {
            User.findById(req.params.id, (err, foundUser) => {
                if(err) {
                    console.error(err);
                    req.flash('error', 'there has been an error declining the request');
                    res.redirect('back');
                } else {
                    // remove request
                    let r = user.friendRequests.find(o => o._id.equals(foundUser._id));
                    if(r) {
                        let index = user.friendRequests.indexOf(r);
                        user.friendRequests.splice(index, 1);
                        user.save();
                        req.flash('success', 'declined');
                        res.redirect('back')
                    }
                }
            });
        }
    });
});

// chat
router.get('/chat', isLoggedIn, (req, res) => {
    User.findById(req.user._id)
        .populate('friends')
        .exec((err, user) => {
            if(err) {
                console.error(err);
                req.flash('error', 'couldnt access the chat');
                res.redirect('/');
            } else {
                res.render('users/chat', { userData: user });
            }
        });
});

module.exports = router;

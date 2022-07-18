const express = require('express');
const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');
const multer = require('multer');
//const isLoggedIn = require('../isLoggedIn')

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
//

const isLoggedIn = (req, res, next) => {
    console.log('checking login')
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash('error', 'login please');
    res.redirect('/bbs/user/login');
}


// router
router.get('/',  (req, res) => {
    console.log('/');
    User.findById(req.user._id)         // 친구 게시글
        .populate({
            path: 'friends',
            populate: {
                path: 'posts',
                model: 'Post'
            }
        })
        .populate('posts')              // 현재 사용자 게시글
        .exec((err, user) => {
            if(err) {
                console.error(err);
                req.flash('error', 'an error occured finding posts');
                res.render('posts/index');
            } else {
                let posts = [];
                for(let i=0; i<user.friends.length; i++) {
                    for(let j=0; j<user.friends[i].posts.length; j++) {
                        posts.push(user.friends[i].posts[j]);
                    }
                }
                for(let i=0; i<user.posts.length; i++) {
                    posts.push(user.posts[i]);
                }
                if(posts) {
                    res.render('posts/index', { posts: posts});
                } else {
                    res.render('posts/index', { posts: null });
                }
            }
        });
});

router.get('/post/:id/like', isLoggedIn, (req, res) => {
    User.findById(req.user._id, (userErr, user) => {
        if(userErr) {
            console.error(userErr);
            req.flash('error', 'error occured trying to like this post');
            res.redirect('back');
        } else {
            Post.findById(req.params.id, (postErr, post) => {
                if(postErr) {
                    console.error(postErr);
                    req.flash('error', 'error occured trying to like this post');
                    res.redirect('back');
                } else {
                    for(let i=0; i< user.liked_posts.length; i++) {
                        if(user.liked_posts[i].equals(post._id)) {
                            req.flash('error', 'already liked this post');
                            return res.redirect('back');
                        }
                    }
                    post.likes = post.likes + 1;
                    post.save();
                    user.liked_posts.push(post._id);
                    user.save();
                    req.flash('success', `successfully liked ${ post.creator.firstName }'s post`);
                    res.redirect('back');
                }
            });
        }
    });
});

router.get('/post/:postid/comment/:commentid/like', isLoggedIn, (req, res) => {
    User.findById(req.user._id, (userErr, user) => {
        if(userErr) {
            console.error(userErr);
            req.flash('error', 'error occured trying to like this post');
            res.redirect('back');
        } else {
            Comment.findById(req.params.commentid, (commentErr, comment) => {
                if(commentErr) {
                    console.error(commentErr);
                    req.flash('error', 'error occured trying to find the comment')
                    res.redirect('back');
                } else {
                    comment.likes += 1;
                    comment.save();
                    user.liked_comments.push(comment._id);
                    user.save();
                    req.flash('success', `successfully liked ${ comment.creator.firstName }'s comment`);
                    res.redirect('back');
                }
            });
        }
    });
});

router.get('post/new', isLoggedIn, (req, res) => {
    res.render('posts/new');
});

router.post('/post/new', isLoggedIn, uploade.single('image'), (req, res) => {
    if(req.body.content) {
        let newPost = {};
        if(req.file) {
            newPost.image = `/bbs/public/${ req.file.filename }`;
            newPost.creator = req.user;
            newPost.time = new Date();
            newPost.likes = 0;
            newPost.content = req.body.content;
            return createPost(newPost, req, res);
        } else {
            newPost.image = null;
            newPost.creator = req.user;
            newPost.time = new Date();
            newPost.likes = 0;
            newPost.content = req.body.content;
            return createPost(newPost, req, res);
        }
    }
});

function createPost(newPost, req, res) {
    Post.create(newPost, (err, post) => {
        if(err) {
            console.error(err);
        } else {
            req.user.posts.push(post._id);
            req.user.save();
            res.redirect('/');
        }
    });
}

router.get('/post/:id', isLoggedIn, (req, res) => {
    Post.findById(req.params.id)
        .populate('comments')
        .exec((err, post) => {
            if(err) {
                console.error(err);
                req.flash('error', 'an error occured finding this post');
                res.redirect('back');
            } else {
                res.render('posts/show', { post: post });
            }
        });
});

router.post('/post/:id/comments/new', isLoggedIn, (req, res) => {
    Post.findById(req.params.id, (err, post) => {
        if(err) {
            console.error(err);
            req.flash('error', 'an error occured posting your comment');
            res.redirect('back');
        } else {
            Comment.create({ comment: req.body.content }, (err, comment) => {
                if(err) {
                    console.error(err);
                    req.flash('error', 'Something went wrong with posting your comment');
                    res.redirect('back');
                } else {
                    comment.creator._id = req.user._id;
                    comment.creator.firstName = req.user.firstName;
                    comment.creator.lastName = req.user.lastName;
                    comment.likes = 0;
                    comment.save();
                    post.comments.push(comment);
                    post.save();
                    req.flash('success', 'Successfully posted your comment');
                    res.redirect('/post/' + post._id);
                }
            });
        }
    });
});

module.exports = router;

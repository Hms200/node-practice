const isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash('error', 'login please');
    res.redirect('/bbs/user/login');
}

module.export = isLoggedIn
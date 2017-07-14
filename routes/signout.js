var express = require('express');
var router = express.Router();

var checkLogin = require('../middlewares/check').checkLogin;

// GET /signout: user sign out
router.get('/', checkLogin, function(req, res, next){
    // clear the user info in session
    req.session.user =null;
    req.flash('success', 'Successfully signed out');
    // redirect to homepage
    res.redirect('/posts');
});

module.exports = router;
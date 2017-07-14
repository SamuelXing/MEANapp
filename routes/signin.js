var sha1 = require('sha1');
var express = require('express');
var router = express.Router();

var UserModel = require('../models/users');
var checkNotLogin = require('../middlewares/check').checkNotLogin;

// GET /signin: sign in page
router.get('/', checkNotLogin, function(req, res, next){
   res.render('signin');
});

// POST /signin: user sign in
router.post('/', checkNotLogin, function(req, res, next){
   var name =req.fields.name;
   var password = req.fields.password;

   UserModel.getUserByName(name)
       .then(function(user){
         if(!user){
            req.flash('error', 'User does not exist.');
            return res.redirect('back');
         }
          // check if the password match or not
          if(sha1(password)!== user.password){
             req.flash('error', 'username or password is wrong!');
             return res.redirect('back');
          }
          req.flash('success', 'successfully signed in');
          // write user info into session
          delete user.password;
          req.session.user = user;
          // redirect to homepage
          res.redirect('/posts');
       })
       .catch(next)
});

module.exports = router;
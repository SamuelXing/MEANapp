var fs= require('fs');
var path = require('path');
var sha1 = require('sha1');
var express = require('express');
var router = express.Router();

var UserModel = require('../models/users');
var checkNotLogin = require('../middlewares/check').checkNotLogin;

// GET /signup: get user register page
router.get('/', checkNotLogin, function(req, res, next){
    res.render('signup');
});

// POST /signin: post register info
router.post('/', checkNotLogin, function(req, res, next){
    var name =  req.fields.name;
    var gender = req.fields.gender;
    var bio = req.fields.bio;
    var avatar = req.files.avatar.path.split(path.sep).pop();
    var password = req.fields.password;
    var repassword = req.fields.repassword;

    // check & validate
    try{
        if(!(name.length >= 1 && name.length <= 10)){
            throw new Error('Name: please input 1-10 characters');
        }
        if(['m', 'f', 'x'].indexOf(gender) === -1){
            throw new Error('Gender: only m, f, x');
        }
        if(!(bio.length >= 1 && bio.length <= 30)){
            throw new Error('Bio: Please limit you bio within 1-30 characters');
        }
        if(!req.files.avatar.name){
            throw new Error('Avatar: Profile image required');
        }
        if(password.length < 6){
            throw new Error('Password: please input at least 6 characters');
        }
        if(password != repassword){
            throw new Error('Passwords don\'t match');
        }
    }catch (e)
    {
        fs.unlink(req.files.avatar.path);
        req.flash('error', e.message);
        return res.redirect('/signup');
    }

    // encrypt the password
    password = sha1(password);

    //write to database
    var user = {
        name: name,
        password: password,
        gender: gender,
        bio: bio,
        avatar: avatar
    };

    UserModel.create(user)
        .then(function(result){
            // insert into mongoDB
            user = result.ops[0];
            // save user info to session
            delete user.password;
            req.session.user = user;
            // write flash
            req.flash('success', 'Successfully sign up');
            // redirect to index page
            res.redirect('/posts');
        })
        .catch(function(e){
            // fail, async delete uploaded file
            fs.unlink(req.files.avatar.path);
            // if username has been used, then redirect to signup page
            if(e.message.match('E11000 duplicate key')){
                req.flash('error','Username has been used');
                return res.redirect('/signup');
            }
            next(e);
        });
});

module.exports = router;
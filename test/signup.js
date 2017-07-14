var path = require('path');
var assert = require('assert');
var request = require('supertest');
var app = require('../index');
var User = require('../lib/mongo').User;

var testName ='testname1';
var testName2 = 'nswbmw';
describe('signup', function(){
    describe('POST /signup', function() {
        var agent = request.agent(app); //persist cookie when redirect
        beforeEach(function(done){
            // create a user
            User.create({
                name: testName,
                password: '123456',
                avatar: '',
                gender: 'x',
                bio: ''
            })
                .exec()
                .then(function(){
                    done();
                })
                .catch(done);
        });

        afterEach(function (done){
            // delete a user
            User.remove({ name: {$in: [testName, testName2] }})
                .exec()
                .then(function(){
                    done();
                })
                .catch(done);
        });

        // user name is wrong
        it('wrong name', function(done){
            agent
                .post('/signup')
                .type('form')
                .attach('avatar', path.join(__dirname, 'avatar.png'))
                .field({ name: ''})
                .redirects()
                .end(function(err, res){
                   if(err)
                       return done(err);
                    assert(res.text.match(/Name: please input 1-10 characters/));
                    done();

                });
        });

        // gender is wrong
        it('wrong gender', function(done){
            agent
                .post('/signup')
                .type('form')
                .attach('avatar', path.join(__dirname, 'avatar.png'))
                .field({name: testName2, gender: 'a'})
                .redirects()
                .end(function(err, res){
                   if(err) return done(err);
                    assert(res.text.match(/Gender: only m, f, x/));
                    done();
                });
        });

        // username has been used
        it('duplicate name', function(done){
            agent
                .post('/signup')
                .type('form')
                .attach('avatar', path.join(__dirname, 'avatar.png'))
                .field({name: testName, gender: 'm', bio: 'noder', password: '123456', repassword: '123456'})
                .redirects()
                .end(function(err, res){
                   if(err) return done(err);
                    assert(res.text.match(/Username has been used/));
                    done();
                });
        });

        // success
        it('success', function(done){
            agent
                .post('/signup')
                .type('form')
                .attach('avatar', path.join(__dirname, 'avatar.png'))
                .field({ name: testName2, gender: 'm', bio: 'noder', password: '123456', repassword: '123456' })
                .redirects()
                .end(function(err, res){
                    if (err) return done(err);
                    assert(res.text.match(/Successfully sign up/));
                    done();
                });
        })

    })

})
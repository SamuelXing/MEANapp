var express = require('express');
var router = express.Router();
var checkLogin = require('../middlewares/check').checkLogin;

var PostModel = require('../models/posts');
var CommentModel = require('../models/comments');

// GET /posts: get all the posts by all users or a specific user
router.get('/', function(req, res, next){
    var author = req.query.author;

    PostModel.getPosts(author)
        .then(function(posts){
            res.render('posts',{
                posts: posts
            });
        })
        .catch(next);
});

// POST ／posts: post a page
router.post('/', checkLogin, function(req,res, next){
    var author = req.session.user._id;
    var title = req.fields.title;
    var content =req.fields.content;

    // validate
    try {
        if(! title.length){
            throw new Error('Please input title');
        }
        if(! content.length){
            throw new Error('Please input content');
        }
    } catch (e) {
        req.flash('error', e.message);
        return res.redirect('back');
    }

    var post = {
        author: author,
        title: title,
        content: content,
        pv: 0
    };

    PostModel.create(post)
        .then(function(result){
            post = result.ops[0];
            req.flash('success', 'success');
            res.redirect('/posts/${post._id}');
        })
        .catch(next);
});

// GET /posts/create: submit some content
router.get('/create', checkLogin, function(req,res,next){
    res.render('create');
});

// GET /posts/:postId: a single page
router.get('/:postId', function(req, res, next){
    var postId = req.params.postId;

    Promise.all([
        PostModel.getPostById(postId), //get post
        CommentModel.getComments(postId),
        PostModel.incPv(postId)
    ])
        .then(function(result){
            var post = result[0];
            var comments = result[1];
            if(!post){
                throw new Error('This page is not exist');
            }

            res.render('post', {
                post:post,
                comments: comments
            });
        })
        .catch(next);
});

// GET /posts/:postId/edit: get edit page
router.get('/:postId/edit', checkLogin, function(req,res,next){
    var postId = req.params.postId;
    var author = req.session.user._id;

    PostModel.getRawPostById(postId)
        .then(function(post){
            if(!post){
                throw new Erro('That post is not exist');
            }
            if(author.toString() !== post.author._id.toString())
            {
                throw new Error("no permission");
            }
            res.render('edit', {
               post: post
            });
        })
        .catch(next);
});

// POST /posts/:postId/edit: update a page
router.post('/:postId/edit', checkLogin, function(req, res, next){
    var postId = req.params.postId;
    var author = req.session.user._id;
    var title = req.fields.title;
    var content = req.fields.content;

    PostModel.updatePostById(postId, author, {title: title, content: content})
        .then(function (){
            req.flash('success','edit post successfully');
            // redirect to last page
            res.redirect('/posts/' + postId);
        })
        .catch(next);
});

// GET /posts/:postId/remove: delete a blog
router.get('/:postId/remove', checkLogin, function(req, res, next){
    var postId = req.params.postId;
    var author = req.session.user._id;

    PostModel.delPostById(postId, author)
        .then(function (){
            req.flash('success', 'remove post successfully');
            res.redirect('/posts');
        })
        .catch(next);
});

// POST /posts/:postId/comment: create a comment
router.post('/:postId/comment', checkLogin, function(req, res, next){
    var author = req.session.user._id;
    var postId = req.params.postId;
    var content = req.fields.content;
    var comment = {
        author: author,
        postId: postId,
        content: content
    };

    CommentModel.create(comment)
        .then(function(){
            req.flash('success', 'comment successfully');
            res.redirect('back');
        })
        .catch(next);
});


// GET /posts/:postId/comment/:commentId/remove: remove a comment
router.get('/:postId/comment/:commentId/remove', checkLogin, function(req, res, next){
    var commentId =req.params.commentId;
    var author = req.session.user._id;

    CommentModel.delCommentById(commentId, author)
        .then(function(){
            req.flash('success', 'remove comment successfully');
            res.redirect('back');
        })
        .catch(next);
})

module.exports = router;

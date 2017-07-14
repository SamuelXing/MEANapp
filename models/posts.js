var marked = require('marked');
var Post = require('../lib/mongo').Post;
var CommentModel = require('./comments');

// convert the content from markdown format to html
Post.plugin('contentToHtml', {
    afterFind: function(posts) {
        return posts.map(function (post){
            post.content = marked(post.content);
            return post;
        });
    },
    afterFindOne: function(post){
        if(post){
            post.content = marked(post.content);
        }
        return post;
    }

});

Post.plugin('addCommentsCount', {
   afterFind: function(posts){
       return Promise.all(posts.map(function(post){
           return CommentModel.getCommentsCount(post._id)
               .then(function(commentsCount){
                   post.commentsCount = commentsCount;
                   return post;
               });
       }));
   },
    afterFindOne: function (post){
        if(post){
            return CommentModel.getCommentsCount(post._id)
                .then(function (count){
                    post.commentsCount = count;
                    return post;
                });
        }
        return post;
    }
});

module.exports = {
    // create a post
    create: function create(post){
        return Post.create(post).exec();
    },

    // getPosts
    getPosts: function getPosts(author) {
        var query = {};
        if(author){
            query.author = author;
        }
        return Post
            .find(query)
            .populate({path: 'author', model: 'User' })
            .sort({_id: -1})
            .addCreatedAt()
            .addCommentsCount()
            .contentToHtml()
            .exec();
    },

    // get a post by ID
    getPostById: function getPostById(postId) {
        return Post
            .findOne({_id: postId})
            .populate({ path: 'author', model:'User' })
            .addCreatedAt()
            .addCommentsCount()
            .contentToHtml()
            .exec();
    },

    // increase pv by id
    incPv: function incPv(postId){
        return Post
            .update({_id:postId}, {$inc: {pv:1}})
            .exec();
    },

    // get a raw post by id
    getRawPostById: function getRawPostById(postId){
        return Post
            .findOne({_id: postId})
            .populate({path: 'author', model: 'User'})
            .exec();
    },

    // update a post by userId and postId
    updatePostById: function updatePostById(postId, author, data){
        return Post.update({author: author, _id: postId}, {$set: data}).exec();
    },

    // remove a post by userId and postId
    delPostById: function delPostById(postId, author){
        return Post.remove({author: author, _id:postId}).exec()
            .then(function(res){
               if(res.result.ok && res.result.n > 0){
                   return CommentModel.delCommentById(postId);
               }
            });
    }
};


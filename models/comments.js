var marked = require('marked');
var Comment =  require('../lib/mongo').Comment;

// translate comments' content from Markdown to html
Comment.plugin('contentToHtml', {
    afterFind: function (comments) {
        return comments.map(function (comment) {
            comment.content = marked(comment.content);
            return comment;
        });
    }
});

module.exports = {
    // create a comment
    create: function create(comment){
        return Comment.create(comment).exec();
    },

    // remove a comment by userID and commentId
    delCommentById: function delCommentById(commentId, author){
        return Comment.remove({ author:author, _id: commentId }).exec();
    },

    // get all comments by postId, sort by increase
    getComments: function getComments(postId){
        return Comment
            .find({ postId: postId })
            .populate({ path: 'author', model: 'User' })
            .sort({ _id: 1})
            .addCreatedAt()
            .contentToHtml()
            .exec();
    },

    // count the comments by postId
    getCommentsCount: function getCommentsCount(postId){
        return Comment.count({ postId: postId }).exec();
    }
}
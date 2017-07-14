var config = require('config-lite')(__dirname);
var Mongolass = require('mongolass');
var mongolass = new Mongolass();
var moment = require('moment');
var objectIdtoTimestamp = require('objectid-to-timestamp');
mongolass.connect(config.mongodb);

// User Model
exports.User = mongolass.model('User',{
   name: {type: 'string'},
    password: {type: 'string'},
    avatar: {type: 'string'},
    gender: {type: 'string', enum: ['m','f','x']},
    bio: {type: 'string'}
});

exports.User.index({name: 1}, {unique: true}).exec();

// generate the created time by adding customized plugin
mongolass.plugin('addCreatedAt',{
   afterFind: function(results){
       results.forEach(function(item){
          item.created_at = moment(objectIdtoTimestamp(item._id)).format('YYYY-MM-DD HH:mm');
       });
       return results;
   },
   afterFineOne: function(result){
       if(result){
           result.created_at = moment(objectIdtoTimestamp(item._id)).format('YYYY-MM-DD HH:mm');
       }
       return result;
   }
});

// Post Model
exports.Post = mongolass.model('Post',{
    author: {type: Mongolass.Types.ObjectId },
    title: {type: 'string' },
    content: {type: 'string'},
    pv: {type: 'number'}
});

exports.Post.index({author: 1, _id: -1}).exec(); //

// Comment Model
exports.Comment = mongolass.model('Comment', {
    author: {type: Mongolass.Types.ObjectId },
    content: {type: 'string'},
    postId: {type: Mongolass.Types.ObjectId }
});

exports.Comment.index({ postId: 1, _id: 1 }).exec(); // get all comments by postId
exports.Comment.index({ author: 1, _id: 1 }).exec(); // remove a comment by userId and postId


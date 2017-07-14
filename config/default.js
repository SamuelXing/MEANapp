module.exports = {
  port: 3000,
    session:{
        secret: 'samsblog',
        key: 'samsblog',
        maxAge: 2592000000
    },
    mongodb: 'mongodb://localhost:27017/samsblog'
};
var path = require('path');
var express = require('express');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var flash=require('connect-flash');
var config = require('config-lite')(__dirname);
var routes= require('./routes');
var pkg = require('./package');
var winston = require('winston');
var expressWinston = require('express-winston');

var app = express();

// set views
app.set('views', path.join(__dirname,'views'));
// set template engine
app.set('view engine', 'ejs');

// set directory of static files
app.use(express.static(path.join(__dirname,'public')));

// session middleware
app.use(session({
    name: config.session.key,
    secret: config.session.secret,
    resave: true,
    saveUninitialized: false,
    cookie:{
      maxAge: config.session.maxAge
    },
    store: new MongoStore({
      url: config.mongodb
    })
}));

// flash middleware, used to show notifications
app.use(flash());
app.use(require('express-formidable')({
    uploadDir: path.join(__dirname, 'public/img'),  // upload Dir
    keepExtensions: true // keep extensions
}));

// set global variables
app.locals.blog = {
  title: pkg.name,
  description: pkg.description
};

// add three required variables
app.use(function(req, res, next){
   res.locals.user = req.session.user;
    res.locals.success= req.flash('success').toString();
    res.locals.error = req.flash('error').toString();
    next();
});

// log
app.use(expressWinston.logger({
    transports: [
        new (winston.transports.Console)({
            json: true,
            colorize: true
        }),
        new winston.transports.File({
            filename: 'logs/success.log'
        })
    ]
}));

// route
routes(app);

// error logger
app.use(expressWinston.errorLogger({
    transports: [
        new winston.transports.Console({
            json: true,
            colorize: true
        }),
        new winston.transports.File({
            filename: 'logs/error.log'
        })
    ]
}));


// error handling
app.use(function(err, req, res, next){
    res.render('error',{
       error:err
    });
});

// listen on certain port, start the application
if(module.parent){
    module.exports = app;
}
else{
    app.listen(config.port, function(){
        console.log(pkg.name + ' listening on port '+ config.port);
    });
}
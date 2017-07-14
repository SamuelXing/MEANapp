// Authorization Control
module.exports = {
    // CheckLogin & checkNotLogin: check user have logged in yet
    // if not checked in, redirect to the signup page
    // if yes, return to the prior page
  checkLogin: function(req, res, next) {
      if (! req.session.user){
          req.flash('error', 'You have to sign in');
          return res.redirect('/signin');
      }
      next();
  },
    checkNotLogin: function(req, res, next){
     if(req.session.user){
         req.flash('error', 'You have successfully signed in');
         return res.redirect('back');
     }
        next();
    }
};
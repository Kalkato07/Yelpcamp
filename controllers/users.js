const User = require('../models/user');


module.exports.renderNewUserForm = (req, res) => {
    res.render('users/newUser');
};

module.exports.registerNewUser = async (req, res) => {
  const {username, password, email} = req.body;
  const user = new User({username, email});
  const registeredUser = await User.register(user, password);
  req.login(registeredUser, err => {
    if (err) return next(err);
    req.flash('success', 'User has been created successfully');
    res.redirect('/campgrounds');
  })};

module.exports.renderLoginForm = (req, res) => {
  res.render('users/login');
}

module.exports.loginUser = (req, res) => {
  req.flash('success', 'Welcome back');
  const redirectUrl = res.locals.returnTo || '/campgrounds'
  delete res.locals.returnTo
  res.redirect(redirectUrl);
};

module.exports.logoutUser = (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err)
    }
    req.flash('success', 'Goodbye');
    res.redirect('/campgrounds');
  })
}
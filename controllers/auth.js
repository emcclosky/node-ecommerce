const User = require('../models/user');

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: false
  });
};

exports.postLogin = (req, res, next) => {
  User.findById("5e59763a04a949d9c0b362ef")
  .then((user) => {
    req.session.user = user;
    req.session.isLoggedIn = true;
    req.session.save(err => {
      console.log(err);
      res.redirect('/');
    });
  })
  .catch((err) => {
    console.log('error:', err)
  });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log('error in postLogout', err)
    res.redirect('/');
  });
};
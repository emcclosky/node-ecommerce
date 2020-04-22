const crypto = require('crypto');

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const User = require('../models/user');

const transporter = nodemailer.createTransport(sendgridTransport({
  auth: {
    api_key: process.env.SENDGRID_KEY
  }
 }));

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message
  });
};


exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email })
  .then((user) => {
    if (!user) {
      req.flash('error', 'Invalid email or password.');
      return res.redirect('/login');
    }
    bcrypt
      .compare(password, user.password)
      .then((doMatch) => {
        if (doMatch) {
          req.session.user = user;
          req.session.isLoggedIn = true;
          return req.session.save((err) => {
            console.log(err);
            res.redirect('/');
          });
        }
        req.flash('error', 'Invalid email or password.');
        res.redirect('/login');
    })
    .catch((err) => {
      console.log('error in comparison', err);
      res.redirect('/login');
    })
  })
  .catch((err) => {
    console.log('error:', err);
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  User.findOne({ email: email })
  .then((userDoc) => {
    if (userDoc) {
      req.flash('error', 'There was a problem creating your account. Check that your email address is spelled correctly.');
      return res.redirect('/signup');
    }
    return bcrypt
      .hash(password, 12)
      .then((hashedPassword) => {
        const user = new User({
          email: email,
          password: hashedPassword,
          cart: { items: [] }
        });
        return user.save();
      })
      .then((result) => {
        res.redirect('/login');
        return transporter.sendMail({
          to: email,
          from: 'shop@node-test.com',
          subject: 'Signup Completed!',
          html: '<h1>You have successfully signed up!</h1>'
        });
      })
      .catch((err) => {
        console.log('error:', err);
      })
  })
  .catch((err) => {
    console.log('error in finding user:', err);
  });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) console.log('error in postLogout', err);
    res.redirect('/');
  });
};

exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: message
  })
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log('error in crypto.randomBytes', err);
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash('error', 'There was a problem finding your account. Check that your email address is spelled correctly.');
          return res.redirect('/reset');
        }
        user.resetToken = token;
        user.resetExpiration = Date.now() + 3600000;
        console.log('user in postReset OVER HERE', user)

        return user.save();
      })
      .then((result) => {
        res.redirect('/');
        transporter.sendMail({
          to: req.body.email,
          from: 'shop@node-test.com',
          subject: 'Password Reset',
          html: `
            <p>You request a password reset</p>
            <p>Click <a href="http://localhost:8000/reset/${token}">here</a> to set your password</p>
          `
        });
      })
      .catch((err) => {
        console.log('error in finding user', err);
      });
  });
};


exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetExpiration: { $gt: Date.now() } })
    .then(user => {
      let message = req.flash('error');
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'New Password',
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token
      });
    })
    .catch((err) => {
      console.log('error in getNewPassword', err)
    })
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body._userId;
  const token = req.body.token;
  User.update({ _id: userId }, { password: newPassword })
    .then((result) => {
      console.log(result)
      res.redirect('/')
    })
  // User.findOne({ _id: userId })
  //   .then((user) => {

  //   })
  //   .catch((err) => {
  //     console.log('error in updating password:', err)
  //   })
};
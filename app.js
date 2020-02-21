const dotenv = require('dotenv');
dotenv.config();

const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const mongoConnect = require('./util/database').mongoConnect;
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findById("5e45ec8cb28a180d595efb8b")
  .then((user) => {
    req.user = new User(user.name, user.email, user.cart, user._id);
    next();
  })
  .catch((err) => {
    console.log('error:', err)
  });
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoConnect(() => {
  app.listen(8000, () => {
    console.log('actually listening on 8000')
  })
});


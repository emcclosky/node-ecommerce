const dotenv = require('dotenv');
dotenv.config();

const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const errorController = require('./controllers/error');

const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findById("5e59763a04a949d9c0b362ef")
  .then((user) => {
    req.user = user;
    next();
  })
  .catch((err) => {
    console.log('error:', err)
  });
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose
  .connect(`mongodb+srv://emcclosky:${process.env.DB_PASSWORD}@cluster0-znnig.mongodb.net/shop?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then((result) => {
    User.findOne().then((user) => {
      if (!user) {
        const user = new User({
          name: 'Test',
          email: 'test@test.com',
          cart: {
            items: []
          }
        });
        user.save();
      }
    })
    app.listen(8000, () => {
      console.log('actually listening on 8000');
    })
  })
  .catch((err) => {
    console.log('error in connecting to DB:', err)
  })


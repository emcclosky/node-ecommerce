const mongodb = require('mongodb');
const { MongoClient } = mongodb;

const uri = `mongodb+srv://emcclosky:${process.env.DB_PASSWORD}@cluster0-znnig.mongodb.net/shop?retryWrites=true&w=majority`;
let _db;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const mongoConnect = (cb) => {
  client.connect(async err => {
    try {
      _db = client.db('Shop');
      cb();
    } catch (err) {
      console.log('error', err)
    }
   })
}


const getDb = () => {
  if (_db) {
    return _db;
  }
  throw 'No Database found';
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;


require('dotenv').config()
const mongoose = require('mongoose')

const db_pwd = process.env.MONGODB_ATLAS_PASSWORD
const db_name = process.env.DB_NAME
const uri = `mongodb+srv://admin:${db_pwd}@fantom.9jjuy.mongodb.net/${db_name}?retryWrites=true&w=majority`

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function () {
  console.log('we are connected')
})

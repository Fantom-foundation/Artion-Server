const admin = require('firebase-admin')
const router = require('express').Router()
const config = require('dotenv').config().parsed

const firebaseConfig = {
  apiKey: config.APIKEY,
  authDomain: config.AUTHDOMAIN,
  projectId: config.PROJECTID,
  storageBucket: config.STORAGEBUCKET,
  messagingSenderId: config.MEASSAGINGSENDERID,
  appId: config.APPID,
  measurementId: config.MEASUREMENTID,
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

const db = admin.firestore()

router.get('/test', async (req, res, next) => {
  return res.json({
    test: 'test api',
  })
})

module.exports = router

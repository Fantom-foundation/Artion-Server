const admin = require('firebase-admin')
const router = require('express').Router()
const emailValidator = require('email-validator')
const Constants = require('../config/constants')
const serviceAccount = require('../config/fantomsea_tommy_service.json')
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})
const auth = admin.auth()

const checkIfUserExists = async (email) => {
  try {
    let user = await auth.getUserByEmail(email)
    if (user) return true
    else return false
  } catch (error) {
    return false
  }
}

const validateEmail = (email) => {
  return emailValidator.validate(email)
}

router.get('/test', async (req, res, next) => {
  console.log(Constants)
  return res.json({
    test: 'test api',
  })
})

router.post('/addUser', async (req, res, next) => {
  let name = req.query.name
  let email = req.query.email
  let password = req.query.password
  if (!name)
    res.status(400).json({
      msg: Constants.NONAME,
    })
  if (!email)
    res.status(400).json({
      msg: Constants.NOEMAIL,
    })
  if (!validateEmail(email))
    res.status(400).json({
      msg: Constants.INVALIDEMAIL,
    })
  if (!password)
    res.status(400).json({
      msg: Constants.NOPASSWORD,
    })
  let isExist = await checkIfUserExists(email)
  if (isExist)
    return res.status(400).json({
      msg: Constants.USEREXISTS,
    })
  try {
    let user = await auth.createUser({
      displayName: name,
      email: email,
      password: password,
    })
    if (user)
      res.json({
        msg: Constants.USERCREATED,
        user: user,
      })
    else
      res.status(400).json({
        msg: Constants.USERCREATIONFAILED,
      })
  } catch (error) {
    res.status(400).json({
      msg: Constants.USERCREATIONFAILED,
    })
  }
})

router.post('/signin', async (req, res, next) => {
  let email = req.query.email

  try {
    let user = await auth.getUserByEmail(email)
    let token = new auth.createCustomToken(user.uid)
    res.json({
      msg: Constants.SIGNINJWTTOKEN,
      token: token,
    })
  } catch (error) {
    res.status(400).json({
      msg: Constants.SIGNINJWTTOKENFAILED,
    })
  }
})

router.post('/signout', async (req, res, next) => {
  let email = req.query.email

  try {
    let user = await auth.getUserByEmail(email)
    let token = new auth.createCustomToken(user.uid)
    res.json({
      msg: Constants.SIGNOUTJWTTOKEN,
      token: token,
    })
  } catch (error) {
    res.status(400).json({
      msg: Constants.SIGNOUTJWTTOKENFAILED,
    })
  }
})

router.post('/updateUser', async (req, res, next) => {
  let name = req.query.name
  let email = req.query.email
  let password = req.query.password
  if (!name)
    res.status(400).json({
      msg: Constants.NONAME,
    })
  if (!email)
    res.status(400).json({
      msg: Constants.NOEMAIL,
    })
  if (!validateEmail(email))
    res.status(400).json({
      msg: Constants.INVALIDEMAIL,
    })
  if (!password)
    res.status(400).json({
      msg: Constants.NOPASSWORD,
    })

  try {
    let user = await auth.getUserByEmail(email)
    let uid = user.uid
    let newUser = await auth.updateUser(uid, {
      displayName: name,
      email: email,
      password: password,
    })
    if (newUser)
      res.json({
        msg: Constants.USERUPDATED,
        user: newUser,
      })
    else
      res.status(400).json({
        msg: Constants.UPDATEUSERFAILED,
      })
  } catch (error) {
    res.status(400).json({
      msg: Constants.UPDATEUSERFAILED,
    })
  }
})

router.post('/getUser', async (req, res, next) => {
  let email = req.query.email
  try {
    let user = await auth.getUserByEmail(email)
    if (user)
      res.json({
        msg: Constants.USERFOUND,
        user: user,
      })
    else
      res.status(400).json({
        msg: Constants.USERNOTFOUND,
      })
  } catch (error) {
    res.status(400).json({
      msg: Constants.USERNOTFOUND,
    })
  }
})

module.exports = router

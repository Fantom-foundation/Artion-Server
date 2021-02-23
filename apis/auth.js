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
  // console.log(req.body)

  let email = req.body.email
  let password = req.body.password

  console.log('add user, name, email, password are ')
  console.log(email, password)
  if (!email)
    return res.status(400).json({
      msg: Constants.NOEMAIL,
    })
  if (!validateEmail(email))
    return res.status(400).json({
      msg: Constants.INVALIDEMAIL,
    })
  if (!password)
    return res.status(400).json({
      msg: Constants.NOPASSWORD,
    })
  let isExist = await checkIfUserExists(email)
  if (isExist)
    return res.status(400).json({
      msg: Constants.USEREXISTS,
    })
  try {
    let user = await auth.createUser({
      email: email,
      password: password,
    })
    if (user)
      return res.json({
        msg: Constants.USERCREATED,
        user: user,
      })
    else
      return res.status(400).json({
        msg: Constants.USERCREATIONFAILED,
      })
  } catch (error) {
    return res.status(400).json({
      msg: Constants.USERCREATIONFAILED,
    })
  }
})

router.post('/signin', async (req, res, next) => {
  let email = req.body.email

  try {
    let user = await auth.getUserByEmail(email)
    let token = new auth.createCustomToken(user.uid)
    return res.json({
      msg: Constants.SIGNINJWTTOKEN,
      token: token,
    })
  } catch (error) {
    return res.status(400).json({
      msg: Constants.SIGNINJWTTOKENFAILED,
    })
  }
})

router.post('/signout', async (req, res, next) => {
  let email = req.body.email

  try {
    let user = await auth.getUserByEmail(email)
    let token = new auth.createCustomToken(user.uid)
    return res.json({
      msg: Constants.SIGNOUTJWTTOKEN,
      token: token,
    })
  } catch (error) {
    return res.status(400).json({
      msg: Constants.SIGNOUTJWTTOKENFAILED,
    })
  }
})

router.post('/updateUser', async (req, res, next) => {
  console.log(req.body)
  let email = req.body.email
  let password = req.body.password
  if (!email)
    return res.status(400).json({
      msg: Constants.NOEMAIL,
    })
  if (!validateEmail(email))
    return res.status(400).json({
      msg: Constants.INVALIDEMAIL,
    })
  if (!password)
    return res.status(400).json({
      msg: Constants.NOPASSWORD,
    })

  try {
    let user = await auth.getUserByEmail(email)
    let uid = user.uid
    let newUser = await auth.updateUser(uid, {
      email: email,
      password: password,
    })
    if (newUser)
      return res.json({
        msg: Constants.USERUPDATED,
        user: newUser,
      })
    else
      return res.status(400).json({
        msg: Constants.UPDATEUSERFAILED,
      })
  } catch (error) {
    return res.status(400).json({
      msg: Constants.UPDATEUSERFAILED,
    })
  }
})

router.post('/getUser', async (req, res, next) => {
  let email = req.body.email
  try {
    let user = await auth.getUserByEmail(email)
    if (user)
      return res.json({
        msg: Constants.USERFOUND,
        user: user,
      })
    else
      return res.status(400).json({
        msg: Constants.USERNOTFOUND,
      })
  } catch (error) {
    return res.status(400).json({
      msg: Constants.USERNOTFOUND,
    })
  }
})

router.post('/deleteUser', async (req, res, next) => {})
module.exports = router

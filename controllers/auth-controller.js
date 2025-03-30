const prisma = require('../config/prisma')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const createError = require('../utils/createError')

function checkEmailOrMobile(identity) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const mobileRegex = /^[0-9]{10,15}$/

  let identityKey = ''
  if (emailRegex.test(identity)) {
    identityKey = 'email'
  }
  if (mobileRegex.test(identity)) {
    identityKey = 'mobile'
  }
  if (!identityKey) {
    createError(400, 'only Email or Mobile phone')
  }
  return identityKey
}

exports.register = async (req, res, next) => {
  try {
    // code
    // step 1 req.body
    const {identity, name, password, confirmPassword} = req.body

    // step 2 Vaidate
    if(!(identity.trim() && name.trim() && password.trim() && confirmPassword.trim())) {
      createError(400, 'Please fill in all data')
    }

    if(password !== confirmPassword) {
      createError(400, 'Please check Confirm-password')
    }

    // identity is email or phone number
    const identitykey =  checkEmailOrMobile(identity)
    console.log(identitykey)

    // step 3 Check user already exist?
    const findIdentity = await prisma.user.findUnique({
      where: {[identitykey]: identity}
    })
    console.log(findIdentity)
    if(findIdentity) {
      createError(400, 'This user is already registered', identity)
    }

    // step 4 prepare date for new user and Encrypt by bcrypt
    const newUser = {
      [identitykey]: identity,
      name: name,
      password: await bcrypt.hash(password, 10)
    }

    // step 5 insert to DB
    const result = await prisma.user.create({data: newUser})

    // step 6 response
    console.log(result)
    res.json({message: 'Register successful', result})
  } catch (error) {
    console.log('step 2 catch')
    next(error)
  }
}

exports.login = async (req, res, next) => {
  try {
    //code
    // step 1 req.body
    const {identity, password} = req.body

    // step 2 validation
    if(!identity.trim() || !password.trim()) {
      createError(400, 'Please fill in all data')
    }

    // step 3 find user
    // 3.1 identity is email or mobile?
    const identityKey = checkEmailOrMobile(identity)
  
    // 3.2 find and validate password
    const foundUser = await prisma.user.findUnique({
      where: {[identityKey]: identity}
    })
    if(!foundUser) {
      createError(400, 'Invalid login')
    }
    let pwOk = await bcrypt.compare(password, foundUser.password)
    if(!pwOk) {
      createError(400, 'Invalid login')
    }

    // step 4 create jwt token
    const payload = {
      id: foundUser.id
    }
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '15d'
    })

    // step 5 response
    const {password: pw, createdAt, updatedAt, ...userData} = foundUser

    res.json({message: 'Login successful', token, user: userData})
  } catch (error) {
    console.log('step 2 catch')
    next(error)
  }
}

exports.getCurrentUser = async (req, res, next) => {
  console.log("req.user.id ==== ", req.user.id)

  try {
    const {id} = req.user.id
    const profile = await prisma.user.findFirst({
      where: {id: req.user.id},
      select: {
        id: true,
        role: true,
      }
    })
    console.log("profile ==== ", profile)
    res.json({message: 'Hello, get current user', user: profile})
  } catch (error) {
    next(error)
  }
}
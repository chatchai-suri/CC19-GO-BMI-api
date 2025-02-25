const jwt = require('jsonwebtoken')
const prisma = require('../config/prisma')
const createError = require('../utils/createError')


exports.authenticate = async (req, res, next) => {
  try {
    // code
    // step 1 check authorization and token was send from client?
    const authorization = req.headers.authorization
    // console.log('authorization = ', authorization)

    if(!authorization ||!authorization.startsWith('Bearer')) {
      createError(401, 'Unauthorized 1')
    }
    const token = authorization.split(' ')[1]
    // console.log('token = ', token)
    if(!token) {
      createError(401, 'Unauthorized 2')
    }

    // step 2 verify token
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    // console.log('payload = ', payload)

    // step 3 find user by utilize payload
    const foundUser = await prisma.user.findUnique({
      where: {id: payload.id}
    })
    // console.log('foundUser = ', foundUser)
    if(!foundUser) {
      createError(401, 'Unauthorized 3')
    }

    // step 4 create userData and prepare to pass to 'next()' flow
    const {password, createdAt, updatedAt, ...userData} = foundUser
    // console.log('req.user = ', userData) 
    req.user = userData
    next()
  } catch (error) {
    console.log(error)
    next (error)
  }
}
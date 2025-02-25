const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth-controller')
const {authenticate} = require('../middlewares/authenticate')

// @ENDPOINT http://localhost:8899/api/auth/...
router.post('/register', authController.register)
router.post('/login', authController.login)
router.get('/getCurrentUser', authenticate, authController.getCurrentUser)


module.exports = router
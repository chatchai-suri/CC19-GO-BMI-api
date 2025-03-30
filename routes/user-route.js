const express = require('express')
const router = express.Router()
const {authenticate} = require('../middlewares/authenticate')
const userController = require('../controllers/user-controller')
const geminiControler = require('../controllers/gemini-controller')
const upload = require('../middlewares/upload')
const { user } = require('../config/prisma')

// @ENDPOINT http://localhost:8899/api/user/...
router.put('/profile', authenticate, upload.single('image'), userController.updateProfile)
router.get('/listUserAll', authenticate, userController.listUserAll)
router.patch('/updateUserRole', authenticate, userController.updateUserRole)
router.delete('/deleteUserbyId/:id', authenticate, userController.deleteUser)
router.post('/challenge', authenticate, userController.createChallenge)
router.post('/weeklyPlan', authenticate, userController.createWeeklyPlan)
router.patch('/weeklyPlan', authenticate, userController.updateWeeklyPlanById)
router.get('/weeklyPlanById/:id', authenticate, userController.getWeeklyPlanById)
router.get('/challengeById/:id', authenticate, userController.getChallengebyId)
router.get('/challengeAll', authenticate, userController.getChallengeAll)
router.delete('/challengeById/:id', authenticate, userController.deleteChallengeById)
router.patch('/challengeById/:id', authenticate, userController.updateChallengeById)
router.post('/chatGemini', geminiControler.createChat)


module.exports = router


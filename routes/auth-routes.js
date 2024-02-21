const express = require('express')
const router = express.Router()
const { signup, login, genUniqueCode, verifyCode, updatePassword } = require('../controllers/auth-controller')

router.route('/signup').post(signup)
router.route('/login').post(login)
router.route('/gen-code').patch(genUniqueCode)
router.route('/verify-code').post(verifyCode)
router.route('/update-password').patch(updatePassword)

module.exports = router
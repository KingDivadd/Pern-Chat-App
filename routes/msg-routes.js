const express = require('express')
const router = express.Router()
const { allMessages, newMessage } = require('../controllers/msg-controller')
const decodeToken = require('../middlewares/auth-middleware')

router.route('/all-messages').post(decodeToken, allMessages)
router.route('/new-message').post(decodeToken, newMessage)

module.exports = router
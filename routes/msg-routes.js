const express = require('express')
const router = express.Router()
const { allMessages } = require('../controllers/msg-controller')
const decodeToken = require('../middlewares/auth-middleware')

router.route('/all-messages').get(decodeToken, allMessages)

module.exports = router
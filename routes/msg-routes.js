const express = require('express')
const router = express.Router()
const { allMessages, newMessage, editMessage, deleteMsg } = require('../controllers/msg-controller')
const decodeToken = require('../middlewares/auth-middleware')

router.route('/all-messages').post(decodeToken, allMessages)
router.route('/new-message').post(decodeToken, newMessage)
router.route('/edit-message').patch(decodeToken, editMessage)
router.route('/delete-message').delete(decodeToken, deleteMsg)

module.exports = router
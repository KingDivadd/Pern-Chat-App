const express = require('express')
const router = express.Router()
const { allChats, createChat, editChat, addParticipants } = require('../controllers/chat-controller')
const decodeToken = require('../middlewares/auth-middleware')

router.route('/all-chat').get(decodeToken, allChats)
router.route('/create-chat').post(decodeToken, createChat)
router.route('/edit-chat').patch(decodeToken, editChat)
router.route('/add-chat-participants').patch(decodeToken, addParticipants)


module.exports = router
const express = require('express')
const router = express.Router()
const { allChats, createChat, editChat, addParticipants, removeParticipants, deleteChat } = require('../controllers/chat-controller')
const decodeToken = require('../middlewares/auth-middleware')

router.route('/all-chat').get(decodeToken, allChats)
router.route('/create-chat').post(decodeToken, createChat)
router.route('/edit-chat').patch(decodeToken, editChat)
router.route('/add-chat-participants').patch(decodeToken, addParticipants)
router.route('/remove-chat-participants').patch(decodeToken, removeParticipants)
router.route('/delete-chat').patch(decodeToken, deleteChat)


module.exports = router
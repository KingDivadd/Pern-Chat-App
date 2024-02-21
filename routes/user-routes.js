const express = require('express')
const router = express.Router()
const { allUsers, chatUsers, editUserInfo, oneUser } = require('../controllers/user-controller')
const decodeToken = require('../middlewares/auth-middleware')

router.route('/all-users').get(allUsers)
router.route('/group-participants').post(chatUsers)
router.route('/edit-user-info').patch(decodeToken, editUserInfo)
router.route('/find-user').post(decodeToken, oneUser)

module.exports = router
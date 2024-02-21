const asyncHandler = require('express-async-handler')
const pool = require('../config/db')

const allUsers = asyncHandler(async(req, res) => {
    const users = await pool.query(`select * from chat_user`)

    return res.status(200).json({ mbUsers: users.rows.length, all_users: users.rows })
})

const oneUser = asyncHandler(async(req, res) => {
    const { user_id } = req.body

    let user;
    if (!user_id) {
        user = await pool.query('select * from chat_user where chat_user_id = $1', [req.info.id])
    }
    if (user_id && user_id.trim() !== '') {
        user = await pool.query('select * from chat_user where chat_user_id = $1', [user_id])
    }

    return res.status(200).json({ user: user.rows[0] })
})

const chatUsers = asyncHandler(async(req, res) => {
    const { chat_id } = req.body
    if (!chat_id) {
        return res.status(500).json({ err: 'Please provide the chat id' })
    }
    const chatExist = await pool.query('select * from chat where chat_id = $1', [chat_id])
    if (!chatExist.rows.length) {
        return res.status(404).json({ err: 'Chat not found.' })
    }
    if (!chatExist.rows[0].is_group_chat) {
        return res.status(200).json({ msg: 'Not a group chat' })
    }
    const participants_box = chatExist.rows[0].participants
    let storage = []
    const promises = participants_box.map(async(data) => {
        const user = await pool.query('select * from chat_user where chat_user_id =  $1', [data])
        storage.push(user.rows[0])
    });

    await Promise.all(promises)
    return res.status(200).json({ nbHit: chatExist.rows[0].participants.length, participants: storage })
})

const editUserInfo = asyncHandler(async(req, res) => {
    const { first_name, last_name, username, pic } = req.body

    const updateUserInfo = await pool.query('update chat_user set first_name = $1, last_name = $2, display_name = $3, pic = $4 where chat_user_id = $5 returning *', [first_name, last_name, username, pic, req.info.id])

    return res.status(200).json({ msg: 'Profile update was successful.', updatedUserInfo: updateUserInfo.rows[0] })
})


module.exports = { allUsers, chatUsers, editUserInfo, oneUser }
const asyncHandler = require('express-async-handler')
const pool = require('../config/db')

const allMessages = asyncHandler(async(req, res) => {
    const allMsgs = await pool.query('select * from msg where chat_user_id = $1', [req.info.id])

    return res.status(200).json({ nbHit: allMsgs.rows.length, allMessages: allMsgs.rows })
})

const newMessage = asyncHandler(async(req, res) => {
    const { content, isgroupChat } = req.body
    if (content.trim() !== '') {

        const chatArea = await pool.query(`insert into chat (participants, is_group_chat, )`)

        const addMsg = await pool.query(`insert into msg (chat_user_id, content) values ($1) returning *`, [req.info.id, content])



        return res.status(200).json({})
    }

})

module.exports = { allMessages }
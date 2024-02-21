const asyncHandler = require('express-async-handler')
const pool = require('../config/db')

const allMessages = asyncHandler(async(req, res) => {
    const { chat_id } = req.body
    const allMsgs = await pool.query('select * from msg left join chat using (chat_id) where chat_id = $1', [chat_id])


    return res.status(200).json({ nbHit: allMsgs.rows.length, allMessages: allMsgs.rows })
})

const newMessage = asyncHandler(async(req, res) => {
    const { chat_id, content } = req.body
    if (content && content.trim() !== '') {

        const chatExist = await pool.query('select * from chat where chat_id = $1', [chat_id])
        if (!chatExist.rows.length) {
            return res.status(500).json({ err: `selected chat not found, might have been deleted.` })
        }
        // now lets make sure we are participant of the chat
        if (!chatExist.rows[0].participants.includes(req.info.id)) {
            return res.status(401).json({ err: `Only participants of a chat can send message in a chat.` })
        }


        const new_msg = await pool.query('insert into msg (sender, content, chat_id) values ($1, $2, $3) returning * ', [req.info.id, content.trim(), chat_id])

        const updateChat = await pool.query('update chat set latestMsg = $1 where chat_id = $2 returning * ', [new_msg.rows[0].msg_id, chat_id])



        return res.status(200).json({ sentMsg: new_msg.rows[0], updatedChat: updateChat.rows[0] })
    }

    return res.status(200).json({ msg: `Enter text to begin sending msg` })
})

module.exports = { allMessages, newMessage }
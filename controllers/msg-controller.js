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
        if (!chatExist.rows[0].participants.includes(req.info.id)) {
            return res.status(401).json({ err: `Only participants of a chat can send message in a chat.` })
        }

        const new_msg = await pool.query('insert into msg (sender, content, chat_id) values ($1, $2, $3) returning * ', [req.info.id, content.trim(), chat_id])


        const updateChat = await pool.query('update chat set msg_id = $1 where chat_id = $2 returning * ', [new_msg.rows[0].msg_id, chat_id])

        const chat = await pool.query('select * from chat left join msg using (msg_id) where chat.chat_id = $1', [chat_id])

        return res.status(200).json({ sentMsg: new_msg.rows[0], chat: updateChat.rows[0] })
    }

    return res.status(200).json({ msg: `Enter text to begin sending msg` })
})

const editMessage = asyncHandler(async(req, res) => {
    const { msg_id, content } = req.body
    const msgExist = await pool.query('select * from msg left join chat using (chat_id) where msg.msg_id = $1', [msg_id])
    if (!msgExist.rows.length) {
        return res.status(404).json({ err: 'Message not found, might have been deleted.' })
    }
    if (!msgExist.rows[0].is_group_chat) {
        if (msgExist.rows[0].sender !== req.info.id) {
            return res.status(401).json({ err: `Message can only be edited by sender.` })
        }
        const update_msg = await pool.query('update msg set content = $1 where msg_id = $2 returning *', [content, msg_id])

        return res.status(200).json({ msg: 'Message updated successfully.', updatedMsg: update_msg.rows[0] })
    } else if (msgExist.rows[0].is_group_chat) {
        const user = await pool.query('select * from msg left join chat using (chat_id) where msg.msg_id = $1', [msg_id])

        if (msgExist.rows[0].sender !== req.info.id || msgExist.rows[0].group_admin !== req.info.id) {
            return res.status(401).json({ err: `You are not authorized to edit msg` })
        }
        const update_msg = await pool.query('update msg set content = $1 where msg_id = $2 returning *', [content, msg_id])

        return res.status(200).json({ msg: 'Message updated successfully.', updatedMsg: update_msg.rows[0] })
    }


    return res.status(200).json({ msg: msgExist.rows[0] })
})

const deleteMsg = asyncHandler(async(req, res) => {
    const { msg_id } = req.body
    if (!msg_id) {
        return res.status(500).json({ err: 'Please provied the message id' })
    }
    const msgExist = await pool.query(`select * from msg left join chat using (chat_id) where msg.msg_id = $1`, [msg_id])
    if (!msgExist.rows.length) {
        return res.status(404).json({ err: `Msg not found, might already be deleted.` })
    }

    if (!msgExist.rows[0].is_group_chat) {
        if (msgExist.rows[0].sender !== req.info.id) {
            return res.status(401).json({ err: `You are not authorizd to delete selected message.` })
        }
        // updating chat if the msg_id is the same as the one to be deleted.
        const chat_latest_msg = await pool.query('select * from chat where msg_id = $1', [msg_id])
        if (chat_latest_msg.rows.length) {
            var update_chat = await pool.query('update chat set msg_id = null where chat.msg_id = $1 returning *', [msg_id])
        }
        const delete_msg = await pool.query('delete from msg where msg_id = $1 ', [msg_id])

        return res.status(200).json({ msg: 'Message deleted successfully.', updateChat: update_chat.rows[0] })
    }

    if (msgExist.rows[0].is_group_chat) {
        if (msgExist.rows[0].sender !== req.info.id || msgExist.rows[0].group_admin !== req.info.id) {
            return res.status(401).json({ err: `You are not authorized to delete message.` })
        }
        // now delete 
        // updating chat if the msg_id is the same as the one to be deleted.
        const chat_latest_msg = await pool.query('select * from chat where msg_id = $1', [msg_id])
        if (chat_latest_msg.rows.length) {
            var update_chat = await pool.query('update chat set msg_id = null where chat.msg_id = $1 returning *', [msg_id])
        }
        const delete_msg = await pool.query('delete from msg where msg_id = $1 ', [msg_id])

        return res.status(200).json({ msg: 'Message deleted successfully.', updateChat: update_chat.rows[0] })

    }

})

module.exports = { allMessages, newMessage, editMessage, deleteMsg }
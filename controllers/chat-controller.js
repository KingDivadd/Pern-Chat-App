const asyncHandler = require('express-async-handler')
const pool = require('../config/db')

const allChats = asyncHandler(async(req, res) => {

    const all_chats = await pool.query(`select * from chat`);
    const fetched_chats = all_chats.rows
    const box = fetched_chats.filter((data, ind) => data.participants.includes(req.info.id))

    return res.status(200).json({ nbHit: box.length, all_chats: box })
})

const createChat = asyncHandler(async(req, res) => {
    const { participants, chat_name, chat_pic } = req.body

    if (!participants.length) {
        return res.status(500).json({ err: `Please select at least one user` })
    }

    if (participants.includes(req.info.id)) {
        return res.status(500).json({ err: `You cannot add yourself.` })
    }
    participants.push(req.info.id)
    let is_group_chat = false
    let group_admin = null
    let latestmsg = null
    if (participants.length > 2) {
        is_group_chat = true
        group_admin = participants[participants.length - 1]
    }

    // now let us ensure that the chat only exists once
    const chatExist = await pool.query(`select * from chat where participants = $1`, [participants])

    if (chatExist.rows.length) {
        return res.status(500).json({ err: `Chat already exist` })
    }


    const new_chat = await pool.query(`insert into chat (participants, group_admin, latestmsg, is_group_chat) values ($1, $2, $3, $4) returning * `, [participants, group_admin, latestmsg, is_group_chat])

    return res.status(200).json({ chatInfo: new_chat.rows[0] })

})

const editChat = asyncHandler(async(req, res) => {
    const { chat_id, chat_name, chat_pic } = req.body
    if (!chat_id) {
        return res.status(500).json({ err: `Please provide chat id` })
    }
    const chatExist = await pool.query(`select * from chat where chat_id = $1`, [chat_id])
    if (!chatExist.rows.length) {
        return res.status(404).json({ err: `Chat not found, might be deleted.` })
    }

    // now lets make sure only those whose id is in the group can make changes and only group chat can be editted.
    if (!chatExist.rows[0].participants.includes(req.info.id)) {
        return res.status(401).json({ err: `Only chat participants are allowed to make changes to the chat.` })
    }
    if (chatExist.rows[0].is_group_chat) {
        if (chat_name && chat_name.trim() !== "") {
            const update_chat_name = await pool.query('update chat set chat_name = $1 where chat_id = $2', [chat_name, chat_id])
        }
        if (chat_pic && chat_pic.trim() !== "") {
            const update_chat_pic = await pool.query('update chat set chat_pic = $1 where chat_id = $2', [chat_pic, chat_id])
        }

        const updated_chat = await pool.query('select * from chat where chat_id = $1', [chat_id])
        return res.status(200).json({ msg: `Chat updated successfully`, updated_chat: updated_chat.rows[0] })
    }
    return res.status(200).json({ msg: `Edits can only be made on a group chat.` })
})

const addParticipants = asyncHandler(async(req, res) => {
    const { chat_id, newUser } = req.body
    if (!chat_id) {
        return res.status(500).json({ err: `Please provide chat id` })
    }
    const chatExist = await pool.query('select * from chat where chat_id = $1', [chat_id])
    if (!chatExist.rows.length) {
        return res.status(404).json({ err: `Chat not found, might have been deleted.` })
    }
    if (!chatExist.rows[0].is_group_chat) {
        return res.status(500).json({ err: 'Participants can only be added to group chats.' })
    }

    if (chatExist.rows[0].group_admin !== req.info.id) {
        return res.status(401).json({ err: `Only group admin can add users.` })
    }
    //
    const userExist = await pool.query('select * from chat_user where chat_user_id = $1', [newUser])
    if (!userExist.rows.length) {
        return res.status(500).json({ err: 'User not found' })
    }
    const existingParticipant = chatExist.rows[0].participants
    const newParticipant = existingParticipant.push(newUser)

    const updatedChat = await pool.query(`update chat set participants = $1 where chat_id = $2 returning *`, [newParticipant, chat_id])

    return res.status(200).json({ msg: `${userExist.rows[0].last_name} ${userExist.rows[0].first_name} added successfully`, updatedChat: updatedChat })

})

module.exports = { allChats, createChat, editChat, addParticipants }
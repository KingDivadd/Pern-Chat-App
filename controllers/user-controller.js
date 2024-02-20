const asyncHandler = require('express-async-handler')
const pool = require('../config/db')

const allUsers = asyncHandler(async(req, res) => {
    const users = await pool.query(`select * from chat_user`)

    return res.status(200).json({ mbUsers: users.rows.length, all_users: users.rows })
})

module.exports = { allUsers }
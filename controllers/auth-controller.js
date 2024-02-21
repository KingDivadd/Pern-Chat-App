const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')
const pool = require('../config/db')
const genToken = require('../config/generateToken')

// code generation
function uniqueCode() {
    const characters = '0123456789';
    let randomString = '';

    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomString += characters.charAt(randomIndex);
    }

    return randomString;
}


const signup = asyncHandler(async(req, res) => {
    const { first_name, last_name, phone, email, password, username, pic, } = req.body

    if (!first_name || !last_name || !phone || !email || !password) {
        return res.status(500).json({ err: "Please fill all fields" })
    }
    //check if email exist
    const user = await pool.query(`select * from chat_user where email = $1 or phone = $2`, [email, phone])
    if (user.rows.length) {
        return res.status(500).json({ err: `User already exist change email and (or) phone.` })
    }

    let display_name;
    if (!username || username.trim() === '') {
        display_name = `${last_name} ${first_name}`
    } else {
        display_name = username
    }

    const salt = await bcrypt.genSalt(10)
    const encryptedPassword = await bcrypt.hash(password, salt)

    const newUser = await pool.query(`INSERT INTO chat_user (first_name, last_name, email, phone,display_name, pic) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, [first_name, last_name, email, phone, display_name, pic])
    const user_id = newUser.rows[0].chat_user_id

    const newAuth = await pool.query(`INSERT INTO auth (unique_code, password, chat_user_id) VALUES ($1, $2, $3)`, ['00000', encryptedPassword, user_id])

    return res.status(200).json({ msg: `Congratulations, Registration was successful.`, newUser: newUser.rows[0], token: genToken({ id: user_id }) })

})

const login = asyncHandler(async(req, res) => {
    const { username, password } = req.body

    if (!username || !password) {
        return res.status(500).json({ err: `Field cannot be empty` })
    }

    const findUser = await pool.query(`select * from chat_user where email = $1 or phone = $1`, [username])
    if (!findUser.rows.length) {
        return res.status(404).json({ err: `Please check email / phone and try again.` })
    }
    const user_id = findUser.rows[0].chat_user_id

    const auth = await pool.query(`select * from auth where chat_user_id = $1`, [user_id])
    if (!auth.rows.length) {
        return res.status(404).json({ err: `Credentials not found` })
    }
    const encryptedPassword = auth.rows[0].password
    const matchPassword = await bcrypt.compare(password, encryptedPassword)
    if (!matchPassword) {
        return res.status(401).json({ err: `Incorrect password, check password and try again.` })
    }

    return res.status(200).json({ msg: `Login succcessful`, userInfo: findUser.rows[0], token: genToken({ id: user_id }) })

})

const genUniqueCode = asyncHandler(async(req, res) => {
    const { email } = req.body
    if (!email) {
        return res.status(500).json({ err: 'Please provide your email address.' })
    }
    const emailExist = await pool.query('select * from chat_user where email = $1', [email])
    if (!emailExist.rows.length) {
        return res.status(500).json({ err: 'Incorrect email address, check and try again.' })
    }

    const genCode = uniqueCode()
    const updateAuth = await pool.query('update auth set unique_code = $1 where chat_user_id = $2 returning *', [Number(genCode), emailExist.rows[0].chat_user_id])
    res.status(200).json({ msg: 'Uniqe generated and sent to your email', updatedAuth: updateAuth.rows[0] })
})

const verifyCode = asyncHandler(async(req, res) => {
    const { email, code } = req.body
    if (!email) {
        return res.status(500).json({ err: 'Please provide your email address' })
    }
    if (!code) {
        return res.status(500).json({ err: 'Please provide code sent to your email' })
    }
    const emailExist = await pool.query('select * from chat_user where email = $1', [email])
    if (!emailExist.rows.length) {
        return res.status(500).json({ err: 'Incorrect email address, check and try again.' })
    }

    const verifyAuth = await pool.query('select * from auth where unique_code = $1', [code])
    if (!verifyAuth.rows.length) {
        return res.status(404).json({ err: `Incorrect code supplied` })
    }

    return res.status(200).json({ msg: 'Code verified successfully' })

})

const updatePassword = asyncHandler(async(req, res) => {
    const { email, newPassword } = req.body

    if (!email) {
        return res.status(500).json({ err: 'Please provide your email address' })
    }
    const emailExist = await pool.query('select * from chat_user where email = $1', [email])
    if (!emailExist.rows.length) {
        return res.status(500).json({ err: 'Incorrect email address, check and try again.' })
    }
    if (!newPassword || newPassword.trim() === null) {
        return res.status(500).json({ err: 'Please enter a valid password' })
    }

    const salt = await bcrypt.genSalt(10)
    const encryptPassword = await bcrypt.hash(newPassword, salt)

    const updateAuth = await pool.query('update auth set password = $1 where chat_user_id = $2', [encryptPassword, emailExist.rows[0].chat_user_id])

    return res.status(200).json({ msg: 'Password updated successfully' })

})

module.exports = { signup, login, genUniqueCode, verifyCode, updatePassword }
const express = require('express')
const app = express()
const cors = require('cors')
require('colors')
require('dotenv').config()
const authRoutes = require('./routes/auth-routes')
const chatRoutes = require('./routes/chat-routes')
const userRoutes = require('./routes/user-routes')
const msgRoutes = require('./routes/msg-routes')


app.use(express.json())
app.use(cors())

// ROUTERS
app.use('/api/auth', authRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/user', userRoutes)
app.use('/api/msg', msgRoutes)

const start = async() => {
    const PORT = process.env.SERVER_PORT || 6500
    try {
        app.listen(PORT, console.log(`PernChatApp server started and running on port ${PORT} `.yellow.bold))
    } catch (err) {
        console.log(`something went wrong`.red.bold)
    }
}

start()
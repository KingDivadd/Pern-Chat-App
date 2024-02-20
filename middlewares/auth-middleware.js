const jwt = require('jsonwebtoken')

const decodeToken = (req, res, next) => {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer')) {
        const token = authHeader.split(' ')[1]
        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            const { id } = decode
            req.info = (id)
            next()
        } catch (err) {
            return res.status(401).json({ err: `Not authorized to access this route` })
        }
    } else {
        return res.status(500).json({ err: 'Please provide token.' })
    }
}

module.exports = decodeToken
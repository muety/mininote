const crypto = require('crypto')

exports.hash = (password) => {
    return crypto.createHash('sha256').update(password).digest('base64')
}

exports.compare = (password, expected) => {
    return exports.hash(password) === expected
}
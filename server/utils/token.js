const jwt = require("jsonwebtoken")

/**
 * Generate token based on jwt
 * @param data
 * @returns {string}
 */
exports.getToken = (data) => {
    const token = 'Bearer ' + jwt.sign(
        {
            id: data.id,
            userName: data.userName,
            googleAccount: data.googleAccount
        },
        process.env["SIGN_KEY"],
        {
            expiresIn: 3600 * 24 * 3 //3 days
            // expiresIn: 30 //30s
        }
    )
    return token
}
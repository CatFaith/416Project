const db = require("../models");
const User = db.user;
const {getToken} = require("../utils/token")
const {sendResultResponse} = require("../utils/responseFrom")

/**
 * req.user.id is obtained by the calling interface after the token in the request header is resolved. 
 * If the id of the current login user is the same as that of the user in the token, the database can be operated only if the ID is the same.
 */

/**
 * Users Log in and create users
 * @param req
 * @param res
 * @returns User information and user unique token
 */
exports.login = async (req, res) => {
    const user = req.body;
    const newUser = {
        userName: user.userName,
        googleAccount: user.googleAccount,
    };
    await User.findOne({where: {googleAccount: user.googleAccount}}).then(data => {
        if (data) {
            res.json(sendResultResponse({data, token: getToken(data)}, 200, process.env["SYSTEM_SUCCESS"]))
        } else {
            // If it detects that the current Gmail user has not logged in to the system, the user creates a new record
            User.create(newUser).then(data => {
                res.json(sendResultResponse({data, token: getToken(data)}, 200, process.env["SYSTEM_SUCCESS"]))
            }).catch(err => {
                res.json(sendResultResponse(err, 500, process.env["SYSTEM_FAIL"]))
            })
        }
    })
};

/**
 * Delete user information
 * @param req
 * @param res
 * @returns Returns the length of modified data
 */
exports.deleteUser = async (req, res) => {
    const user = req.body
    await User.destroy({where: {id: user.id}}).then(data => {
        res.json(sendResultResponse(data, 200, process.env["SYSTEM_SUCCESS"]))
    }).catch(err => {
        res.json(sendResultResponse(err, 500, process.env["SYSTEM_FAIL"]))
    })
};

/**
 * Modifying User Information
 * @param req
 * @param res
 * @returns Returns the length of modified data
 */
exports.editUser = async (req, res) => {
    const user = req.body;
    //req.user.id是调用接口在请求头传入的token解析后得到的，匹配当前登录用户和传入token中的用户是否一致，是一致的才能操作数据库数据
    if (user.id == req.user.id) {
        const newUser = {
            userName: user.userName,
            googleAccount: user.googleAccount,
        };
        await User.update(newUser, {where: {id: user.id}}).then(data => {
            res.json(sendResultResponse(data.length, 200, process.env["SYSTEM_SUCCESS"]))
        }).catch(err => {
            res.json(sendResultResponse(err, 500, process.env["SYSTEM_FAIL"]))
        });
    } else {
        res.json({result: process.env["TOKEN_ERROR_MSG"]})
    }
};

/**
 * Query user information based on the user id
 * @param req
 * @param res
 * @returns User information object
 */
exports.getUser = async (req, res) => {
    const user = req.body;
    //req.user.id是调用接口在请求头传入的token解析后得到的，匹配当前登录用户和传入token中的用户是否一致，是一致的才能操作数据库数据
    if (user.id == req.user.id) {
        await User.findOne({where: {id: user.id}}).then(data => {
            res.json(sendResultResponse(data, 200, process.env["SYSTEM_SUCCESS"]))
        }).catch(err => {
            res.json(sendResultResponse(err, 500, process.env["SYSTEM_FAIL"]))
        })
    } else {
        res.json({result: process.env["TOKEN_ERROR_MSG"]})
    }
};

/**
 * Gets a list of all users
 * @param req
 * @param res
 * @returns List of user information objects
 */
exports.getUserList = async (req, res) => {
    await User.findAll().then(data => {
        res.json(sendResultResponse(data, 200, process.env["SYSTEM_SUCCESS"]))
    }).catch(err => {
        res.json(sendResultResponse(err, 500, process.env["SYSTEM_FAIL"]))
    })
};

/**
 * Gets whether the user exists based on the user primary key
 * @param req
 * @param res
 * @returns Return true/false
 */
exports.getUserByPk = async (data) => {
    const user = await User.findByPk(data)
    if (user != null) {
        return true
    } else {
        return false
    }
};
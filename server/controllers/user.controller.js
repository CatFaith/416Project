const db = require("../models");
const User = db.user;
const Op = db.Op;
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
    console.log(req)
    const newUser = {
        userName: user.userName,
        googleAccount: user.googleAccount,
        googleToken: user.googleToken
    };
    await User.findOne({where: {googleAccount: user.googleAccount}}).then(data => {
        if (data) {
            //如果查询出来的数据不为空，代表此用户之前已经登录过系统，则无需再新增数据到user表，只需正常的返回用户信息和token即可
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
    //根据主键Id进行删除，确保删除数据的唯一性
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
        //根据主键Id进行更新，确保更新数据的唯一性
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
    //查询可以分享的用户，但是要排除自己，所以此处排除自己的id
    let where = {
        id: {[Op.ne]:req.user.id} // not equal Sequelize
    };
    await User.findAll({where}).then(data => {
        res.json(sendResultResponse(data, 200, process.env["SYSTEM_SUCCESS"]))
    }).catch(err => {
        res.json(sendResultResponse(err, 500, process.env["SYSTEM_FAIL"]))
    })
};

/**
 * 通过谷歌账户获取用户信息
 * @param req
 * @param res
 * @returns Return user.dataValues/null
 */
exports.getUserByGoogleAccount = async (googleAccount) => {
    //传入的账户是谷歌账户，根据谷歌账户查询用户的信息
    const user = await User.findOne({where: {googleAccount: googleAccount}})
    if (user != null) {
        return user.dataValues
    } else {
        return null
    }
};
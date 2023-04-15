const db = require("../models");
const App = db.app;
const Op = db.Op;
const {getUserByGoogleAccount} = require("./user.controller");
const {sendResultResponse} = require("../utils/responseFrom");
const {getGoogleSheetAuthorization} = require("../utils/googleSheet");

/**
 * req.user.id is obtained by the calling interface after the token in the request header is resolved. 
 * If the id of the current login user is the same as that of the user in the token, the database can be operated only if the ID is the same.
 */

/**
 * Create APP
 * @param req
 * @param res
 * @returns APP object
 */
exports.createApp = async (req, res) => {
    const user = req.user;
    const app = req.body;
    //前端新增APP传过来的参数，保存APP表
    //userId直接从token中解密获得，前端可不需要传userId
    const newApp = {
        userId: user.id,
        googleAccount: user.googleAccount,
        roleMemberSheet: app.roleMemberSheet,
        savedDataUrl: app.savedDataUrl,
        published: app.published,
        developer: app.developer,
        appName: app.appName
    };
    await App.create(newApp).then(data => {
        res.json(sendResultResponse(data, 200, process.env["SYSTEM_SUCCESS"]))
    }).catch(err => {
        res.json(sendResultResponse(err, 500, process.env["SYSTEM_FAIL"]))
    })
};

/**
 * Delete the APP according to its id
 * @param req
 * @param res
 * @returns APP Object
 */
exports.deleteApp = async (req, res) => {
    const app = req.body;
    //req.user.id is obtained by the calling interface after the token in the request header is resolved. 
    //It matches whether the current login user is the same as the user in the incoming token
    if (app.userId == req.user.id) {
        //根据主键Id进行删除，确保删除数据的唯一性
        await App.destroy({where: {id: app.id}}).then(data => {
            res.json(sendResultResponse(data, 200, process.env["SYSTEM_SUCCESS"]))
        }).catch(err => {
            res.json(sendResultResponse(err, 500, process.env["SYSTEM_FAIL"]))
        })
    } else {
        res.json({result: process.env["TOKEN_ERROR_MSG"]})
    }
};

/**
 * Get all visible apps based on the id of the currently logged in user
 * @param req
 * @param res
 * @returns APP object
 */
// There are two situations to query an APP. 
// The first is to query an APP created by oneself, and the second is to query an APP shared by others. 
// The data of the two parts needs to be found.
// According to the ID of the current user, all published apps belonging to the user or shared by the user to other users are queried in the APP data table, and the query results are returned in JSON format.
exports.getApp = async (req, res) => {
    const user = req.user;
    let where = {};
    if (user.id != '') {
        //"like" and "or" are used，The second part of the condition is to find out what apps others have shared.
        // Op.or is a logical operator that combines multiple conditions into one OR condition.
        where = {
            [Op.or]: [{userId: user.id}
                     ,{endUserIds: {[Op.like]: '%,' + user.id + ',%'}, published: 'true'}
                    ],
        }; // The like operator is used to blur match strings in a query. We used the % wildcard to match any character, so the query returns a record containing the endUserIds value for the specified user ID.
        await App.findAll({where}).then(data => {
            res.json(sendResultResponse(data, 200, process.env["SYSTEM_SUCCESS"]))
        }).catch(err => {
            res.json(sendResultResponse(err, 500, process.env["SYSTEM_FAIL"]))
        })
    }
};

/**
 * 登录后获取有权限的APP
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.getAppAfterLogin = async (req, res) => {
    const user = req.user;
    const googleAccount = user.googleAccount;
    //定义返回给前端的列表
    const returnAppData = {}
    //1,获取所有的APP，根据roleMemberSheet字段调用google sheet api
    await App.findAll().then(data => {
        //2,循环app的数据，然后调用google sheet api
        for (const item of data){
            //2.1 取出/d后的字符串和gid
            //roleMemberSheet样例：https://docs.google.com/spreadsheets/d/1wadtiEG_BWMmbH9rl4DaVc0_RelTgzYuK20QKIXgQdo/edit#gid=385025179
            const result = getGoogleSheetAuthorization(item.roleMemberSheet)
            //result格式[1@gamil.com,2@gamil.com,3@gamil.com,4@gamil.com]
            //3,解析返回的数据，判断是否包含当前登录用户的谷歌账号
            if (result != null){
                if (result.indexOf(googleAccount) != -1){
                    returnAppData.add(item)
                }
            }
        }
        //4,将匹配到的app数据返回给前端
        res.json(sendResultResponse(returnAppData, 200, process.env["SYSTEM_SUCCESS"]))
    }).catch(err => {
        res.json(sendResultResponse(err, 500, process.env["SYSTEM_FAIL"]))
    })
};

/**
 * 每次打开/修改/分享/删除app前都判断权限
 * @param req
 * @param res
 * @returns true/false
 */
exports.checkAuthorization = async (req, res) => {
    //1，点击app时，根据app的roleMemberSheet，判断当前用户是否有权限打开app
    const app = req.body;
    //2，调用google sheet获取数据
    const result = getGoogleSheetAuthorization(app.roleMemberSheet)
    if (result != null){
        //3，根据返回的数据，判断是否有权限
        if (result.indexOf(googleAccount) != -1){
            res.json(sendResultResponse(true, 200, process.env["SYSTEM_SUCCESS"]))
        }else {
            res.json(sendResultResponse(false, 200, process.env["SYSTEM_SUCCESS"]))
        }
    }
};

/**
 * Gets the creator id of the APP based on the APP primary key
 * @param req
 * @param res
 * @returns APP creator's id
 */
exports.getAppByPk = async (data) => {
    //data为view的属性。因为是对view进行增删查改的时候，需要获取APP的数据
    const appId = data.appId;
    const app = await App.findByPk(appId)
    if (app != null) {
        return app.userId
    } else {
        return null
    }
};

/**
 * Modify APP information
 * @param req
 * @param res
 * @returns Returns the length of modified data
 */
exports.editApp = async (req, res) => {
    const app = req.body;
    // req.user.id is obtained by the calling interface after the token in the request header is resolved.
    // It matches whether the current login user is the same as the user in the incoming token
    if (app.userId == req.user.id) {
        const newApp = {
            roleMemberSheet: app.roleMemberSheet,
            savedDataUrl: app.savedDataUrl,
            published: app.published,
            developer: app.developer,
            appName: app.appName
        };
        //根据主键Id进行更新，确保更新数据的唯一性
        await App.update(newApp, {where: {id: app.id}}).then(data => {
            res.json(sendResultResponse(data.length, 200, process.env["SYSTEM_SUCCESS"]))
        }).catch(err => {
            res.json(sendResultResponse(err, 500, process.env["SYSTEM_FAIL"]))
        });
    } else {
        res.json(sendResultResponse('', 401, process.env["TOKEN_ERROR_MSG"]))
    }
};

/**
 * Publish APP
 * @param req
 * @param res
 * @returns Returns the length of modified data
 */
exports.setPublished = async (req, res) => {
    const app = req.body;
    //这里需要先判断APP的userId，也就是创建人的Id和token中解密得到的userId是否是一致的
    //如果是一致的，则可以进行操作。如果不是一致的，终止操作。
    if (app.userId == req.user.id) {
        const newApp = {
            published: app.published
        };
        await App.update(newApp, {where: {id: app.id}}).then(data => {
            res.json(sendResultResponse(data.length, 200, process.env["SYSTEM_SUCCESS"]))
        }).catch(err => {
            res.json(sendResultResponse(err, 500, process.env["SYSTEM_FAIL"]))
        });
    } else {
        res.json(sendResultResponse('', 401, process.env["TOKEN_ERROR_MSG"]))
    }
};

/**
 * Share APP
 * @param req
 * @param res
 * @returns Returns the length of modified data
 */
exports.shareApp = async (req, res) => {
    const params = req.body;
    if (params.appId != null) {
        const app = await App.findByPk(params.appId)
        //1，Check whether the id of the current user is the same as the user id of the incoming parameter
        //2，Whether the database is shared information
        //3，Query whether the APP share list already contains the sharer
        if (app.userId == req.user.id) {
            const oldEndUserIds = app.endUserIds
            const googleAccountArr = params.googleAccount
            let userIds = ''
            for (const googleAccount of googleAccountArr) {
                //根据谷歌账号获取用户信息，获取用户Id
                const user = await getUserByGoogleAccount(googleAccount)
                if (user != null){
                    //如果已经存在，则不再把用户id加入endUserIds字段
                    if (oldEndUserIds == null || oldEndUserIds == ''){
                        userIds += userIds == '' ? ',' + user.id + ',' :  user.id+','
                    }else {
                        if (oldEndUserIds.indexOf(',' +user.id+ ',') == -1){
                            userIds +=  user.id + ','
                        }
                    }
                }
            }
            //拼接endUserIds字段，如果原本已经有分享的userId了，则在原来的基础上追加
            //如果当前APP重来没有分享过，则endUserIds是null，所以直接赋值userIds即可
            const endUserIds = app.endUserIds != null && app.endUserIds != '' ?  app.endUserIds + userIds  : userIds
            const newApp = {
                endUserIds: endUserIds
            };
            await App.update(newApp, {where: {id: app.id}}).then(data => {
                res.json(sendResultResponse(data.length, 200, process.env["SYSTEM_SUCCESS"]))
            }).catch(err => {
                res.json(sendResultResponse(err, 500, process.env["SYSTEM_FAIL"]))
            });
        } else {
            res.json(sendResultResponse('', 500, process.env["SYSTEM_FAIL"]))
        }
    } else {
        res.json(sendResultResponse('', 400, process.env["PARMAS_HIATUS"]))
    }
};



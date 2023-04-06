const db = require("../models");
const App = db.app;
const Op = db.Op; // Op是Sequelize操作符的别名，可以用于构建复杂的SQL查询条件
const {getUserByGoogleAccount} = require("./user.controller");
const {sendResultResponse} = require("../utils/responseFrom")

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
            // [Op.or] 表示使用 Sequelize 的操作符 OR 进行条件查询，它用于组合多个条件，只要其中一个条件成立，就返回查询结果。
            [Op.or]: [{userId: user.id} // 分别是用户自己创建的应用和其他用户分享的应用，查询条件中的Op.like操作符可以进行模糊查询，通过将指定的用户ID用通配符%拼接到查询条件中，可以返回包含该用户ID的记录。
                     ,{endUserIds: {[Op.like]: '%' + user.id + '%'}, published: 'true'}],
        }; // The like operator is used to blur match strings in a query. We used the % wildcard to match any character, so the query returns a record containing the endUserIds value for the specified user ID.
        await App.findAll({where}).then(data => {
            res.json(sendResultResponse(data, 200, process.env["SYSTEM_SUCCESS"]))
        }).catch(err => {
            res.json(sendResultResponse(err, 500, process.env["SYSTEM_FAIL"]))
        })
    }
};

/**
 * Gets the creator id of the APP based on the APP primary key
 * @param req
 * @param res
 * @returns APP creator's id
 */
exports.getAppByPk = async (data) => {// Sequelize ORM 中 Model（模型）实例的一个方法，用于根据主键（primary key）查找单个实例。
    //data为view的属性。因为是对view进行增删查改的时候，需要获取APP的数据
    const appId = data.appId;
    console.log(data)

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
    console.log(app)
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
        const app = await App.findByPk(params.appId) // Sequelize ORM（对象关系映射）库提供的一个方法之一，用于从数据库中查找具有指定主键值的单个模型实例。
        //1，Check whether the id of the current user is the same as the user id of the incoming parameter
        //2，Whether the database is shared information
        //3，Query whether the APP share list already contains the sharer
        if (app.userId == req.user.id) {
            const oldEndUserIds = app.endUserIds
            const googleAccountArr = params.googleAccount
            let userIds = '';
            for (const googleAccount of googleAccountArr) {
                //根据谷歌账号获取用户信息，获取用户Id
                const user = await getUserByGoogleAccount(googleAccount)
                if (user != null){
                    //如果已经存在，则不再把用户id加入endUserIds字段
                    if (oldEndUserIds == null || oldEndUserIds == ''){
                        userIds += userIds == '' ? user.id : ',' + user.id
                    }else {
                        if (oldEndUserIds.indexOf(user.id) == -1){
                            userIds += userIds == '' ? user.id : ',' + user.id
                        }
                    }
                }
            }
            //拼接endUserIds字段，如果原本已经有分享的userId了，则在原来的基础上追加
            //如果当前APP重来没有分享过，则endUserIds是null，所以直接赋值userIds即可
            const endUserIds = app.endUserIds != null && app.endUserIds != '' ? userIds + ',' + app.endUserIds : userIds
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


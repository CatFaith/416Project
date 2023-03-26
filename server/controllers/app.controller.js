const db = require("../models");
const App = db.app;
const Op = db.Op;
const {getUserByPk} = require("./user.controller");
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
    const newApp = {
        userId: user.id,
        roleMemberSheet: app.roleMemberSheet,
        savedDataUrl: app.savedDataUrl,
        published: app.published
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
                     ,{endUserIds: {[Op.like]: '%' + user.id + '%'}, published: 'true'}
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
 * Gets the creator id of the APP based on the APP primary key
 * @param req
 * @param res
 * @returns APP creator's id
 */
exports.getAppByPk = async (data) => {
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
    // req.user.id is obtained by the calling interface after the token in the request header is resolved. 
    // It matches whether the current login user is the same as the user in the incoming token
    if (app.userId == req.user.id) {
        const newApp = {
            roleMemberSheet: app.roleMemberSheet,
            savedDataUrl: app.savedDataUrl,
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
 * Publish APP
 * @param req
 * @param res
 * @returns Returns the length of modified data
 */
exports.setPublished = async (req, res) => {
    const app = req.body;
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
        if (app.userId == req.user.id && await getUserByPk(params.endUserId) && app.endUserIds != null ? app.endUserIds.indexOf(params.endUserId) == -1 : true) {
            const endUserIds = app.endUserIds != null ? app.endUserIds + ',' + params.endUserId : params.endUserId
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


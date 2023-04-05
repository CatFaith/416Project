const db = require("../models");
const View = db.view;
const {getAppByPk} = require("./app.controller");
const {sendResultResponse} = require("../utils/responseFrom")

/**
 * req.user.id is obtained by the calling interface after the token in the request header is resolved. 
 * If the id of the current login user is the same as that of the user in the token, the database can be operated only if the ID is the same.
 */

/**
 * Create View
 * @param req
 * @param res
 * @returns View object
 */
exports.addView = async (req, res) => {
    const view = req.body;
    const userId = await getAppByPk(view)
    // req.user.id is obtained by the calling interface after the token in the request header is resolved. 
    // If the id of the current login user is the same as that of the user in the token, the database can be operated only if the ID is the same
    // 前端新增View传过来的参数，保存View表
    if (userId == req.user.id) {
        const newView = {
            appId: view.appId,
            viewName: view.viewName,
            savedDataUrl: view.savedDataUrl,
            columns: view.columns,
            viewType: view.viewType,
            allowedActions: view.allowedActions,
            roles: view.roles,
        };
        await View.create(newView).then(data => {
            res.json(sendResultResponse(data, 200, process.env["SYSTEM_SUCCESS"]))
        }).catch(err => {
            res.json(sendResultResponse(err, 500, process.env["SYSTEM_FAIL"]))
        })
    } else {
        res.json({result: process.env["TOKEN_ERROR_MSG"]})
    }
};

/**
 * Delete a View based on its id
 * @param req
 * @param res
 * @returns View Object
 */
exports.deleteView = async (req, res) => {
    const view = req.body;
    const userId = await getAppByPk(view)
    // req.user.id is obtained by the calling interface after the token in the request header is resolved. 
    // It matches whether the current login user is the same as the user in the incoming token
    if (userId == req.user.id) {
        //根据主键Id进行删除，确保删除数据的唯一性
        await View.destroy({where: {id: view.id}}).then(data => {
            res.json(sendResultResponse(data, 200, process.env["SYSTEM_SUCCESS"]))
        }).catch(err => {
            console.log(111)
            res.json(sendResultResponse(err, 500, process.env["SYSTEM_FAIL"]))
        })
    } else {
        res.json(sendResultResponse('', 500, process.env["TOKEN_ERROR_MSG"]))
    }
};

/**
 * Query the view object according to the id of the currently selected APP
 * @param req
 * @param res
 * @returns View object
 */
exports.getView = async (req, res) => {
    const view = req.body;
    //APP点击查看view，需要根据appid查询当前APP下所有关联的view
    await View.findAll({where: {appId: view.appId}}).then(data => {
        res.json(sendResultResponse(data, 200, process.env["SYSTEM_SUCCESS"]))
    }).catch(err => {
        res.json(sendResultResponse(err, 500, process.env["SYSTEM_FAIL"]))
    })
};

/**
 * Modifying View Information
 * @param req
 * @param res
 * @returns Returns the length of modified data
 */
exports.editView = async (req, res) => {
    const view = req.body;
    const userId = await getAppByPk(view)
    // console.log(view)
    // req.user.id is obtained by the calling interface after the token in the request header is resolved. 
    // It matches whether the current login user is the same as the user in the incoming token
    if (userId == req.user.id) {
        const newView = {
            appId: view.appId,
            viewName: view.viewName,
            savedDataUrl: view.savedDataUrl,
            columns: view.columns,
            viewType: view.viewType,
            allowedActions: view.allowedActions,
            roles: view.roles
        };
        //根据主键Id进行更新，确保更新数据的唯一性
        await View.update(newView, {where: {id: view.id}}).then(data => {
            res.json(sendResultResponse(data.length, 200, process.env["SYSTEM_SUCCESS"]))
        }).catch(err => {
            res.json(sendResultResponse(err, 500, process.env["SYSTEM_FAIL"]))
        });
    } else {
        res.json({result: process.env["TOKEN_ERROR_MSG"]})
    }
};


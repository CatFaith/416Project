const db = require("../models");
const View = db.view;
const {getAppByPk, getAppEntityByPk} = require("./app.controller");
const {sendResultResponse} = require("../utils/responseFrom")
const {getGoogleSheetsData, addViewSheet, editSheetData, addSheetData, deleteSheetData} = require("../utils/googleSheet");

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

/**
 * 从app列表点击app时候，根据view的saveDataURL字段获取google sheet的数据
 * @param req
 * @param res
 * @returns google sheet data
 */
exports.getViewForGoogleSheet = async (req, res) => {
    //1,根据appid，查出当前APP下所有的view
    const view = req.body;
    //APP点击查看view，需要根据appid查询当前APP下所有关联的view
    const urlArr = []
    const data = await View.findAll({where: {appId: view.appId}})
    if (data != null){
        for (const item of data) {
            urlArr.push(item.savedDataUrl)
        }
        //2，根据view的saveDataURL字段获取google sheet的数据
        const result = await getGoogleSheetsData(urlArr)
        //3，展示数据
        res.json(sendResultResponse(result, 200, process.env["SYSTEM_SUCCESS"]))
    }else {
        res.json(sendResultResponse(null, 200, process.env["SYSTEM_SUCCESS"]))
    }
};

/**
 *
 * @param req
 * @param res
 * @returns google sheet data
 */
exports.addViewToGoogleSheet = async (req, res) => {
    //1,根据appid，查出当前APP的savedDataUrl
    const view = req.body;
    const app = await getAppEntityByPk(view)
    if (app != null){
        //2，根据APP的saveDataURL来创建出一个新的sheet
        const result = await addViewSheet(app.savedDataUrl, view.viewName)

        //3，展示数据
        res.json(sendResultResponse(true, 200, process.env["SYSTEM_SUCCESS"]))
    }else {
        res.json(sendResultResponse(false, 200, process.env["SYSTEM_SUCCESS"]))
    }
};

/**
 *
 * @param req
 * @param res
 * @returns google sheet data
 */
exports.addRecordToGoogleSheet = async (req, res) => {
    //1,根据appid，查出当前APP下所有的view
    const data = req.body;
    if (data != null){
        //2，根据view的saveDataURL字段去新增google sheet的数据
        const result = await addSheetData(data.savedDataUrl, JSON.parse(JSON.stringify(data.rowData))) // 你需要json格式。
        //3，展示数据
        res.json(sendResultResponse(true, 200, process.env["SYSTEM_SUCCESS"]))
    }else {
        res.json(sendResultResponse(false, 500, process.env["SYSTEM_FAIL"]))
    }
};

/**
 *
 * @param req
 * @param res
 * @returns google sheet data
 */
exports.editRecordToGoogleSheet = async (req, res) => {
    //1,根据appid，查出当前APP下所有的view
    const data = req.body;
    if (data != null){
        //2，根据view的saveDataURL字段获取google sheet的数据
        const result = await editSheetData(data.savedDataUrl, data.rowNum, data.rowData)
        //3，展示数据
        res.json(sendResultResponse(true, 200, process.env["SYSTEM_SUCCESS"]))
    }else {
        res.json(sendResultResponse(false, 500, process.env["SYSTEM_FAIL"]))
    }
};

/**
 *
 * @param req
 * @param res
 * @returns google sheet data
 */
exports.deleteRecordToGoogleSheet = async (req, res) => {
    //1,根据appid，查出当前APP下所有的view
    const data = req.body;
    if (data != null){
        //2，根据view的saveDataURL字段获取google sheet的数据
        const result = await deleteSheetData(data.savedDataUrl, data.rowNum)
        //3，展示数据
        res.json(sendResultResponse(true, 200, process.env["SYSTEM_SUCCESS"]))
    }else {
        res.json(sendResultResponse(false, 500, process.env["SYSTEM_FAIL"]))
    }
};




const db = require("../models");
const View = db.view;
const {addLog} = require("./log.controller");
const EMUN = require("../utils/emun")
const {getAppByPk, getAppEntityByPk} = require("./app.controller");
const {sendResultResponse} = require("../utils/responseFrom")
const {getGoogleSheetsData, addViewSheet, deleteViewSheet, editSheetData, addSheetData, deleteSheetData, getGoogleSheetAuthorization} = require("../utils/googleSheet");

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
    // const userId = await getAppByPk(view)
    // req.user.id is obtained by the calling interface after the token in the request header is resolved.
    // If the id of the current login user is the same as that of the user in the token, the database can be operated only if the ID is the same
    // 前端新增View传过来的参数，保存View表
    let viewType = ''
    let viewName = ''
    let savedDataUrl = ''
    let roles = ''
    let appId = ''
    let allowedActions = ''
    if (view.viewName != null && view.viewName != undefined){
        //代表是新增view，新增view分为两步
        viewType = EMUN.TABLE
        roles = EMUN.DEVELOPERS
        allowedActions = 'add,edit,delete'
        appId = view.appId
        viewName = view.viewName
        //1，第一步是在google sheet新增多一个sheet，返回新建sheet的url
        const app = await getAppEntityByPk(view)
        let appSavedDataUrl = app.dataValues.savedDataUrl
        const urlArr = appSavedDataUrl.split('=')
        const sheet = await addViewSheet(appSavedDataUrl, viewName)
        //替换成新生成的sheetId
        savedDataUrl = urlArr[0] + '=' + sheet._rawProperties.sheetId
        //添加日志记录
        addLog(EMUN.GOOGLE_SHEET, EMUN.VIEW, 'addView', 'add sheet', req.user.googleAccount)
    }else {
        //新增role的时候，view.id为当前View的Id，如果是新增View，那view.id就是空的，则查出来的queryView也是空
        const queryView = await View.findByPk(view.id)
        //代表是新增view对应的role，此操作会新增一条viewType为detail的数据到MySQL的view表
        viewType = EMUN.DETAIL
        appId = queryView.appId
        viewName = queryView.viewName
        savedDataUrl = queryView.savedDataUrl
        roles = view.roleName
    }
    const newView = {
        appId: appId,
        viewName: viewName,
        savedDataUrl: savedDataUrl,
        viewType: viewType,
        allowedActions: allowedActions,
        roles: roles
    };
    await View.create(newView).then(data => {
        res.json(sendResultResponse(data, 200, process.env[EMUN.SYSTEM_SUCCESS]))
    }).catch(err => {
        //添加日志记录
        addLog(EMUN.ERROR, EMUN.VIEW, 'addView', err, req.user.googleAccount)
        res.json(sendResultResponse(err, 500, process.env[EMUN.SYSTEM_FAIL]))
    })
    // if (userId == req.user.id) {
    //
    // } else {
    //     //添加日志记录
    //     addLog(EMUN.ERROR, EMUN.VIEW, 'addView', process.env[EMUN.TOKEN_ERROR_MSG], req.user.googleAccount)
    //     res.json({result: process.env[EMUN.TOKEN_ERROR_MSG]})
    // }
};

/**
 * Delete a View based on its id
 * @param req
 * @param res
 * @returns View Object
 */
exports.deleteView = async (req, res) => {
    const view = req.body;
    const queryView = await View.findByPk(view.id)
    const viewData = queryView.dataValues
    // const userId = await getAppByPk(view)
    // req.user.id is obtained by the calling interface after the token in the request header is resolved.
    // It matches whether the current login user is the same as the user in the incoming token
    //根据主键Id进行删除，确保删除数据的唯一性
    //1,删除MySQL的View表信息
    await View.destroy({where: {id: view.id}}).then(data => {
        res.json(sendResultResponse(data, 200, process.env[EMUN.SYSTEM_SUCCESS]))
    }).catch(err => {
        //添加日志记录
        addLog(EMUN.ERROR, EMUN.VIEW, 'deleteView', err, req.user.googleAccount)
        res.json(sendResultResponse(err, 500, process.env[EMUN.SYSTEM_FAIL]))
    })
    //2，删除google Sheet的Sheet页
    await deleteViewSheet(viewData.savedDataUrl)
    //添加日志记录
    addLog(EMUN.GOOGLE_SHEET, EMUN.VIEW, 'deleteView', 'delete sheet', req.user.googleAccount)
    // if (userId == req.user.id) {
    // } else {
    //     //添加日志记录
    //     addLog(EMUN.ERROR, EMUN.VIEW, 'deleteView', process.env[EMUN.TOKEN_ERROR_MSG], req.user.googleAccount)
    //     res.json(sendResultResponse('', 500, process.env[EMUN.TOKEN_ERROR_MSG]))
    // }
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
        res.json(sendResultResponse(data, 200, process.env[EMUN.SYSTEM_SUCCESS]))
    }).catch(err => {
        //添加日志记录
        addLog(EMUN.ERROR, EMUN.VIEW, 'getView', err, req.user.googleAccount)
        res.json(sendResultResponse(err, 500, process.env[EMUN.SYSTEM_FAIL]))
    })
};

/**
 * Query the view object according to the id of the currently selected APP
 * @param req
 * @param res
 * @returns View object
 */
exports.getViewById = async (req, res) => {
    const view = req.body;
    //APP点击查看view，需要根据appid查询当前APP下所有关联的view
    await View.findAll({where: {id: view.id,}}).then(data => {
        // data.nameData=[["columns0","name0","type0","label0"],["columns1","name1","type1","label1"]]
        // data.obg={columns0: "a",name0: "222" ,type0: [ "reference", "sheet1" ],label0: "false",columns1: "a",name1: "222" ,type1: [ "reference", "sheet1" ],label1: "false"}
        res.json(sendResultResponse(data, 200, process.env[EMUN.SYSTEM_SUCCESS]))
    }).catch(err => {
        //添加日志记录
        addLog(EMUN.ERROR, EMUN.VIEW, 'getViewById', err, req.user.googleAccount)
        res.json(sendResultResponse(err, 500, process.env[EMUN.SYSTEM_FAIL]))
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
    // const userId = await getAppByPk(view)
    // req.user.id is obtained by the calling interface after the token in the request header is resolved.
    // It matches whether the current login user is the same as the user in the incoming token
    let newView = ''
    if (view.viewName != null && view.viewName != undefined){
        //代表是修改view的名称
        newView = {
            viewName: view.viewName
        }
    }else {
        //代表是修改role的名称或者其他信息
        if (view.roleName != null && view.roleName != undefined){
            //代表只是修改role的名称
            newView = {
                roles: view.roleName
            }
        }else {
            //代表是修改role的权限信息
            let columns = ''
            for (const item of view.columns){
                columns += item + ','
            }
            let allowedActions = ''
            for (const item of view.allowedActions){
                allowedActions += item + ','
            }
            let editColumns = ''
            for (const item of view.editColumns){
                editColumns += item + ','
            }
            newView = {
                columns: columns != '' ? columns.substring(0, columns.length -1) : columns,
                allowedActions: allowedActions != '' ? allowedActions.substring(0, allowedActions.length -1) : allowedActions,
                editColumns: editColumns != '' ? editColumns.substring(0, editColumns.length -1) : editColumns
            }
        }
    }
    //根据主键Id进行更新，确保更新数据的唯一性
    await View.update(newView, {where: {id: view.id}}).then(data => {
        res.json(sendResultResponse(data.length, 200, process.env[EMUN.SYSTEM_SUCCESS]))
    }).catch(err => {
        //添加日志记录
        addLog(EMUN.ERROR, EMUN.VIEW, 'editView', err, req.user.googleAccount)
        res.json(sendResultResponse(err, 500, process.env[EMUN.SYSTEM_FAIL]))
    });
    // if (userId == req.user.id) {
    // } else {
    //     //添加日志记录
    //     addLog(EMUN.ERROR, EMUN.VIEW, 'editView', process.env[EMUN.TOKEN_ERROR_MSG], req.user.googleAccount)
    //     res.json({result: process.env[EMUN.TOKEN_ERROR_MSG]})
    // }
};

/**
 * 判断当前登录人在RoleMemberSheet中是什么角色
 * @param result 根据RoleMemberSheet查询google sheet返回来的数据
 * @param googleAccount
 * @returns {Promise<string>}
 */
getRoleByRoleMemberSheet = async (result, googleAccount) => {
    let role = ''
    let index = null;
    for (const rowData of result){
        for (let i = 0;i < rowData.length; i++){
            if (rowData[i] == googleAccount){
                index = i;
                break;
            }
        }
        //index不等于''，就代表已经匹配上角色，则可以直接跳出循环了
        if (index != null){
            break;
        }
    }
    if (index != null){
        //取result[0]，是因为result[0]是第一行，就是role的名称
        //index是对应的列序号
        role = result[0][index]
    }
    return role
}

/**
 * 查询当前角色对view的权限
 * @param role
 * @param view
 * @returns {Promise<{editColumnArr: *, columnsArr: *, allowedActionsArr: *}>}
 */
getRoleAction = async (role, view) => {
    let viewData = ''
    // 判断是管理员还是其他普通的角色
    if (role == EMUN.DEVELOPERS) {
        //管理员
        viewData = await View.findOne({where: {roles: EMUN.DEVELOPERS,viewName: view.viewName,viewType: EMUN.TABLE}})
    }else {
        // 根据role、viewName和viewType能查出唯一的一条数据，同一个view的role不应该重复
        viewData = await View.findOne({where: {roles: role,viewName: view.viewName,viewType: EMUN.DETAIL}})
    }
    let roleActionFrom = ''
    if (null != viewData){
        const viewItem = viewData.dataValues
        const columnsArr = viewItem.columns.split(',')
        const allowedActionsArr = viewItem.allowedActions.split(',')
        const editColumnsArr = viewItem.editColumns.split(',')
        roleActionFrom = {
            columnsArr: columnsArr,
            allowedActionsArr: allowedActionsArr,
            editColumnsArr: editColumnsArr
        }
    }else {
        roleActionFrom = {
            columnsArr: [],
            allowedActionsArr: [],
            editColumnsArr: []
        }
    }
    return roleActionFrom
}

/**
 * 组装返回表格行数据，假设sheet有name,email,age列，但是role中配置了只能看name和email列，那就只能返回name和email这两列和对应的数据
 * 方法中的for循环有两次用到：i < 4这个条件，是因为约定好，每一个sheet页的前四列是：id,createBy,filter,editable
 * @param googleSheetView
 * @param roleActionFrom
 * @returns {Promise<{referenceData: [], returnData: []}>}
 */
assembleRowData = async (googleSheetView, roleActionFrom) => {
    //定义方法的返回值
    let returnData = []
    let referenceData = []
    // header为列名
    const header = googleSheetView.headerValues
    //判断当前的sheet中是否存在reference类型的数据
    const reference = googleSheetView.reference
    for (let i = 0;i < reference.length; i++){
        let refArrColumn = [];
        if (reference[i].toLowerCase() != 'false' && reference[i].toLowerCase() != 'true'){
            //不等于true或者false，那代表的就是当前列是reference类型的列了
            //refArrColumn第0个元素是ref的列名，第1个元素是ref的表名
            refArrColumn.push(header[i])
            refArrColumn.push(reference[i])
            referenceData.push(refArrColumn)
        }
    }
    // 根据role中设置的可见列，返回可见列
    let columnsIndex = []
    const canBeDisplayColumns = roleActionFrom.columnsArr
    for (const columns of canBeDisplayColumns){
        for (let i = 0;i < header.length; i++){
            //通过view表的columns列名于google sheet中的列名比对，比对相等，代表可以在UI界面上展示出来
            if (columns == header[i]){
                columnsIndex.push(i)
                break
            }
        }
    }
    if (columnsIndex.length != 0){
        //组合数据返回给前端
        //前四列是固定的，分别是:id,createBy,filter,editable
        const rowColumns = []
        for (let i = 0;i < 4; i++){
            rowColumns.push(header[i])
        }
        for (const index of columnsIndex){
            rowColumns.push(header[index])
        }
        const data = {
            rowNum: 1,
            rowData: rowColumns
        }
        //rowNum: 1，为标题列
        returnData.push(data)
        //下面组合表格数值列
        if (googleSheetView.rowData.length > 0){
            //要大于5是因为google sheet真正的数据时从第六行开始
            const rows = googleSheetView.rowData
            for (const row of rows){
                const rowData = []
                for (let i = 0;i < 4; i++){
                    rowData.push(row[i])
                }
                for (const index of columnsIndex){
                    rowData.push(row[index])
                }
                const data = {
                    rowNum: row[0],
                    rowData: rowData
                }
                returnData.push(data)
            }
        }
    }
    const data = {
        returnData: returnData,
        referenceData: referenceData
    }
    return data
}

/**
 * 从app列表点击app时候，根据view的saveDataURL字段获取google sheet的数据
 * @param req
 * @param res
 * @returns google sheet data
 */
exports.getViewForGoogleSheet = async (req, res) => {
    //定义返回给前端的数据
    const returnData = []
    const googleAccount = req.user.googleAccount;
    //1,根据appid，查出当前APP下所有的view
    const appId = req.body.appId;
    //查询app数据，获取roleMemberSheet
    const app = await getAppEntityByPk(req.body)
    //APP点击查看view，需要根据appid查询当前APP下所有关联的view，只查ViewType为table的数据，因为只有table的数据才是View的数据
    const views = await View.findAll({where: {appId: appId,viewType: EMUN.TABLE}})
    const viewData = []
    if (views != null){
        //2，调用google sheet获取数据
        const result = await getGoogleSheetAuthorization(app.dataValues.roleMemberSheet)
        // const result = [[EMUN.DEVELOPERS, 'StudentRole', 'TARole', 'PoliceRole', 'DoctorRole' ],['ali@gamil.com','Eric@gmail.com','ta@gamil.com','po@gamil.com','doc@gmail.com'],['2@gamil.com','ali1@gamil.com','ta1@gamil.com','po1@gamil.com','doc1@gamil.com'],['3@gamil.com','ali2@gamil.com','ta2@gamil.com','po2@gamil.com','doc2@gamil.com'],['4@gamil.com','Eric1@gmail.com','ta3@gamil.com','po3@gamil.com','doc3@gamil.com']]
        //从role member sheet获取当前登录用户的角色信息
        const role = await getRoleByRoleMemberSheet(result, googleAccount)
        for (const item of views) {
            viewData.push(item.dataValues)
        }
        //逐个遍历view
        for (const view of viewData) {
            //3，查询view表MySQL数据库，查出所有的角色信息。判断第3步的role具有什么权限？？可见列有哪些？？
            const roleActionFrom = await getRoleAction(role, view)
            const urlArr = []
            urlArr.push(view.savedDataUrl)
            //4，根据view的saveDataURL字段获取google sheet的数据
            const result = await getGoogleSheetsData(urlArr)
            // const result = [{"title": "course","headerValues": ["id","createBy","filter","editable","studentId","course","score"],"initialValue": ["\"\"","\"\"",
            //         "\"\"","\"\"","\"\"","\"\"","\"\""],"label": ["FALSE","FALSE","FALSE","FALSE","TRUE","FALSE","FALSE"],"reference": [
            //         "FALSE","FALSE","FALSE","FALSE","student","FALSE","FALSE"],"type": ["text","text","boolean","boolean","text","text","Number"],
            //     "rowData": [["6","Er1c@gmail.com","FALSE","TRUE","6","English","90"],["7","Jun@gmail.com","FALSE","TRUE","7","organism","91"],
            //         ["8","Jun@gmail.com","FALSE","TRUE","8","chemistry","92"],["9","Jun@gmail.com","TRUE","FALSE","9","physics","93"],
            //         ["10","Er1c@gmail.com","TRUE","FALSE","10","history","94"],["11","Er1c@gmail.com","TRUE","FALSE","11","mathematics","95"]]}
            //     // ,{"title": "student","headerValues": ["id","createBy","filter","editable","name","email","age","phone"],"initialValue": ["\"\"","\"\"",
            //     //     "\"\"","\"\"","\"\"","\"\"","\"\"","\"\""],"label": ["FALSE","FALSE","FALSE","FALSE","FALSE","FALSE","FALSE","FALSE"],
            //     // "reference": ["FALSE","FALSE","FALSE","FALSE","FALSE","FALSE","FALSE","FALSE"],"type": ["text","text","boolean","boolean","text",
            //     //     "text","Number","text"],"rowData": [["6","Er1c@gmail.com","FALSE","TRUE","name1","1@gmail.com","20","13567875432"],["7","Jun@gmail.com",
            //     //     "FALSE","TRUE","name2","2@gmail.com","21","13567875433"],["8","Jun@gmail.com","FALSE","TRUE","name3","3@gmail.com","22","13567875434"],
            //     //     ["9","Jun@gmail.com","TRUE","FALSE","name4","4@gmail.com","23","13567875435"],["10","Er1c@gmail.com","TRUE","FALSE","name5","5@gmail.com","24",
            //     //         "13567875436"],["11","Er1c@gmail.com","TRUE","FALSE","name6","6@gmail.com","25","13567875437"]]
            //     // }
            // ]
            for (const googleSheetView of result){
                //5，组装返回的行数据
                const data = await assembleRowData(googleSheetView, roleActionFrom)
                const viewReturnData = {
                    id: view.id,
                    viewName: view.viewName,
                    allowedAction: roleActionFrom.allowedActionsArr,
                    editableColumns: roleActionFrom.editColumnsArr,
                    reference: data.referenceData,
                    viewData: data.returnData
                }
                returnData.push(viewReturnData)
            }
        }
        //6，展示数据
        res.json(sendResultResponse(returnData, 200, process.env[EMUN.SYSTEM_SUCCESS]))
    }else {
        res.json(sendResultResponse(null, 200, process.env[EMUN.SYSTEM_SUCCESS]))
    }
};

/**
 * 组装返回的Columns数据，数据格式为：[["columns0","name0","type0","label0"],["columns1","name1","type1","label1"]]
 * @param googleSheetView
 * @returns {Promise<[]>}
 */
assembleColumnData = async (googleSheetView) => {
    // header为列名
    const header = googleSheetView.headerValues
    // label
    const label = googleSheetView.label
    // type数据类型
    const type = googleSheetView.type
    // reference,判断当前的sheet中是否存在reference类型的数据
    const reference = googleSheetView.reference
    //定义返回的值
    const returnData = []
    for (let i = 0;i < header.length; i++){
        const columnData = []
        //String.fromCharCode(i+65)为数字转英文的方法
        columnData.push(String.fromCharCode(i+65))
        columnData.push(header[i])
        if (reference[i].toLowerCase() != 'false' && reference[i].toLowerCase() != 'true'){
            //代表当前列是引用类型，那数据格式为： [ "reference", "sheet1" ],sheet1为ViewName
            const referenceArr = []
            referenceArr.push('reference')
            referenceArr.push(reference[i])
            columnData.push(referenceArr)
        }else {
            columnData.push(type[i])
        }
        columnData.push(label[i])
        returnData.push(columnData)
    }
    return returnData
}

/**
 * 根据appId从google sheet获取当前app下所有sheet的Column及相关属性
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.getViewColumnsByAppId = async (req, res) => {
    //定义返回给前端的数据
    const returnColumnData = []
    const returnViewName = []
    //1,根据appid，查出当前APP下所有的view
    const appId = req.body.appId;
    //APP点击查看view，需要根据appid查询当前APP下所有关联的view，只查ViewType为table的数据，因为只有table的数据才是View的数据
    const views = await View.findAll({where: {appId: appId,viewType: EMUN.TABLE}})
    const viewData = []
    if (views != null){
        for (const item of views) {
            viewData.push(item.dataValues)
        }
        //逐个遍历view
        for (const view of viewData) {
            returnViewName.push(view.viewName)
            const urlArr = []
            urlArr.push(view.savedDataUrl)
            //4，根据view的saveDataURL字段获取google sheet的数据
            const result = await getGoogleSheetsData(urlArr)
            // const result = [{"title": "course","headerValues": ["id","createBy","filter","editable","studentId","course","score"],"initialValue": ["\"\"","\"\"",
            //         "\"\"","\"\"","\"\"","\"\"","\"\""],"label": ["FALSE","FALSE","FALSE","FALSE","TRUE","FALSE","FALSE"],"reference": [
            //         "FALSE","FALSE","FALSE","FALSE","student","FALSE","FALSE"],"type": ["text","text","boolean","boolean","text","text","Number"],
            //     "rowData": [["6","Er1c@gmail.com","FALSE","TRUE","6","English","90"],["7","Jun@gmail.com","FALSE","TRUE","7","organism","91"],
            //         ["8","Jun@gmail.com","FALSE","TRUE","8","chemistry","92"],["9","Jun@gmail.com","TRUE","FALSE","9","physics","93"],
            //         ["10","Er1c@gmail.com","TRUE","FALSE","10","history","94"],["11","Er1c@gmail.com","TRUE","FALSE","11","mathematics","95"]]}
            //     // ,{"title": "student","headerValues": ["id","createBy","filter","editable","name","email","age","phone"],"initialValue": ["\"\"","\"\"",
            //     //     "\"\"","\"\"","\"\"","\"\"","\"\"","\"\""],"label": ["FALSE","FALSE","FALSE","FALSE","FALSE","FALSE","FALSE","FALSE"],
            //     // "reference": ["FALSE","FALSE","FALSE","FALSE","FALSE","FALSE","FALSE","FALSE"],"type": ["text","text","boolean","boolean","text",
            //     //     "text","Number","text"],"rowData": [["6","Er1c@gmail.com","FALSE","TRUE","name1","1@gmail.com","20","13567875432"],["7","Jun@gmail.com",
            //     //     "FALSE","TRUE","name2","2@gmail.com","21","13567875433"],["8","Jun@gmail.com","FALSE","TRUE","name3","3@gmail.com","22","13567875434"],
            //     //     ["9","Jun@gmail.com","TRUE","FALSE","name4","4@gmail.com","23","13567875435"],["10","Er1c@gmail.com","TRUE","FALSE","name5","5@gmail.com","24",
            //     //         "13567875436"],["11","Er1c@gmail.com","TRUE","FALSE","name6","6@gmail.com","25","13567875437"]]
            //     // }
            // ]
            for (const googleSheetView of result){
                //5，组装返回的行数据
                const columnData = await assembleColumnData(googleSheetView)
                let columnsList = {}
                const nameList = []
                let type = ''
                let columnsItem = {}
                columnData.map((item,index)=>{
                    nameList.push(["columns"+index,"name"+index,"type"+index,"label"+index])
                    type= item[2].length!=2?item[2]:item[2][0]+'","'+item[2][1]
                    columnsItem=JSON.parse('{"columns'+index+'": "'+item[0]+'","name'+index+'": "'+item[1]+'" ,"type'+index+'": ["'+type+'"],"label'+index+'": "'+item[3]+'" }')
                    columnsList = {...columnsList,...columnsItem}
                })
                const viewColumnData = {
                    id: view.id,
                    viewName: view.viewName,
                    columnData: columnData,
                    columnsList: columnsList,
                    nameList: nameList
                }
                returnColumnData.push(viewColumnData)
            }
        }
        const jsonData = {
            viewNameArr: returnViewName,
            viewData: returnColumnData
        }
        //6，展示数据
        res.json(sendResultResponse(jsonData, 200, process.env[EMUN.SYSTEM_SUCCESS]))
    }else {
        res.json(sendResultResponse(null, 200, process.env[EMUN.SYSTEM_SUCCESS]))
    }
}

/**
 * 根据ViewName，查询当前View关联的所有role数据
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.getRoleDataByViewId = async (req, res) => {
    //定义返回给前端的数据
    const returnRoleData = []
    const returnRoleNameArr = []
    const queryView = await View.findByPk(req.body.viewId)
    const view = queryView.dataValues
    //1,根据viewName，查出当前View下所有的Role
    //APP点击查看view，需要根据appid查询当前APP下所有关联的view，只查ViewType为table的数据，因为只有table的数据才是View的数据
    const roles = await View.findAll({where: {viewName: view.viewName,viewType: EMUN.DETAIL}})
    //2,根据viewName，查出当前View的table数据，目的是为了取出当前View所有的列
    const viewTable = await View.findOne({where: {viewName: view.viewName,viewType: EMUN.TABLE}})
    if (viewTable != null){
        const allColumns = viewTable.columns.split(',')
        const roleData = []
        if (roles != null){
            for (const item of roles) {
                //提取出roleData
                roleData.push(item.dataValues)
            }
            for (const role of roleData) {
                returnRoleNameArr.push(role.roles)
                const data = {
                    id: role.id,
                    roleName: role.roles,
                    columns: role.columns != null ? role.columns.split(',') : [],
                    allowedActions: role.allowedActions != null ? role.allowedActions.split(',') : [],
                    editColumns: role.editColumns != null ? role.editColumns.split(',') : [],
                    viewName: view.viewName
                }
                returnRoleData.push(data)
            }
            //组装返回给前端的数据结构
            const jsonData = {
                roleNameArr: returnRoleNameArr,
                allColumns: allColumns,
                roleData: returnRoleData
            }
            // 展示数据
            res.json(sendResultResponse(jsonData, 200, process.env[EMUN.SYSTEM_SUCCESS]))
        }else {
            res.json(sendResultResponse(null, 200, process.env[EMUN.SYSTEM_SUCCESS]))
        }
    }else {
        res.json(sendResultResponse('view table data is null', 200, process.env[EMUN.SYSTEM_SUCCESS]))
    }
}

/**
 * 新增或者修改appView的Column信息
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.editOrAddViewColumn = async (req, res) => {
    //1,组织column，name，type，label
    let columnArr = []
    let nameArr = []
    let typeArr = []
    let labelArr = []
    const viewColunms = req.body;
    for (const key in viewColunms) {
        if (key.indexOf('column') != -1){
            columnArr.push(key)
        }
        if (key.indexOf('name') != -1){
            nameArr.push(key)
        }
        if (key.indexOf('type') != -1){
            typeArr.push(key)
        }
        if (key.indexOf('label') != -1){
            labelArr.push(key)
        }
    }
    //2，更新View表的columns和editColumns字段
    let columns = ''
    //从i=4开始，因为前四Column是Id，createBy，filter，editable
    for (let i = 4;i < nameArr.length; i++){
        columns += viewColunms[nameArr[i]] + ','
    }
    const newView = {
        columns: columns != '' ? columns.substring(0, columns.length - 1) : columns,
        editColumns: columns != '' ? columns.substring(0, columns.length - 1) : columns
    }
    //根据主键Id进行更新，确保更新数据的唯一性
    await View.update(newView, {where: {id: viewColunms['id']}}).then(data => {
        res.json(sendResultResponse(data.length, 200, process.env[EMUN.SYSTEM_SUCCESS]))
    }).catch(err => {
        //添加日志记录
        addLog(EMUN.ERROR, EMUN.VIEW, 'editOrAddViewColumn', err, req.user.googleAccount)
        res.json(sendResultResponse(err, 500, process.env[EMUN.SYSTEM_FAIL]))
    });
    //3,更新列的信息到google sheet，采取全部更新列的形式
    //先根据viewId查出存储google sheet的savedDataUrl,
    const queryView = await View.findByPk(viewColunms['id'])
    const view = queryView.dataValues
    let rowNum = []
    let updateData = []
    let googleSheetColumns = []
    let googleSheetLabel = []
    let googleSheetRef = []
    let googleSheetType = []
    for (const name of nameArr){
        googleSheetColumns.push(viewColunms[name])
    }
    // rowNum.push(0)
    updateData.push(googleSheetColumns)
    for (const label of labelArr){
        googleSheetLabel.push(viewColunms[label])
    }
    rowNum.push(1)
    updateData.push(googleSheetLabel)
    for (const type of typeArr){
        if (viewColunms[type].length > 1){
            //第二个元素为引用sheet页的名字，类似这样的结构：[ 'reference', 'student' ]
            googleSheetRef.push(viewColunms[type][1])
        }else {
            googleSheetRef.push('FALSE')
        }
    }
    rowNum.push(2)
    updateData.push(googleSheetRef)
    for (const type of typeArr){
        //第1个元素为引用sheet页的名字，类似这样的结构：[ 'reference', 'student' ]
        googleSheetType.push(viewColunms[type][0])
    }
    rowNum.push(3)
    updateData.push(googleSheetType)
    // 4，根据view的saveDataURL字段获取google sheet的数据
    if (rowNum.length > 0){
        await editSheetData(view.savedDataUrl, rowNum, updateData)
        //添加日志记录
        addLog(EMUN.GOOGLE_SHEET, EMUN.VIEW, 'editOrAddViewColumn', updateData.toString(), req.user.googleAccount)
    }

};

/**
 * 根据APP中的savedDataUrl创建出一个新的sheet
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
        res.json(sendResultResponse(true, 200, process.env[EMUN.SYSTEM_SUCCESS]))
    }else {
        res.json(sendResultResponse(false, 200, process.env[EMUN.SYSTEM_SUCCESS]))
    }
};

/**
 * google sheet新增行数据
 * @param req
 * @param res
 * @returns google sheet data
 */
exports.addRecordToGoogleSheet = async (req, res) => {
    //1,根据appid，查出当前APP下所有的view
    const data = req.body;
    if (data != null){
        //2，根据view的saveDataURL字段去新增google sheet的数据
        const result = await addSheetData(data.savedDataUrl, JSON.parse(JSON.stringify(data.rowData)))
        //3，展示数据
        res.json(sendResultResponse(true, 200, process.env[EMUN.SYSTEM_SUCCESS]))
    }else {
        res.json(sendResultResponse(false, 500, process.env[EMUN.SYSTEM_FAIL]))
    }
};

/**
 * google sheet修改行数据
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
        res.json(sendResultResponse(true, 200, process.env[EMUN.SYSTEM_SUCCESS]))
    }else {
        res.json(sendResultResponse(false, 500, process.env[EMUN.SYSTEM_FAIL]))
    }
};

/**
 * google sheet删除行数据
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
        res.json(sendResultResponse(true, 200, process.env[EMUN.SYSTEM_SUCCESS]))
    }else {
        res.json(sendResultResponse(false, 500, process.env[EMUN.SYSTEM_FAIL]))
    }
};

// /**
//  * 根据appId查询所有的view数据
//  * @param appId
//  * @returns {Promise<*|null>}
//  */
// exports.getViewByAppId = async (appId) => {
//     //根据appId查询所有的view
//     const viewData = await View.findAll({where: {appId: appId}})
//     if (viewData != null) {
//         let returnData = []
//         for (const view of viewData){
//             //循环viewData，其中dataValues属性才是真正的数据
//             returnData.push(view.dataValues)
//         }
//         return returnData
//     } else {
//         return null
//     }
// };




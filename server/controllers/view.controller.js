const db = require("../models");
const View = db.view;
const {addLog} = require("./log.controller");
const EMUN = require("../utils/emun")
const {getAppEntityByPk, checkAuthorizationMethod} = require("./app.controller");
const {sendResultResponse} = require("../utils/responseFrom")
const {getGoogleSheetsData, addViewSheet, deleteViewSheet, editSheetData, addSheetData, deleteSheetData, getGoogleSheetAuthorization, editSheetDataByRowNum, getSheet} = require("../utils/googleSheet");

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
    let columns = ''
    if (view.viewName != null && view.viewName != undefined){
        //代表是新增view，新增view分为两步
        viewType = EMUN.TABLE
        roles = EMUN.DEVELOPERS
        allowedActions = 'add,edit,delete'
        appId = view.appId
        viewName = view.viewName
        if (view.savedDataUrl != null && view.savedDataUrl != undefined){
            //如果savedDataUrl的值不为空，代表无需到googlesheet中新增sheet页，因为用户已经提前新增好了
            //需先判断当前输入的url，在googlesheet中是否能找到相对应的sheet页，找到了，才能新增
            //根据view的saveDataURL字段获取google sheet的数据
            const result = await getSheet(view.savedDataUrl)
            if (result != null && result != undefined){
                const rows = await result.getRows();
                if (rows != null && rows != undefined){
                    const headerValues = rows[0]._sheet.headerValues;
                    for (let i = 2;i < headerValues.length; i++){
                        columns += headerValues[i] + ','
                    }
                }
                savedDataUrl = view.savedDataUrl
            }else {
                res.json(sendResultResponse('输入的URL在google sheet中找不到对应的表格，请检查并重新输入', 500, process.env[EMUN.SYSTEM_FAIL]))
                return
            }
        }else {
            //1，第一步是在google sheet新增多一个sheet，返回新建sheet的url
            const app = await getAppEntityByPk(view)
            let appSavedDataUrl = app.dataValues.savedDataUrl
            const urlArr = appSavedDataUrl.split('=')
            const sheet = await addViewSheet(appSavedDataUrl, viewName)
            //替换成新生成的sheetId
            savedDataUrl = urlArr[0] + '=' + sheet._rawProperties.sheetId
        }
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
        roles: roles,
        columns: columns == '' ? '' : columns.substring(0, columns.length - 1),
        editColumns: columns == '' ? '' : columns.substring(0, columns.length - 1)
    };
    await View.create(newView).then(data => {
        res.json(sendResultResponse(data, 200, process.env[EMUN.SYSTEM_SUCCESS]))
    }).catch(err => {
        //添加日志记录
        addLog(EMUN.ERROR, EMUN.VIEW, 'addView', err, req.user.googleAccount)
        res.json(sendResultResponse(err, 500, process.env[EMUN.SYSTEM_FAIL]))
    })
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
    if (viewData.viewType == 'table'){
        //2，删除google Sheet的Sheet页
        await deleteViewSheet(viewData.savedDataUrl)
        //添加日志记录
        addLog(EMUN.GOOGLE_SHEET, EMUN.VIEW, 'deleteView', 'delete sheet', req.user.googleAccount)
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
        viewData = await View.findOne({where: {roles: EMUN.DEVELOPERS,appId: view.appId,viewName: view.viewName,viewType: EMUN.TABLE}})
    }else {
        // 根据role、viewName和viewType能查出唯一的一条数据，同一个view的role不应该重复
        viewData = await View.findOne({where: {roles: role,appId: view.appId,viewName: view.viewName,viewType: EMUN.DETAIL}})
    }
    let roleActionFrom = ''
    if (null != viewData){
        const viewItem = viewData.dataValues
        roleActionFrom = {
            columnsArr: viewItem.columns != null ? viewItem.columns.split(',') : [],
            allowedActionsArr: viewItem.allowedActions != null ? viewItem.allowedActions.split(',') : [],
            editColumnsArr: viewItem.editColumns != null ? viewItem.editColumns.split(',') : []
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
 * @param view
 * @param role
 * @param googleAccount
 * @returns {Promise<{referenceData: [], returnData: []}>}
 */
assembleRowData = async (googleSheetView, roleActionFrom, view, role, googleAccount) => {
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
    //列顺序升序，保持和googlesheet中的列顺序一致
    columnsIndex.sort(function(a, b) {
        return a - b;
    });
    if (columnsIndex.length != 0){
        //组合数据返回给前端
        //前四列是固定的，分别是:id,createBy,filter,editable
        const rowColumns = []
        //首先先添加行号到第0个袁术
        rowColumns.push('rowNum')
        //如果包含filter，那就是table，那就要只有前两列默认
        //如果不包含filter，那就是detail，那就要前四列默认
        let index = canBeDisplayColumns.toString().indexOf('filter') != -1 ? 2 : 4
        for (let i = 0;i < index; i++){
            rowColumns.push(header[i])
        }
        for (const index of columnsIndex){
            rowColumns.push(header[index])
        }
        //第一行，为标题列
        returnData.push({rowData: rowColumns})
        //接下来添加第2行，第2行时列的类型
        // const columnsType = googleSheetView.type
        // const columnsTypeArr = ['rowNum']
        // for (const type of columnsType){
        //     columnsTypeArr.push(type)
        // }
        // //第二行，为列类型
        // returnData.push({rowData: columnsTypeArr})
        // //接下来添加第2行，第2行时列的类型
        // const columnsInitialValue = googleSheetView.initialValue
        // const initialValueArr = ['rowNum']
        // for (const initialValue of columnsInitialValue){
        //     initialValueArr.push(initialValue)
        // }
        // //第三行，为列的默认值
        // returnData.push({rowData: initialValueArr})
        //下面组合表格数值列
        if (googleSheetView.rowData.length > 0){
            //要大于5是因为google sheet真正的数据时从第六行开始
            const rows = googleSheetView.rowData
            const rowNumData = googleSheetView.rowNumData
            //rows和rowNumData的length是一致的
            let rowNumIndex = 0;
            for (const row of rows){
                //首先要判断当前行的数据是否满足三个开关，三个开关分别为：filter、userFilter、editFilter
                const flag = await matchThreeFilterByViewData(view, role, googleAccount, row)
                if (flag){
                    const rowData = []
                    //第一先添加行号
                    rowData.push(rowNumData[rowNumIndex])
                    for (let i = 0;i < index; i++){
                        rowData.push(row[i])
                    }
                    for (const index of columnsIndex){
                        rowData.push(row[index])
                    }
                    const data = {
                        // rowNum: rowNumData[rowNumIndex],
                        rowData: rowData
                    }
                    returnData.push(data)
                    rowNumIndex++
                }
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
 * 判断当前行的数据是否满足developer配置的三个开关
 * @param view
 * @param role
 * @param googleAccount
 * @param row
 * @returns {Promise<boolean>}
 */
matchThreeFilterByViewData = async (view, role, googleAccount, row) => {
    //如果是developer，那就有权限看所有的数据
    if (role == EMUN.DEVELOPERS) {
        return true
    }else {
        //不是developer，则需要判断三个filter
        //row的第2个元素是创建人，第3个元素是filter，第4个元素是editFilter
        let filterFlag = true
        let userFilterFlag = true
        let editFilterFlag = true
        const filter = view.filter == "false" ? false : true
        const userFilter = view.userFilter == "false" ? false : true
        const editFilter = view.editFilter == "false" ? false : true
        if (filter){
            filterFlag = row[2] == "TRUE" ? true : false
        }
        if (userFilter){
            userFilterFlag = row[1] == googleAccount ? true : false
        }
        if (editFilter){
            editFilterFlag = row[3] == "TRUE" ? true : false
        }
        if (filterFlag && userFilterFlag && editFilterFlag){
            return true
        }else {
            return false
        }
    }
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
        let role = null
        //判断当前登录的用户是不是全局开发者
        const globalDevelopersFlag = await checkGlobalDevelopers(googleAccount)
        if (globalDevelopersFlag){
            role = EMUN.DEVELOPERS
        }else {
            //2，调用google sheet获取数据
            const result = await getGoogleSheetAuthorization(app.dataValues.roleMemberSheet)
            // const result = [[EMUN.DEVELOPERS, 'StudentRole', 'TARole', 'PoliceRole', 'DoctorRole' ],['ali@gamil.com','Eric@gmail.com','ta@gamil.com','po@gamil.com','doc@gmail.com'],['2@gamil.com','ali1@gamil.com','ta1@gamil.com','po1@gamil.com','doc1@gamil.com'],['3@gamil.com','ali2@gamil.com','ta2@gamil.com','po2@gamil.com','doc2@gamil.com'],['4@gamil.com','Eric1@gmail.com','ta3@gamil.com','po3@gamil.com','doc3@gamil.com']]
            //从role member sheet获取当前登录用户的角色信息
            role = await getRoleByRoleMemberSheet(result, googleAccount)
        }
        for (const item of views) {
            viewData.push(item.dataValues)
        }
        //逐个遍历view
        for (const view of viewData) {
            const flag = await matchViewByRole(view, role)
            if (flag){
                //3，查询view表MySQL数据库，查出所有的角色信息。判断第3步的role具有什么权限？？可见列有哪些？？
                const roleActionFrom = await getRoleAction(role, view)
                const urlArr = []
                urlArr.push(view.savedDataUrl)
                //4，根据view的saveDataURL字段获取google sheet的数据
                const result = await getGoogleSheetsData(urlArr)
                for (const googleSheetView of result){
                    //5，组装返回的行数据
                    const data = await assembleRowData(googleSheetView, roleActionFrom, view, role, googleAccount)
                    //组装返回列的信息
                    const columnsData = await assembleColumnsData(googleSheetView, roleActionFrom)
                    const viewReturnData = {
                        id: view.id,
                        viewName: view.viewName,
                        role: role,
                        filter: view.filter == "false" ? false : true,
                        userFilter: view.userFilter == "false" ? false : true,
                        editFilter: view.editFilter == "false" ? false : true,
                        allowedAction: roleActionFrom.allowedActionsArr,
                        editableColumns: roleActionFrom.editColumnsArr,
                        reference: data.referenceData,
                        viewData: data.returnData,
                        editableColumnsType: columnsData.editableColumnsType,
                        editableColumnsInitialValue: columnsData.editableColumnsInitialValue,
                        urlType: columnsData.urlType
                    }
                    returnData.push(viewReturnData)
                }
            }
        }
        //6，展示数据
        res.json(sendResultResponse(returnData, 200, process.env[EMUN.SYSTEM_SUCCESS]))
    }else {
        res.json(sendResultResponse(null, 200, process.env[EMUN.SYSTEM_SUCCESS]))
    }
};

/**
 * 匹配返回当前可编辑列的类型，默认值，是否url类型值
 * @param googleSheetView
 * @param roleActionFrom
 * @returns {Promise<{urlType: [], editableColumnsType: [], editableColumnsInitialValue: []}>}
 */
assembleColumnsData = async (googleSheetView, roleActionFrom) => {
    // "editableColumnsType": ["text"],
    // "editableColumnsInitialValue": ["(Null)"],
    // "urlType": ["webUrl","appUrl"],
    // 定义返回值
    let editableColumnsType = []
    let editableColumnsInitialValue = []
    let urlType = []
    // 1，根据roleActionFrom中的列，匹配googleSheet的列信息
    const editColumnsArr = roleActionFrom.editColumnsArr
    // googleSheet header为列名
    const header = googleSheetView.headerValues
    // googleSheet type为列类型
    const columnsType = googleSheetView.type
    // googleSheet initialValue为列的默认值
    const columnsInitialValue = googleSheetView.initialValue
    // 2，返回列的类型和列的默认值，以数组的方式放回
    for (let i = 0;i < editColumnsArr.length; i++){
        for (let k = 0;k < header.length; k++){
            if (editColumnsArr[i] == header[k]){
                editableColumnsType.push(columnsType[k])
                editableColumnsInitialValue.push(columnsInitialValue[k])
                if (columnsType[k] == 'url'){
                    // 获取url类型的列
                    urlType.push(editColumnsArr[i])
                }
            }
        }
    }
    // 3，返回url类型的列，以数组的方式放回
    const data = {
        editableColumnsType: editableColumnsType,
        editableColumnsInitialValue: editableColumnsInitialValue,
        urlType: urlType
    }
    return data
}

/**
 * 判断当前登录用户有没有设置view的role，然后判断view是否对当前用户可见
 * @param view
 * @param role
 * @returns {Promise<boolean>}
 */
matchViewByRole = async (view, role) => {
    //判断当前登录人的角色，是否能看到当前的View
    //判断是管理员还是其他普通的角色
    if (role == EMUN.DEVELOPERS) {
        //如果是developer，那肯定可以看得到
        return true
    }else {
        //如果不是developer，则就要判断当前账户的在Role member sheet中是什么角色，然后再看当前View有没有给当前的Role设置Column的权限
        //如果有设置了Column的权限，那代表可以看得到当前的view，根据role、viewName和viewType能查出唯一的一条数据，同一个view的role不应该重复
        const viewData = await View.findOne({where: {roles: role,appId: view.appId,viewName: view.viewName,viewType: EMUN.DETAIL}})
        if (viewData != null && viewData != undefined){
            return true
        }else {
            return false
        }
    }
}

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
            for (const googleSheetView of result){
                //5，组装返回的行数据
                const columnData = await assembleColumnData(googleSheetView)
                let columnsList = {}
                const nameList = []
                let type = ''
                let columnsItem = {}
                //拼装成前端所需要的结构，其中Type拼装的是reference属性，如果是reference属性的话，则会['reference','XXXX']的格式返回
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
    const roles = await View.findAll({where: {viewName: view.viewName,appId: view.appId,viewType: EMUN.DETAIL}})
    //2,根据viewName，查出当前View的table数据，目的是为了取出当前View所有的列
    const viewTable = await View.findOne({where: {viewName: view.viewName,appId: view.appId,viewType: EMUN.TABLE}})
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
                    columns: role.columns != null && role.columns != '' ? role.columns.split(',') : [],
                    allowedActions: role.allowedActions != null && role.allowedActions != '' ? role.allowedActions.split(',') : [],
                    editColumns: role.editColumns != null && role.editColumns != '' ? role.editColumns.split(',') : [],
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
    for (let i = 2;i < nameArr.length; i++){
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
    // 设置新的表头
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
    const queryView = await View.findByPk(view.id)
    if (await checkAuthorizationMethod(queryView.dataValues.roleMemberSheet, queryView.dataValues.googleAccount)){
        const app = await getAppEntityByPk(view)
        if (app != null){
            //2，根据APP的saveDataURL来创建出一个新的sheet
            const result = await addViewSheet(app.savedDataUrl, view.viewName)
            //添加日志记录
            addLog(EMUN.GOOGLE_SHEET, EMUN.VIEW, 'editOrAddViewColumn', updateData.toString(), req.user.googleAccount)
            //3，展示数据
            res.json(sendResultResponse(true, 200, process.env[EMUN.SYSTEM_SUCCESS]))
        }else {
            res.json(sendResultResponse(false, 200, process.env[EMUN.SYSTEM_SUCCESS]))
        }
    }else {
        res.json(sendResultResponse('No Permission', 500, process.env[EMUN.SYSTEM_FAIL]))
    }
};

/**
 * google sheet新增行数据
 * @param req
 * @param res
 * @returns google sheet data
 */
exports.addRecordToGoogleSheet = async (req, res) => {
    //1,根据viewId查出view的信息，取出savedDataUrl
    const view = req.body;
    const queryView = await View.findByPk(view.id)
    const app = await getAppEntityByPk(queryView.dataValues)
    if (await checkAuthorizationMethod(app.dataValues.roleMemberSheet, app.dataValues.googleAccount)){
        if (view != null){
            //2，根据view的saveDataURL字段去新增google sheet的数据
            await addSheetData(queryView.dataValues.savedDataUrl, JSON.parse(JSON.stringify(view.rowData)), req.user.googleAccount)
            //3，展示数据
            res.json(sendResultResponse(true, 200, process.env[EMUN.SYSTEM_SUCCESS]))
        }else {
            res.json(sendResultResponse(false, 500, process.env[EMUN.SYSTEM_FAIL]))
        }
        //添加日志记录
        addLog(EMUN.GOOGLE_SHEET, EMUN.VIEW, 'addRecordToGoogleSheet', view.id + '=>' + view.rowData, req.user.googleAccount)
    }else {
        res.json(sendResultResponse('No Permission', 500, process.env[EMUN.SYSTEM_FAIL]))
    }
};

/**
 * google sheet修改行数据
 * @param req
 * @param res
 * @returns google sheet data
 */
exports.editRecordToGoogleSheet = async (req, res) => {
    //1,根据viewId查出view的信息，取出savedDataUrl
    const view = req.body;
    const queryView = await View.findByPk(view.id)
    const app = await getAppEntityByPk(queryView.dataValues)
    if (await checkAuthorizationMethod(app.dataValues.roleMemberSheet, app.dataValues.googleAccount)){
        if (view != null){
            //2，根据view的saveDataURL字段更新google sheet的数据
            await editSheetDataByRowNum(queryView.dataValues.savedDataUrl, view.rowNum, view.rowData)
            //3，展示数据
            res.json(sendResultResponse(true, 200, process.env[EMUN.SYSTEM_SUCCESS]))
        }else {
            res.json(sendResultResponse(false, 500, process.env[EMUN.SYSTEM_FAIL]))
        }
        //添加日志记录
        addLog(EMUN.GOOGLE_SHEET, EMUN.VIEW, 'editRecordToGoogleSheet', view.id + '=>' + view.rowNum + '=>' + view.rowData, req.user.googleAccount)
    }else {
        res.json(sendResultResponse('No Permission', 500, process.env[EMUN.SYSTEM_FAIL]))
    }

};

/**
 * google sheet删除行数据
 * @param req
 * @param res
 * @returns google sheet data
 */
exports.deleteRecordToGoogleSheet = async (req, res) => {
    //1,根据viewId查出view的信息，取出savedDataUrl
    const view = req.body;
    const queryView = await View.findByPk(view.id)
    const app = await getAppEntityByPk(queryView.dataValues)
    if (await checkAuthorizationMethod(app.dataValues.roleMemberSheet, app.dataValues.googleAccount)){
        if (view != null){
            //2，根据view的saveDataURL字段删除google sheet的数据
            await deleteSheetData(queryView.dataValues.savedDataUrl, view.rowNum)
            //3，展示数据
            res.json(sendResultResponse(true, 200, process.env[EMUN.SYSTEM_SUCCESS]))
        }else {
            res.json(sendResultResponse(false, 500, process.env[EMUN.SYSTEM_FAIL]))
        }
        //添加日志记录
        addLog(EMUN.GOOGLE_SHEET, EMUN.VIEW, 'deleteRecordToGoogleSheet', view.id + '=>' + view.rowNum, req.user.googleAccount)
    }else {
        res.json(sendResultResponse('No Permission', 500, process.env[EMUN.SYSTEM_FAIL]))
    }
};

/**
 * 判读当前登录的谷歌账户是否是全局开发者
 * @param req
 * @param res
 * @returns true/false
 */
checkGlobalDevelopers = async (googleAccount) => {
    //判读是否是全局开发者
    const globalDevelopers = await getGoogleSheetAuthorization(EMUN.GLOBAL_DEVELOPERS_URL)
    if (globalDevelopers.toString().indexOf(googleAccount) != -1){
        return true
    }else {
        return false
    }
}

/**
 * 根据主键update三个filter的值
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.editFilter = async (req, res) => {
    const view = req.body;
    const newView = {
        filter: view.filter == false ? "false" : "true",
        userFilter: view.userFilter == false ? "false" : "true",
        editFilter: view.editFilter == false ? "false" : "true"
    }
    //根据主键Id进行更新，确保更新数据的唯一性
    await View.update(newView, {where: {id: view.id}}).then(data => {
        res.json(sendResultResponse(data.length, 200, process.env[EMUN.SYSTEM_SUCCESS]))
    }).catch(err => {
        //添加日志记录
        addLog(EMUN.ERROR, EMUN.VIEW, 'editView', err, req.user.googleAccount)
        res.json(sendResultResponse(err, 500, process.env[EMUN.SYSTEM_FAIL]))
    });
}

// /**
//  * 根据appId查询所有的view数据
//  * @param appId
//  * @returns {Promise<returnData|null>}
//  */
// exports.getViewByAppId = async (appId) => {
//     //根据appId查询所有的view
//     const viewData = await View.findAll({where: {appId: appId,viewType: EMUN.TABLE}})
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




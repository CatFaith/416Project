// googleSheet.js
const { GoogleSpreadsheet } = require('google-spreadsheet');
const EMUN = require("../utils/emun")

/**
 * @param  {String} url 是google sheet的url
 */
async function getGoogleSheetAuthorization(url) {
    //roleMemberSheet样例：https://docs.google.com/spreadsheets/d/1wadtiEG_BWMmbH9rl4DaVc0_RelTgzYuK20QKIXgQdo/edit#gid=385025179
    const result = [];
    const sheet = await getSheet(url); // 返回sheet
    const rows = await sheet.getRows(); // 获取所有行
    //列名称
    const headerValues = rows[0]._sheet.headerValues;
    result.push(headerValues)
    for (row of rows) {
        result.push(row._rawData);
    }
    return result;
};

/**
 * 获取sheet页
 * @param url
 * @returns {Promise<*>}
 */
async function getSheet(url) {
    const arr = url.split('d/')[1];
    const sheetId = arr.split('gid=')[1];
    const doc = await getGoogleSheetDoc(url)
    const sheet = doc.sheetsById[sheetId];
    return sheet;
};

/**
 * 获取sheet页的名称
 * @param url
 * @returns {Promise<*>}
 */
async function getSheetTitle(url) {
    const sheet = await getSheet(url)
    let title = null
    if (sheet != null && sheet != undefined){
        title = sheet._rawProperties.title
    }
    return title;
};

/**
 * urlArr是一个google sheet url的地址，逐一遍历获取数据回来
 * @param urlArr
 * @returns {Promise<*>}
 */
async function getGoogleSheetsData(urlArr) {
    //roleMemberSheet样例：https://docs.google.com/spreadsheets/d/1wadtiEG_BWMmbH9rl4DaVc0_RelTgzYuK20QKIXgQdo/edit#gid=385025179
    const result = [];
    for (const url of urlArr){
        console.log('url',url)
        const sheet = await getSheet(url);
        // console.log('sheet',sheet)
        //sheet页名称
        const title = sheet._rawProperties.title;
        //列名称
        // const headerValues = sheet.headerValues;
        //初始值
        let initialValue = []
        //label
        let label = []
        //Ref
        let reference = []
        //类型
        let type = []
        const rows = await sheet.getRows();
        //列名称
        const headerValues = rows[0]._sheet.headerValues;
        const rowData = []
        const rowNumData = []
        let i = 0;
        //第一行为name，第二行为initialValue，第三行为label，第四行为reference,第五行是类型。数据时从第六行开始
        for (const row of rows) {
            if (i == 0){
                initialValue = row._rawData
            }
            if (i == 1){
                label = row._rawData
            }
            if (i == 2){
                reference = row._rawData
            }
            if (i == 3){
                type = row._rawData
            }
            //i > 3,代表的是至少是第六行
            if (i > 3){
                rowNumData.push(row._rowNumber)
                rowData.push(row._rawData)
            }
            i++
        }
        const data = {
            title: title,
            headerValues: headerValues,
            initialValue: initialValue,
            label: label,
            reference: reference,
            type: type,
            rowNumData: rowNumData,
            rowData: rowData
        }
        result.push(data)
    }
    return result; //数组，好几个data
};

/**
 * 获取整个google sheet信息
 * @param url
 * @returns doc
 */
async function getGoogleSheetDoc(url) {
    //例：最终目的返回"1wadtiEG_BWMmbH9rl4DaVc0_RelTgzYuK20QKIXgQdo"和"385025179"
    //roleMemberSheet样例：https://docs.google.com/spreadsheets/d/1wadtiEG_BWMmbH9rl4DaVc0_RelTgzYuK20QKIXgQdo/edit#gid=385025179
    //先把d/前和后分为数组的两个元素
    const arr = url.split('d/')[1];
    const docId = arr.split('/')[0];
    const credentialsPath = '../static/sheet2app.json' // 密钥
    const doc = new GoogleSpreadsheet(docId);
    const creds = require(credentialsPath);
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();
    return doc;
};

/**
 * 获取当前app所有的sheet的id
 * @param url
 * @returns sheetIds
 */
async function getGoogleSheetIds(url) {
    //roleMemberSheet样例：https://docs.google.com/spreadsheets/d/1wadtiEG_BWMmbH9rl4DaVc0_RelTgzYuK20QKIXgQdo/edit#gid=385025179
    const doc = await getGoogleSheetDoc(url)
    const rawSheets = doc._rawSheets
    const sheetIds = []
    for(const key in rawSheets){
        sheetIds.push(key)
    }
    return sheetIds;
};

/**
 * url为APP的saveDatURL，创建view，在googlesheet创建多一个sheet页
 * @param url
 * @param headerValues: { headerValues: ['name', 'email'] }
 * @returns {Promise<*>}
 */
async function addViewSheet(url, sheetName) {
    //roleMemberSheet样例：https://docs.google.com/spreadsheets/d/1wadtiEG_BWMmbH9rl4DaVc0_RelTgzYuK20QKIXgQdo/edit#gid=385025179
    const doc = await getGoogleSheetDoc(url) //官方返回doc
    const sheet = await doc.addSheet({title: sheetName});
    //新的Sheet页面添加好了以后，就添加每个Sheet都固定有的4列
    await sheet.setHeaderRow(EMUN.NEW_SHEET_COLUMN)
    // add rows
    await sheet.addRows(EMUN.NEW_SHEET_INIT);
    await sheet.addRows(EMUN.NEW_SHEET_LABEL);
    await sheet.addRows(EMUN.NEW_SHEET_REF);
    await sheet.addRows(EMUN.NEW_SHEET_TYPE);
    return sheet;
};

/**
 * 根据google Sheet的地址删除对应的表格
 * @param url
 * @returns {Promise<*>}
 */
async function deleteViewSheet(url) {
    //roleMemberSheet样例：https://docs.google.com/spreadsheets/d/1wadtiEG_BWMmbH9rl4DaVc0_RelTgzYuK20QKIXgQdo/edit#gid=385025179
    const sheet = await getSheet(url);
    const res = await sheet.delete();
    return res;
};

/**
 * 修改数据，
 * @param url  url为APP的saveDatURL，创建view，在googlesheet创建多一个sheet页
 * @param data : [
 { name: 'Sergey Brin', email: 'sergey@google.com' },
 { name: 'Eric Schmidt', email: 'eric@google.com' },
 ]
 * @returns {Promise<*>}
 */
async function addSheetData(url, data, googleAccount) {
    //roleMemberSheet样例：https://docs.google.com/spreadsheets/d/1wadtiEG_BWMmbH9rl4DaVc0_RelTgzYuK20QKIXgQdo/edit#gid=385025179
    const sheet = await getSheet(url);
    // get rows
    const rows = await sheet.getRows();
    //列名称
    const headerValues = rows[0]._sheet.headerValues;
    let newId = null
    if (rows.length > 4){
        //代表已有行数据,取末尾行的Id，再加1就是新数据的Id
        const rowData = rows[rows.length - 1]._rawData
        newId = parseInt(rowData[0]) + 1
    }else {
        //代表还未有行数据
        newId = 1
    }
    // 添加数据
    let newRow = {
        id: newId,
        createBy: googleAccount
    }
    let map = new Map()
    for (let i = 2;i < headerValues.length;i++){
        let matchColumn = null
        for (const item in data) {
            if (headerValues[i] == item){
                matchColumn = item
            }
        }
        // 如果匹配列matchColumn不为空，那代表的是当前列有更新
        if (matchColumn != null){
            map.set(headerValues[i], data[matchColumn])
        }else {
            if (headerValues[i] == 'filter'){
                map.set(headerValues[i], 'TRUE')
            }else if (headerValues[i] == 'editable'){
                map.set(headerValues[i], 'TRUE')
            }else {
                map.set(headerValues[i], '(Null)')
            }
        }
    }
    const inputRowData = Array.from(map).reduce((obj, [key, value]) =>
            Object.assign(obj, { [key]: value} )
        , {})
    newRow = {...newRow,...inputRowData}
    let addRowData = []
    addRowData.push(newRow)
    // append rows
    await sheet.addRows(addRowData);
    return rows;
};

/**
 * 编辑row及保存
 * @param url
 * @param rowNum  修改的行号
 * @param data    修改后整行data的数据
 * @returns {Promise<*>}
 */
async function editSheetData(url, rowNum, data) {
    //roleMemberSheet样例：https://docs.google.com/spreadsheets/d/1wadtiEG_BWMmbH9rl4DaVc0_RelTgzYuK20QKIXgQdo/edit#gid=385025179
    const sheet = await getSheet(url);
    //先更新标题行
    await sheet.setHeaderRow(data[0])
    // get rows
    const rows = await sheet.getRows();
    let rowOne = rows[0]._rawData
    if (rowOne.length != data[0].length){
        //长度不相等，代表新增了列，赋予新列默认值
        rowOne.push('(Null)')
        await rows[0].save();
    }
    // edit rows
    for (const num of rowNum){
        rows[num]._rawData = data[num]
        // save updates
        await rows[num].save()
    }
    // 接下来是更新当前sheet页真实的数据，因为新加了一列，需要给新加的列赋予默认值：(Null)
    if (rows.length > 4){
        for (let i = 4; i < rows.length ;i++){
            let rowData = rows[i]._rawData
            rowData.push('(Null)')
            rows[i]._rawData = rowData
            // save updates
            await rows[i].save()
        }
    }
    return rows;
};


/**
 * 编辑row及保存
 * @param url
 * @param rowNum  修改的行号
 * @param data    修改后整行data的数据，格式为：{ "TEST2222": "Eric666", "test333": "1888" }
 * @returns {Promise<*>}
 */
async function editSheetDataByRowNum(url, rowNum, data) {
    //roleMemberSheet样例：https://docs.google.com/spreadsheets/d/1wadtiEG_BWMmbH9rl4DaVc0_RelTgzYuK20QKIXgQdo/edit#gid=385025179
    const sheet = await getSheet(url);
    // get rows
    const rows = await sheet.getRows();
    // 减2才是真实的行数据
    const updateRow = rows[rowNum - 2]._rawData
    //列名称
    const headerValues = rows[0]._sheet.headerValues;
    let rowData = []
    for (let i = 0;i < 2;i++){
        //前4列固定的值不会被修改
        rowData.push(updateRow[i])
    }
    // 匹配列头中需要更新的列
    for (let i = 2;i < headerValues.length;i++){
        let matchColumn = null
        for (const item in data) {
            if (headerValues[i] == item){
                matchColumn = item
            }
        }
        // 如果匹配列matchColumn不为空，那代表的是当前列有更新
        if (matchColumn != null){
            rowData.push(data[matchColumn])
        }else {
            rowData.push(updateRow[i])
        }
    }
    rows[rowNum - 2]._rawData = rowData
    // save updates
    await rows[rowNum - 2].save();
    return rows;
};



/**
 *
 * @param url
 * @param rowNum 的行号
 * @returns {Promise<*>}
 */
async function deleteSheetData(url, rowNum) {
    //roleMemberSheet样例：https://docs.google.com/spreadsheets/d/1wadtiEG_BWMmbH9rl4DaVc0_RelTgzYuK20QKIXgQdo/edit#gid=385025179
    const sheet = await getSheet(url);
    // get rows
    const rows = await sheet.getRows();
    // save updates
    await rows[rowNum - 2].delete();
    return rows;
};


module.exports = {
    getGoogleSheetsData,
    getGoogleSheetAuthorization,
    getGoogleSheetDoc,
    getGoogleSheetIds,
    addViewSheet,
    deleteViewSheet,
    addSheetData,
    editSheetData,
    deleteSheetData,
    editSheetDataByRowNum,
    getSheet,
    getSheetTitle
};

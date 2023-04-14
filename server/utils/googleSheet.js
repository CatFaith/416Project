// googleSheet.js
const { GoogleSpreadsheet } = require('google-spreadsheet');

/**
 * @param  {String} url 是google sheet的url
 */
async function getGoogleSheetAuthorization(url) {
    //roleMemberSheet样例：https://docs.google.com/spreadsheets/d/1wadtiEG_BWMmbH9rl4DaVc0_RelTgzYuK20QKIXgQdo/edit#gid=385025179
    const result = [];
    const sheet = getSheet(url);
    const rows = await sheet.getRows();
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
    const sheetId = arr.split('=')[1];
    const doc = getGoogleSheetDoc(url)
    const sheet = doc.sheetsById[sheetId];
    return sheet;
};

/**
 * urlArr是一个google sheet url的地址，逐一遍历获取数据回来
 * @param urlArr
 * @returns {Promise<*>}
 */
async function getGoogleSheetsData(urlArr) {
    //roleMemberSheet样例：https://docs.google.com/spreadsheets/d/1wadtiEG_BWMmbH9rl4DaVc0_RelTgzYuK20QKIXgQdo/edit#gid=385025179
    for (const url of urlArr){
        const result = [];
        const sheet = getSheet(url);
        //sheet页名称
        const title = sheet._rawProperties.title;
        //列名称
        const headerValues = sheet.headerValues;
        //初始值
        let initialValue = []
        //label
        let label = []
        //Ref
        let reference = []
        //类型
        let type = []
        const rows = await sheet.getRows();
        const rowData = []
        let i = 0;
        //第一行为name，第二行为initialValue，第三行为label，第四行为reference,第五行是类型。数据时从第六行开始
        for (row of rows) {
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
            rowData: rowData
        }
        result.push(data)
    }
    return result;
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
    const credentialsPath = '../static/sheet2app.json'
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
    const doc = getGoogleSheetDoc(url)
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
async function addGoogleSheetSheet(url, headerValues) {
    //roleMemberSheet样例：https://docs.google.com/spreadsheets/d/1wadtiEG_BWMmbH9rl4DaVc0_RelTgzYuK20QKIXgQdo/edit#gid=385025179
    const doc = getGoogleSheetDoc(url)
    const sheet = await doc.addSheet(headerValues);
    return sheet;
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
async function addSheetData(url, data) {
    //roleMemberSheet样例：https://docs.google.com/spreadsheets/d/1wadtiEG_BWMmbH9rl4DaVc0_RelTgzYuK20QKIXgQdo/edit#gid=385025179
    const sheet = getSheet(url);
    // append rows
    const rows = await sheet.addRows(data);
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
    const sheet = getSheet(url);
    // get rows
    const rows = await sheet.getRows();
    // edit rows
    rows[rowNum] = data;
    // save updates
    await rows[rowNum].save();
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
    const sheet = getSheet(url);
    // get rows
    const rows = await sheet.getRows();
    // save updates
    await rows[rowNum].delete();
    return rows;
};



module.exports = {
    getGoogleSheetsData,
    getGoogleSheetAuthorization,
    getGoogleSheetDoc,
    getGoogleSheetIds,
    addGoogleSheetSheet,
    addSheetData,
    editSheetData,
    deleteSheetData
};


// 全局常量定义

module.exports = Object.freeze(
    {
        // Log日志类型常量
        GOOGLE_SHEET: 'googleSheet',
        ERROR: 'error',
        // Log日志模块常量
        APP: 'app',
        VIEW: 'view',
        USER: 'user',
        LOGIN: 'login',
        // 系统参数
        SYSTEM_SUCCESS: 'SYSTEM_SUCCESS',
        SYSTEM_FAIL: 'SYSTEM_FAIL',
        TOKEN_ERROR_MSG: 'TOKEN_ERROR_MSG',
        PARMAS_HIATUS: 'PARMAS_HIATUS',
        // 管理员角色
        DEVELOPERS: 'developers',
        // ViewType值
        TABLE: 'table',
        DETAIL: 'detail',
        //新增Sheet页后默认列赋值
        NEW_SHEET_COLUMN: ['id', 'createBy', 'filter', 'editable'],
        NEW_SHEET_INIT: [ { id: '(Null)', createBy: '(Null)', filter: '(Null)', editable: '(Null)' } ],
        NEW_SHEET_LABEL: [ { id: 'FALSE', createBy: 'FALSE', filter: 'FALSE', editable: 'FALSE' } ],
        NEW_SHEET_REF: [ { id: 'FALSE', createBy: 'FALSE', filter: 'FALSE', editable: 'FALSE' } ],
        NEW_SHEET_TYPE: [ { id: 'text', createBy: 'text', filter: 'boolean', editable: 'boolean' } ],
        //global developers
        GLOBAL_DEVELOPERS_URL: "https://docs.google.com/spreadsheets/d/18LrH2XWM7-yriRJAveSSId1sOIQ_fS8JnFlSbq5GOlw/edit#gid=0"
    }
);

module.exports = {
    extends: [
        'alloy',
        'alloy/typescript',
    ],
    env: {
        // 您的环境变量（包含多个预定义的全局变量）
        // Your environments (which contains several predefined global variables)
        //
        // browser: true,
        // node: true,
        // mocha: true,
        // jest: true,
        // jquery: true
    },
    globals: {
        'unsafeWindow': false,
        'GM_addStyle': false,
        'GM_deleteValue': false,
        'GM_listValues': false,
        'GM_addValueChangeListener': false,
        'GM_removeValueChangeListener': false,
        'GM_setValue': false,
        'GM_getValue': false,
        'GM_log': false,
        'GM_getResourceText': false,
        'GM_getResourceURL': false,
        'GM_registerMenuCommand': false,
        'GM_unregisterMenuCommand': false,
        'GM_openInTab': false,
        'GM_xmlhttpRequest': false,
        'GM_download': false,
        'GM_getTab': false,
        'GM_saveTab': false,
        'GM_getTabs': false,
        'GM_notification': false,
        'GM_setClipboard': false,
        'GM_info': false,
        'CryptoJS': false,
        'JSZip': false,
        'saveAs': false
        // 您的全局变量（设置为 false 表示它不允许被重新赋值）
        // Your global variables (setting to false means it's not allowed to be reassigned)
        //
        // myGlobal: false
    },
    rules: {
        // 自定义您的规则
        // Customize your rules
    }
};

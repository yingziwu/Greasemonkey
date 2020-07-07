declare let unsafeWindow: Document;
declare let GM_addStyle: (css: string) => any;
declare let GM_deleteValue: (name: string) => any;
declare let GM_listValues: () => any;
declare let GM_addValueChangeListener: (
  name: string,
  callback: Function
) => any;
declare let GM_removeValueChangeListener: (listener_id: number) => any;
declare let GM_setValue: (name: string, value: string) => any;
declare let GM_getValue: (name: string, defaultValue: string) => string;
declare let GM_log: (message: any) => any;
declare let GM_getResourceText: (name: string) => any;
declare let GM_getResourceURL: (name: string) => string;
declare let GM_registerMenuCommand: (
  name: string,
  fn: Function,
  accessKey?: string
) => number;
declare let GM_unregisterMenuCommand: (menuCmdId: number) => any;
declare let GM_openInTab: (url: string, options?: Object) => any;
declare let GM_xmlhttpRequest: (details: Object) => any;
declare let GM_download: (details: Object) => any;
declare let GM_getTab: (callback: Function) => any;
declare let GM_saveTab: (tab: Object) => any;
declare let GM_getTabs: (callback: Function) => any;
declare let GM_notification: (details: Object, ondone?: Function) => any;
declare let GM_setClipboard: (data: string, info?: Object) => any;
declare let GM_info: Object;
declare let CryptoJS: any;
declare let JSZip: any;
declare let saveAs: any;

// ==UserScript==
// @name        小说下载器
// @namespace   https://blog.bgme.me
// @match       http://www.yruan.com/article/*.html
// @match       https://www.jingcaiyuedu.com/novel/*/list.html
// @match       http://www.shuquge.com/txt/*/index.html
// @match       http://www.dingdiann.com/ddk*/
// @match       https://www.dingdiann.com/ddk*/
// @match       http://www.biquwo.org/bqw*/
// @match       http://www.xkzw.org/xkzw*/
// @match       https://www.fpzw.com/xiaoshuo/*/*/
// @match       https://www.hetushu.com/book/*/index.html
// @match       http://www.shouda8.com/*/
// @match       https://www.shouda8.com/*/
// @match       https://book.qidian.com/info/*
// @match       https://www.ciweimao.com/chapter-list/*
// @match       http://www.jjwxc.net/onebook.php?novelid=*
// @exclude     http://www.jjwxc.net/onebook.php?novelid=*&chapterid=*
// @match       http://book.sfacg.com/Novel/*/MainIndex/
// @match       http://www.gebiqu.com/biquge_*/
// @match       https://www.meegoq.com/book*.html
// @exclude     https://www.meegoq.com/book/*.html
// @match       http://book.zongheng.com/showchapter/*.html
// @match       http://huayu.zongheng.com/showchapter/*.html
// @match       https://www.17k.com/list/*.html
// @grant       unsafeWindow
// @grant       GM_info
// @grant       GM_xmlhttpRequest
// @connect     img.shouda8.com
// @connect     read.qidian.com
// @connect     kuangxiangit.com
// @connect     sinaimg.cn
// @connect     jjwxc.net
// @connect     image.gebiqu.com
// @connect     qidian.qpic.cn
// @connect     static.zongheng.com
// @connect     book.zongheng.com
// @connect     cdn.static.17k.com
// @require     https://cdn.jsdelivr.net/npm/file-saver@2.0.2/dist/FileSaver.min.js
// @require     https://cdn.jsdelivr.net/npm/jszip@3.2.1/dist/jszip.min.js
// @require     https://cdn.jsdelivr.net/npm/crypto-js@4.0.0/crypto-js.min.js
// @run-at      document-end
// @version     2.0.2.7
// @author      bgme
// @description 一个可扩展的通用型小说下载器。目前支持起点、晋江、SF轻小说、刺猬猫等小说网站的免费章节，以及亿软小说、精彩小说网、书趣阁、顶点小说、2k小说阅读网、和图书、笔趣窝、星空文学、手打吧等转载网站。详细支持网站列表请打开说明页面。
// @supportURL  https://github.com/yingziwu/Greasemonkey/issues
// @icon        https://greasyfork.org/assets/blacklogo96-1221dbbb8f0d47a728f968c35c2e2e03c64276a585b8dceb7a79a17a3f350e8a.png
// @license     AGPL-3.0-or-later
// ==/UserScript==
/*  本下载器可添加抓取规则以支持更多网站

    抓取规则示例：
    ["www.yruan.com", {
        bookname() { return document.querySelector('#info > h1:nth-child(1)').innerText.trim() },
        author() { return document.querySelector('#info > p:nth-child(2)').innerText.replace(/作\s+者:/, '').trim() },
        intro() { return convertDomNode(document.querySelector('#intro > p'))[0] },
        linkList() { return document.querySelectorAll('div.box_con div#list dl dd a') },
        coverUrl() { return document.querySelector('#fmimg > img').src; },
        chapterName: function(doc) { return doc.querySelector('.bookname > h1:nth-child(1)').innerText.trim() },
        content: function(doc) { return doc.querySelector('#content') },
    }],

    抓取规则的 `key` 为该抓取规则适用的网站域名，即 `document.location.host`。

    抓取规则的 `value` 一对象，该对象由7个函数组成：

    函数名          功能                返回值
    bookname()	抓取小说题名            String
    author()	抓取小说作者	        String
    intro()	    抓取小说简介	        String
    linkList()	抓取小说分章链接列表     NodeList
    coverUrl()	抓取小说封面图片地址     String

    以上5个函数在小说目录页（即按下按钮时的页面）运行。

    函数名                  功能                返回值
    chapterName(doc)    抓取小说章节名          String
    content(doc)        抓取小说章节主体部分     Element

    以上2个函数在小说章节页运行，输入值 `doc` 为小说章节页的 `document` 。

    变量名	                功能	                    备注
    charset	            网站响应的编码方式	             可选
    CORS	            抓取章节时是否跨域	             可选
    maxRetryTimes       最大重试次数（默认为3）           可选
    maxConcurrency      下载文本时最大并发数（默认为10）   可选
    maxImgConcurrency   下载图片时最大并发数（默认为5）    可选

    若网站返回的响应非 UTF-8 编码，请添加 charset 变量注明编码方式。网站当前编码方式可通过 document.charset 查看。
    对于起点这样抓取章节页需要跨域的网站，请将 CORS 设为 true 。

    根据上述要求添加好相应网站抓取规则，并在 `// @match` 中添加相应网站，即可在新网站上使用本下载器。

    调试功能：
    将 `enableDebug` 变量改为 `true` 可开启调试功能，开启之后可在控制台（console）中访问如下对象：

    对象名	                    类型	  功能
    rule                        变量    当前抓取规则
    main(rule)                  函数    运行下载器
    convertDomNode(node)        函数    输出处理后的txt文本及Dom节点
    ruleTest(rule[, callback])  函数    测试抓取规则
    gfetch(url,option)          函数	使用 GM_xmlhttpRequest 进行请求

    url                 the destination URL
    gfetch 可用 option 选项：
    method              one of GET, HEAD, POST
    headers             ie. user-agent, referer, ... (some special headers are not supported by Safari and Android browsers)
    data                some string to send via a POST request
    cookie              a cookie to be patched into the sent cookie set
    binary              send the data string in binary mode
    nocache             don't cache the resource
    revalidate          revalidate maybe cached content
    timeout             a timeout in ms
    context             a property which will be added to the response object
    responseType        one of arraybuffer, blob, json
    overrideMimeType    a MIME type for the request
    anonymous           don't send cookies with the requests (please see the fetch notes)
    username            a username for authentication
    password            a password

    gfetch 返回值：
    finalUrl            the final URL after all redirects from where the data was loaded
    readyState          the ready state
    status              the request status
    statusText          the request status text
    responseHeaders     the request response headers
    response            the response data as object if details.responseType was set
    responseXML         the response data as XML document
    responseText        the response data as plain string
*/
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 80);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return crossPage; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return gfetch; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return includeLatestChapter; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return rm; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "e", function() { return sleep; });
/* eslint-disable no-eval */

/* eslint-disable no-param-reassign */
function rm(selector) {
  let All = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  let doc = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : document;

  if (All) {
    let rs = doc.querySelectorAll(selector);
    rs.forEach(e => e.remove());
  } else {
    let r = doc.querySelector(selector);

    if (r) {
      r.remove();
    }
  }
}

function gfetch(url) {
  let {
    method = "GET",
    headers,
    data,
    cookie,
    binary,
    nocache,
    revalidate,
    timeout,
    context,
    responseType,
    overrideMimeType,
    anonymous,
    username,
    password
  } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      url: url,
      method: method,
      headers: headers,
      data: data,
      cookie: cookie,
      binary: binary,
      nocache: nocache,
      revalidate: revalidate,
      timeout: timeout,
      context: context,
      responseType: responseType,
      overrideMimeType: overrideMimeType,
      anonymous: anonymous,
      username: username,
      password: password,
      onload: obj => {
        resolve(obj);
      },
      onerror: err => {
        reject(err);
      }
    });
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function includeLatestChapter(selector) {
  let dl = document.querySelector(selector);
  let rDt = dl.querySelector("dt:nth-child(1)");

  if (rDt.innerText.includes("最新章节")) {
    let p = null;
    let n = rDt;

    while (true) {
      if (n.nodeName === "DD") {
        p = n;
        n = n.nextSibling;
        p.classList.add("not_download");
      } else if (n.nodeName === "DT" && !n.innerText.includes("最新章节")) {
        break;
      } else {
        p = n;
        n = n.nextSibling;
      }
    }
  }

  return dl.querySelectorAll("dd:not(.not_download) > a");
}

async function crossPage(url, functionString) {
  let charset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
  let text;

  if (charset === undefined) {
    text = await fetch(url).then(response => response.text());
  } else {
    text = await fetch(url).then(response => response.arrayBuffer()).then(buffer => {
      let decoder = new TextDecoder(charset);
      let text = decoder.decode(buffer);
      return text;
    });
  }

  const doc = new DOMParser().parseFromString(text, "text/html");
  return eval(functionString);
}



/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return downloading; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "m", function() { return setDownloadingTrue; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "i", function() { return nowWorking; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "j", function() { return nowWorkingInc; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return convertDomNode; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "k", function() { return pageWorker; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "l", function() { return save; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "n", function() { return updateProgress; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return getMetadate; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return genPageTaskQueue; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "e", function() { return imgDownLoop; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "h", function() { return imgWorkerResolved; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "g", function() { return imgWorkerRejected; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "f", function() { return imgTaskQueueSet; });
/* harmony import */ var core_js_modules_es6_regexp_split__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(49);
/* harmony import */ var core_js_modules_es6_regexp_split__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_regexp_split__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var core_js_modules_es6_regexp_replace__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(51);
/* harmony import */ var core_js_modules_es6_regexp_replace__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_regexp_replace__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var core_js_modules_es7_symbol_async_iterator__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(43);
/* harmony import */ var core_js_modules_es7_symbol_async_iterator__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es7_symbol_async_iterator__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var core_js_modules_es6_symbol__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(46);
/* harmony import */ var core_js_modules_es6_symbol__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_symbol__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var core_js_modules_es6_regexp_to_string__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(50);
/* harmony import */ var core_js_modules_es6_regexp_to_string__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_regexp_to_string__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var core_js_modules_es6_array_sort__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(78);
/* harmony import */ var core_js_modules_es6_array_sort__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_array_sort__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var core_js_modules_web_dom_iterable__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(15);
/* harmony import */ var core_js_modules_web_dom_iterable__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_iterable__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _lib__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(0);
/* harmony import */ var _setting__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(2);








/* eslint-disable no-return-assign */

/* eslint-disable max-params */

/* eslint-disable no-param-reassign */


let nowWorking = 0;

const nowWorkingInc = () => nowWorking++;

let downloading = false;

const setDownloadingTrue = () => downloading = true;

let corsDomains = new Set();
let imgNowWorking = 0;
let imgTaskQueue = [];
let imgTaskQueueSet = new Set();
let imgWorkerResolved = new Map();
let imgWorkerRejected = new Map();

function save(pageWorkerResolved, pageWorkerRejected, bookname, author, infoText, cover, pageNum) {
  console.log("保存文件中……");
  let sortKeys = [];

  for (let key of pageWorkerResolved.keys()) {
    sortKeys.push(key);
  }

  sortKeys.sort(compareNumeric);
  let savedTxt = infoText;
  let savedZip = new JSZip();

  for (let key of sortKeys) {
    let v = pageWorkerResolved.get(key);
    savedTxt = savedTxt + "\n\n\n\n" + "## ".concat(v.chapterName) + "\n" + "=".repeat(30) + "\n\n" + v.txt.trim();
    const htmlFileName = "Chapter" + "0".repeat(pageNum.toString().length - key.toString().length) + key.toString() + ".html";
    const htmlFile = genHtml(v.chapterName, v.dom);
    savedZip.file(htmlFileName, htmlFile);
  }

  const saveBaseFileName = "[".concat(author, "]").concat(bookname);
  saveAs(new Blob([savedTxt], {
    type: "text/plain;charset=utf-8"
  }), saveBaseFileName + ".txt");

  if (pageWorkerRejected.size) {
    let failedTxt = "";

    for (let entry of pageWorkerRejected.entries()) {
      let id;
      let url;
      [id, url] = entry;
      failedTxt = failedTxt + "\n".concat(id, "\t").concat(url);
    }

    savedZip.file("failed.txt", new Blob([failedTxt], {
      type: "text/plain;charset=utf-8"
    }));
  }

  savedZip.file("info.txt", new Blob([infoText], {
    type: "text/plain;charset=utf-8"
  }));
  savedZip.file("cover.".concat(cover.type), cover.file);

  for (let entry of imgWorkerResolved) {
    let filename;
    let imgObj;
    [filename, imgObj] = entry;
    savedZip.file(filename, imgObj.file);
  }

  savedZip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: {
      level: 6
    }
  }, metadata => updateProgress(1, 1, 1, 1, metadata.percent)).then(blob => {
    saveAs(blob, saveBaseFileName + ".zip");
    document.querySelector("#progress").remove();
  }).catch(err => console.log("saveZip: " + err));
  downloading = false;
  document.querySelector("#novel-downloader > img").src = _setting__WEBPACK_IMPORTED_MODULE_8__[/* icon0 */ "d"];
  console.log("下载完毕！");

  function compareNumeric(a, b) {
    if (a > b) return 1;
    if (a === b) return 0;
    if (a < b) return -1;
  }
}

function updateProgress(finishNum, pageNum, finishImgNum, imgNum) {
  let zipPercent = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;

  if (!document.querySelector("#progress")) {
    let progress = document.createElement("div");
    progress.id = "progress";
    progress.innerHTML = "\n        <div id='page-progress' title=\"\u9875\u9762\"></div>\n        <div id='img-progress' title=\"\u56FE\u7247\"></div>\n        <div id='zip-progress' title=\"ZIP\"></div>\n        ";
    let progressStyle = document.createElement("style");
    progressStyle.innerHTML = "\n        #progress {\n            position: fixed;\n            bottom: 8%;\n            right: 3%;\n            z-index: 99;\n            border-style: none;\n            text-align: center;\n            vertical-align: baseline;\n            background-color: rgba(210, 210, 210, 0.2);\n            padding: 6px;\n            border-radius: 12px;\n        }\n        #page-progress{\n            --color:green;\n            --position:0%;\n            width:200px;\n            height:10px;\n            border-radius:30px;\n            background-color:#ccc;\n            background-image:radial-gradient(closest-side circle at var(--position),var(--color),var(--color) 100%,transparent),linear-gradient(var(--color),var(--color));\n            background-image:-webkit-radial-gradient(var(--position),circle closest-side,var(--color),var(--color) 100%,transparent),-webkit-linear-gradient(var(--color),var(--color));\n            background-size:100% ,var(--position);\n            background-repeat: no-repeat;\n        }\n        #img-progress{\n            --color:purple;\n            --position:0%;\n            width:200px;\n            height:10px;\n            border-radius:30px;\n            background-color:#ccc;\n            background-image:radial-gradient(closest-side circle at var(--position),var(--color),var(--color) 100%,transparent),linear-gradient(var(--color),var(--color));\n            background-image:-webkit-radial-gradient(var(--position),circle closest-side,var(--color),var(--color) 100%,transparent),-webkit-linear-gradient(var(--color),var(--color));\n            background-size:100% ,var(--position);\n            background-repeat: no-repeat;\n            margin-top: 5px;\n        }\n        #zip-progress{\n            --color:yellow;\n            --position:0%;\n            width:200px;\n            height:10px;\n            border-radius:30px;\n            background-color:#ccc;\n            background-image:radial-gradient(closest-side circle at var(--position),var(--color),var(--color) 100%,transparent),linear-gradient(var(--color),var(--color));\n            background-image:-webkit-radial-gradient(var(--position),circle closest-side,var(--color),var(--color) 100%,transparent),-webkit-linear-gradient(var(--color),var(--color));\n            background-size:100% ,var(--position);\n            background-repeat: no-repeat;\n            margin-top: 5px;\n        }\n        ";
    document.head.appendChild(progressStyle);
    document.body.appendChild(progress);
  }

  let pagePercent = "".concat(Math.trunc(finishNum / pageNum * 100), "%");
  document.querySelector("#page-progress").style.cssText = "--position:".concat(pagePercent, ";");

  if (imgNum !== 0) {
    let imgPercent = "".concat(Math.trunc(finishImgNum / imgNum * 100), "%");
    document.querySelector("#img-progress").style.cssText = "--position:".concat(imgPercent, ";");
  } else {
    document.querySelector("#img-progress").style.cssText = "display:none;";
  }

  if (zipPercent) {
    document.querySelector("#zip-progress").style.cssText = "--position:".concat(zipPercent, "%;");
  } else {
    document.querySelector("#zip-progress").style.cssText = "display:none;";
  }
}

function genHtml(chapterName, dom) {
  let htmlFile = new DOMParser().parseFromString("<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"><title>".concat(chapterName, "</title></head><body><h2>").concat(chapterName, "</h2></body></html>"), "text/html");
  htmlFile.querySelector("body").appendChild(dom);
  return new Blob([htmlFile.documentElement.outerHTML], {
    type: "text/html; charset=UTF-8"
  });
}

async function getMetadate(rule) {
  let bookname;
  let author;
  let intro;
  let linkList;
  let coverUrl;
  let cover;
  let sourceUrl;
  let infoText;

  if (rule.bookname[Symbol.toStringTag] === "AsyncFunction") {
    await rule.bookname().then(result => bookname = result);
  } else {
    bookname = rule.bookname();
  }

  if (rule.author[Symbol.toStringTag] === "AsyncFunction") {
    await rule.author().then(result => author = result);
  } else {
    author = rule.author();
  }

  if (rule.intro[Symbol.toStringTag] === "AsyncFunction") {
    await rule.intro().then(result => intro = result);
  } else {
    intro = rule.intro();
  }

  if (rule.linkList[Symbol.toStringTag] === "AsyncFunction") {
    await rule.linkList().then(result => linkList = result);
  } else {
    linkList = rule.linkList();
  }

  if (rule.coverUrl[Symbol.toStringTag] === "AsyncFunction") {
    await rule.coverUrl().then(result => coverUrl = result);
  } else {
    coverUrl = rule.coverUrl();
  }

  cover = await imgWorker({
    url: coverUrl,
    filename: "cover",
    retry: 0
  }).catch(error => {
    console.error(error);
    let file = new Blob(["下载封面失败"], {
      type: "text/plain;charset=utf-8"
    });
    return {
      type: "txt",
      file: file,
      url: coverUrl
    };
  });
  intro = intro.replace(/\n{2,}/g, "\n");
  sourceUrl = document.location.href;
  infoText = "\u9898\u540D\uFF1A".concat(bookname, "\n\u4F5C\u8005\uFF1A").concat(author, "\n\u7B80\u4ECB\uFF1A").concat(intro, "\n\u6765\u6E90\uFF1A").concat(document.location.href);
  return [bookname, author, intro, linkList, cover, sourceUrl, infoText];
}

function genPageTaskQueue(linkList) {
  let pageTaskQueue = [];

  for (let i = 0; i < linkList.length; i++) {
    let pageTask = {
      id: i,
      url: linkList[i].href,
      retry: 0,
      dom: linkList[i]
    };
    pageTaskQueue.push(pageTask);
  }

  return pageTaskQueue;
}

function pageWorker(pageTask, pageWorkerResolved, pageWorkerRejected, pageTaskQueue, rule) {
  const id = pageTask.id;
  const url = pageTask.url;
  const host = new URL(url).host;
  let retry = pageTask.retry;
  let dom = pageTask.dom;
  let text;

  if (_setting__WEBPACK_IMPORTED_MODULE_8__[/* charset */ "b"] === undefined) {
    if (_setting__WEBPACK_IMPORTED_MODULE_8__[/* CORS */ "a"]) {
      text = Object(_lib__WEBPACK_IMPORTED_MODULE_7__[/* gfetch */ "b"])(url).then(response => {
        if (response.status >= 200 && response.status <= 299) {
          return response.responseText;
        } else {
          throw new Error("Bad response!");
        }
      }, error => {
        nowWorking--;
        errorCallback(error);
      }).catch(error => {
        nowWorking--;
        errorCallback(error);
      });
    } else {
      text = fetch(url).then(response => {
        if (response.ok) {
          return response.text();
        } else {
          throw new Error("Bad response!");
        }
      }, error => {
        nowWorking--;
        errorCallback(error);
      }).catch(error => {
        nowWorking--;
        errorCallback(error);
      });
    }
  } else {
    if (_setting__WEBPACK_IMPORTED_MODULE_8__[/* CORS */ "a"]) {
      text = Object(_lib__WEBPACK_IMPORTED_MODULE_7__[/* gfetch */ "b"])(url, {
        responseType: "arraybuffer"
      }).then(response => {
        if (response.status >= 200 && response.status <= 299) {
          return response.response;
        } else {
          throw new Error("Bad response!");
        }
      }, error => {
        nowWorking--;
        errorCallback(error);
      }).then(buffer => {
        let decoder = new TextDecoder(_setting__WEBPACK_IMPORTED_MODULE_8__[/* charset */ "b"]);
        let text = decoder.decode(buffer);
        return text;
      }).catch(error => {
        nowWorking--;
        errorCallback(error);
      });
    } else {
      text = fetch(url).then(response => {
        if (response.ok) {
          return response.arrayBuffer();
        } else {
          throw new Error("Bad response!");
        }
      }, error => {
        nowWorking--;
        errorCallback(error);
      }).then(buffer => {
        let decoder = new TextDecoder(_setting__WEBPACK_IMPORTED_MODULE_8__[/* charset */ "b"]);
        let text = decoder.decode(buffer);
        return text;
      }).catch(error => {
        nowWorking--;
        errorCallback(error);
      });
    }
  }

  text.then(text => {
    if (text) {
      nowWorking--;
      extractData(id, url, text, rule, pageWorkerResolved);
    }
  }).catch(error => errorCallback(error));

  function errorCallback(error) {
    console.error(id, url, pageTask, error);
    retry++;

    if (retry > _setting__WEBPACK_IMPORTED_MODULE_8__[/* maxRetryTimes */ "h"]) {
      pageWorkerRejected.set(id, url);
    } else {
      pageTaskQueue.unshift({
        id: id,
        url: url,
        retry: retry,
        dom: dom
      });
    }
  }
}

async function extractData(id, url, text, rule, pageWorkerResolved) {
  let doc = new DOMParser().parseFromString(text, "text/html");
  let base;

  if (doc.querySelector("base")) {
    base = doc.querySelector("base");
  } else {
    base = document.createElement("base");
    doc.head.appendChild(base);
  }

  base.href = url;
  let chapterName;
  let content;

  if (rule.chapterName[Symbol.toStringTag] === "AsyncFunction") {
    await rule.chapterName(doc).then(result => chapterName = result);
  } else {
    chapterName = rule.chapterName(doc);
  }

  if (rule.content[Symbol.toStringTag] === "AsyncFunction") {
    await rule.content(doc).then(result => content = result);
  } else {
    content = rule.content(doc);
  }

  Object(_lib__WEBPACK_IMPORTED_MODULE_7__[/* rm */ "d"])('[style*="display:none"]', true, content);
  Object(_lib__WEBPACK_IMPORTED_MODULE_7__[/* rm */ "d"])('[style*="display: none"]', true, content);
  let txtOut;
  let htmlOut;
  [txtOut, htmlOut] = convertDomNode(content);
  pageWorkerResolved.set(id, {
    id: id,
    url: url,
    chapterName: chapterName,
    content: content,
    txt: txtOut,
    dom: htmlOut
  });
}

function imgDownLoop() {
  for (let i = imgNowWorking; i < _setting__WEBPACK_IMPORTED_MODULE_8__[/* maxImgConcurrency */ "g"]; i++) {
    const imgTask = imgTaskQueue.pop();

    if (!imgTask) {
      return;
    }

    const filename = imgTask.filename;
    imgWorker(imgTask).then(imgObj => imgWorkerResolved.set(filename, imgObj), errorObj => {
      let error;
      let newImgTask;
      [error, newImgTask] = errorObj;
      console.error(error);
      const newRetry = newImgTask.retry;

      if (newRetry > _setting__WEBPACK_IMPORTED_MODULE_8__[/* maxImgConcurrency */ "g"]) {
        imgWorkerRejected.set(filename, error);
      } else {
        imgTaskQueue.push(newImgTask);
      }
    });
  }
}

function imgWorker(imgTask) {
  const url = imgTask.url;
  const filename = imgTask.filename;
  let retry = imgTask.retry;
  const host = new URL(url).host;
  console.log("\u6B63\u5728\u4E0B\u8F7D\u56FE\u7247:".concat(filename, "\t").concat(url));
  return new Promise((resolve, reject) => {
    if (corsDomains.has(host)) {
      imgNowWorking++;
      Object(_lib__WEBPACK_IMPORTED_MODULE_7__[/* gfetch */ "b"])(url, {
        responseType: "blob"
      }).then(response => {
        if (imgNowWorking > 0) {
          imgNowWorking--;
        }

        const _headers = response.responseHeaders.split("\r\n");

        let headers = {};

        for (let _header of _headers) {
          let k;
          let v;
          [k, v] = _header.split(/:\s+/);
          headers[k] = v;
        }

        const imgObject = {
          type: headers["content-type"].split("/")[1],
          file: response.response,
          url: response.finalUrl
        };
        resolve(imgObject);
      }).catch(error => {
        if (imgNowWorking > 0) {
          imgNowWorking--;
        }

        retry++;
        const newImgTask = {
          url: url,
          filename: filename,
          retry: retry
        };
        reject([error, newImgTask]);
      });
    } else {
      imgNowWorking++;
      fetch(url).then(response => {
        if (imgNowWorking > 0) {
          imgNowWorking--;
        }

        const imgObject = {
          type: response.headers.get("Content-Type").split("/")[1],
          file: response.blob(),
          url: response.url
        };
        resolve(imgObject);
      }, error => {
        if (imgNowWorking > 0) {
          imgNowWorking--;
        }

        retry++;
        imgNowWorking++;
        Object(_lib__WEBPACK_IMPORTED_MODULE_7__[/* gfetch */ "b"])(url, {
          responseType: "blob"
        }).then(response => {
          if (imgNowWorking > 0) {
            imgNowWorking--;
          }

          const _headers = response.responseHeaders.split("\r\n");

          let headers = {};

          for (let _header of _headers) {
            let k;
            let v;
            [k, v] = _header.split(/:\s+/);
            headers[k] = v;
          }

          const imgObject = {
            type: headers["content-type"].split("/")[1],
            file: response.response,
            url: response.finalUrl
          };
          corsDomains.add(host);
          console.log("\u5C06 ".concat(host, " \u52A0\u5165\u8DE8\u57DF\u8BF7\u6C42\u5217\u8868"));
          resolve(imgObject);
        });
      }).catch(error => {
        if (imgNowWorking > 0) {
          imgNowWorking--;
        }

        retry++;
        const newImgTask = {
          url: url,
          filename: filename,
          retry: retry
        };
        reject([error, newImgTask]);
      });
    }
  });
}

function convertDomNode(node) {
  let txtOut = "";
  let htmlOut = document.createElement("div");
  let brc = 0;
  [txtOut, htmlOut, brc] = walker(null, node.childNodes[0], node, brc, txtOut, htmlOut);
  txtOut = txtOut.trim();
  return [txtOut, htmlOut];
} // eslint-disable-next-line complexity


function walker(p, n, r, brc, txtOut, htmlOut) {
  let pNodeName;
  let nNodeName;

  if (p) {
    pNodeName = p.nodeName;
  } else {
    pNodeName = null;
  }

  if (n) {
    nNodeName = n.nodeName;
  } else {
    nNodeName = null;
  }

  const nodeType2 = ["DIV", "P", "OL", "H1", "H1", "H2", "H3", "H4", "H5", "H6"];
  const nodeType3 = ["SCRIPT", "STYLE", "#comment"];
  let lastNode;

  if (htmlOut.childElementCount !== 0) {
    lastNode = htmlOut.childNodes[htmlOut.childElementCount - 1];
  } else {
    lastNode = document.createElement("p");
  }

  if (nodeType3.includes(nNodeName)) {// pass
  } else if (nNodeName === "BR") {
    if (nodeType2.includes(r.nodeName) && r.childElementCount === r.querySelectorAll("br").length) {
      for (let i = 0; i < r.querySelectorAll("br").length; i++) {
        if (r.childNodes[i].nodeName === "BR") {
          r.childNodes[i].classList.add("remove");
        } else {
          brc++;
          break;
        }
      }
    } else {
      brc++;
    }
  } else if (nNodeName === "HR") {
    txtOut = txtOut + "\n\n" + "-".repeat(15);
    let hr = document.createElement("hr");
    htmlOut.appendChild(hr);
  } else if (nNodeName === "IMG") {
    const url = n.src;

    if (url) {
      const filename = url.split("/").splice(-1)[0];
      let alt;

      if (n.alt) {
        alt = n.alt;
      }

      let imgTask = {
        url: url,
        filename: filename,
        retry: 0
      };

      if (url.startsWith("http") && !imgTaskQueueSet.has(url)) {
        imgTaskQueueSet.add(url);
        imgTaskQueue.push(imgTask);
      }

      txtOut = txtOut + "\n\n" + "[Image filename:".concat(filename, " url:").concat(url, "]");
      let img = document.createElement("img");
      img.src = filename;

      if (alt) {
        img.alt = alt;
      }

      if (r.nodeName !== "A") {
        htmlOut.appendChild(img);
      } else {
        lastNode.appendChild(img);
      }

      if (nodeType2.includes(r.nodeName)) {
        brc = 0;
      }
    }
  } else if (nNodeName === "A") {
    if (n.childElementCount === 0) {
      txtOut = txtOut + "[link ".concat(n.innerText, " href: ").concat(n.href, "]");
      let newLink = document.createElement("a");
      newLink.href = n.href;
      newLink.innerText = n.innerText.trim();
      lastNode.appendChild(newLink);
    } else {
      [txtOut, htmlOut, brc] = walker(null, n.childNodes[0], n, brc, txtOut, htmlOut);
    }
  } else if (nNodeName === "#text") {
    const nodetext = n.textContent.trim().replace(/(\s+)?\n+(\s+)?/g, "").replace(/\s+/, " ");
    let specialBr = r.querySelectorAll("br").length !== 0 && r.querySelectorAll("br").length === r.querySelectorAll("br.remove").length;

    if (nodetext) {
      if (brc === 0 || specialBr) {
        if ((nodeType2.includes(pNodeName) || specialBr) && r.nodeName !== "A") {
          txtOut = txtOut + "\n".repeat(2) + nodetext;
          let p0 = document.createElement("p");
          p0.innerText = nodetext;
          htmlOut.appendChild(p0);
        } else {
          txtOut = txtOut + nodetext;
          lastNode.innerText = lastNode.innerText + nodetext;
        }
      } else if (brc === 1 || brc === 2) {
        txtOut = txtOut + "\n".repeat(brc) + nodetext;
        let p0 = document.createElement("p");
        p0.innerText = nodetext;
        htmlOut.appendChild(p0);
      } else {
        txtOut = txtOut + "\n".repeat(3) + nodetext;
        let p1 = document.createElement("p");
        let p2 = p1.cloneNode();
        let br = document.createElement("br");
        p1.appendChild(br);
        p2.innerText = nodetext;
        htmlOut.appendChild(p1);
        htmlOut.appendChild(p2);
      }

      brc = 0;
    }
  } else if (nodeType2.includes(nNodeName)) {
    if (n.childElementCount === 0) {
      const nodetext = n.innerText.trim();

      if (nodetext) {
        if (brc >= 3) {
          txtOut = txtOut + "\n".repeat(3) + nodetext;
          let p1 = document.createElement("p");
          let p2 = p1.cloneNode();
          let br = document.createElement("br");
          p1.appendChild(br);
          p2.innerText = nodetext;
          htmlOut.appendChild(p1);
          htmlOut.appendChild(p2);
        } else {
          txtOut = txtOut + "\n".repeat(2) + nodetext;
          let p0 = document.createElement("p");
          p0.innerText = nodetext;
          htmlOut.appendChild(p0);
        }
      }
    } else {
      [txtOut, htmlOut, brc] = walker(null, n.childNodes[0], n, brc + 2, txtOut, htmlOut);
    }
  } else if (n.childElementCount === 0) {
    const nodetext = n.innerText.trim();

    if (nodetext) {
      txtOut = txtOut + nodetext;
      lastNode.innerText = lastNode.innerText + nodetext;
    }
  } else if (n.childElementCount !== 0) {
    [txtOut, htmlOut, brc] = walker(null, n.childNodes[0], n, brc, txtOut, htmlOut);
  }

  p = n;
  n = n.nextSibling;

  if (n === null) {
    return [txtOut, htmlOut, brc];
  } else {
    return walker(p, n, r, brc, txtOut, htmlOut);
  }
}



/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return enableDebug; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "i", function() { return rule; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return charset; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return CORS; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "h", function() { return maxRetryTimes; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "f", function() { return maxConcurrency; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "g", function() { return maxImgConcurrency; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return icon0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "e", function() { return icon1; });
/* harmony import */ var _rules__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(52);

const enableDebug = false;
const defaultMaxRetryTimes = 3;
const defaultMaxConcurrency = 10;
const defaultMaxImgConcurrency = 5;
const host = document.location.host;
const rule = _rules__WEBPACK_IMPORTED_MODULE_0__[/* rules */ "a"].get(host);
const charset = rule.charset;
const CORS = rule.CORS;
const customMaxRetryTimes = rule.maxRetryTimes;
const customMaxConcurrency = rule.maxConcurrency;
const customMaxImgConcurrency = rule.maxImgConcurrency;
let maxRetryTimes;
let maxConcurrency;
let maxImgConcurrency;

if (customMaxRetryTimes) {
  maxRetryTimes = customMaxRetryTimes;
} else {
  maxRetryTimes = defaultMaxRetryTimes;
}

if (customMaxConcurrency) {
  maxConcurrency = customMaxConcurrency;
} else {
  maxConcurrency = defaultMaxConcurrency;
}

if (customMaxImgConcurrency) {
  maxImgConcurrency = customMaxImgConcurrency;
} else {
  maxImgConcurrency = defaultMaxImgConcurrency;
}

const icon0 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAFSQAABUkBt3pUAAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAbTSURBVHic7Z1ZqFZVFMd/V69zaY4lIagNoqXVbU4boEkbtCSDSMKSxEJfywahxyIrfMmMoIEyQhBMshIq8yGnBoqKZkyTMknKofR6r7eH3YVPu373nL33d/aw1g/2g9xvn7XO3n/3sM4emvBLD2AmMAu4GDgZ6OvZhi86gF3Ab8DPwHpgHfB1QJ+SpgX4AlOwKadtwCJgiNfSyZwbgQOErzyf6QCwFBjosZyyZCKwj/AV1qi0HZjqrbQyZAPhK6mKtBQzxlFqmEz4iqkyrSGzLsFV0TO8eJEONwEbgdNCO+ILVwFM8OJFWkwAtgDXhHbEB64CGO7Fi/QYArwNLAjtSGg+Jny/HDo9D/R2LchQ6KjWnXuB9zFRz+RQAfyfxUBbyTyTgU3AJP/uxE2OXcBAYArwq0Xe/ZhvIWLIVQAAp2KmfGXzHwEeR0jrmrMAAPoAyy2fsxIYYFOoKZG7ADq5C/jb4lmfA6PLFGhqbCV8hVUhADCfu7dZPG83cFXB8kwOSQIAGAa8Z/HMQ8A9hUo0MaQJAKAZM8izefZyoFd3hZoSEgXQyR3YLYJZBwwuaCN6JAsA4BzgRwsb35PJhzTpAgDzYehdCzt7geklbUWHCsDQE3gMEwQqY6sNeNDCXjSoAI5mOvCnhc0VQD8Hu8HYQvgKi0kAAOMwewvK2t0IjHS0XTkqgK45EVhlYXsncKEH+5WhAjg+TZj+vb2k/X8woeckUAF0zw3AnpI+JPNFUQVQjNOx2zb3FjCoAf54QwVQnBOANyz8+QYzsIwSFUB55gGtJX36A7i6wX5ZsZnwFZaaAMDsKdhd0q9WYH4FvpVCBWDPaOATC/8ersi/QqgA3OgHvGzh4+wKfaxLjgI4yWsJFWMh5cYF+4hkqdkmwleY73SG1xIqzuWUW4q+OoybR5OjAG7xWkLlKLsU/RJXg66RpiZXByIkZP+6E9MSPFHw9wsb6EshcmwB2oFpPgvJkrnAQer7ehDz4SkYOQqgA7MHYB7hd/1eBOygvq9OW9Fcm/BNmPMAc+V3zDtuxywADcEIYA7Hr6sngQdsH95sm1EII4h/3d54l8yug8AOx/yKO0NdMussIH2cxinRLzhQGosKQDg6BhCOtgDCUQEIR1Ic4BfgW4p1W6MxCzmzx1UAKYwB9gB3Au+UzNcCvA6c6d2jiJDQBSygfOUDfIqJs7f6dScucg8EtWK2aNnyFeYgrGzJfRq4C3M+jwvbPPgRLRK6AKUOKgDhqACEowIQjgpAOCoA4agAhJN7HEDpBm0BhKMCEI4KQDgqAOGoAISjAhCOCkA4GgcQjrYAwlEBCEcFIBwVgHBUAMJRAQhHp4HC0RZAOCoA4agAhJPS7uAjwFrMFu+2gnn+8mB3DeawxiI0AWOBm4E+HmxHzwaqO71zVkXv5IPLgMNUUy5Om1dT6QJ2ACtDO1GCjzAnjEZPKgLoj7mgOSWqvHnEmlQEMBRzeHMqTAMmhXaiCqocA+wnjeNaBmMOl66qXESMAQAGAK8BvUI70g3PAaNCO1GUlAQAcAGRXZt2DHOA20M7USVVdgGd6TAe7sppAGMwcYeqy0NMF9BJM6YrCHpVyjH0AF4kkZF/LSkKAEy0bUloJ2pYBFwZ2okQfEj1TV5tiuE2j/MwJ5GFKgNxXUAtLwCnBLTfF3iF8JdLWZO6AIZj+t5QB1YuAc4OZNsLqQsAYCphooTXAvcHsOuVHAQA8DQwrkJ7wzC3fsd+VG635CKA/lQbJXwWGFmRrYaSiwAAzgcercDO3aS1NqGhhJ4GdhUlvLSB7xsq2hftNLDDMb9vmoFXaUyUMNloXz1y6gI6GYsZFPrmIYRG++qxnvBN4PHSbR7fs4Ww0b5ou4CYWYafKGHy0b565CyAYcBLuM/VnwLOcvYmUnIWAMD1wHyH/NcB93nyJUpyFwCYeL1NlNBXCxI1uU0Du6I/sILyUcJson31kNACgBnFLy7x+7lotK8QHxB+GlQ0tQNXFHinMcDeCPzVaaBnemD69HqRvM7fxLTesKFIEgCY/93P1Pn7IxRrJZT/SKkLqE1d9e8tmKtmQ/uWVBfQ4Zg/FMuAiTX/HoXZfRz7riPvuB4QkSpDga2YW8UPYTZziun3a5EqADAneMwI7URopA0ClWNQAQhHBSAcFYBwpE4Dc6LokXldoi1A+uxyyewqAB8HMSpufOmS2VUAPznmV9x50yWzqwDWOuZX3FgPbA7pQBMmpBr6g4jEdIBIziIcT3zbpXJPB4GZRSqnKs4FfiB8wUhI3wFTilVL9/hc8dobmA3cijk1Y5Cn5/Yks/14JWnDTPU+A1ZhtsG3+nr4v9GhBc6CW0iCAAAAAElFTkSuQmCC";
const icon1 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAAAA3NCSVQICAjb4U/gAAAACXBIWXMAAANSAAADUgEQACRKAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAUdQTFRF////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAiYSOVQAAAGx0Uk5TAAECAwQFCAkKCwwNDhETFRkaHB0fICMkKCwwNTg5PD1AQUZKTk9QV1tcX2BjZGhtb3B2eHl6fX6AgYKHi4+QlJicnaChpamur7C3uru+v8LEyMzP0NXZ3N3f4OTn6uvt7/Hy8/T2+Pn6/P3+VI4wmgAAAyxJREFUeNrtmVdT4zAUhTFs6BB6Cb13WLpooffeQjW9hMT//3mVJbsT4li6ahbD6D4y5p5vzrGuFDkry5QpznLSygAYAANgAAyAATAABsAAGAADYAAMgAEwAD8XADlChTQTIM0eIM0pIM3vAdL8JiLNawFpXo1I8zxAmicS0jwTkeapjDTvC8r0gQQK9UEESvUBBIr1qQTK9SkESvR/wQkQ5V95KhS+Q1AC14N34ZCYenD0LGNjoH7ij2ejQV71QPd2lNQapI8rut0d4LMe0Bz4CHMUSetZCGgPMESRYj1cAGARMIqv1kMlgK8pNQq39TARBB8VhCgyW59S414y6frjxDYeUYTCNnnKHw4WeUxl1/wtGjwk97LToyBan6irmRrPfSHj/K+ZuSJ3TImCav3zaqvlvTN57T9W6+ozJAqa9fH9/gLS3kja/wr69+PUKMhGXUxVie0mVVMXZAUSwONys4ztvHn5kQcgttubJ+tEkde7G2MEiExUyD3VVExE4AAPS40qTlaNSw8QgI+dnlxVx8ncnp0PCsD5WJnaI23Z2Lk3wP1igx83jA2L998V4G8E5WrVy0kRfIeXMLkMm1TIN8GWYXIQTVbKVa+cjLCO4r2+fFnq+X17MZ7N6GmlxRJXt1pWnjh3Q1yX09Vi8tXTl/zb8eeB5GCgkFe9cOAgTutPBcD1stbGEYXVtvYCaA4BwHU9W8smXzt7DesMBMB1NFQMVS8eOgK3hQM4zut6ezZdPbt9/ZWhKQsArpu5OrJ83dwNW0dGAFzHwyVe6iXDx8zt2AEc522jI8etntOx8cbRjAcA1+18/Vf5+vlbvk6cALhORkr/qZeOnHC34QdwnPfNTvzjLtC5+S7QRAQg8eNuYcEW6yAIIF4GQD8A9W5IZX3eFQW6tqI61KNbXf9vy4K/T/2Wd90X+hqFnfHG1K8oUq1nuqpVZD3zjal865nvjBVY74pC/qpg/nYkNQqb6+uZrChYrFcQhcBnOwlR2KIfLoUGlIj1EgaUsPVCUcixnjcKmdZzRCHdeqYo1FgPjUKl9YAolFtPjMIf672i8NP6DFH4br2pH1d/AAm28mJJn9pPAAAAAElFTkSuQmCC";


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

var store = __webpack_require__(16)('wks');
var uid = __webpack_require__(14);
var Symbol = __webpack_require__(5).Symbol;
var USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function (name) {
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(11);
module.exports = function (it) {
  if (!isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};


/***/ }),
/* 5 */
/***/ (function(module, exports) {

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef


/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

var dP = __webpack_require__(9);
var createDesc = __webpack_require__(19);
module.exports = __webpack_require__(8) ? function (object, key, value) {
  return dP.f(object, key, createDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

// Thank's IE8 for his funny defineProperty
module.exports = !__webpack_require__(6)(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

var anObject = __webpack_require__(4);
var IE8_DOM_DEFINE = __webpack_require__(39);
var toPrimitive = __webpack_require__(27);
var dP = Object.defineProperty;

exports.f = __webpack_require__(8) ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return dP(O, P, Attributes);
  } catch (e) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};


/***/ }),
/* 10 */
/***/ (function(module, exports) {

var hasOwnProperty = {}.hasOwnProperty;
module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};


/***/ }),
/* 11 */
/***/ (function(module, exports) {

module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = __webpack_require__(56);
var defined = __webpack_require__(21);
module.exports = function (it) {
  return IObject(defined(it));
};


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(5);
var hide = __webpack_require__(7);
var has = __webpack_require__(10);
var SRC = __webpack_require__(14)('src');
var $toString = __webpack_require__(58);
var TO_STRING = 'toString';
var TPL = ('' + $toString).split(TO_STRING);

__webpack_require__(17).inspectSource = function (it) {
  return $toString.call(it);
};

(module.exports = function (O, key, val, safe) {
  var isFunction = typeof val == 'function';
  if (isFunction) has(val, 'name') || hide(val, 'name', key);
  if (O[key] === val) return;
  if (isFunction) has(val, SRC) || hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
  if (O === global) {
    O[key] = val;
  } else if (!safe) {
    delete O[key];
    hide(O, key, val);
  } else if (O[key]) {
    O[key] = val;
  } else {
    hide(O, key, val);
  }
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, TO_STRING, function toString() {
  return typeof this == 'function' && this[SRC] || $toString.call(this);
});


/***/ }),
/* 14 */
/***/ (function(module, exports) {

var id = 0;
var px = Math.random();
module.exports = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

var $iterators = __webpack_require__(53);
var getKeys = __webpack_require__(23);
var redefine = __webpack_require__(13);
var global = __webpack_require__(5);
var hide = __webpack_require__(7);
var Iterators = __webpack_require__(28);
var wks = __webpack_require__(3);
var ITERATOR = wks('iterator');
var TO_STRING_TAG = wks('toStringTag');
var ArrayValues = Iterators.Array;

var DOMIterables = {
  CSSRuleList: true, // TODO: Not spec compliant, should be false.
  CSSStyleDeclaration: false,
  CSSValueList: false,
  ClientRectList: false,
  DOMRectList: false,
  DOMStringList: false,
  DOMTokenList: true,
  DataTransferItemList: false,
  FileList: false,
  HTMLAllCollection: false,
  HTMLCollection: false,
  HTMLFormElement: false,
  HTMLSelectElement: false,
  MediaList: true, // TODO: Not spec compliant, should be false.
  MimeTypeArray: false,
  NamedNodeMap: false,
  NodeList: true,
  PaintRequestList: false,
  Plugin: false,
  PluginArray: false,
  SVGLengthList: false,
  SVGNumberList: false,
  SVGPathSegList: false,
  SVGPointList: false,
  SVGStringList: false,
  SVGTransformList: false,
  SourceBufferList: false,
  StyleSheetList: true, // TODO: Not spec compliant, should be false.
  TextTrackCueList: false,
  TextTrackList: false,
  TouchList: false
};

for (var collections = getKeys(DOMIterables), i = 0; i < collections.length; i++) {
  var NAME = collections[i];
  var explicit = DOMIterables[NAME];
  var Collection = global[NAME];
  var proto = Collection && Collection.prototype;
  var key;
  if (proto) {
    if (!proto[ITERATOR]) hide(proto, ITERATOR, ArrayValues);
    if (!proto[TO_STRING_TAG]) hide(proto, TO_STRING_TAG, NAME);
    Iterators[NAME] = ArrayValues;
    if (explicit) for (key in $iterators) if (!proto[key]) redefine(proto, key, $iterators[key], true);
  }
}


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

var core = __webpack_require__(17);
var global = __webpack_require__(5);
var SHARED = '__core-js_shared__';
var store = global[SHARED] || (global[SHARED] = {});

(module.exports = function (key, value) {
  return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: core.version,
  mode: __webpack_require__(18) ? 'pure' : 'global',
  copyright: '© 2019 Denis Pushkarev (zloirock.ru)'
});


/***/ }),
/* 17 */
/***/ (function(module, exports) {

var core = module.exports = { version: '2.6.11' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef


/***/ }),
/* 18 */
/***/ (function(module, exports) {

module.exports = false;


/***/ }),
/* 19 */
/***/ (function(module, exports) {

module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};


/***/ }),
/* 20 */
/***/ (function(module, exports) {

var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};


/***/ }),
/* 21 */
/***/ (function(module, exports) {

// 7.2.1 RequireObjectCoercible(argument)
module.exports = function (it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(5);
var core = __webpack_require__(17);
var hide = __webpack_require__(7);
var redefine = __webpack_require__(13);
var ctx = __webpack_require__(59);
var PROTOTYPE = 'prototype';

var $export = function (type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var target = IS_GLOBAL ? global : IS_STATIC ? global[name] || (global[name] = {}) : (global[name] || {})[PROTOTYPE];
  var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
  var expProto = exports[PROTOTYPE] || (exports[PROTOTYPE] = {});
  var key, own, out, exp;
  if (IS_GLOBAL) source = name;
  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    // export native or passed
    out = (own ? target : source)[key];
    // bind timers to global for call from export context
    exp = IS_BIND && own ? ctx(out, global) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // extend global
    if (target) redefine(target, key, out, type & $export.U);
    // export
    if (exports[key] != out) hide(exports, key, exp);
    if (IS_PROTO && expProto[key] != out) expProto[key] = out;
  }
};
global.core = core;
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library`
module.exports = $export;


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys = __webpack_require__(42);
var enumBugKeys = __webpack_require__(31);

module.exports = Object.keys || function keys(O) {
  return $keys(O, enumBugKeys);
};


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

// 7.1.15 ToLength
var toInteger = __webpack_require__(25);
var min = Math.min;
module.exports = function (it) {
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};


/***/ }),
/* 25 */
/***/ (function(module, exports) {

// 7.1.4 ToInteger
var ceil = Math.ceil;
var floor = Math.floor;
module.exports = function (it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

// 7.1.13 ToObject(argument)
var defined = __webpack_require__(21);
module.exports = function (it) {
  return Object(defined(it));
};


/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = __webpack_require__(11);
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function (it, S) {
  if (!isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};


/***/ }),
/* 28 */
/***/ (function(module, exports) {

module.exports = {};


/***/ }),
/* 29 */
/***/ (function(module, exports) {

module.exports = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};


/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

var shared = __webpack_require__(16)('keys');
var uid = __webpack_require__(14);
module.exports = function (key) {
  return shared[key] || (shared[key] = uid(key));
};


/***/ }),
/* 31 */
/***/ (function(module, exports) {

// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');


/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

var def = __webpack_require__(9).f;
var has = __webpack_require__(10);
var TAG = __webpack_require__(3)('toStringTag');

module.exports = function (it, tag, stat) {
  if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
};


/***/ }),
/* 33 */
/***/ (function(module, exports) {

exports.f = {}.propertyIsEnumerable;


/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var at = __webpack_require__(72)(true);

 // `AdvanceStringIndex` abstract operation
// https://tc39.github.io/ecma262/#sec-advancestringindex
module.exports = function (S, index, unicode) {
  return index + (unicode ? at(S, index).length : 1);
};


/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var classof = __webpack_require__(73);
var builtinExec = RegExp.prototype.exec;

 // `RegExpExec` abstract operation
// https://tc39.github.io/ecma262/#sec-regexpexec
module.exports = function (R, S) {
  var exec = R.exec;
  if (typeof exec === 'function') {
    var result = exec.call(R, S);
    if (typeof result !== 'object') {
      throw new TypeError('RegExp exec method returned something other than an Object or null');
    }
    return result;
  }
  if (classof(R) !== 'RegExp') {
    throw new TypeError('RegExp#exec called on incompatible receiver');
  }
  return builtinExec.call(R, S);
};


/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

__webpack_require__(74);
var redefine = __webpack_require__(13);
var hide = __webpack_require__(7);
var fails = __webpack_require__(6);
var defined = __webpack_require__(21);
var wks = __webpack_require__(3);
var regexpExec = __webpack_require__(37);

var SPECIES = wks('species');

var REPLACE_SUPPORTS_NAMED_GROUPS = !fails(function () {
  // #replace needs built-in support for named groups.
  // #match works fine because it just return the exec results, even if it has
  // a "grops" property.
  var re = /./;
  re.exec = function () {
    var result = [];
    result.groups = { a: '7' };
    return result;
  };
  return ''.replace(re, '$<a>') !== '7';
});

var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = (function () {
  // Chrome 51 has a buggy "split" implementation when RegExp#exec !== nativeExec
  var re = /(?:)/;
  var originalExec = re.exec;
  re.exec = function () { return originalExec.apply(this, arguments); };
  var result = 'ab'.split(re);
  return result.length === 2 && result[0] === 'a' && result[1] === 'b';
})();

module.exports = function (KEY, length, exec) {
  var SYMBOL = wks(KEY);

  var DELEGATES_TO_SYMBOL = !fails(function () {
    // String methods call symbol-named RegEp methods
    var O = {};
    O[SYMBOL] = function () { return 7; };
    return ''[KEY](O) != 7;
  });

  var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL ? !fails(function () {
    // Symbol-named RegExp methods call .exec
    var execCalled = false;
    var re = /a/;
    re.exec = function () { execCalled = true; return null; };
    if (KEY === 'split') {
      // RegExp[@@split] doesn't call the regex's exec method, but first creates
      // a new one. We need to return the patched regex when creating the new one.
      re.constructor = {};
      re.constructor[SPECIES] = function () { return re; };
    }
    re[SYMBOL]('');
    return !execCalled;
  }) : undefined;

  if (
    !DELEGATES_TO_SYMBOL ||
    !DELEGATES_TO_EXEC ||
    (KEY === 'replace' && !REPLACE_SUPPORTS_NAMED_GROUPS) ||
    (KEY === 'split' && !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC)
  ) {
    var nativeRegExpMethod = /./[SYMBOL];
    var fns = exec(
      defined,
      SYMBOL,
      ''[KEY],
      function maybeCallNative(nativeMethod, regexp, str, arg2, forceStringMethod) {
        if (regexp.exec === regexpExec) {
          if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
            // The native String method already delegates to @@method (this
            // polyfilled function), leasing to infinite recursion.
            // We avoid it by directly calling the native @@method method.
            return { done: true, value: nativeRegExpMethod.call(regexp, str, arg2) };
          }
          return { done: true, value: nativeMethod.call(str, regexp, arg2) };
        }
        return { done: false };
      }
    );
    var strfn = fns[0];
    var rxfn = fns[1];

    redefine(String.prototype, KEY, strfn);
    hide(RegExp.prototype, SYMBOL, length == 2
      // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
      // 21.2.5.11 RegExp.prototype[@@split](string, limit)
      ? function (string, arg) { return rxfn.call(string, this, arg); }
      // 21.2.5.6 RegExp.prototype[@@match](string)
      // 21.2.5.9 RegExp.prototype[@@search](string)
      : function (string) { return rxfn.call(string, this); }
    );
  }
};


/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var regexpFlags = __webpack_require__(38);

var nativeExec = RegExp.prototype.exec;
// This always refers to the native implementation, because the
// String#replace polyfill uses ./fix-regexp-well-known-symbol-logic.js,
// which loads this file before patching the method.
var nativeReplace = String.prototype.replace;

var patchedExec = nativeExec;

var LAST_INDEX = 'lastIndex';

var UPDATES_LAST_INDEX_WRONG = (function () {
  var re1 = /a/,
      re2 = /b*/g;
  nativeExec.call(re1, 'a');
  nativeExec.call(re2, 'a');
  return re1[LAST_INDEX] !== 0 || re2[LAST_INDEX] !== 0;
})();

// nonparticipating capturing group, copied from es5-shim's String#split patch.
var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;

var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED;

if (PATCH) {
  patchedExec = function exec(str) {
    var re = this;
    var lastIndex, reCopy, match, i;

    if (NPCG_INCLUDED) {
      reCopy = new RegExp('^' + re.source + '$(?!\\s)', regexpFlags.call(re));
    }
    if (UPDATES_LAST_INDEX_WRONG) lastIndex = re[LAST_INDEX];

    match = nativeExec.call(re, str);

    if (UPDATES_LAST_INDEX_WRONG && match) {
      re[LAST_INDEX] = re.global ? match.index + match[0].length : lastIndex;
    }
    if (NPCG_INCLUDED && match && match.length > 1) {
      // Fix browsers whose `exec` methods don't consistently return `undefined`
      // for NPCG, like IE8. NOTE: This doesn' work for /(.?)?/
      // eslint-disable-next-line no-loop-func
      nativeReplace.call(match[0], reCopy, function () {
        for (i = 1; i < arguments.length - 2; i++) {
          if (arguments[i] === undefined) match[i] = undefined;
        }
      });
    }

    return match;
  };
}

module.exports = patchedExec;


/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// 21.2.5.3 get RegExp.prototype.flags
var anObject = __webpack_require__(4);
module.exports = function () {
  var that = anObject(this);
  var result = '';
  if (that.global) result += 'g';
  if (that.ignoreCase) result += 'i';
  if (that.multiline) result += 'm';
  if (that.unicode) result += 'u';
  if (that.sticky) result += 'y';
  return result;
};


/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = !__webpack_require__(8) && !__webpack_require__(6)(function () {
  return Object.defineProperty(__webpack_require__(40)('div'), 'a', { get: function () { return 7; } }).a != 7;
});


/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(11);
var document = __webpack_require__(5).document;
// typeof document.createElement is 'object' in old IE
var is = isObject(document) && isObject(document.createElement);
module.exports = function (it) {
  return is ? document.createElement(it) : {};
};


/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject = __webpack_require__(4);
var dPs = __webpack_require__(61);
var enumBugKeys = __webpack_require__(31);
var IE_PROTO = __webpack_require__(30)('IE_PROTO');
var Empty = function () { /* empty */ };
var PROTOTYPE = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = __webpack_require__(40)('iframe');
  var i = enumBugKeys.length;
  var lt = '<';
  var gt = '>';
  var iframeDocument;
  iframe.style.display = 'none';
  __webpack_require__(64).appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while (i--) delete createDict[PROTOTYPE][enumBugKeys[i]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty();
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};


/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

var has = __webpack_require__(10);
var toIObject = __webpack_require__(12);
var arrayIndexOf = __webpack_require__(62)(false);
var IE_PROTO = __webpack_require__(30)('IE_PROTO');

module.exports = function (object, names) {
  var O = toIObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) if (key != IE_PROTO) has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (has(O, key = names[i++])) {
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};


/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(44)('asyncIterator');


/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(5);
var core = __webpack_require__(17);
var LIBRARY = __webpack_require__(18);
var wksExt = __webpack_require__(45);
var defineProperty = __webpack_require__(9).f;
module.exports = function (name) {
  var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
  if (name.charAt(0) != '_' && !(name in $Symbol)) defineProperty($Symbol, name, { value: wksExt.f(name) });
};


/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

exports.f = __webpack_require__(3);


/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// ECMAScript 6 symbols shim
var global = __webpack_require__(5);
var has = __webpack_require__(10);
var DESCRIPTORS = __webpack_require__(8);
var $export = __webpack_require__(22);
var redefine = __webpack_require__(13);
var META = __webpack_require__(66).KEY;
var $fails = __webpack_require__(6);
var shared = __webpack_require__(16);
var setToStringTag = __webpack_require__(32);
var uid = __webpack_require__(14);
var wks = __webpack_require__(3);
var wksExt = __webpack_require__(45);
var wksDefine = __webpack_require__(44);
var enumKeys = __webpack_require__(67);
var isArray = __webpack_require__(68);
var anObject = __webpack_require__(4);
var isObject = __webpack_require__(11);
var toObject = __webpack_require__(26);
var toIObject = __webpack_require__(12);
var toPrimitive = __webpack_require__(27);
var createDesc = __webpack_require__(19);
var _create = __webpack_require__(41);
var gOPNExt = __webpack_require__(69);
var $GOPD = __webpack_require__(70);
var $GOPS = __webpack_require__(47);
var $DP = __webpack_require__(9);
var $keys = __webpack_require__(23);
var gOPD = $GOPD.f;
var dP = $DP.f;
var gOPN = gOPNExt.f;
var $Symbol = global.Symbol;
var $JSON = global.JSON;
var _stringify = $JSON && $JSON.stringify;
var PROTOTYPE = 'prototype';
var HIDDEN = wks('_hidden');
var TO_PRIMITIVE = wks('toPrimitive');
var isEnum = {}.propertyIsEnumerable;
var SymbolRegistry = shared('symbol-registry');
var AllSymbols = shared('symbols');
var OPSymbols = shared('op-symbols');
var ObjectProto = Object[PROTOTYPE];
var USE_NATIVE = typeof $Symbol == 'function' && !!$GOPS.f;
var QObject = global.QObject;
// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var setSymbolDesc = DESCRIPTORS && $fails(function () {
  return _create(dP({}, 'a', {
    get: function () { return dP(this, 'a', { value: 7 }).a; }
  })).a != 7;
}) ? function (it, key, D) {
  var protoDesc = gOPD(ObjectProto, key);
  if (protoDesc) delete ObjectProto[key];
  dP(it, key, D);
  if (protoDesc && it !== ObjectProto) dP(ObjectProto, key, protoDesc);
} : dP;

var wrap = function (tag) {
  var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
  sym._k = tag;
  return sym;
};

var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  return it instanceof $Symbol;
};

var $defineProperty = function defineProperty(it, key, D) {
  if (it === ObjectProto) $defineProperty(OPSymbols, key, D);
  anObject(it);
  key = toPrimitive(key, true);
  anObject(D);
  if (has(AllSymbols, key)) {
    if (!D.enumerable) {
      if (!has(it, HIDDEN)) dP(it, HIDDEN, createDesc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if (has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
      D = _create(D, { enumerable: createDesc(0, false) });
    } return setSymbolDesc(it, key, D);
  } return dP(it, key, D);
};
var $defineProperties = function defineProperties(it, P) {
  anObject(it);
  var keys = enumKeys(P = toIObject(P));
  var i = 0;
  var l = keys.length;
  var key;
  while (l > i) $defineProperty(it, key = keys[i++], P[key]);
  return it;
};
var $create = function create(it, P) {
  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
};
var $propertyIsEnumerable = function propertyIsEnumerable(key) {
  var E = isEnum.call(this, key = toPrimitive(key, true));
  if (this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return false;
  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
};
var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
  it = toIObject(it);
  key = toPrimitive(key, true);
  if (it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return;
  var D = gOPD(it, key);
  if (D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
  return D;
};
var $getOwnPropertyNames = function getOwnPropertyNames(it) {
  var names = gOPN(toIObject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META) result.push(key);
  } return result;
};
var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
  var IS_OP = it === ObjectProto;
  var names = gOPN(IS_OP ? OPSymbols : toIObject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true)) result.push(AllSymbols[key]);
  } return result;
};

// 19.4.1.1 Symbol([description])
if (!USE_NATIVE) {
  $Symbol = function Symbol() {
    if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor!');
    var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
    var $set = function (value) {
      if (this === ObjectProto) $set.call(OPSymbols, value);
      if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, createDesc(1, value));
    };
    if (DESCRIPTORS && setter) setSymbolDesc(ObjectProto, tag, { configurable: true, set: $set });
    return wrap(tag);
  };
  redefine($Symbol[PROTOTYPE], 'toString', function toString() {
    return this._k;
  });

  $GOPD.f = $getOwnPropertyDescriptor;
  $DP.f = $defineProperty;
  __webpack_require__(48).f = gOPNExt.f = $getOwnPropertyNames;
  __webpack_require__(33).f = $propertyIsEnumerable;
  $GOPS.f = $getOwnPropertySymbols;

  if (DESCRIPTORS && !__webpack_require__(18)) {
    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
  }

  wksExt.f = function (name) {
    return wrap(wks(name));
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, { Symbol: $Symbol });

for (var es6Symbols = (
  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
).split(','), j = 0; es6Symbols.length > j;)wks(es6Symbols[j++]);

for (var wellKnownSymbols = $keys(wks.store), k = 0; wellKnownSymbols.length > k;) wksDefine(wellKnownSymbols[k++]);

$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
  // 19.4.2.1 Symbol.for(key)
  'for': function (key) {
    return has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(sym) {
    if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol!');
    for (var key in SymbolRegistry) if (SymbolRegistry[key] === sym) return key;
  },
  useSetter: function () { setter = true; },
  useSimple: function () { setter = false; }
});

$export($export.S + $export.F * !USE_NATIVE, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: $create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: $defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: $defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: $getOwnPropertySymbols
});

// Chrome 38 and 39 `Object.getOwnPropertySymbols` fails on primitives
// https://bugs.chromium.org/p/v8/issues/detail?id=3443
var FAILS_ON_PRIMITIVES = $fails(function () { $GOPS.f(1); });

$export($export.S + $export.F * FAILS_ON_PRIMITIVES, 'Object', {
  getOwnPropertySymbols: function getOwnPropertySymbols(it) {
    return $GOPS.f(toObject(it));
  }
});

// 24.3.2 JSON.stringify(value [, replacer [, space]])
$JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function () {
  var S = $Symbol();
  // MS Edge converts symbol values to JSON as {}
  // WebKit converts symbol values to JSON as null
  // V8 throws on boxed symbols
  return _stringify([S]) != '[null]' || _stringify({ a: S }) != '{}' || _stringify(Object(S)) != '{}';
})), 'JSON', {
  stringify: function stringify(it) {
    var args = [it];
    var i = 1;
    var replacer, $replacer;
    while (arguments.length > i) args.push(arguments[i++]);
    $replacer = replacer = args[1];
    if (!isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
    if (!isArray(replacer)) replacer = function (key, value) {
      if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
      if (!isSymbol(value)) return value;
    };
    args[1] = replacer;
    return _stringify.apply($JSON, args);
  }
});

// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
$Symbol[PROTOTYPE][TO_PRIMITIVE] || __webpack_require__(7)($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
// 19.4.3.5 Symbol.prototype[@@toStringTag]
setToStringTag($Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setToStringTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setToStringTag(global.JSON, 'JSON', true);


/***/ }),
/* 47 */
/***/ (function(module, exports) {

exports.f = Object.getOwnPropertySymbols;


/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
var $keys = __webpack_require__(42);
var hiddenKeys = __webpack_require__(31).concat('length', 'prototype');

exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return $keys(O, hiddenKeys);
};


/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isRegExp = __webpack_require__(75);
var anObject = __webpack_require__(4);
var speciesConstructor = __webpack_require__(76);
var advanceStringIndex = __webpack_require__(34);
var toLength = __webpack_require__(24);
var callRegExpExec = __webpack_require__(35);
var regexpExec = __webpack_require__(37);
var fails = __webpack_require__(6);
var $min = Math.min;
var $push = [].push;
var $SPLIT = 'split';
var LENGTH = 'length';
var LAST_INDEX = 'lastIndex';
var MAX_UINT32 = 0xffffffff;

// babel-minify transpiles RegExp('x', 'y') -> /x/y and it causes SyntaxError
var SUPPORTS_Y = !fails(function () { RegExp(MAX_UINT32, 'y'); });

// @@split logic
__webpack_require__(36)('split', 2, function (defined, SPLIT, $split, maybeCallNative) {
  var internalSplit;
  if (
    'abbc'[$SPLIT](/(b)*/)[1] == 'c' ||
    'test'[$SPLIT](/(?:)/, -1)[LENGTH] != 4 ||
    'ab'[$SPLIT](/(?:ab)*/)[LENGTH] != 2 ||
    '.'[$SPLIT](/(.?)(.?)/)[LENGTH] != 4 ||
    '.'[$SPLIT](/()()/)[LENGTH] > 1 ||
    ''[$SPLIT](/.?/)[LENGTH]
  ) {
    // based on es5-shim implementation, need to rework it
    internalSplit = function (separator, limit) {
      var string = String(this);
      if (separator === undefined && limit === 0) return [];
      // If `separator` is not a regex, use native split
      if (!isRegExp(separator)) return $split.call(string, separator, limit);
      var output = [];
      var flags = (separator.ignoreCase ? 'i' : '') +
                  (separator.multiline ? 'm' : '') +
                  (separator.unicode ? 'u' : '') +
                  (separator.sticky ? 'y' : '');
      var lastLastIndex = 0;
      var splitLimit = limit === undefined ? MAX_UINT32 : limit >>> 0;
      // Make `global` and avoid `lastIndex` issues by working with a copy
      var separatorCopy = new RegExp(separator.source, flags + 'g');
      var match, lastIndex, lastLength;
      while (match = regexpExec.call(separatorCopy, string)) {
        lastIndex = separatorCopy[LAST_INDEX];
        if (lastIndex > lastLastIndex) {
          output.push(string.slice(lastLastIndex, match.index));
          if (match[LENGTH] > 1 && match.index < string[LENGTH]) $push.apply(output, match.slice(1));
          lastLength = match[0][LENGTH];
          lastLastIndex = lastIndex;
          if (output[LENGTH] >= splitLimit) break;
        }
        if (separatorCopy[LAST_INDEX] === match.index) separatorCopy[LAST_INDEX]++; // Avoid an infinite loop
      }
      if (lastLastIndex === string[LENGTH]) {
        if (lastLength || !separatorCopy.test('')) output.push('');
      } else output.push(string.slice(lastLastIndex));
      return output[LENGTH] > splitLimit ? output.slice(0, splitLimit) : output;
    };
  // Chakra, V8
  } else if ('0'[$SPLIT](undefined, 0)[LENGTH]) {
    internalSplit = function (separator, limit) {
      return separator === undefined && limit === 0 ? [] : $split.call(this, separator, limit);
    };
  } else {
    internalSplit = $split;
  }

  return [
    // `String.prototype.split` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.split
    function split(separator, limit) {
      var O = defined(this);
      var splitter = separator == undefined ? undefined : separator[SPLIT];
      return splitter !== undefined
        ? splitter.call(separator, O, limit)
        : internalSplit.call(String(O), separator, limit);
    },
    // `RegExp.prototype[@@split]` method
    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@split
    //
    // NOTE: This cannot be properly polyfilled in engines that don't support
    // the 'y' flag.
    function (regexp, limit) {
      var res = maybeCallNative(internalSplit, regexp, this, limit, internalSplit !== $split);
      if (res.done) return res.value;

      var rx = anObject(regexp);
      var S = String(this);
      var C = speciesConstructor(rx, RegExp);

      var unicodeMatching = rx.unicode;
      var flags = (rx.ignoreCase ? 'i' : '') +
                  (rx.multiline ? 'm' : '') +
                  (rx.unicode ? 'u' : '') +
                  (SUPPORTS_Y ? 'y' : 'g');

      // ^(? + rx + ) is needed, in combination with some S slicing, to
      // simulate the 'y' flag.
      var splitter = new C(SUPPORTS_Y ? rx : '^(?:' + rx.source + ')', flags);
      var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
      if (lim === 0) return [];
      if (S.length === 0) return callRegExpExec(splitter, S) === null ? [S] : [];
      var p = 0;
      var q = 0;
      var A = [];
      while (q < S.length) {
        splitter.lastIndex = SUPPORTS_Y ? q : 0;
        var z = callRegExpExec(splitter, SUPPORTS_Y ? S : S.slice(q));
        var e;
        if (
          z === null ||
          (e = $min(toLength(splitter.lastIndex + (SUPPORTS_Y ? 0 : q)), S.length)) === p
        ) {
          q = advanceStringIndex(S, q, unicodeMatching);
        } else {
          A.push(S.slice(p, q));
          if (A.length === lim) return A;
          for (var i = 1; i <= z.length - 1; i++) {
            A.push(z[i]);
            if (A.length === lim) return A;
          }
          q = p = e;
        }
      }
      A.push(S.slice(p));
      return A;
    }
  ];
});


/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

__webpack_require__(77);
var anObject = __webpack_require__(4);
var $flags = __webpack_require__(38);
var DESCRIPTORS = __webpack_require__(8);
var TO_STRING = 'toString';
var $toString = /./[TO_STRING];

var define = function (fn) {
  __webpack_require__(13)(RegExp.prototype, TO_STRING, fn, true);
};

// 21.2.5.14 RegExp.prototype.toString()
if (__webpack_require__(6)(function () { return $toString.call({ source: 'a', flags: 'b' }) != '/a/b'; })) {
  define(function toString() {
    var R = anObject(this);
    return '/'.concat(R.source, '/',
      'flags' in R ? R.flags : !DESCRIPTORS && R instanceof RegExp ? $flags.call(R) : undefined);
  });
// FF44- RegExp#toString has a wrong name
} else if ($toString.name != TO_STRING) {
  define(function toString() {
    return $toString.call(this);
  });
}


/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var anObject = __webpack_require__(4);
var toObject = __webpack_require__(26);
var toLength = __webpack_require__(24);
var toInteger = __webpack_require__(25);
var advanceStringIndex = __webpack_require__(34);
var regExpExec = __webpack_require__(35);
var max = Math.max;
var min = Math.min;
var floor = Math.floor;
var SUBSTITUTION_SYMBOLS = /\$([$&`']|\d\d?|<[^>]*>)/g;
var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&`']|\d\d?)/g;

var maybeToString = function (it) {
  return it === undefined ? it : String(it);
};

// @@replace logic
__webpack_require__(36)('replace', 2, function (defined, REPLACE, $replace, maybeCallNative) {
  return [
    // `String.prototype.replace` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.replace
    function replace(searchValue, replaceValue) {
      var O = defined(this);
      var fn = searchValue == undefined ? undefined : searchValue[REPLACE];
      return fn !== undefined
        ? fn.call(searchValue, O, replaceValue)
        : $replace.call(String(O), searchValue, replaceValue);
    },
    // `RegExp.prototype[@@replace]` method
    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@replace
    function (regexp, replaceValue) {
      var res = maybeCallNative($replace, regexp, this, replaceValue);
      if (res.done) return res.value;

      var rx = anObject(regexp);
      var S = String(this);
      var functionalReplace = typeof replaceValue === 'function';
      if (!functionalReplace) replaceValue = String(replaceValue);
      var global = rx.global;
      if (global) {
        var fullUnicode = rx.unicode;
        rx.lastIndex = 0;
      }
      var results = [];
      while (true) {
        var result = regExpExec(rx, S);
        if (result === null) break;
        results.push(result);
        if (!global) break;
        var matchStr = String(result[0]);
        if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
      }
      var accumulatedResult = '';
      var nextSourcePosition = 0;
      for (var i = 0; i < results.length; i++) {
        result = results[i];
        var matched = String(result[0]);
        var position = max(min(toInteger(result.index), S.length), 0);
        var captures = [];
        // NOTE: This is equivalent to
        //   captures = result.slice(1).map(maybeToString)
        // but for some reason `nativeSlice.call(result, 1, result.length)` (called in
        // the slice polyfill when slicing native arrays) "doesn't work" in safari 9 and
        // causes a crash (https://pastebin.com/N21QzeQA) when trying to debug it.
        for (var j = 1; j < result.length; j++) captures.push(maybeToString(result[j]));
        var namedCaptures = result.groups;
        if (functionalReplace) {
          var replacerArgs = [matched].concat(captures, position, S);
          if (namedCaptures !== undefined) replacerArgs.push(namedCaptures);
          var replacement = String(replaceValue.apply(undefined, replacerArgs));
        } else {
          replacement = getSubstitution(matched, S, position, captures, namedCaptures, replaceValue);
        }
        if (position >= nextSourcePosition) {
          accumulatedResult += S.slice(nextSourcePosition, position) + replacement;
          nextSourcePosition = position + matched.length;
        }
      }
      return accumulatedResult + S.slice(nextSourcePosition);
    }
  ];

    // https://tc39.github.io/ecma262/#sec-getsubstitution
  function getSubstitution(matched, str, position, captures, namedCaptures, replacement) {
    var tailPos = position + matched.length;
    var m = captures.length;
    var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;
    if (namedCaptures !== undefined) {
      namedCaptures = toObject(namedCaptures);
      symbols = SUBSTITUTION_SYMBOLS;
    }
    return $replace.call(replacement, symbols, function (match, ch) {
      var capture;
      switch (ch.charAt(0)) {
        case '$': return '$';
        case '&': return matched;
        case '`': return str.slice(0, position);
        case "'": return str.slice(tailPos);
        case '<':
          capture = namedCaptures[ch.slice(1, -1)];
          break;
        default: // \d\d?
          var n = +ch;
          if (n === 0) return match;
          if (n > m) {
            var f = floor(n / 10);
            if (f === 0) return match;
            if (f <= m) return captures[f - 1] === undefined ? ch.charAt(1) : captures[f - 1] + ch.charAt(1);
            return match;
          }
          capture = captures[n - 1];
      }
      return capture === undefined ? '' : capture;
    });
  }
});


/***/ }),
/* 52 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return rules; });
/* harmony import */ var core_js_modules_es6_regexp_match__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(71);
/* harmony import */ var core_js_modules_es6_regexp_match__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_regexp_match__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var core_js_modules_es6_regexp_split__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(49);
/* harmony import */ var core_js_modules_es6_regexp_split__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_regexp_split__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var core_js_modules_es6_regexp_to_string__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(50);
/* harmony import */ var core_js_modules_es6_regexp_to_string__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_regexp_to_string__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var core_js_modules_es6_regexp_replace__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(51);
/* harmony import */ var core_js_modules_es6_regexp_replace__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_regexp_replace__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var core_js_modules_web_dom_iterable__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(15);
/* harmony import */ var core_js_modules_web_dom_iterable__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_iterable__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _lib__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(0);
/* harmony import */ var _main__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(1);






/* eslint-disable no-eval */


let rules = new Map([["www.yruan.com", {
  bookname() {
    return document.querySelector("#info > h1:nth-child(1)").innerText.trim();
  },

  author() {
    return document.querySelector("#info > p:nth-child(2)").innerText.replace(/作\s+者:/, "").trim();
  },

  intro() {
    return Object(_main__WEBPACK_IMPORTED_MODULE_6__[/* convertDomNode */ "a"])(document.querySelector("#intro > p"))[0];
  },

  linkList() {
    return document.querySelectorAll("div.box_con div#list dl dd a");
  },

  coverUrl() {
    return document.querySelector("#fmimg > img").src;
  },

  chapterName: function chapterName(doc) {
    return doc.querySelector(".bookname > h1:nth-child(1)").innerText.trim();
  },
  content: function content(doc) {
    return doc.querySelector("#content");
  }
}], ["www.jingcaiyuedu.com", {
  bookname() {
    return document.querySelector("div.row.text-center.mb10 > h1:nth-child(1)").innerText.trim();
  },

  author() {
    return document.querySelector('div.row.text-center.mb10 a[href^="/novel/"]').innerText.trim();
  },

  intro: async () => {
    const indexUrl = document.location.href.replace(/\/list.html$/, ".html");
    return Object(_lib__WEBPACK_IMPORTED_MODULE_5__[/* crossPage */ "a"])(indexUrl, "convertDomNode(doc.querySelector('#bookIntro'))[0]");
  },

  linkList() {
    return document.querySelectorAll("dd.col-md-4 > a");
  },

  coverUrl: async () => {
    const indexUrl = document.location.href.replace(/\/list.html$/, ".html");
    return Object(_lib__WEBPACK_IMPORTED_MODULE_5__[/* crossPage */ "a"])(indexUrl, "doc.querySelector('.panel-body img').getAttribute('data-original')");
  },
  chapterName: function chapterName(doc) {
    return doc.querySelector("h1.readTitle").innerText.trim();
  },
  content: function content(doc) {
    let c = doc.querySelector("#htmlContent");
    let ad = c.querySelector("p:nth-child(1)");

    if (ad === null || ad === void 0 ? void 0 : ad.innerText.includes("精彩小说网")) {
      ad.remove();
    }

    return c;
  }
}], ["www.shuquge.com", {
  bookname() {
    return document.querySelector(".info > h2").innerText.trim();
  },

  author() {
    return document.querySelector(".small > span:nth-child(1)").innerText.replace(/作者：/, "").trim();
  },

  intro() {
    let iNode = document.querySelector(".intro");
    iNode.innerHTML = iNode.innerHTML.replace(/推荐地址：http:\/\/www.shuquge.com\/txt\/\d+\/index\.html/, "");
    return Object(_main__WEBPACK_IMPORTED_MODULE_6__[/* convertDomNode */ "a"])(iNode)[0];
  },

  linkList() {
    return Object(_lib__WEBPACK_IMPORTED_MODULE_5__[/* includeLatestChapter */ "c"])(".listmain > dl:nth-child(1)");
  },

  coverUrl() {
    return document.querySelector(".info > .cover > img").src;
  },

  chapterName: function chapterName(doc) {
    return doc.querySelector(".content > h1:nth-child(1)").innerText.trim();
  },
  content: function content(doc) {
    let content = doc.querySelector("#content");
    content.innerHTML = content.innerHTML.replace("请记住本书首发域名：www.shuquge.com。书趣阁_笔趣阁手机版阅读网址：m.shuquge.com", "").replace(/http:\/\/www.shuquge.com\/txt\/\d+\/\d+\.html/, "");
    return content;
  }
}], ["www.dingdiann.com", {
  bookname() {
    return document.querySelector("#info > h1:nth-child(1)").innerText.trim();
  },

  author() {
    return document.querySelector("#info > p:nth-child(2)").innerText.replace(/作\s+者：/, "").trim();
  },

  intro() {
    return Object(_main__WEBPACK_IMPORTED_MODULE_6__[/* convertDomNode */ "a"])(document.querySelector("#intro"))[0];
  },

  linkList() {
    return Object(_lib__WEBPACK_IMPORTED_MODULE_5__[/* includeLatestChapter */ "c"])("#list > dl");
  },

  coverUrl() {
    return document.querySelector("#fmimg > img").src;
  },

  chapterName: function chapterName(doc) {
    return doc.querySelector(".bookname > h1:nth-child(1)").innerText.trim();
  },
  content: function content(doc) {
    let content = doc.querySelector("#content");
    let ad = '<div align="center"><a href="javascript:postError();" style="text-align:center;color:red;">章节错误,点此举报(免注册)</a>,举报后维护人员会在两分钟内校正章节内容,请耐心等待,并刷新页面。</div>';
    content.innerHTML = content.innerHTML.replace(ad, "").replace(/http:\/\/www.shuquge.com\/txt\/\d+\/\d+\.html/, "");
    return content;
  }
}], ["www.fpzw.com", {
  bookname() {
    return document.querySelector("#title > h1:nth-child(1)").innerText.trim();
  },

  author() {
    return document.querySelector(".author > a:nth-child(1)").innerText.trim();
  },

  intro: async () => {
    const indexUrl = document.location.href.replace(/xiaoshuo\/\d+\//, "");
    const charset = "GBK";
    return Object(_lib__WEBPACK_IMPORTED_MODULE_5__[/* crossPage */ "a"])(indexUrl, "convertDomNode(doc.querySelector('.wright .Text'))[0]", charset);
  },

  linkList() {
    return Object(_lib__WEBPACK_IMPORTED_MODULE_5__[/* includeLatestChapter */ "c"])(".book");
  },

  coverUrl: async () => {
    const indexUrl = document.location.href.replace(/xiaoshuo\/\d+\//, "");
    const charset = "GBK";
    return Object(_lib__WEBPACK_IMPORTED_MODULE_5__[/* crossPage */ "a"])(indexUrl, "doc.querySelector('div.bortable.wleft > img').src", charset);
  },
  chapterName: function chapterName(doc) {
    return doc.querySelector("h2").innerText.trim();
  },
  content: function content(doc) {
    let content = doc.querySelector(".Text");
    Object(_lib__WEBPACK_IMPORTED_MODULE_5__[/* rm */ "d"])(".Text > a:nth-child(1)", false, content);
    Object(_lib__WEBPACK_IMPORTED_MODULE_5__[/* rm */ "d"])('.Text > font[color="#F00"]', false, content);
    Object(_lib__WEBPACK_IMPORTED_MODULE_5__[/* rm */ "d"])("strong.top_book", false, content);
    return content;
  },
  charset: "GBK"
}], ["www.hetushu.com", {
  bookname() {
    return document.querySelector(".book_info > h2").innerText.trim();
  },

  author() {
    return document.querySelector(".book_info > div:nth-child(3) > a:nth-child(1)").innerText.trim();
  },

  intro() {
    return Object(_main__WEBPACK_IMPORTED_MODULE_6__[/* convertDomNode */ "a"])(document.querySelector(".intro"))[0];
  },

  linkList() {
    return document.querySelectorAll("#dir dd a");
  },

  coverUrl() {
    return document.querySelector(".book_info > img").src;
  },

  chapterName: function chapterName(doc) {
    return doc.querySelector("#content .h2").innerText.trim();
  },
  content: function content(doc) {
    let content = doc.querySelector("#content");
    Object(_lib__WEBPACK_IMPORTED_MODULE_5__[/* rm */ "d"])("h2", true, content);
    return content;
  }
}], ["www.biquwo.org", {
  bookname() {
    return document.querySelector("#info > h1").innerText.trim();
  },

  author() {
    return document.querySelector("#info > p:nth-child(2)").innerText.replace(/作\s+者：/, "").trim();
  },

  intro() {
    return Object(_main__WEBPACK_IMPORTED_MODULE_6__[/* convertDomNode */ "a"])(document.querySelector("#intro"))[0];
  },

  linkList() {
    return Object(_lib__WEBPACK_IMPORTED_MODULE_5__[/* includeLatestChapter */ "c"])("#list > dl:nth-child(1)");
  },

  coverUrl() {
    return document.querySelector("#fmimg > img").src;
  },

  chapterName: function chapterName(doc) {
    return doc.querySelector(".bookname > h1:nth-child(1)").innerText.trim();
  },
  content: function content(doc) {
    return doc.querySelector("#content");
  }
}], ["www.xkzw.org", {
  bookname() {
    return document.querySelector("#info > h1").innerText.trim();
  },

  author() {
    return document.querySelector("#info > p:nth-child(2)").innerText.replace(/作\s+者：/, "").trim();
  },

  intro() {
    return Object(_main__WEBPACK_IMPORTED_MODULE_6__[/* convertDomNode */ "a"])(document.querySelector("#intro"))[0];
  },

  linkList() {
    let showmore = document.querySelector("#showMore a");
    let showmoreJS = showmore.href.replace("javascript:", "");

    if (!showmore.innerText.includes("点击关闭")) {
      eval(showmoreJS);
    }

    return document.querySelectorAll(".list dd > a");
  },

  coverUrl() {
    return document.querySelector("#fmimg > img").src;
  },

  chapterName: function chapterName(doc) {
    return doc.querySelector(".bookname > h1:nth-child(1)").innerText.trim();
  },
  content: async function content(doc) {
    runEval(CryptoJS);
    return doc.querySelector("#content");

    function runEval(CryptoJS) {
      function gettt1(str, keyStr, ivStr) {
        let key = CryptoJS.enc.Utf8.parse(keyStr);
        let iv = CryptoJS.enc.Utf8.parse(ivStr);
        let encryptedHexStr = CryptoJS.enc.Hex.parse(str);
        let srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
        let decrypt = CryptoJS.DES.decrypt(srcs, key, {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        });
        let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
        return decryptedStr.toString();
      }

      function gettt2(str, keyStr, ivStr) {
        let key = CryptoJS.enc.Utf8.parse(keyStr);
        let iv = CryptoJS.enc.Utf8.parse(ivStr);
        let encryptedHexStr = CryptoJS.enc.Hex.parse(str);
        let srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
        let decrypt = CryptoJS.AES.decrypt(srcs, key, {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        });
        let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
        return decryptedStr.toString();
      }

      function gettt3(str, keyStr, ivStr) {
        let key = CryptoJS.enc.Utf8.parse(keyStr);
        let iv = CryptoJS.enc.Utf8.parse(ivStr);
        let encryptedHexStr = CryptoJS.enc.Hex.parse(str);
        let srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
        let decrypt = CryptoJS.RC4.decrypt(srcs, key, {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        });
        let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
        return decryptedStr.toString();
      }

      function getttn(str, keyStr, ivStr) {
        let key = CryptoJS.enc.Utf8.parse(keyStr);
        let iv = CryptoJS.enc.Utf8.parse(ivStr);
        let encryptedHexStr = CryptoJS.enc.Hex.parse(str);
        let srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
        let decrypt = CryptoJS.TripleDES.decrypt(srcs, key, {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        });
        let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
        return decryptedStr.toString();
      }

      function showttt1(doc) {
        let obj = doc.getElementById("other");
        let objTips = doc.getElementById("contenttips");

        if (obj) {
          let content = obj.innerHTML.trim(); // eslint-disable-next-line radix

          let type = parseInt(content.substring(0, 1));
          let key;
          let iv;

          if (type === 1) {
            key = content.substring(1, 9);
            iv = content.substring(9, 17);
            content = content.substring(17);
            obj.innerHTML = gettt1(content, key, iv);
            obj.style.display = "block";

            if (objTips) {
              objTips.remove();
            }
          } else if (type === 2) {
            key = content.substring(1, 33);
            iv = content.substring(33, 49);
            content = content.substring(49);
            obj.innerHTML = gettt2(content, key, iv);
            obj.style.display = "block";

            if (objTips) {
              objTips.remove();
            }
          } else if (type === 3) {
            key = content.substring(1, 9);
            iv = content.substring(9, 17);
            content = content.substring(17);
            obj.innerHTML = gettt3(content, key, iv);
            obj.style.display = "block";

            if (objTips) {
              objTips.remove();
            }
          } else {
            key = content.substring(1, 25);
            iv = content.substring(25, 33);
            content = content.substring(33);
            obj.innerHTML = getttn(content, key, iv);
            obj.style.display = "block";

            if (objTips) {
              objTips.remove();
            }
          }
        }
      }

      showttt1(doc);
    }
  }
}], ["www.shouda8.com", {
  bookname() {
    return document.querySelector(".bread-crumbs > li:nth-child(4)").innerText.replace("最新章节列表", "").trim();
  },

  author() {
    return document.querySelector("div.bookname > h1 > em").innerText.replace("作者：", "").trim();
  },

  intro() {
    let intro = document.querySelector(".intro");
    Object(_lib__WEBPACK_IMPORTED_MODULE_5__[/* rm */ "d"])(".book_keywords");
    Object(_lib__WEBPACK_IMPORTED_MODULE_5__[/* rm */ "d"])("script", true);
    Object(_lib__WEBPACK_IMPORTED_MODULE_5__[/* rm */ "d"])("#cambrian0");
    return Object(_main__WEBPACK_IMPORTED_MODULE_6__[/* convertDomNode */ "a"])(intro)[0];
  },

  linkList() {
    return document.querySelectorAll(".link_14 > dl dd a");
  },

  coverUrl() {
    return document.querySelector(".pic > img:nth-child(1)").src;
  },

  chapterName: function chapterName(doc) {
    return doc.querySelector(".kfyd > h2:nth-child(1)").innerText.trim();
  },
  content: function content(doc) {
    let content = doc.querySelector("#content");
    Object(_lib__WEBPACK_IMPORTED_MODULE_5__[/* rm */ "d"])("p:last-child", false, content);
    return content;
  }
}], ["book.qidian.com", {
  bookname() {
    return document.querySelector(".book-info > h1 > em").innerText.trim();
  },

  author() {
    return document.querySelector(".book-info .writer").innerText.replace(/作\s+者:/, "").trim();
  },

  intro() {
    return Object(_main__WEBPACK_IMPORTED_MODULE_6__[/* convertDomNode */ "a"])(document.querySelector(".book-info-detail .book-intro"))[0];
  },

  linkList: async () => {
    return new Promise((resolve, reject) => {
      let list;

      const getLiLength = () => document.querySelectorAll("#j-catalogWrap li").length;

      const getlinkList = () => document.querySelectorAll('.volume-wrap ul.cf li a:not([href^="//vipreader"]');

      if (getLiLength() !== 0) {
        list = getlinkList();
        setTimeout(() => {
          if (getLiLength() !== 0) {
            list = getlinkList();
            resolve(list);
          } else {
            reject(new Error("Can't found linkList."));
          }
        }, 3000);
      } else {
        list = getlinkList();
        resolve(list);
      }
    });
  },

  coverUrl() {
    return document.querySelector("#bookImg > img").src;
  },

  chapterName: function chapterName(doc) {
    return doc.querySelector(".j_chapterName > .content-wrap").innerText.trim();
  },
  content: function content(doc) {
    return doc.querySelector(".read-content");
  },
  CORS: true
}], ["www.ciweimao.com", {
  bookname() {
    return document.querySelector(".book-catalog .hd h3").innerText.trim();
  },

  author() {
    return document.querySelector(".book-catalog .hd > p > a").innerText.trim();
  },

  intro: async () => {
    const bookid = unsafeWindow.HB.book.book_id;
    const indexUrl = "https://www.ciweimao.com/book/" + bookid;
    return Object(_lib__WEBPACK_IMPORTED_MODULE_5__[/* crossPage */ "a"])(indexUrl, "convertDomNode(doc.querySelector('.book-intro-cnt .book-desc'))[0]");
  },

  linkList() {
    document.querySelectorAll(".book-chapter-list > li > a > i").forEach(i => i.parentElement.classList.add("not_download"));
    return document.querySelectorAll(".book-chapter-list > li > a:not(.not_download)");
  },

  coverUrl: async () => {
    const bookid = unsafeWindow.HB.book.book_id;
    const indexUrl = "https://www.ciweimao.com/book/" + bookid;
    return Object(_lib__WEBPACK_IMPORTED_MODULE_5__[/* crossPage */ "a"])(indexUrl, "doc.querySelector('.cover > img').src");
  },
  chapterName: function chapterName(doc) {
    Object(_lib__WEBPACK_IMPORTED_MODULE_5__[/* rm */ "d"])("h3.chapter i", false, doc);
    return doc.querySelector("h3.chapter").innerText.trim();
  },
  content: async function content(doc) {
    const url = doc.baseURI;
    const chapter_id = url.split("/").slice(-1)[0];

    let _chapter_author_says = doc.querySelectorAll("#J_BookCnt .chapter.author_say");

    let div_chapter_author_say;

    if (_chapter_author_says.length !== 0) {
      let hr = document.createElement("hr");
      div_chapter_author_say = document.createElement("div");
      div_chapter_author_say.appendChild(hr);

      for (let _chapter_author_say of _chapter_author_says) {
        Object(_lib__WEBPACK_IMPORTED_MODULE_5__[/* rm */ "d"])("i", true, _chapter_author_say);
        div_chapter_author_say.appendChild(_chapter_author_say);
      }
    }

    let content = document.createElement("div");
    let decryptDate;

    while (true) {
      if (!window.lock) {
        window.lock = true;
        decryptDate = await chapterDecrypt(chapter_id, url).catch(error => {
          console.error(error);
          chapterDecrypt(chapter_id, url);
        }).catch(error => {
          window.lock = false;
          throw error;
        });
        window.lock = false;
        break;
      } else {
        await Object(_lib__WEBPACK_IMPORTED_MODULE_5__[/* sleep */ "e"])(17);
      }
    }

    content.innerHTML = decryptDate;
    Object(_lib__WEBPACK_IMPORTED_MODULE_5__[/* rm */ "d"])(".chapter span", true, content);

    if (_chapter_author_says.length !== 0) {
      content.appendChild(div_chapter_author_say);
    }

    return content;

    async function chapterDecrypt(chapter_id, refererUrl) {
      const rootPath = "https://www.ciweimao.com/";
      const access_key_url = rootPath + "chapter/ajax_get_session_code";
      const chapter_content_url = rootPath + "chapter/get_book_chapter_detail_info";
      console.log("\u8BF7\u6C42 ".concat(access_key_url, " Referer ").concat(refererUrl));
      const access_key_obj = await Object(_lib__WEBPACK_IMPORTED_MODULE_5__[/* gfetch */ "b"])(access_key_url, {
        method: "POST",
        headers: {
          Accept: "application/json, text/javascript, */*; q=0.01",
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          Referer: refererUrl,
          Origin: "https://www.ciweimao.com",
          "X-Requested-With": "XMLHttpRequest"
        },
        data: "chapter_id=".concat(chapter_id),
        responseType: "json"
      }).then(response => response.response);
      const chapter_access_key = access_key_obj.chapter_access_key;
      console.log("\u8BF7\u6C42 ".concat(chapter_content_url, " Referer ").concat(refererUrl));
      const chapter_content_obj = await Object(_lib__WEBPACK_IMPORTED_MODULE_5__[/* gfetch */ "b"])(chapter_content_url, {
        method: "POST",
        headers: {
          Accept: "application/json, text/javascript, */*; q=0.01",
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          Referer: refererUrl,
          Origin: "https://www.ciweimao.com",
          "X-Requested-With": "XMLHttpRequest"
        },
        data: "chapter_id=".concat(chapter_id, "&chapter_access_key=").concat(chapter_access_key),
        responseType: "json"
      }).then(response => response.response);

      if (chapter_content_obj.code !== 100000) {
        console.error(chapter_content_obj);
        throw new Error("\u4E0B\u8F7D ".concat(refererUrl, " \u5931\u8D25"));
      }

      return decrypt({
        content: chapter_content_obj.chapter_content,
        keys: chapter_content_obj.encryt_keys,
        accessKey: chapter_access_key
      });
    }

    function decrypt(item) {
      let message = item.content;
      let keys = item.keys;
      let len = item.keys.length;
      let accessKey = item.accessKey;
      let accessKeyList = accessKey.split("");
      let charsNotLatinNum = accessKeyList.length;
      let output = new Array();
      output.push(keys[accessKeyList[charsNotLatinNum - 1].charCodeAt(0) % len]);
      output.push(keys[accessKeyList[0].charCodeAt(0) % len]);

      for (let i = 0; i < output.length; i++) {
        message = atob(message);
        let data = output[i];
        let iv = btoa(message.substr(0, 16));
        let keys255 = btoa(message.substr(16));
        let pass = CryptoJS.format.OpenSSL.parse(keys255);
        message = CryptoJS.AES.decrypt(pass, CryptoJS.enc.Base64.parse(data), {
          iv: CryptoJS.enc.Base64.parse(iv),
          format: CryptoJS.format.OpenSSL
        });

        if (i < output.length - 1) {
          message = message.toString(CryptoJS.enc.Base64);
          message = atob(message);
        }
      }

      return message.toString(CryptoJS.enc.Utf8);
    }
  },
  maxConcurrency: 3
}], ["www.jjwxc.net", {
  bookname() {
    return document.querySelector('h1[itemprop="name"] > span').innerText.trim();
  },

  author() {
    return document.querySelector("td.sptd h2 a span").innerText.trim();
  },

  intro() {
    let intro = document.querySelector("#novelintro");
    Object(_lib__WEBPACK_IMPORTED_MODULE_5__[/* rm */ "d"])("img", true, intro);
    return Object(_main__WEBPACK_IMPORTED_MODULE_6__[/* convertDomNode */ "a"])(intro)[0];
  },

  linkList() {
    return document.querySelectorAll('tr[itemprop*="chapter"] > td:nth-child(2) > span a[href]');
  },

  coverUrl() {
    return document.querySelector(".noveldefaultimage").src;
  },

  chapterName: function chapterName(doc) {
    return doc.querySelector("div.noveltext h2").innerText.trim();
  },
  content: function content(doc) {
    let content = doc.querySelector("div.noveltext");
    Object(_lib__WEBPACK_IMPORTED_MODULE_5__[/* rm */ "d"])("div:first-child", false, content);
    Object(_lib__WEBPACK_IMPORTED_MODULE_5__[/* rm */ "d"])('div[style="display:none"]', true, content);
    Object(_lib__WEBPACK_IMPORTED_MODULE_5__[/* rm */ "d"])("#favoriteshow_3", false, content);
    Object(_lib__WEBPACK_IMPORTED_MODULE_5__[/* rm */ "d"])('div[align="right"]', true, content);
    Object(_lib__WEBPACK_IMPORTED_MODULE_5__[/* rm */ "d"])('div[style="clear: both;"]', true, content);
    Object(_lib__WEBPACK_IMPORTED_MODULE_5__[/* rm */ "d"])('div[style="width:710px;height:70px;float:right;"]', true, content);
    Object(_lib__WEBPACK_IMPORTED_MODULE_5__[/* rm */ "d"])("div.noveltext div.readsmall  > hr", true, content);
    Object(_lib__WEBPACK_IMPORTED_MODULE_5__[/* rm */ "d"])("div:first-child", false, content);
    return content;
  },
  charset: "GB18030"
}], ["book.sfacg.com", {
  bookname() {
    return document.querySelector("h1.story-title").innerText.trim();
  },

  author: async () => {
    const indexUrl = document.location.href.replace("/MainIndex/", "");
    return Object(_lib__WEBPACK_IMPORTED_MODULE_5__[/* crossPage */ "a"])(indexUrl, "doc.querySelector('.author-name').innerText.trim()");
  },
  intro: async () => {
    const indexUrl = document.location.href.replace("/MainIndex/", "");
    return Object(_lib__WEBPACK_IMPORTED_MODULE_5__[/* crossPage */ "a"])(indexUrl, "convertDomNode(doc.querySelector('.introduce'))[0]");
  },

  linkList() {
    return document.querySelectorAll('.catalog-list li a:not([href^="/vip"])');
  },

  coverUrl: async () => {
    const indexUrl = document.location.href.replace("/MainIndex/", "");
    return Object(_lib__WEBPACK_IMPORTED_MODULE_5__[/* crossPage */ "a"])(indexUrl, "doc.querySelector('#hasTicket div.pic img').src");
  },
  chapterName: function chapterName(doc) {
    return doc.querySelector("h1.article-title").innerText.trim();
  },
  content: function content(doc) {
    return doc.querySelector(".article-content");
  }
}], ["www.gebiqu.com", {
  bookname() {
    return document.querySelector("#info > h1").innerText.trim();
  },

  author() {
    return document.querySelector("#info > p:nth-child(2)").innerText.replace(/作\s+者：/, "").trim();
  },

  intro() {
    let intro = document.querySelector("#intro");
    intro.innerHTML = intro.innerHTML.replace(/如果您喜欢.+，别忘记分享给朋友/, "");
    Object(_lib__WEBPACK_IMPORTED_MODULE_5__[/* rm */ "d"])('a[href^="http://down.gebiqu.com"]', false, intro);
    return Object(_main__WEBPACK_IMPORTED_MODULE_6__[/* convertDomNode */ "a"])(intro)[0];
  },

  linkList() {
    return Object(_lib__WEBPACK_IMPORTED_MODULE_5__[/* includeLatestChapter */ "c"])("#list > dl:nth-child(1)");
  },

  coverUrl() {
    return document.querySelector("#fmimg > img").src;
  },

  chapterName: function chapterName(doc) {
    return doc.querySelector(".bookname > h1:nth-child(1)").innerText.trim();
  },
  content: function content(doc) {
    let content = doc.querySelector("#content");
    content.innerHTML = content.innerHTML.replace("www.gebiqu.com", "");
    return content;
  }
}], ["www.meegoq.com", {
  bookname() {
    return document.querySelector("article.info > header > h1").innerText.replace(/最新章节$/, "").trim();
  },

  author: async () => {
    const indexUrl = document.location.href.replace("/book", "/info");
    return Object(_lib__WEBPACK_IMPORTED_MODULE_5__[/* crossPage */ "a"])(indexUrl, "doc.querySelector('article.info > p.detail.pt20 > i:nth-child(1) > a').innerText.trim()");
  },
  intro: async () => {
    const indexUrl = document.location.href.replace("/book", "/info");
    return Object(_lib__WEBPACK_IMPORTED_MODULE_5__[/* crossPage */ "a"])(indexUrl, "(() => {\n              let intro = doc.querySelector(\"article.info > p.desc\");\n              rm('b',false,intro);\n              return convertDomNode(intro)[0];\n            })()");
  },

  linkList() {
    let ul = document.querySelector("ul.mulu");
    let rLi = ul.querySelector("li:nth-child(1)");

    if (rLi.innerText.match(/最新.章/)) {
      let p = null;
      let n = rLi;

      while (true) {
        if (n.nodeName === "LI" && n.childElementCount !== 0) {
          p = n;
          n = n.nextSibling;
          p.classList.add("not_download");
        } else if (n.nodeName === "LI" && n.childElementCount === 0 && !n.innerText.match(/最新.章/)) {
          break;
        } else {
          p = n;
          n = n.nextSibling;
        }
      }
    }

    return ul.querySelectorAll("li:not(.not_download) > a");
  },

  coverUrl: async () => {
    const indexUrl = document.location.href.replace("/book", "/info");
    return Object(_lib__WEBPACK_IMPORTED_MODULE_5__[/* crossPage */ "a"])(indexUrl, "doc.querySelector('article.info > div.cover > img').src");
  },
  chapterName: function chapterName(doc) {
    return doc.querySelector("article > header > h1").innerText.trim();
  },
  content: function content(doc) {
    return doc.querySelector("#content");
  },
  maxConcurrency: 1,
  maxRetryTimes: 5
}], ["book.zongheng.com", {
  bookname() {
    return document.querySelector("div.book-meta > h1").innerText.trim();
  },

  author() {
    return document.querySelector("div.book-meta > p > span:nth-child(1) > a").innerText.trim();
  },

  intro: async () => {
    const indexUrl = document.location.href.replace("/showchapter/", "/book/");
    return Object(_lib__WEBPACK_IMPORTED_MODULE_5__[/* crossPage */ "a"])(indexUrl, "convertDomNode(doc.querySelector('div.book-info > div.book-dec'))[0]");
  },

  linkList() {
    return document.querySelectorAll(".chapter-list li:not(.vip) a");
  },

  coverUrl: async () => {
    const indexUrl = document.location.href.replace("/showchapter/", "/book/");
    return Object(_lib__WEBPACK_IMPORTED_MODULE_5__[/* crossPage */ "a"])(indexUrl, "doc.querySelector('div.book-img > img').src");
  },
  chapterName: function chapterName(doc) {
    return doc.querySelector("div.title_txtbox").innerText.trim();
  },
  content: function content(doc) {
    return doc.querySelector("div.content");
  }
}], ["www.17k.com", {
  bookname() {
    return document.querySelector("h1.Title").innerText.trim();
  },

  author() {
    return document.querySelector("div.Author > a").innerText.trim();
  },

  intro: async () => {
    const indexUrl = document.location.href.replace("/list/", "/book/");
    return Object(_lib__WEBPACK_IMPORTED_MODULE_5__[/* crossPage */ "a"])(indexUrl, "convertDomNode(doc.querySelector('#bookInfo p.intro > a'))[0]");
  },

  linkList() {
    document.querySelectorAll("dl.Volume > dd > a > span.vip").forEach(span => span.parentElement.classList.add("not_download"));
    return document.querySelectorAll("dl.Volume > dd > a:not(.not_download)");
  },

  coverUrl: async () => {
    const indexUrl = document.location.href.replace("/list/", "/book/");
    return Object(_lib__WEBPACK_IMPORTED_MODULE_5__[/* crossPage */ "a"])(indexUrl, "doc.querySelector('#bookCover img.book').src.replace('http://','https://')");
  },
  chapterName: function chapterName(doc) {
    return doc.querySelector("#readArea > div.readAreaBox.content > h1").innerText.trim();
  },
  content: function content(doc) {
    let content = doc.querySelector("#readArea > div.readAreaBox.content > div.p");
    Object(_lib__WEBPACK_IMPORTED_MODULE_5__[/* rm */ "d"])('p.copy', false, content);
    Object(_lib__WEBPACK_IMPORTED_MODULE_5__[/* rm */ "d"])('#banner_content', false, content);
    Object(_lib__WEBPACK_IMPORTED_MODULE_5__[/* rm */ "d"])('div.qrcode', false, content);
    Object(_lib__WEBPACK_IMPORTED_MODULE_5__[/* rm */ "d"])('div.chapter_text_ad', false, content);
    return content;
  }
}]]);
[{
  "mainHost": "book.zongheng.com",
  "alias": ["huayu.zongheng.com"],
  "modify": {
    CORS: true
  }
}].forEach(entry => {
  const aliases = entry.alias;
  let mainRule = rules.get(entry.mainHost);
  let modify = entry.modify;

  for (let key in modify) {
    if (Object.prototype.hasOwnProperty.call(modify, key)) {
      mainRule[key] = modify[key];
    }
  }

  for (let alias of aliases) {
    rules.set(alias, mainRule);
  }
});


/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var addToUnscopables = __webpack_require__(54);
var step = __webpack_require__(55);
var Iterators = __webpack_require__(28);
var toIObject = __webpack_require__(12);

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = __webpack_require__(57)(Array, 'Array', function (iterated, kind) {
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var kind = this._k;
  var index = this._i++;
  if (!O || index >= O.length) {
    this._t = undefined;
    return step(1);
  }
  if (kind == 'keys') return step(0, index);
  if (kind == 'values') return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');


/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

// 22.1.3.31 Array.prototype[@@unscopables]
var UNSCOPABLES = __webpack_require__(3)('unscopables');
var ArrayProto = Array.prototype;
if (ArrayProto[UNSCOPABLES] == undefined) __webpack_require__(7)(ArrayProto, UNSCOPABLES, {});
module.exports = function (key) {
  ArrayProto[UNSCOPABLES][key] = true;
};


/***/ }),
/* 55 */
/***/ (function(module, exports) {

module.exports = function (done, value) {
  return { value: value, done: !!done };
};


/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = __webpack_require__(20);
// eslint-disable-next-line no-prototype-builtins
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return cof(it) == 'String' ? it.split('') : Object(it);
};


/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var LIBRARY = __webpack_require__(18);
var $export = __webpack_require__(22);
var redefine = __webpack_require__(13);
var hide = __webpack_require__(7);
var Iterators = __webpack_require__(28);
var $iterCreate = __webpack_require__(60);
var setToStringTag = __webpack_require__(32);
var getPrototypeOf = __webpack_require__(65);
var ITERATOR = __webpack_require__(3)('iterator');
var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
var FF_ITERATOR = '@@iterator';
var KEYS = 'keys';
var VALUES = 'values';

var returnThis = function () { return this; };

module.exports = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
  $iterCreate(Constructor, NAME, next);
  var getMethod = function (kind) {
    if (!BUGGY && kind in proto) return proto[kind];
    switch (kind) {
      case KEYS: return function keys() { return new Constructor(this, kind); };
      case VALUES: return function values() { return new Constructor(this, kind); };
    } return function entries() { return new Constructor(this, kind); };
  };
  var TAG = NAME + ' Iterator';
  var DEF_VALUES = DEFAULT == VALUES;
  var VALUES_BUG = false;
  var proto = Base.prototype;
  var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
  var $default = $native || getMethod(DEFAULT);
  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
  var methods, key, IteratorPrototype;
  // Fix native
  if ($anyNative) {
    IteratorPrototype = getPrototypeOf($anyNative.call(new Base()));
    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
      // Set @@toStringTag to native iterators
      setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if (!LIBRARY && typeof IteratorPrototype[ITERATOR] != 'function') hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if (DEF_VALUES && $native && $native.name !== VALUES) {
    VALUES_BUG = true;
    $default = function values() { return $native.call(this); };
  }
  // Define iterator
  if ((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG] = returnThis;
  if (DEFAULT) {
    methods = {
      values: DEF_VALUES ? $default : getMethod(VALUES),
      keys: IS_SET ? $default : getMethod(KEYS),
      entries: $entries
    };
    if (FORCED) for (key in methods) {
      if (!(key in proto)) redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};


/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(16)('native-function-to-string', Function.toString);


/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

// optional / simple context binding
var aFunction = __webpack_require__(29);
module.exports = function (fn, that, length) {
  aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};


/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var create = __webpack_require__(41);
var descriptor = __webpack_require__(19);
var setToStringTag = __webpack_require__(32);
var IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
__webpack_require__(7)(IteratorPrototype, __webpack_require__(3)('iterator'), function () { return this; });

module.exports = function (Constructor, NAME, next) {
  Constructor.prototype = create(IteratorPrototype, { next: descriptor(1, next) });
  setToStringTag(Constructor, NAME + ' Iterator');
};


/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

var dP = __webpack_require__(9);
var anObject = __webpack_require__(4);
var getKeys = __webpack_require__(23);

module.exports = __webpack_require__(8) ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var keys = getKeys(Properties);
  var length = keys.length;
  var i = 0;
  var P;
  while (length > i) dP.f(O, P = keys[i++], Properties[P]);
  return O;
};


/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

// false -> Array#indexOf
// true  -> Array#includes
var toIObject = __webpack_require__(12);
var toLength = __webpack_require__(24);
var toAbsoluteIndex = __webpack_require__(63);
module.exports = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
      if (O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};


/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

var toInteger = __webpack_require__(25);
var max = Math.max;
var min = Math.min;
module.exports = function (index, length) {
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};


/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

var document = __webpack_require__(5).document;
module.exports = document && document.documentElement;


/***/ }),
/* 65 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has = __webpack_require__(10);
var toObject = __webpack_require__(26);
var IE_PROTO = __webpack_require__(30)('IE_PROTO');
var ObjectProto = Object.prototype;

module.exports = Object.getPrototypeOf || function (O) {
  O = toObject(O);
  if (has(O, IE_PROTO)) return O[IE_PROTO];
  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};


/***/ }),
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

var META = __webpack_require__(14)('meta');
var isObject = __webpack_require__(11);
var has = __webpack_require__(10);
var setDesc = __webpack_require__(9).f;
var id = 0;
var isExtensible = Object.isExtensible || function () {
  return true;
};
var FREEZE = !__webpack_require__(6)(function () {
  return isExtensible(Object.preventExtensions({}));
});
var setMeta = function (it) {
  setDesc(it, META, { value: {
    i: 'O' + ++id, // object ID
    w: {}          // weak collections IDs
  } });
};
var fastKey = function (it, create) {
  // return primitive with prefix
  if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return 'F';
    // not necessary to add metadata
    if (!create) return 'E';
    // add missing metadata
    setMeta(it);
  // return object ID
  } return it[META].i;
};
var getWeak = function (it, create) {
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return true;
    // not necessary to add metadata
    if (!create) return false;
    // add missing metadata
    setMeta(it);
  // return hash weak collections IDs
  } return it[META].w;
};
// add metadata on freeze-family methods calling
var onFreeze = function (it) {
  if (FREEZE && meta.NEED && isExtensible(it) && !has(it, META)) setMeta(it);
  return it;
};
var meta = module.exports = {
  KEY: META,
  NEED: false,
  fastKey: fastKey,
  getWeak: getWeak,
  onFreeze: onFreeze
};


/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

// all enumerable object keys, includes symbols
var getKeys = __webpack_require__(23);
var gOPS = __webpack_require__(47);
var pIE = __webpack_require__(33);
module.exports = function (it) {
  var result = getKeys(it);
  var getSymbols = gOPS.f;
  if (getSymbols) {
    var symbols = getSymbols(it);
    var isEnum = pIE.f;
    var i = 0;
    var key;
    while (symbols.length > i) if (isEnum.call(it, key = symbols[i++])) result.push(key);
  } return result;
};


/***/ }),
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

// 7.2.2 IsArray(argument)
var cof = __webpack_require__(20);
module.exports = Array.isArray || function isArray(arg) {
  return cof(arg) == 'Array';
};


/***/ }),
/* 69 */
/***/ (function(module, exports, __webpack_require__) {

// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var toIObject = __webpack_require__(12);
var gOPN = __webpack_require__(48).f;
var toString = {}.toString;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function (it) {
  try {
    return gOPN(it);
  } catch (e) {
    return windowNames.slice();
  }
};

module.exports.f = function getOwnPropertyNames(it) {
  return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
};


/***/ }),
/* 70 */
/***/ (function(module, exports, __webpack_require__) {

var pIE = __webpack_require__(33);
var createDesc = __webpack_require__(19);
var toIObject = __webpack_require__(12);
var toPrimitive = __webpack_require__(27);
var has = __webpack_require__(10);
var IE8_DOM_DEFINE = __webpack_require__(39);
var gOPD = Object.getOwnPropertyDescriptor;

exports.f = __webpack_require__(8) ? gOPD : function getOwnPropertyDescriptor(O, P) {
  O = toIObject(O);
  P = toPrimitive(P, true);
  if (IE8_DOM_DEFINE) try {
    return gOPD(O, P);
  } catch (e) { /* empty */ }
  if (has(O, P)) return createDesc(!pIE.f.call(O, P), O[P]);
};


/***/ }),
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var anObject = __webpack_require__(4);
var toLength = __webpack_require__(24);
var advanceStringIndex = __webpack_require__(34);
var regExpExec = __webpack_require__(35);

// @@match logic
__webpack_require__(36)('match', 1, function (defined, MATCH, $match, maybeCallNative) {
  return [
    // `String.prototype.match` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.match
    function match(regexp) {
      var O = defined(this);
      var fn = regexp == undefined ? undefined : regexp[MATCH];
      return fn !== undefined ? fn.call(regexp, O) : new RegExp(regexp)[MATCH](String(O));
    },
    // `RegExp.prototype[@@match]` method
    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@match
    function (regexp) {
      var res = maybeCallNative($match, regexp, this);
      if (res.done) return res.value;
      var rx = anObject(regexp);
      var S = String(this);
      if (!rx.global) return regExpExec(rx, S);
      var fullUnicode = rx.unicode;
      rx.lastIndex = 0;
      var A = [];
      var n = 0;
      var result;
      while ((result = regExpExec(rx, S)) !== null) {
        var matchStr = String(result[0]);
        A[n] = matchStr;
        if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
        n++;
      }
      return n === 0 ? null : A;
    }
  ];
});


/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

var toInteger = __webpack_require__(25);
var defined = __webpack_require__(21);
// true  -> String#at
// false -> String#codePointAt
module.exports = function (TO_STRING) {
  return function (that, pos) {
    var s = String(defined(that));
    var i = toInteger(pos);
    var l = s.length;
    var a, b;
    if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};


/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = __webpack_require__(20);
var TAG = __webpack_require__(3)('toStringTag');
// ES3 wrong here
var ARG = cof(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (e) { /* empty */ }
};

module.exports = function (it) {
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};


/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var regexpExec = __webpack_require__(37);
__webpack_require__(22)({
  target: 'RegExp',
  proto: true,
  forced: regexpExec !== /./.exec
}, {
  exec: regexpExec
});


/***/ }),
/* 75 */
/***/ (function(module, exports, __webpack_require__) {

// 7.2.8 IsRegExp(argument)
var isObject = __webpack_require__(11);
var cof = __webpack_require__(20);
var MATCH = __webpack_require__(3)('match');
module.exports = function (it) {
  var isRegExp;
  return isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : cof(it) == 'RegExp');
};


/***/ }),
/* 76 */
/***/ (function(module, exports, __webpack_require__) {

// 7.3.20 SpeciesConstructor(O, defaultConstructor)
var anObject = __webpack_require__(4);
var aFunction = __webpack_require__(29);
var SPECIES = __webpack_require__(3)('species');
module.exports = function (O, D) {
  var C = anObject(O).constructor;
  var S;
  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
};


/***/ }),
/* 77 */
/***/ (function(module, exports, __webpack_require__) {

// 21.2.5.3 get RegExp.prototype.flags()
if (__webpack_require__(8) && /./g.flags != 'g') __webpack_require__(9).f(RegExp.prototype, 'flags', {
  configurable: true,
  get: __webpack_require__(38)
});


/***/ }),
/* 78 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $export = __webpack_require__(22);
var aFunction = __webpack_require__(29);
var toObject = __webpack_require__(26);
var fails = __webpack_require__(6);
var $sort = [].sort;
var test = [1, 2, 3];

$export($export.P + $export.F * (fails(function () {
  // IE8-
  test.sort(undefined);
}) || !fails(function () {
  // V8 bug
  test.sort(null);
  // Old WebKit
}) || !__webpack_require__(79)($sort)), 'Array', {
  // 22.1.3.25 Array.prototype.sort(comparefn)
  sort: function sort(comparefn) {
    return comparefn === undefined
      ? $sort.call(toObject(this))
      : $sort.call(toObject(this), aFunction(comparefn));
  }
});


/***/ }),
/* 79 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var fails = __webpack_require__(6);

module.exports = function (method, arg) {
  return !!method && fails(function () {
    // eslint-disable-next-line no-useless-call
    arg ? method.call(null, function () { /* empty */ }, 1) : method.call(null);
  });
};


/***/ }),
/* 80 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXTERNAL MODULE: ./node_modules/core-js/modules/web.dom.iterable.js
var web_dom_iterable = __webpack_require__(15);

// EXTERNAL MODULE: ./node_modules/core-js/modules/es7.symbol.async-iterator.js
var es7_symbol_async_iterator = __webpack_require__(43);

// EXTERNAL MODULE: ./node_modules/core-js/modules/es6.symbol.js
var es6_symbol = __webpack_require__(46);

// EXTERNAL MODULE: ./小说下载器/src/setting.ts
var setting = __webpack_require__(2);

// EXTERNAL MODULE: ./小说下载器/src/main.ts
var main = __webpack_require__(1);

// EXTERNAL MODULE: ./小说下载器/src/lib.ts
var lib = __webpack_require__(0);

// CONCATENATED MODULE: ./小说下载器/src/debug.ts



async function ruleTest(rule, callback) {
  let outpubObj;
  let bookname;
  let author;
  let intro;
  let linkList;
  let cover;
  let sourceUrl;
  let infoText;
  [bookname, author, intro, linkList, cover, sourceUrl, infoText] = await Object(main["d" /* getMetadate */])(rule);
  console.log("infoText:\n".concat(infoText));
  console.log("cover: ", cover);
  console.log("linkList: ", linkList);
  outpubObj = {
    infoText: infoText,
    cover: cover,
    linkList: linkList
  };
  let blob = await cover.file;
  let coverImg = document.createElement("img");
  coverImg.src = URL.createObjectURL(blob);

  coverImg.onclick = function () {
    this.remove();
  };

  coverImg.style.cssText = "position: fixed; bottom: 8%; right: 8%; z-index: 99; max-width: 150px;";
  document.body.appendChild(coverImg);
  outpubObj["coverImg"] = coverImg;
  let rad = Math.trunc(linkList.length * Math.random());
  let url = linkList[rad].href;
  let pageTaskQueue = [{
    id: rad,
    url: url,
    retry: rad,
    dom: linkList[rad]
  }];
  let pageWorkerResolved = new Map();
  let pageWorkerRejected = new Map();
  let loopId = setInterval(loop, 800);

  function loop() {
    let finishNum = pageWorkerResolved.size + pageWorkerRejected.size;

    if (finishNum !== 1) {
      const pageTask = pageTaskQueue.pop();

      if (pageTask) {
        Object(main["k" /* pageWorker */])(pageTask, pageWorkerResolved, pageWorkerRejected, pageTaskQueue, rule);
      }
    } else {
      clearInterval(loopId);
      let result = pageWorkerResolved.get(rad);
      outpubObj["pageObj"] = result;

      if (callback) {
        callback(outpubObj);
      }

      console.log(result);
      console.log(result.dom);
      console.log(result.txt);
    }
  }
}


// CONCATENATED MODULE: ./小说下载器/src/run.ts







window.addEventListener("DOMContentLoaded", async function () {
  console.log("\u5F00\u59CB\u8F7D\u5165\u5C0F\u8BF4\u4E0B\u8F7D\u5668\u2026\u2026\n\u5F53\u524D\u811A\u672C\u7BA1\u7406\u5668\uFF1A".concat(GM_info.scriptHandler, "\n\u5F53\u524D\u811A\u672C\u7BA1\u7406\u5668\u7248\u672C\uFF1A").concat(GM_info.version, "\n\u5F53\u524D\u811A\u672C\u7248\u672C\uFF1A").concat(GM_info.script.version, "\n\u662F\u5426\u5F00\u542F\u8C03\u8BD5\u6A21\u5F0F\uFF1A").concat(setting["c" /* enableDebug */]));

  if (setting["c" /* enableDebug */]) {
    debug();
  }

  let linkList;

  if (setting["i" /* rule */].linkList[Symbol.toStringTag] === "AsyncFunction") {
    // eslint-disable-next-line no-return-assign
    await setting["i" /* rule */].linkList().then(result => linkList = result);
  } else {
    linkList = setting["i" /* rule */].linkList();
  }

  if (linkList.length !== 0) {
    addButton();
  }
});

function addButton() {
  let button = document.createElement("button");
  button.id = "novel-downloader";
  button.style.cssText = "position: fixed;\n                          top: 15%;\n                          right: 5%;\n                          z-index: 99;\n                          border-style: none;\n                          text-align:center;\n                          vertical-align:baseline;\n                          background-color: rgba(128, 128, 128, 0.2);\n                          padding: 5px;\n                          border-radius: 12px;";
  let img = document.createElement("img");
  img.src = setting["d" /* icon0 */];
  img.style.cssText = "height: 2em;";

  button.onclick = function () {
    if (main["b" /* downloading */]) {
      alert("正在下载中，请耐心等待……");
    } else {
      Object(main["m" /* setDownloadingTrue */])();
      img.src = setting["e" /* icon1 */];
      console.log("开始下载……");
      run_main(setting["i" /* rule */]);
    }
  };

  button.appendChild(img);
  document.body.appendChild(button);
}

async function run_main(rule) {
  let bookname;
  let author;
  let intro;
  let linkList;
  let cover;
  let sourceUrl;
  let infoText;
  [bookname, author, intro, linkList, cover, sourceUrl, infoText] = await Object(main["d" /* getMetadate */])(rule);
  const pageNum = linkList.length;
  let pageTaskQueue = Object(main["c" /* genPageTaskQueue */])(linkList);
  let pageWorkerResolved = new Map();
  let pageWorkerRejected = new Map();
  let loopId = setInterval(loop, 300);
  let imgLoopId = setInterval(main["e" /* imgDownLoop */], 800);

  function loop() {
    let finishNum = pageWorkerResolved.size + pageWorkerRejected.size;
    let finishImgNum = main["h" /* imgWorkerResolved */].size + main["g" /* imgWorkerRejected */].size;

    if (finishNum !== pageNum || finishImgNum !== main["f" /* imgTaskQueueSet */].size) {
      Object(main["n" /* updateProgress */])(finishNum, pageNum, finishImgNum, main["f" /* imgTaskQueueSet */].size);

      for (let i = main["i" /* nowWorking */]; i < setting["f" /* maxConcurrency */]; i++) {
        const pageTask = pageTaskQueue.pop();

        if (pageTask) {
          Object(main["j" /* nowWorkingInc */])();
          console.log("\u5F00\u59CB\u4E0B\u8F7D\uFF1A".concat(pageTask.id, "\t").concat(pageTask.dom.innerText, "\t").concat(pageTask.url, "\t\u7B2C").concat(pageTask.retry, "\u6B21\u91CD\u8BD5"));
          Object(main["k" /* pageWorker */])(pageTask, pageWorkerResolved, pageWorkerRejected, pageTaskQueue, rule);
        } else {
          break;
        }
      }
    } else {
      Object(main["n" /* updateProgress */])(finishNum, pageNum, finishImgNum, main["f" /* imgTaskQueueSet */].size);
      clearInterval(loopId);
      clearInterval(imgLoopId);
      Object(main["l" /* save */])(pageWorkerResolved, pageWorkerRejected, bookname, author, infoText, cover, pageNum);
    }
  }
}

function debug() {
  unsafeWindow.rule = setting["i" /* rule */];
  unsafeWindow.main = run_main;
  unsafeWindow.convertDomNode = main["a" /* convertDomNode */];
  unsafeWindow.ruleTest = ruleTest;
  unsafeWindow.gfetch = lib["b" /* gfetch */];
}

/***/ })
/******/ ]);
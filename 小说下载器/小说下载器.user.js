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
// @match       http://www.shuhai.com/book/*.htm
// @match       http://mm.shuhai.com/book/*.htm
// @match       http://bianshenbaihe.szalsaf.com/txt/*/index.html
// @match       https://www.biquge.tw/*/
// @match       https://www.uukanshu.com/b/*/
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
// @connect     www.shuhai.com
// @connect     img.uukanshu.com
// @require     https://cdn.jsdelivr.net/npm/file-saver@2.0.2/dist/FileSaver.min.js
// @require     https://cdn.jsdelivr.net/npm/jszip@3.2.1/dist/jszip.min.js
// @require     https://cdn.jsdelivr.net/npm/crypto-js@4.0.0/crypto-js.min.js
// @run-at      document-end
// @version     2.0.7.1
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
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return crossPage; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return gfetch; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return includeLatestChapter; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "e", function() { return rm; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "f", function() { return sleep; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return convertDomNode; });
/* harmony import */ var _main__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
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

function convertDomNode(node) {
  let txtOut = "";
  let htmlOut = document.createElement("div");
  let brc = 0;
  [txtOut, htmlOut, brc] = Object(_main__WEBPACK_IMPORTED_MODULE_0__[/* walker */ "n"])(null, node.childNodes[0], node, brc, txtOut, htmlOut);
  txtOut = txtOut.trim();
  return [txtOut, htmlOut];
}



/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return downloading; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "l", function() { return setDownloadingTrue; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "h", function() { return nowWorking; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "i", function() { return nowWorkingInc; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "j", function() { return pageWorker; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "k", function() { return save; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "m", function() { return updateProgress; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return getMetadate; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return genPageTaskQueue; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return imgDownLoop; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "g", function() { return imgWorkerResolved; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "f", function() { return imgWorkerRejected; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "e", function() { return imgTaskQueueSet; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "n", function() { return walker; });
/* harmony import */ var _lib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(0);
/* harmony import */ var _setting__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2);
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
  document.querySelector("#novel-downloader > img").src = _setting__WEBPACK_IMPORTED_MODULE_1__[/* icon0 */ "d"];
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

  if (_setting__WEBPACK_IMPORTED_MODULE_1__[/* charset */ "b"] === undefined) {
    if (_setting__WEBPACK_IMPORTED_MODULE_1__[/* CORS */ "a"]) {
      text = Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* gfetch */ "c"])(url).then(response => {
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
    if (_setting__WEBPACK_IMPORTED_MODULE_1__[/* CORS */ "a"]) {
      text = Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* gfetch */ "c"])(url, {
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
        let decoder = new TextDecoder(_setting__WEBPACK_IMPORTED_MODULE_1__[/* charset */ "b"]);
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
        let decoder = new TextDecoder(_setting__WEBPACK_IMPORTED_MODULE_1__[/* charset */ "b"]);
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

    if (retry > _setting__WEBPACK_IMPORTED_MODULE_1__[/* maxRetryTimes */ "h"]) {
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

  Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* rm */ "e"])('[style*="display:none"]', true, content);
  Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* rm */ "e"])('[style*="display: none"]', true, content);
  let txtOut;
  let htmlOut;
  [txtOut, htmlOut] = Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* convertDomNode */ "a"])(content);
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
  for (let i = imgNowWorking; i < _setting__WEBPACK_IMPORTED_MODULE_1__[/* maxImgConcurrency */ "g"]; i++) {
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

      if (newRetry > _setting__WEBPACK_IMPORTED_MODULE_1__[/* maxImgConcurrency */ "g"]) {
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
      Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* gfetch */ "c"])(url, {
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
        Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* gfetch */ "c"])(url, {
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
/* harmony import */ var _rules__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);

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
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return rules; });
/* harmony import */ var _lib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(0);
/* eslint-disable no-eval */

let rules = new Map([["www.yruan.com", {
  bookname() {
    return document.querySelector("#info > h1:nth-child(1)").innerText.trim();
  },

  author() {
    return document.querySelector("#info > p:nth-child(2)").innerText.replace(/作\s+者:/, "").trim();
  },

  intro() {
    return Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* convertDomNode */ "a"])(document.querySelector("#intro > p"))[0];
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
    return Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* crossPage */ "b"])(indexUrl, "convertDomNode(doc.querySelector('#bookIntro'))[0]");
  },

  linkList() {
    return document.querySelectorAll("dd.col-md-4 > a");
  },

  coverUrl: async () => {
    const indexUrl = document.location.href.replace(/\/list.html$/, ".html");
    return Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* crossPage */ "b"])(indexUrl, "doc.querySelector('.panel-body img').getAttribute('data-original')");
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
    return Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* convertDomNode */ "a"])(iNode)[0];
  },

  linkList() {
    return Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* includeLatestChapter */ "d"])(".listmain > dl:nth-child(1)");
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
    return Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* convertDomNode */ "a"])(document.querySelector("#intro"))[0];
  },

  linkList() {
    return Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* includeLatestChapter */ "d"])("#list > dl");
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
    return Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* crossPage */ "b"])(indexUrl, "convertDomNode(doc.querySelector('.wright .Text'))[0]", charset);
  },

  linkList() {
    return Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* includeLatestChapter */ "d"])(".book");
  },

  coverUrl: async () => {
    const indexUrl = document.location.href.replace(/xiaoshuo\/\d+\//, "");
    const charset = "GBK";
    return Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* crossPage */ "b"])(indexUrl, "doc.querySelector('div.bortable.wleft > img').src", charset);
  },
  chapterName: function chapterName(doc) {
    return doc.querySelector("h2").innerText.trim();
  },
  content: function content(doc) {
    let content = doc.querySelector(".Text");
    Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* rm */ "e"])(".Text > a:nth-child(1)", false, content);
    Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* rm */ "e"])('.Text > font[color="#F00"]', false, content);
    Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* rm */ "e"])("strong.top_book", false, content);
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
    return Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* convertDomNode */ "a"])(document.querySelector(".intro"))[0];
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
    Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* rm */ "e"])("h2", true, content);
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
    return Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* convertDomNode */ "a"])(document.querySelector("#intro"))[0];
  },

  linkList() {
    return Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* includeLatestChapter */ "d"])("#list > dl:nth-child(1)");
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
    return Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* convertDomNode */ "a"])(document.querySelector("#intro"))[0];
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
    Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* rm */ "e"])(".book_keywords");
    Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* rm */ "e"])("script", true);
    Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* rm */ "e"])("#cambrian0");
    return Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* convertDomNode */ "a"])(intro)[0];
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
    Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* rm */ "e"])("p:last-child", false, content);
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
    return Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* convertDomNode */ "a"])(document.querySelector(".book-info-detail .book-intro"))[0];
  },

  linkList: async () => {
    const getLiLength = () => document.querySelectorAll("#j-catalogWrap li").length;

    const getlinkList = () => document.querySelectorAll('.volume-wrap ul.cf li a:not([href^="//vipreader"]');

    return new Promise((resolve, reject) => {
      if (getLiLength() !== 0) {
        resolve(getlinkList());
      } else {
        setTimeout(() => {
          if (getLiLength() !== 0) {
            resolve(getlinkList());
          } else {
            reject(new Error("Can't found linkList."));
          }
        }, 3000);
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
    return Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* crossPage */ "b"])(indexUrl, "convertDomNode(doc.querySelector('.book-intro-cnt .book-desc'))[0]");
  },

  linkList() {
    document.querySelectorAll(".book-chapter-list > li > a > i").forEach(i => i.parentElement.classList.add("not_download"));
    return document.querySelectorAll(".book-chapter-list > li > a:not(.not_download)");
  },

  coverUrl: async () => {
    const bookid = unsafeWindow.HB.book.book_id;
    const indexUrl = "https://www.ciweimao.com/book/" + bookid;
    return Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* crossPage */ "b"])(indexUrl, "doc.querySelector('.cover > img').src");
  },
  chapterName: function chapterName(doc) {
    Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* rm */ "e"])("h3.chapter i", false, doc);
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
        Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* rm */ "e"])("i", true, _chapter_author_say);
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
        await Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* sleep */ "f"])(17);
      }
    }

    content.innerHTML = decryptDate;
    Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* rm */ "e"])(".chapter span", true, content);

    if (_chapter_author_says.length !== 0) {
      content.appendChild(div_chapter_author_say);
    }

    return content;

    async function chapterDecrypt(chapter_id, refererUrl) {
      const rootPath = "https://www.ciweimao.com/";
      const access_key_url = rootPath + "chapter/ajax_get_session_code";
      const chapter_content_url = rootPath + "chapter/get_book_chapter_detail_info";
      console.log("\u8BF7\u6C42 ".concat(access_key_url, " Referer ").concat(refererUrl));
      const access_key_obj = await Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* gfetch */ "c"])(access_key_url, {
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
      const chapter_content_obj = await Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* gfetch */ "c"])(chapter_content_url, {
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
    Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* rm */ "e"])("img", true, intro);
    return Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* convertDomNode */ "a"])(intro)[0];
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
    Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* rm */ "e"])("div:first-child", false, content);
    Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* rm */ "e"])('div[style="display:none"]', true, content);
    Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* rm */ "e"])("#favoriteshow_3", false, content);
    Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* rm */ "e"])('div[align="right"]', true, content);
    Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* rm */ "e"])('div[style="clear: both;"]', true, content);
    Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* rm */ "e"])('div[style="width:710px;height:70px;float:right;"]', true, content);
    Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* rm */ "e"])("div.noveltext div.readsmall  > hr", true, content);
    Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* rm */ "e"])("div:first-child", false, content);
    return content;
  },
  charset: "GB18030"
}], ["book.sfacg.com", {
  bookname() {
    return document.querySelector("h1.story-title").innerText.trim();
  },

  author: async () => {
    const indexUrl = document.location.href.replace("/MainIndex/", "");
    return Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* crossPage */ "b"])(indexUrl, "doc.querySelector('.author-name').innerText.trim()");
  },
  intro: async () => {
    const indexUrl = document.location.href.replace("/MainIndex/", "");
    return Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* crossPage */ "b"])(indexUrl, "convertDomNode(doc.querySelector('.introduce'))[0]");
  },

  linkList() {
    return document.querySelectorAll('.catalog-list li a:not([href^="/vip"])');
  },

  coverUrl: async () => {
    const indexUrl = document.location.href.replace("/MainIndex/", "");
    return Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* crossPage */ "b"])(indexUrl, "doc.querySelector('#hasTicket div.pic img').src");
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
    Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* rm */ "e"])('a[href^="http://down.gebiqu.com"]', false, intro);
    return Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* convertDomNode */ "a"])(intro)[0];
  },

  linkList() {
    return Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* includeLatestChapter */ "d"])("#list > dl:nth-child(1)");
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
    return Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* crossPage */ "b"])(indexUrl, "doc.querySelector('article.info > p.detail.pt20 > i:nth-child(1) > a').innerText.trim()");
  },
  intro: async () => {
    const indexUrl = document.location.href.replace("/book", "/info");
    return Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* crossPage */ "b"])(indexUrl, "(() => {\n              let intro = doc.querySelector(\"article.info > p.desc\");\n              rm('b',false,intro);\n              return convertDomNode(intro)[0];\n            })()");
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
    return Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* crossPage */ "b"])(indexUrl, "doc.querySelector('article.info > div.cover > img').src");
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
    return Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* crossPage */ "b"])(indexUrl, "convertDomNode(doc.querySelector('div.book-info > div.book-dec'))[0]");
  },

  linkList() {
    return document.querySelectorAll(".chapter-list li:not(.vip) a");
  },

  coverUrl: async () => {
    const indexUrl = document.location.href.replace("/showchapter/", "/book/");
    return Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* crossPage */ "b"])(indexUrl, "doc.querySelector('div.book-img > img').src");
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
    return Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* crossPage */ "b"])(indexUrl, "convertDomNode(doc.querySelector('#bookInfo p.intro > a'))[0]");
  },

  linkList() {
    document.querySelectorAll("dl.Volume > dd > a > span.vip").forEach(span => span.parentElement.classList.add("not_download"));
    return document.querySelectorAll("dl.Volume > dd > a:not(.not_download)");
  },

  coverUrl: async () => {
    const indexUrl = document.location.href.replace("/list/", "/book/");
    return Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* crossPage */ "b"])(indexUrl, "doc.querySelector('#bookCover img.book').src.replace('http://','https://')");
  },
  chapterName: function chapterName(doc) {
    return doc.querySelector("#readArea > div.readAreaBox.content > h1").innerText.trim();
  },
  content: function content(doc) {
    let content = doc.querySelector("#readArea > div.readAreaBox.content > div.p");
    Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* rm */ "e"])('p.copy', false, content);
    Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* rm */ "e"])('#banner_content', false, content);
    Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* rm */ "e"])('div.qrcode', false, content);
    Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* rm */ "e"])('div.chapter_text_ad', false, content);
    return content;
  }
}], ["www.shuhai.com", {
  bookname() {
    return document.querySelector("div.book-info-bookname > span:nth-child(1)").innerText.trim();
  },

  author() {
    return document.querySelector("div.book-info-bookname > span:nth-child(2)").innerText.replace("作者: ", "").trim();
  },

  intro() {
    let intro = document.querySelector("div.book-info-bookintro") || document.querySelector("div.book-info-bookintro-all");
    return Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* convertDomNode */ "a"])(intro)[0];
  },

  linkList: async () => {
    const getLinkList = () => {
      document.querySelectorAll("#muluid div.chapter-item > span.vip").forEach(span => span.parentElement.classList.add("not_download"));
      return document.querySelectorAll("#muluid div.chapter-item:not(.not_download) > a");
    };

    return new Promise((resolve, reject) => {
      if (getLinkList().length !== 0) {
        resolve(getLinkList());
      } else {
        setTimeout(() => {
          if (getLinkList().length !== 0) {
            resolve(getLinkList());
          } else {
            reject(new Error("Can't found linkList."));
          }
        }, 3000);
      }
    });
  },

  coverUrl() {
    return document.querySelector(".book-cover-wrapper > img").getAttribute("data-original");
  },

  chapterName: function chapterName(doc) {
    return doc.querySelector("div.chapter-name").innerText.replace("正文 ", "").trim();
  },
  content: function content(doc) {
    let content = doc.querySelector("#reader-content > div:nth-child(1)");
    Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* rm */ "e"])("div.chaper-info", false, content);
    return content;
  }
}], ["bianshenbaihe.szalsaf.com", {
  bookname() {
    return document.querySelector(".book > h1:nth-child(2)").innerText.replace("全文免费阅读", "").trim();
  },

  author() {
    return document.querySelector(".small > span:nth-child(1) > a:nth-child(1)").innerText.trim();
  },

  intro: async () => {
    const indexUrl = document.location.href.replace(/\d+\/(\d+\/index\.html)$/, "$1").replace("/index", "");
    return Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* crossPage */ "b"])(indexUrl, "doc.querySelector('.con').innerText.trim()", "GBK");
  },

  linkList() {
    return document.querySelectorAll(".list > ul:nth-child(2) > li > a");
  },

  coverUrl: async () => {
    const indexUrl = document.location.href.replace(/\d+\/(\d+\/index\.html)$/, "$1").replace("/index", "");
    return Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* crossPage */ "b"])(indexUrl, "doc.querySelector('#BookImage').src", "GBK");
  },
  chapterName: function chapterName(doc) {
    let chapterNameDom = doc.querySelector("#changebgcolor > dl > dt > h1");
    Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* rm */ "e"])("a", false, chapterNameDom);
    Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* rm */ "e"])("span", false, chapterNameDom);
    return chapterNameDom.innerText.replace("《》", "").trim();
  },
  content: async function content(doc) {
    const url = doc.baseURI;
    let contents = [];
    let tmpContent;
    let nextPageObj;
    [tmpContent, nextPageObj] = parser(doc);
    contents.push(tmpContent);

    while (nextPageObj.existNextPage) {
      [tmpContent, nextPageObj] = await Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* crossPage */ "b"])(nextPageObj.nextPageUrl, "(".concat(parser.toString(), ")(doc)"), "GBK");
      contents.push(tmpContent);
    }

    let finContent = document.createElement("div");

    for (let c of contents) {
      finContent.innerHTML = finContent.innerHTML + c.innerHTML.trim();
    }

    return finContent;

    function parser(doc) {
      let content = doc.querySelector("#changebgcolor > dl > dd");
      const nextPage = doc.querySelector(".page > ul:nth-child(1) > li:nth-child(3) > a:nth-child(1)");
      let nextPageObj;

      if (nextPage.href.match(/[\d_]+\.html$/) && nextPage.href.match(/[\d_]+\.html$/)[0].includes("_")) {
        nextPageObj = {
          existNextPage: true,
          nextPageUrl: nextPage.href
        };
      } else {
        nextPageObj = {
          existNextPage: false,
          nextPageUrl: null
        };
      }

      for (let s of [".font", "div[style]", "div.page", "div#wc2"]) {
        content.querySelectorAll(s).length !== 0 && content.querySelectorAll(s).forEach(e => e.remove());
      }

      content.innerHTML = content.innerHTML.replace("\u3010<a href=\"http://bianshenbaihe.qinliugan.org\">\u53D8\u8EAB\u767E\u5408\u5C0F\u8BF4\u7F51</a>TXT\u65E0\u5F39\u7A97\u9605\u8BFB\u63A8\u8350\uFF01\u3011", "");
      return [content, nextPageObj];
    }
  },
  charset: "GBK"
}], ["www.biquge.tw", {
  bookname() {
    return document.querySelector("#info > h1").innerText.trim();
  },

  author() {
    return document.querySelector("#info > p:nth-child(2)").innerText.replace(/作\s+者：/, "").trim();
  },

  intro() {
    return Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* convertDomNode */ "a"])(document.querySelector("#intro"))[0];
  },

  linkList() {
    return Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* includeLatestChapter */ "d"])("#list > dl:nth-child(1)");
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
}], ["www.uukanshu.com", {
  bookname() {
    return document.querySelector("dd.jieshao_content > h1 > a").innerText.replace("最新章节", "").trim();
  },

  author() {
    return document.querySelector("dd.jieshao_content > h2 > a").innerText.trim();
  },

  intro() {
    let intro = document.querySelector("dd.jieshao_content > h3");
    intro.innerHTML = intro.innerHTML.replace(/^.+简介：\s+www.uukanshu.com\s+/, "").replace(/\s+https:\/\/www.uukanshu.com/, "").replace(/－+/, "");
    return Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* convertDomNode */ "a"])(intro)[0];
  },

  linkList() {
    let button = document.querySelector('span[onclick="javascript:reverse(this);"]');
    const reverse = unsafeWindow.reverse;

    if (button.innerText === "顺序排列") {
      reverse(button);
    }

    return document.querySelectorAll("#chapterList li > a");
  },

  coverUrl() {
    return document.querySelector("a.bookImg > img").src;
  },

  chapterName: function chapterName(doc) {
    return doc.querySelector("#timu").innerText.trim();
  },
  content: function content(doc) {
    let content = doc.querySelector("#contentbox");
    Object(_lib__WEBPACK_IMPORTED_MODULE_0__[/* rm */ "e"])(".ad_content", true, content);
    let contentReplace = [/[ＵｕUu]+看书\s*[wｗ]+.[ＵｕUu]+[kｋ][aａ][nｎ][ｓs][hｈ][ＵｕUu].[nｎ][eｅ][tｔ]/g, /[ＵｕUu]+看书\s*[wｗ]+.[ＵｕUu]+[kｋ][aａ][nｎ][ｓs][hｈ][ＵｕUu].[cＣｃ][oＯｏ][mＭｍ]/g, /[UＵ]*看书[（\\(].*?[）\\)]文字首发。/, "请记住本书首发域名：。", "笔趣阁手机版阅读网址：", "小说网手机版阅读网址：", "https://", "http://"];

    for (let r of contentReplace) {
      content.innerHTML = content.innerHTML.replace(r, "");
    }

    return content;
  },
  charset: "GBK"
}]]);
[{
  "mainHost": "book.zongheng.com",
  "alias": ["huayu.zongheng.com"],
  "modify": {
    CORS: true
  }
}, {
  "mainHost": "www.shuhai.com",
  "alias": ["mm.shuhai.com"],
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
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

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
  [bookname, author, intro, linkList, cover, sourceUrl, infoText] = await Object(main["c" /* getMetadate */])(rule);
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
        Object(main["j" /* pageWorker */])(pageTask, pageWorkerResolved, pageWorkerRejected, pageTaskQueue, rule);
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
  console.log("\u5F00\u59CB\u8F7D\u5165\u5C0F\u8BF4\u4E0B\u8F7D\u5668\u2026\u2026\n\u5F53\u524D\u811A\u672C\u7BA1\u7406\u5668\uFF1A".concat(GM_info.scriptHandler, "\n\u5F53\u524D\u811A\u672C\u7BA1\u7406\u5668\u7248\u672C\uFF1A").concat(GM_info.version, "\n\u5F53\u524D\u811A\u672C\u7248\u672C\uFF1A").concat(GM_info.script.version, "\n\u5F53\u524D\u6D4F\u89C8\u5668\uFF1A").concat(navigator.userAgent, "\n\u662F\u5426\u5F00\u542F\u8C03\u8BD5\u6A21\u5F0F\uFF1A").concat(setting["c" /* enableDebug */]));

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
    if (main["a" /* downloading */]) {
      alert("正在下载中，请耐心等待……");
    } else {
      Object(main["l" /* setDownloadingTrue */])();
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
  [bookname, author, intro, linkList, cover, sourceUrl, infoText] = await Object(main["c" /* getMetadate */])(rule);
  const pageNum = linkList.length;
  let pageTaskQueue = Object(main["b" /* genPageTaskQueue */])(linkList);
  let pageWorkerResolved = new Map();
  let pageWorkerRejected = new Map();
  let loopId = setInterval(loop, 300);
  let imgLoopId = setInterval(main["d" /* imgDownLoop */], 800);

  function loop() {
    let finishNum = pageWorkerResolved.size + pageWorkerRejected.size;
    let finishImgNum = main["g" /* imgWorkerResolved */].size + main["f" /* imgWorkerRejected */].size;

    if (finishNum !== pageNum || finishImgNum !== main["e" /* imgTaskQueueSet */].size) {
      Object(main["m" /* updateProgress */])(finishNum, pageNum, finishImgNum, main["e" /* imgTaskQueueSet */].size);

      for (let i = main["h" /* nowWorking */]; i < setting["f" /* maxConcurrency */]; i++) {
        const pageTask = pageTaskQueue.pop();

        if (pageTask) {
          Object(main["i" /* nowWorkingInc */])();
          console.log("\u5F00\u59CB\u4E0B\u8F7D\uFF1A".concat(pageTask.id, "\t").concat(pageTask.dom.innerText, "\t").concat(pageTask.url, "\t\u7B2C").concat(pageTask.retry, "\u6B21\u91CD\u8BD5"));
          Object(main["j" /* pageWorker */])(pageTask, pageWorkerResolved, pageWorkerRejected, pageTaskQueue, rule);
        } else {
          break;
        }
      }
    } else {
      Object(main["m" /* updateProgress */])(finishNum, pageNum, finishImgNum, main["e" /* imgTaskQueueSet */].size);
      clearInterval(loopId);
      clearInterval(imgLoopId);
      Object(main["k" /* save */])(pageWorkerResolved, pageWorkerRejected, bookname, author, infoText, cover, pageNum);
    }
  }
}

function debug() {
  unsafeWindow.rule = setting["i" /* rule */];
  unsafeWindow.main = run_main;
  unsafeWindow.convertDomNode = lib["a" /* convertDomNode */];
  unsafeWindow.ruleTest = ruleTest;
  unsafeWindow.gfetch = lib["c" /* gfetch */];
}

/***/ })
/******/ ]);
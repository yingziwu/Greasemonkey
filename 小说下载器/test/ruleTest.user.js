// ==UserScript==
// @name        小说下载器测试脚本
// @namespace   https://blog.bgme.me
// @match       https://greasyfork.org/*/scripts/406070-%E5%B0%8F%E8%AF%B4%E4%B8%8B%E8%BD%BD%E5%99%A8
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
// @grant       unsafeWindow
// @grant       GM_openInTab
// @grant       GM_registerMenuCommand
// @run-at      document-end
// @version     1.10.0
// @author      bgme
// @description 测试小说下载器。
// ==/UserScript==

const urls = new Map([
  ["www.yruan.com", "http://www.yruan.com/article/27603.html"],
  [
    "www.jingcaiyuedu.com",
    "https://www.jingcaiyuedu.com/novel/uVsXR/list.html",
  ],
  ["www.shuquge.com", "http://www.shuquge.com/txt/78708/index.html"],
  ["www.dingdiann.com", "https://www.dingdiann.com/ddk253007/"],
  ["www.fpzw.com", "https://www.fpzw.com/xiaoshuo/51/51578/"],
  ["www.hetushu.com", "https://www.hetushu.com/book/5/index.html"],
  ["www.biquwo.org", "http://www.biquwo.org/bqw51059/"],
  ["www.xkzw.org", "http://www.xkzw.org/xkzw66086/"],
  ["www.shouda8.com", "http://www.shouda8.com/11342/"],
  ["book.qidian.com", "https://book.qidian.com/info/1010939791"],
  [
    "www.ciweimao.com",
    "https://www.ciweimao.com/chapter-list/100169403/book_detail",
  ],
  ["www.jjwxc.net", "http://www.jjwxc.net/onebook.php?novelid=1319256"],
  ["book.sfacg.com", "http://book.sfacg.com/Novel/326107/MainIndex/"],
  ["www.gebiqu.com", "http://www.gebiqu.com/biquge_2181/"],
  ["www.meegoq.com", "https://www.meegoq.com/book76557.html"],
  ["book.zongheng.com", "http://book.zongheng.com/showchapter/866183.html"],
  ["huayu.zongheng.com", "http://huayu.zongheng.com/showchapter/835758.html"],
  ["www.17k.com", "https://www.17k.com/list/3049463.html"],
  ["www.shuhai.com", "http://www.shuhai.com/book/58361.htm"],
  ["mm.shuhai.com", "http://mm.shuhai.com/book/59167.htm"],
  ["bianshenbaihe.szalsaf.com", "http://bianshenbaihe.szalsaf.com/txt/0/47/index.html"],
]);

window.addEventListener("load", function () {
  const host = document.location.host;

  if (host === "greasyfork.org") {
    GM_registerMenuCommand("Start Rule test", openTab);
  } else if (urls.has(host)) {
    setTimeout(run, 1500 + 3000 * Math.random());
  }
});

function run() {
  console.log("Start ruleTest……");
  const rule = unsafeWindow.rule;
  const main = unsafeWindow.main;
  const ruleTest = unsafeWindow.ruleTest;

  if (rule) {
    ruleTest(rule, testCallback);
  }
}

function openTab() {
  for (let url of urls.values()) {
    console.log(url);
    if (Array.isArray(url)) {
      url.forEach((u) => GM_openInTab(u));
    } else {
      GM_openInTab(url);
    }
  }
}

function testCallback(obj) {
  document.body.innerHTML = `
  <style type="text/css">
  body {
      background-color: #f0f0f2;
      margin: 0;
      padding: 0;
      font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
  }
  div.main {
      width: 600px;
      margin: 5em auto;
      padding: 2em;
      background-color: #fdfdff;
      border-radius: 0.5em;
      box-shadow: 2px 3px 7px 2px rgba(0,0,0,0.02);
  }
  a:link, a:visited {
      color: #38488f;
      text-decoration: none;
  }
  h2 {
    line-height: 130%;
    text-align: center;
    font-weight: bold;
    font-size: x-large;
    margin-top: 0.2em;
    margin-bottom: 0.3em;
  }
  p {
    text-indent: 2em;
    display: block;
    line-height: 1.3em;
    margin-top: 0.4em;
    margin-bottom: 0.4em;
  }
  pre {
    white-space: pre-wrap;
    word-wrap: break-word;
  }
  @media (max-width: 700px) {
      div.main {
          margin: 0 auto;
          width: auto;
      }
  }
  </style>
  <div class="main">
    <div><p><img src="${obj.coverImg.src}" /></p></div>
    <div><pre>${obj.infoText}</pre></div>
    <div><br/></div>
    <div><ul id="linkList"></ul></div>
    <div><br/></div>
    <hr/>
    <div><br/></div>
    <pre>${obj.pageObj.txt}</pre>
    <div><br/></div>
    <div><br/></div>
    <hr/>
    <h2>${obj.pageObj.chapterName}</h2>
    <div>${obj.pageObj.dom.innerHTML}</div>
  </div>
    `;
  let l = document.querySelector("#linkList");
  for (let link of obj.linkList) {
    let li = document.createElement("li");
    li.innerHTML = link.outerHTML;
    l.appendChild(li);
  }
}

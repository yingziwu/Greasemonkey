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
// @match       https://www.biquge.tw/*/
// @match       https://www.uukanshu.com/b/*/
// @grant       unsafeWindow
// @grant       GM_openInTab
// @grant       GM_registerMenuCommand
// @run-at      document-end
// @version     2.0.2
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
  ["www.biquge.tw", "https://www.biquge.tw/9_9376/"],
  ["www.uukanshu.com", "https://www.uukanshu.com/b/83895/"],
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
  @import url(https://fonts.googleapis.com/css?family=ZCOOL+XiaoWei);
  body {
    background-color: #f0f0f2;
    margin: 0;
    padding: 0;
    --font-family: -apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif;;
    font-size: 1rem;
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
    font-family: 'ZCOOL XiaoWei', cursive;
    padding-bottom: 0.3em;
  }
  p {
    text-indent: 2em;
    display: block;
    line-height: 1.3em;
    margin-top: 0.4em;
    margin-bottom: 0.4em;
    font-family: var(--font-family);
  }
  pre {
    white-space: pre-wrap;
    word-wrap: break-word;
    font-family: var(--font-family);
  }
  .info, .linkList, .chapter {
    padding: 2em 0;
  }
  .info {
    padding-left: 1.5em;
    padding-right: 1.5em;
  }
  .info img {
    padding: 0.8em;
  }
  .linkList ul {
    padding-left: 10em;
  }
  #toc {
    position: fixed;
    right: 5%;
    bottom: 30%;
    background-color: rgba(255,255,255,0.7);
    border-radius: 0.8em;
  }
  #toc ul {
    padding: 1.3em;
  }
  @media (max-width: 700px) {
    div.main {
        margin: 0 auto;
        width: auto;
    }
  }
  </style>
  <div class="main">
    <div class="toc" id="toc">
      <ul>
        <li><a href="#info">作品信息</a></li>
        <li><a href="#linkList">章节列表</a></li>
        <li><a href="#txt">txt文本预览</a></li>
        <li><a href="#html">HTML文本预览</a></li>
      </ul>
    </div>
    <div class="info" id="info">
      <div><img src="${obj.coverImg.src}" /></div>
      <div><pre>${obj.infoText}</pre></div>
    </div>
    <hr/>
    <div class="linkList">
      <ul id="linkList"></ul>
    </div>
    <hr/>
    <div class="chapter txt" id="txt">
      <h2>${obj.pageObj.chapterName}</h2>
      <pre>${obj.pageObj.txt}</pre>
    </div>
    <hr/>
      <div class="chapter html" id="html">
      <h2>${obj.pageObj.chapterName}</h2>
      <div>${obj.pageObj.dom.innerHTML}</div>
    </div>
  </div>
    `;
  let l = document.querySelector("#linkList");
  for (let link of obj.linkList) {
    let li = document.createElement("li");
    li.innerHTML = link.outerHTML;
    l.appendChild(li);
  }
}

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
// @grant       unsafeWindow
// @grant       GM_openInTab
// @grant       GM_registerMenuCommand
// @run-at      document-end
// @version     1.1
// @author      bgme
// @description 测试小说下载器。
// ==/UserScript==

const urls = new Map([
    ["www.yruan.com", "http://www.yruan.com/article/27603.html"],
    ["www.jingcaiyuedu.com", "https://www.jingcaiyuedu.com/novel/uVsXR/list.html"],
    ["www.shuquge.com", "http://www.shuquge.com/txt/78708/index.html"],
    ["www.dingdiann.com", "https://www.dingdiann.com/ddk253007/"],
    ["www.fpzw.com", "https://www.fpzw.com/xiaoshuo/51/51578/"],
    ["www.hetushu.com", "https://www.hetushu.com/book/5/index.html"],
    ["www.biquwo.org", "http://www.biquwo.org/bqw51059/"],
    ["www.xkzw.org", "http://www.xkzw.org/xkzw66086/"],
    ["www.shouda8.com", "http://www.shouda8.com/11342/"],
    ["book.qidian.com", "https://book.qidian.com/info/1010939791"],
])

window.addEventListener('load', function() {
    const host = document.location.host;

    if (host == "greasyfork.org") {
        GM_registerMenuCommand('Start Rule test', openTab)
    } else if (urls.has(host)) {
        const rule = unsafeWindow.rule;
        const main = unsafeWindow.main;
        const ruleTest = unsafeWindow.ruleTest;
        setTimeout(ruleTest, 10000 * Math.random(), rule, testCallback);
    }
})


function openTab() {
    for (let url of urls.values()) {
        console.log(url);
        GM_openInTab(url);
    }
}

function testCallback(obj) {
    document.body.innerHTML = `
    <div><p><img src="${obj.coverImg.src}" /></p></div>
    <div><pre>${obj.infoText}</pre></div>
    <div><br/></div>
    <div><ul id="linkList"></ul></div>
    <div><br/></div>
    <hr/>
    <pre>${obj.pageObj.txt}</pre>
    <div><br/></div>
    <hr/>
    <div>${obj.pageObj.dom.innerHTML}</div>
    `
    let l = document.querySelector('#linkList');
    for (let link of obj.linkList) {
        let li = document.createElement('li');
        li.innerHTML = link.outerHTML;
        l.appendChild(li);
    }
}
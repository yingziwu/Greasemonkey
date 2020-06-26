// ==UserScript==
// @name        小说下载器
// @namespace   https://blog.bgme.me
// @match       http://www.yruan.com/article/*.html
// @match       https://www.jingcaiyuedu.com/novel/*/list.html
// @match       http://www.shuquge.com/txt/*/index.html
// @grant       unsafeWindow
// @require     https://cdn.jsdelivr.net/npm/file-saver@2.0.2/dist/FileSaver.min.js
// @require     https://cdn.jsdelivr.net/npm/jszip@3.2.1/dist/jszip.min.js
// @run-at      document-end
// @version     1.0.2
// @author      bgme
// @description 一个从笔趣阁这样的小说网站下载小说的通用脚本
// @supportURL  https://github.com/yingziwu/Greasemonkey/issues
// @icon        -
// @license     AGPL-3.0-or-later
// ==/UserScript==

"use strict";

let rules = new Map([
    ["www.yruan.com", {
        novelName() { return document.querySelector('#info > h1:nth-child(1)').innerText.trim() },
        author() { return document.querySelector('#info > p:nth-child(2)').innerText.replace(/作\s+者:/, '').trim() },
        intro() { return walk(document.querySelector('#intro > p').childNodes[0], null, 0, '', document.createElement('div'))[0].trim() },
        linkList() { return document.querySelectorAll('div.box_con div#list dl dd a') },
        chapter_name: function(h) { return h.querySelector('.bookname > h1:nth-child(1)').innerText.trim() },
        content: function(h) { return h.querySelector('#content') },
    }],
    ["www.jingcaiyuedu.com", {
        novelName() { return document.querySelector('div.row.text-center.mb10 > h1:nth-child(1)').innerText.trim() },
        author() { return document.querySelector('div.row.text-center.mb10 a[href^="/novel/"]').innerText.trim() },
        intro: (async() => {
            const indexUrl = document.location.href.replace(/\/list.html$/, '.html');
            let intro = await fetch(indexUrl)
                .then(response => response.text())
                .then(text => {
                    const h = (new DOMParser()).parseFromString(text, 'text/html');
                    const introNode = h.querySelector('#bookIntro');
                    let intro = walk(introNode.childNodes[0], null, 0, '', document.createElement('div'))[0].trim();
                    return intro
                });
            return intro
        }),
        linkList() { return document.querySelectorAll('dd.col-md-4 > a') },
        chapter_name: function(h) { return h.querySelector('h1.readTitle').innerText.trim() },
        content: function(h) {
            let c = h.querySelector('#htmlContent');
            let ad = c.querySelector('p:nth-child(1)');
            if (ad.innerText.includes('精彩小说网')) { ad.remove() }
            return c
        },
    }],
    ["www.shuquge.com", {
        novelName() { return document.querySelector('.info > h2').innerText.trim() },
        author() { return document.querySelector('.small > span:nth-child(1)').innerText.replace(/作者：/, '').trim() },
        intro() {
            let iNode = document.querySelector('.intro');
            iNode.innerHTML = iNode.innerHTML.replace(/推荐地址：http:\/\/www.shuquge.com\/txt\/\d+\/index\.html/, '');
            let intro = walk(iNode.childNodes[0], null, 0, '', document.createElement('div'))[0].trim()
            return intro
        },
        linkList() {
            let dl = document.querySelector('.listmain > dl:nth-child(1)');
            let rDt = dl.querySelector('dt:nth-child(1)')
            if (rDt.innerText.includes('最新章节')) {
                let p = null;
                let n = rDt;
                while (true) {
                    if (n.nodeName == 'DD') {
                        p = n;
                        n = n.nextSibling;
                        p.classList.add('not_download')
                    } else if (n.nodeName == 'DT' && !n.innerText.includes('最新章节')) {
                        break;
                    } else {
                        p = n;
                        n = n.nextSibling;
                    }
                }
            }
            return dl.querySelectorAll('dd:not(.not_download) > a')
        },
        chapter_name: function(h) { return h.querySelector('.content > h1:nth-child(1)').innerText.trim() },
        content: function(h) {
            let content = h.querySelector('#content');
            content.innerHTML = content.innerHTML.replace('请记住本书首发域名：www.shuquge.com。书趣阁_笔趣阁手机版阅读网址：m.shuquge.com', '').replace(/http:\/\/www.shuquge.com\/txt\/\d+\/\d+\.html/, '');
            return content
        },
    }],
]);
const host = document.location.host;
const rule = rules.get(host);
const icon0 = 'data:image/png;base64,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';
const icon1 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAAAA3NCSVQICAjb4U/gAAAACXBIWXMAAANSAAADUgEQACRKAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAUdQTFRF////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAiYSOVQAAAGx0Uk5TAAECAwQFCAkKCwwNDhETFRkaHB0fICMkKCwwNTg5PD1AQUZKTk9QV1tcX2BjZGhtb3B2eHl6fX6AgYKHi4+QlJicnaChpamur7C3uru+v8LEyMzP0NXZ3N3f4OTn6uvt7/Hy8/T2+Pn6/P3+VI4wmgAAAyxJREFUeNrtmVdT4zAUhTFs6BB6Cb13WLpooffeQjW9hMT//3mVJbsT4li6ahbD6D4y5p5vzrGuFDkry5QpznLSygAYAANgAAyAATAABsAAGAADYAAMgAEwAD8XADlChTQTIM0eIM0pIM3vAdL8JiLNawFpXo1I8zxAmicS0jwTkeapjDTvC8r0gQQK9UEESvUBBIr1qQTK9SkESvR/wQkQ5V95KhS+Q1AC14N34ZCYenD0LGNjoH7ij2ejQV71QPd2lNQapI8rut0d4LMe0Bz4CHMUSetZCGgPMESRYj1cAGARMIqv1kMlgK8pNQq39TARBB8VhCgyW59S414y6frjxDYeUYTCNnnKHw4WeUxl1/wtGjwk97LToyBan6irmRrPfSHj/K+ZuSJ3TImCav3zaqvlvTN57T9W6+ozJAqa9fH9/gLS3kja/wr69+PUKMhGXUxVie0mVVMXZAUSwONys4ztvHn5kQcgttubJ+tEkde7G2MEiExUyD3VVExE4AAPS40qTlaNSw8QgI+dnlxVx8ncnp0PCsD5WJnaI23Z2Lk3wP1igx83jA2L998V4G8E5WrVy0kRfIeXMLkMm1TIN8GWYXIQTVbKVa+cjLCO4r2+fFnq+X17MZ7N6GmlxRJXt1pWnjh3Q1yX09Vi8tXTl/zb8eeB5GCgkFe9cOAgTutPBcD1stbGEYXVtvYCaA4BwHU9W8smXzt7DesMBMB1NFQMVS8eOgK3hQM4zut6ezZdPbt9/ZWhKQsArpu5OrJ83dwNW0dGAFzHwyVe6iXDx8zt2AEc522jI8etntOx8cbRjAcA1+18/Vf5+vlbvk6cALhORkr/qZeOnHC34QdwnPfNTvzjLtC5+S7QRAQg8eNuYcEW6yAIIF4GQD8A9W5IZX3eFQW6tqI61KNbXf9vy4K/T/2Wd90X+hqFnfHG1K8oUq1nuqpVZD3zjal865nvjBVY74pC/qpg/nYkNQqb6+uZrChYrFcQhcBnOwlR2KIfLoUGlIj1EgaUsPVCUcixnjcKmdZzRCHdeqYo1FgPjUKl9YAolFtPjMIf672i8NP6DFH4br2pH1d/AAm28mJJn9pPAAAAAElFTkSuQmCC';
const enableDebug = true;
let downloading = false;


window.addEventListener('DOMContentLoaded', function() {
    if (rule.linkList()) { addButton() }
})


function addButton() {
    let button = document.createElement('button');
    button.className = 'icon_pc';
    button.style.cssText = `position: fixed;
                        top: 15%;
                        right: 5%;
                        z-index: 99;
                        border-style: none;
                        text-align:center;
                        vertical-align:baseline;
                        background-color: rgba(128, 128, 128, 0.2);
                        padding: 5px;
                        border-radius: 12px;`;

    let img = document.createElement('img');
    img.src = icon0;
    img.style.cssText = 'height: 2em;';

    button.onclick = function() {
        if (downloading) {
            alert('正在下载中，请耐心等待……');
        } else {
            downloading = true;
            img.src = icon1;
            console.log('Start download……')
            run(rule).then(() => {
                downloading = false;
                img.src = icon0;
            }).catch(error => {
                console.error(error);
                downloading = false;
                img.src = icon0;
            })
        }
    }
    button.appendChild(img);
    document.body.appendChild(button);
    console.log('Add Button……');
}

async function run(rule) {
    let novelName, author, intro;
    rule.novelName[Symbol.toStringTag] == 'AsyncFunction' ? rule.novelName().then(result => novelName = result) : novelName = rule.novelName();
    rule.author[Symbol.toStringTag] == 'AsyncFunction' ? rule.author().then(result => author = result) : author = rule.author();
    rule.intro[Symbol.toStringTag] == 'AsyncFunction' ? rule.intro().then(result => intro = result) : intro = rule.intro();

    const size = Symbol('size');
    let linkList = rule.linkList();
    return await getChapters(linkList)
        .then(chapters => {
            chapters[size] = 0;
            for (let i in chapters) {
                let v = chapters[i];
                let [txtOut, htmlOut] = clearHtml(v.content);
                chapters[i]['txt'] = txtOut;
                chapters[i]['html'] = htmlOut;
                if (chapters.hasOwnProperty(i)) {
                    chapters[size]++;
                }
            }
            return chapters
        })
        .then(chapters => {
            console.log(chapters);
            console.log('保存中……');
            const infoText = `题名：${novelName}\n作者：${author}\n简介：${intro}\n来源地址：${document.location.href}`;
            let outputTxt = infoText;
            let outputHtmlZip = new JSZip;
            for (let i in chapters) {
                let v = chapters[i];

                outputTxt = outputTxt + '\n\n\n\n' + i + '. ' + v.chapter_name + '\n' + v.txt.trim();

                const htmlFileName = 'Chapter' + '0'.repeat(chapters[size].toString().length - i.toString().length) + i.toString() + '.html';
                const htmlFile = genHtml(v);
                outputHtmlZip.file(htmlFileName, htmlFile);
            }
            let baseName = `[${author}]${novelName}`;
            saveAs((new Blob([outputTxt], { type: "text/plain;charset=utf-8" })), baseName + '.txt');
            outputHtmlZip.file('info.txt', (new Blob([infoText], { type: "text/plain;charset=utf-8" })));
            outputHtmlZip.generateAsync({ type: "blob" })
                .then((blob) => { saveAs(blob, baseName + '.zip'); })
                .catch(err => console.log('saveZip: ' + err));
        })

    async function getChapters(linkList) {
        let chapters = {};
        for (let i = 0; i < linkList.length; i++) {
            const href = linkList[i].href;
            await fetch(href)
                .then(response => {
                    console.log(`正在下载：${i}\t${href}`);
                    return response.text()
                })
                .then(text => {
                    const h = (new DOMParser()).parseFromString(text, 'text/html');
                    return h
                })
                .then(h => {
                    const chapter_name = rule.chapter_name(h);
                    let content = rule.content(h);
                    chapters[i] = { 'chapter_name': chapter_name, 'content': content }
                })
        }
        return chapters
    }

    function clearHtml(content) {
        let txtOut = '';
        let htmlOut = document.createElement('div');
        const firstNode = content.childNodes[0];
        [txtOut, htmlOut] = walk(firstNode, null, 0, txtOut, htmlOut);
        return [txtOut, htmlOut]
    }

    function genHtml(v) {
        let htmlFile = (new DOMParser()).parseFromString(
            `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${v.chapter_name}</title></head><body><h2>${v.chapter_name}</h2></body></html>`,
            'text/html');
        htmlFile.querySelector('body').appendChild(v.html);
        return new Blob([htmlFile.documentElement.outerHTML], { type: "text/html; charset=UTF-8" })
    }
}

function walk(Node, preNode, brCount, txtOut, htmlOut) {
    let nodeName = Node.nodeName;
    if (nodeName === '#text') {
        let nodetext = Node.textContent.trim();
        if (nodetext !== "") {
            if (brCount != 0) {
                if ((Node.previousSibling && Node.previousSibling.nodeName !== 'BR') || (Node.previousSibling === null && ['P', 'DIV'].includes(Node.parentNode.nodeName))) {
                    txtOut = txtOut + '\n' + nodetext;
                } else {
                    txtOut = txtOut + nodetext;
                }
            } else {
                txtOut = txtOut + nodetext;
            }
            let p = document.createElement('p');
            p.innerText = nodetext;
            htmlOut.appendChild(p);
            brCount = 0;
        }
    } else if (nodeName === 'BR') {
        brCount++;
        const nNotBr = (Node.nextSibling && Node.nextSibling.nodeName !== 'BR');
        if (nNotBr) {
            if (brCount === 2) {
                txtOut = txtOut + '\n';
            } else if (brCount >= 3) {
                txtOut = txtOut + '\n\n';

                let p = document.createElement('p');
                p.innerHTML = '<br>';
                htmlOut.appendChild(p);
            }
        }
    } else if (['P', 'DIV'].includes(nodeName)) {
        [txtOut, htmlOut] = walk(Node.childNodes[0], null, brCount + 1, txtOut, htmlOut);
    } else if (Node.childElementCount && Node.childElementCount !== 0) {
        [txtOut, htmlOut] = walk(Node.childNodes[0], null, 0, txtOut, htmlOut);
    } else if (Node.innerText) {
        let nodetext = Node.innerText.trim();
        if (nodetext !== "") {
            txtOut = txtOut + nodetext;

            let lastNode = htmlOut.childNodes[htmlOut.childElementCount - 1];
            if (!lastNode && htmlOut.childElementCount === 0) {
                lastNode = document.createElement('p')
            }
            lastNode.innerText = lastNode.innerText + nodetext;
        }
    }

    preNode = Node;
    Node = Node.nextSibling;
    if (Node === null) {
        return [txtOut, htmlOut]
    } else {
        [txtOut, htmlOut] = walk(Node, preNode, brCount, txtOut, htmlOut);
        return [txtOut, htmlOut]
    }
}

// debug
if (enableDebug) {
    unsafeWindow.rule = rule;
    unsafeWindow.run = run;
    unsafeWindow.walk = walk;
}
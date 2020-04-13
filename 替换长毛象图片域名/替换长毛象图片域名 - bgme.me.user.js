// ==UserScript==
// @name        替换长毛象图片域名 - bgme.me
// @namespace   https://blog.bgme.me
// @match       https://bgme.bid/*
// @match       https://bgme.me/*
// @match       https://c.bgme.bid/*
// @grant       none
// @run-at      document-end
// @version     1.0
// @author      bgme
// @description 替换长毛象图片域名。针对 bgme.me 实例，将图片域名替换为 img.bgme.bid。如需用于其他实例，请自行修改 changeUrl 函数。
// @supportURL  https://github.com/yingziwu/Greasemonkey/issues
// @icon        https://bgme.me/favicon.ico
// @license     AGPL-3.0-or-later
// ==/UserScript==

'use strict';

window.addEventListener('DOMContentLoaded', function () {
    addButton();
});


function addButton() {
    let img = document.createElement('img');
    img.src = 'data:image/png;base64,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'
    img.style.cssText = 'height: 35px;	width: 25px;';

    let button = document.createElement('button');
    button.className = 'icon_pc';
    button.style.cssText = `position: fixed;
                          top: 15%;
                          right: 5%;
                          z-index: 99;
                          border-style: none;
                          text-align:center;
                          vertical-align:baseline;
                          background-color: #fafafa;
                          border-radius: 50%;`
    button.onclick = function () {
        setMutationObserver();
        button.remove()
    };
    button.appendChild(img);

    document.body.appendChild(button);

}


function setMutationObserver() {
    const targetNode1 = (document.querySelector('.columns-area__panels')) ? document.querySelector('.columns-area__panels') : document.querySelector('.columns-area');
    const targetNode2 = document.querySelector('.modal-root');
    const config = { attributes: false, childList: true, subtree: true };
    function callback(mutationsList, observer) {
        document.querySelectorAll('.columns-area .media-gallery__item-thumbnail img').forEach(item => changeSrc(item));
        document.querySelectorAll('.columns-area .video-player video').forEach(item => changeSrc(item));
        document.querySelectorAll('.columns-area .media-gallery__gifv video').forEach(item => changeSrc(item));
        document.querySelectorAll('.modal-root .image-loader img').forEach(item => changeSrc(item));
    }

    function changeSrc(item) {
        item.src = changeUrl(item.src);
        if (item.poster) {
            item.poster = changeUrl(item.poster);
        }
        if (item.srcset) {
            item.srcset = changeSrcset(item.srcset)
        }

        function changeUrl(url) {
            let src = new URL(url);
            if (src.host === 's3.us-west-1.wasabisys.com') {
                src.host = 'img.bgme.bid';
                src.pathname = src.pathname.replace('/bgme-mstdn-media', '');
                // console.log(url, src.href);
                return src.href
            } else {
                return url
            }
        }

        function changeSrcset(srcset) {
            const items = srcset.split(',');
            let results = [];
            for (let item of items) {
                let srcs = item.replace(/^\s/, '').split(' ');
                srcs[0] = changeUrl(srcs[0]);
                results.push(srcs.join(' '));
            }
            return results.join(', ')
        }
    }
    const observer = new MutationObserver(callback);
    observer.observe(targetNode1, config);
    observer.observe(targetNode2, config);
    console.log('setMutationObserver');
}
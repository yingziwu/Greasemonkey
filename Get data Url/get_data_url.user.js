// ==UserScript==
// @name        Get data url
// @namespace   https://blog.bgme.me
// @match       *://*/*
// @run-at      document-idle
// @version     1.0
// @author      bgme
// @description Get data url
// @supportURL  https://github.com/yingziwu/Greasemonkey/issues
// @icon        -
// @license     AGPL-3.0-or-later
// ==/UserScript==

'use strict';

unsafeWindow.toDataURL = toDataURL;
unsafeWindow.getDataURL = getDataURL;


// https://stackoverflow.com/questions/934012/get-image-data-url-in-javascript/42916772#42916772
function toDataURL(url, callback) {
    GM.xmlHttpRequest({
        method: "GET",
        url: url,
        responseType: 'blob',
        onload(response) {
            var fr = new FileReader();

            fr.onload = function() {
                callback(this.result);
            }

            fr.readAsDataURL(response.response);
        }
    });
}

function getDataURL(url) {
    toDataURL(url, function(dataurl) {
        console.log(dataurl);
    });
}
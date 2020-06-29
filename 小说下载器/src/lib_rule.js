function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function rm(selector, All, doc) {
    if (!doc) { doc = document }
    if (All) {
        let rs = doc.querySelectorAll(selector);
        rs.forEach(e => e.remove());
    } else {
        let r = doc.querySelector(selector);
        if (r) { r.remove() }
    }
}

function includeLatestChapter(selector) {
    let dl = document.querySelector(selector);
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
}

async function crossPage(url, functionString, charset) {
    let text;
    if (charset === undefined) {
        text = await fetch(url).then(response => response.text())
    } else {
        text = await fetch(url)
            .then(response => response.arrayBuffer())
            .then(buffer => {
                let decoder = new TextDecoder(charset);
                let text = decoder.decode(buffer);
                return text
            })
    }
    const doc = (new DOMParser()).parseFromString(text, 'text/html');
    return (eval(functionString))
}

async function loadCryptoJs() {
    if (!unsafeWindow.CryptoJS) {
        const url = 'https://cdn.jsdelivr.net/npm/crypto-js@4.0.0/crypto-js.min.js';
        let response = await fetch(url);
        let scriptText = await response.text();
        eval(scriptText)
    }
    const CryptoJS = unsafeWindow.CryptoJS;
    return CryptoJS
}
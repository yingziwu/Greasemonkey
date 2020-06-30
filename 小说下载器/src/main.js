const host = document.location.host;
const rule = rules.get(host);
const charset = rule.charset;
const CORS = rule.CORS;
const customMaxRetryTimes = rule.maxRetryTimes;
const customMaxConcurrency = rule.maxConcurrency;
const customMaxImgConcurrency = rule.maxImgConcurrency;

let maxRetryTimes, maxConcurrency, maxImgConcurrency;
if (customMaxRetryTimes) { maxRetryTimes = customMaxRetryTimes } else { maxRetryTimes = defaultMaxRetryTimes }
if (customMaxConcurrency) { maxConcurrency = customMaxConcurrency } else { maxConcurrency = defaultMaxConcurrency }
if (customMaxImgConcurrency) { maxImgConcurrency = customMaxImgConcurrency } else { maxImgConcurrency = defaultMaxImgConcurrency }

const icon0 = 'data:image/png;base64,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';
const icon1 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAAAA3NCSVQICAjb4U/gAAAACXBIWXMAAANSAAADUgEQACRKAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAUdQTFRF////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAiYSOVQAAAGx0Uk5TAAECAwQFCAkKCwwNDhETFRkaHB0fICMkKCwwNTg5PD1AQUZKTk9QV1tcX2BjZGhtb3B2eHl6fX6AgYKHi4+QlJicnaChpamur7C3uru+v8LEyMzP0NXZ3N3f4OTn6uvt7/Hy8/T2+Pn6/P3+VI4wmgAAAyxJREFUeNrtmVdT4zAUhTFs6BB6Cb13WLpooffeQjW9hMT//3mVJbsT4li6ahbD6D4y5p5vzrGuFDkry5QpznLSygAYAANgAAyAATAABsAAGAADYAAMgAEwAD8XADlChTQTIM0eIM0pIM3vAdL8JiLNawFpXo1I8zxAmicS0jwTkeapjDTvC8r0gQQK9UEESvUBBIr1qQTK9SkESvR/wQkQ5V95KhS+Q1AC14N34ZCYenD0LGNjoH7ij2ejQV71QPd2lNQapI8rut0d4LMe0Bz4CHMUSetZCGgPMESRYj1cAGARMIqv1kMlgK8pNQq39TARBB8VhCgyW59S414y6frjxDYeUYTCNnnKHw4WeUxl1/wtGjwk97LToyBan6irmRrPfSHj/K+ZuSJ3TImCav3zaqvlvTN57T9W6+ozJAqa9fH9/gLS3kja/wr69+PUKMhGXUxVie0mVVMXZAUSwONys4ztvHn5kQcgttubJ+tEkde7G2MEiExUyD3VVExE4AAPS40qTlaNSw8QgI+dnlxVx8ncnp0PCsD5WJnaI23Z2Lk3wP1igx83jA2L998V4G8E5WrVy0kRfIeXMLkMm1TIN8GWYXIQTVbKVa+cjLCO4r2+fFnq+X17MZ7N6GmlxRJXt1pWnjh3Q1yX09Vi8tXTl/zb8eeB5GCgkFe9cOAgTutPBcD1stbGEYXVtvYCaA4BwHU9W8smXzt7DesMBMB1NFQMVS8eOgK3hQM4zut6ezZdPbt9/ZWhKQsArpu5OrJ83dwNW0dGAFzHwyVe6iXDx8zt2AEc522jI8etntOx8cbRjAcA1+18/Vf5+vlbvk6cALhORkr/qZeOnHC34QdwnPfNTvzjLtC5+S7QRAQg8eNuYcEW6yAIIF4GQD8A9W5IZX3eFQW6tqI61KNbXf9vy4K/T/2Wd90X+hqFnfHG1K8oUq1nuqpVZD3zjal865nvjBVY74pC/qpg/nYkNQqb6+uZrChYrFcQhcBnOwlR2KIfLoUGlIj1EgaUsPVCUcixnjcKmdZzRCHdeqYo1FgPjUKl9YAolFtPjMIf672i8NP6DFH4br2pH1d/AAm28mJJn9pPAAAAAElFTkSuQmCC';
let nowWorking = 0;
let downloading = false;
let corsDomains = new Set();

let imgNowWorking = 0;
let imgTaskQueue = [];
let imgTaskQueueSet = new Set();
let imgWorkerResolved = new Map();
let imgWorkerRejected = new Map();


window.addEventListener('DOMContentLoaded', async function() {
    console.log(`开始载入小说下载器……\n当前脚本管理器：${GM_info.scriptHandler}\n当前脚本管理器版本：${GM_info.version}\n当前脚本版本：${GM_info.script.version}\n是否开启调试模式：${enableDebug}`);
    if (enableDebug) { debug() }
    let linkList;
    if (rule.linkList[Symbol.toStringTag] == 'AsyncFunction') { await rule.linkList().then(result => linkList = result) } else { linkList = rule.linkList() }
    if (linkList.length !== 0) { addButton() }
})


function addButton() {
    let button = document.createElement('button');
    button.id = 'novel-downloader';
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
            console.log('开始下载……')
            main(rule)
        }
    }
    button.appendChild(img);
    document.body.appendChild(button);
}

async function main(rule) {
    let bookname, author, intro, linkList, cover, sourceUrl, infoText;
    [bookname, author, intro, linkList, cover, sourceUrl, infoText] = await getMetadate(rule);

    const pageNum = linkList.length;
    let pageTaskQueue = genPageTaskQueue(linkList);
    let pageWorkerResolved = new Map();
    let pageWorkerRejected = new Map();

    let loopId = setInterval(loop, 300);
    let imgLoopId = setInterval(imgDownLoop, 800)

    function loop() {
        let finishNum = pageWorkerResolved.size + pageWorkerRejected.size;
        let finishImgNum = imgWorkerResolved.size + imgWorkerRejected.size;
        if (finishNum !== pageNum || finishImgNum !== imgTaskQueueSet.size) {
            updateProgress(finishNum, pageNum, finishImgNum, imgTaskQueueSet.size);
            for (let i = nowWorking; i < maxConcurrency; i++) {
                const pageTask = pageTaskQueue.pop();
                if (pageTask) {
                    nowWorking++;
                    console.log(`开始下载：${pageTask.id}\t${pageTask.dom.innerText}\t${pageTask.url}\t第${pageTask.retry}次重试`);
                    pageWorker(pageTask, pageWorkerResolved, pageWorkerRejected, pageTaskQueue, rule);
                } else {
                    break;
                }
            }
        } else {
            clearInterval(loopId);
            clearInterval(imgLoopId);
            save(pageWorkerResolved, bookname, author, infoText, cover, pageNum);
        }
    }
}

function save(pageWorkerResolved, bookname, author, infoText, cover, pageNum) {
    console.log('保存文件中……')
    let sortKeys = [];
    for (let key of pageWorkerResolved.keys()) {
        sortKeys.push(key);
    }
    sortKeys.sort(compareNumeric);

    let savedTxt = infoText;
    let savedZip = new JSZip();
    for (let key of sortKeys) {
        let v = pageWorkerResolved.get(key);
        savedTxt = savedTxt + '\n\n\n\n' + `## ${v.chapterName}` + '\n' + '='.repeat(30) + '\n\n' + v.txt.trim();
        const htmlFileName = 'Chapter' + '0'.repeat(pageNum.toString().length - key.toString().length) + key.toString() + '.html';
        const htmlFile = genHtml(v.chapterName, v.dom);
        savedZip.file(htmlFileName, htmlFile);
    }

    const saveBaseFileName = `[${author}]${bookname}`;
    saveAs((new Blob([savedTxt], { type: "text/plain;charset=utf-8" })), saveBaseFileName + '.txt');
    savedZip.file('info.txt', (new Blob([infoText], { type: "text/plain;charset=utf-8" })));

    savedZip.file(`cover.${cover.type}`, cover.file);
    for (let entry of imgWorkerResolved) {
        let filename, imgObj;
        [filename, imgObj] = entry;
        savedZip.file(filename, imgObj.file);
    }

    savedZip.generateAsync({
            type: "blob",
            compression: "DEFLATE",
            compressionOptions: {
                level: 6
            }
        }).then((blob) => { saveAs(blob, saveBaseFileName + '.zip'); })
        .catch(err => console.log('saveZip: ' + err));

    downloading = false;
    document.querySelector('#novel-downloader > img').src = icon0;
    console.log('下载完毕！')
    document.querySelector('#progress').remove();

    function compareNumeric(a, b) {
        if (a > b) return 1;
        if (a == b) return 0;
        if (a < b) return -1;
    }
}

function updateProgress(finishNum, pageNum, finishImgNum, imgNum) {
    if (!document.querySelector('#progress')) {
        let progress = document.createElement('div');
        progress.id = 'progress';
        progress.innerHTML = `
        <div id='page-progress' title="页面"></div>
        <div id='img-progress' title="图片"></div>
        `
        let progressStyle = document.createElement('style');
        progressStyle.innerHTML = `
        #progress {
            position: fixed;
            bottom: 8%;
            right: 3%;
            z-index: 99;
            border-style: none;
            text-align: center;
            vertical-align: baseline;
            background-color: rgba(210, 210, 210, 0.2);
            padding: 6px;
            border-radius: 12px;
        }
        #page-progress{
            --color:green;
            --position:0%;
            width:200px;
            height:10px;
            border-radius:30px;
            background-color:#ccc;
            background-image:radial-gradient(closest-side circle at var(--position),var(--color),var(--color) 100%,transparent),linear-gradient(var(--color),var(--color));
            background-image:-webkit-radial-gradient(var(--position),circle closest-side,var(--color),var(--color) 100%,transparent),-webkit-linear-gradient(var(--color),var(--color));
            background-size:100% ,var(--position);
            background-repeat: no-repeat;
        }
        #img-progress{
            --color:purple;
            --position:0%;
            width:200px;
            height:10px;
            border-radius:30px;
            background-color:#ccc;
            background-image:radial-gradient(closest-side circle at var(--position),var(--color),var(--color) 100%,transparent),linear-gradient(var(--color),var(--color));
            background-image:-webkit-radial-gradient(var(--position),circle closest-side,var(--color),var(--color) 100%,transparent),-webkit-linear-gradient(var(--color),var(--color));
            background-size:100% ,var(--position);
            background-repeat: no-repeat;
            margin-top: 5px;
        }
        `
        document.head.appendChild(progressStyle);
        document.body.appendChild(progress);
    }

    let pagePercent = `${Math.trunc((finishNum/pageNum)*100)}%`;
    document.querySelector('#page-progress').style.cssText = `--position:${pagePercent};`

    if (imgNum !== 0) {
        let imgPercent = `${Math.trunc((finishImgNum/imgNum)*100)}%`;
        document.querySelector('#img-progress').style.cssText = `--position:${imgPercent};`;
    } else {
        document.querySelector('#img-progress').style.cssText = 'display:none;';
    }
}

function genHtml(chapterName, dom) {
    let htmlFile = (new DOMParser()).parseFromString(
        `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${chapterName}</title></head><body><h2>${chapterName}</h2></body></html>`,
        'text/html');
    htmlFile.querySelector('body').appendChild(dom);
    return new Blob([htmlFile.documentElement.outerHTML], { type: "text/html; charset=UTF-8" })
}

async function getMetadate(rule) {
    let bookname, author, intro, linkList, coverUrl, cover, sourceUrl, infoText;
    if (rule.bookname[Symbol.toStringTag] == 'AsyncFunction') { await rule.bookname().then(result => bookname = result) } else { bookname = rule.bookname() }
    if (rule.author[Symbol.toStringTag] == 'AsyncFunction') { await rule.author().then(result => author = result) } else { author = rule.author() }
    if (rule.intro[Symbol.toStringTag] == 'AsyncFunction') { await rule.intro().then(result => intro = result) } else { intro = rule.intro() }
    if (rule.linkList[Symbol.toStringTag] == 'AsyncFunction') { await rule.linkList().then(result => linkList = result) } else { linkList = rule.linkList() }
    if (rule.coverUrl[Symbol.toStringTag] == 'AsyncFunction') { await rule.coverUrl().then(result => coverUrl = result) } else { coverUrl = rule.coverUrl() }

    cover = await imgWorker({ 'url': coverUrl, 'filename': 'cover', 'retry': 0 })
        .catch(error => {
            console.error(error);
            let file = new Blob(['下载封面失败'], { type: "text/plain;charset=utf-8" });
            return {
                'type': 'txt',
                'file': file,
                'url': coverUrl
            }
        });
    intro = intro.replace(/\n{2,}/g, '\n');
    sourceUrl = document.location.href;
    infoText = `题名：${bookname}\n作者：${author}\n简介：${intro}\n来源：${document.location.href}`;
    return [bookname, author, intro, linkList, cover, sourceUrl, infoText]
}

function genPageTaskQueue(linkList) {
    let pageTaskQueue = [];
    for (let i = 0; i < linkList.length; i++) {
        let pageTask = { 'id': i, 'url': linkList[i].href, 'retry': 0, 'dom': linkList[i] };
        pageTaskQueue.push(pageTask);
    }
    return pageTaskQueue
}

function pageWorker(pageTask, pageWorkerResolved, pageWorkerRejected, pageTaskQueue, rule) {
    const id = pageTask.id;
    const url = pageTask.url;
    const host = (new URL(url)).host;
    let retry = pageTask.retry;
    let dom = pageTask.dom;

    let text;
    if (charset === undefined) {
        if (CORS) {
            text = gfetch(url).then(
                response => response.responseText,
                error => {
                    nowWorking--;
                    errorCallback(error)
                }
            )
        } else {
            text = fetch(url).then(
                response => response.text(),
                error => {
                    nowWorking--;
                    errorCallback(error)
                }
            )
        }
    } else {
        if (CORS) {
            text = gfetch(url, { responseType: 'arraybuffer' }).then(
                response => response.response,
                response => response.arrayBuffer(),
                error => {
                    nowWorking--;
                    errorCallback(error)
                }).then(
                buffer => {
                    let decoder = new TextDecoder(charset);
                    let text = decoder.decode(buffer);
                    return text
                })
        } else {
            text = fetch(url).then(
                response => response.arrayBuffer(),
                error => {
                    nowWorking--;
                    errorCallback(error)
                }).then(
                buffer => {
                    let decoder = new TextDecoder(charset);
                    let text = decoder.decode(buffer);
                    return text
                })
        }
    }

    text.then(text => {
        nowWorking--;
        extractData(id, url, text, rule, pageWorkerResolved)
    }).catch(error => errorCallback(error))

    function errorCallback(error) {
        console.error(id, url, pageTask, error);
        retry++;
        if (retry > maxRetryTimes) {
            pageWorkerRejected.set(id, url);
        } else {
            pageTaskQueue.push({ 'id': id, 'url': url, 'retry': retry, 'dom': dom });
        }
    }
}

async function extractData(id, url, text, rule, pageWorkerResolved) {
    let doc = (new DOMParser()).parseFromString(text, 'text/html');
    let base;
    if (doc.querySelector('base')) {
        base = doc.querySelector('base');
    } else {
        base = document.createElement('base');
        doc.head.appendChild(base);
    }
    base.href = url;

    let chapterName, content;
    if (rule.chapterName[Symbol.toStringTag] == 'AsyncFunction') { await rule.chapterName(doc).then(result => chapterName = result) } else { chapterName = rule.chapterName(doc) }
    if (rule.content[Symbol.toStringTag] == 'AsyncFunction') { await rule.content(doc).then(result => content = result) } else { content = rule.content(doc) }
    content = rm('[style*="display:none"]', true, content);
    content = rm('[style*="display: none"]', true, content);

    let txtOut, htmlOut;
    [txtOut, htmlOut] = convertDomNode(content);
    pageWorkerResolved.set(id, {
        'id': id,
        'url': url,
        'chapterName': chapterName,
        'content': content,
        'txt': txtOut,
        'dom': htmlOut
    });
}

function imgDownLoop() {
    for (let i = imgNowWorking; i < maxImgConcurrency; i++) {
        const imgTask = imgTaskQueue.pop();
        if (!imgTask) { return }

        const filename = imgTask.filename;
        imgWorker(imgTask).then(
            imgObj => imgWorkerResolved.set(filename, imgObj),
            errorObj => {
                let error, newImgTask;
                [error, newImgTask] = errorObj;
                console.error(error);
                const newRetry = newImgTask.retry;
                if (newRetry > maxImgConcurrency) {
                    imgWorkerRejected.set(filename, error)
                } else {
                    imgTaskQueue.push(newImgTask);
                }
            }
        );
    }
}
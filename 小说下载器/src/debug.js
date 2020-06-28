function debug() {
    unsafeWindow.rule = rule;
    unsafeWindow.main = main;
    unsafeWindow.convertDomNode = convertDomNode;
    unsafeWindow.ruleTest = ruleTest;
    unsafeWindow.gfetch = gfetch;
}

async function ruleTest(rule) {
    let bookname, author, intro, linkList, cover, sourceUrl, infoText;
    [bookname, author, intro, linkList, cover, sourceUrl, infoText] = await getMetadate(rule);
    console.log(`infoText:\n${infoText}`);
    console.log('cover: ', cover);
    console.log('linkList: ', linkList);

    let blob = await cover.file;
    let coverImg = document.createElement('img');
    coverImg.src = URL.createObjectURL(blob);
    coverImg.onclick = function() { this.remove() };
    coverImg.style.cssText = `position: fixed; bottom: 8%; right: 8%; z-index: 99; max-width: 150px;`;
    document.body.appendChild(coverImg);

    let pageTaskQueue = [{ 'id': 0, 'url': linkList[0].href, 'retry': 0, 'dom': linkList[0] }];
    let pageWorkerResolved = new Map();
    let pageWorkerRejected = new Map();

    let loopId = setInterval(loop, 800);

    function loop() {
        let finishNum = pageWorkerResolved.size + pageWorkerRejected.size;
        if (finishNum != 1) {
            const pageTask = pageTaskQueue.pop()
            if (pageTask) {
                pageWorker(pageTask, pageWorkerResolved, pageWorkerRejected, pageTaskQueue, rule);
            }
        } else {
            clearInterval(loopId);
            let result = pageWorkerResolved.get(0);
            console.log(result);
        }
    }
}
import { enableDebug, rule, maxConcurrency, icon0, icon1 } from "./rules";
import {
  downloading,
  setDownloadingTrue,
  nowWorking,
  nowWorkingInc,
  convertDomNode,
  pageWorker,
  save,
  updateProgress,
  getMetadate,
  genPageTaskQueue,
  imgDownLoop,
  imgWorkerResolved,
  imgWorkerRejected,
  imgTaskQueueSet,
} from "./main";
import { gfetch } from "./lib";
import { ruleTest } from "./debug";

window.addEventListener("DOMContentLoaded", async function () {
  console.log(
    `开始载入小说下载器……\n当前脚本管理器：${GM_info.scriptHandler}\n当前脚本管理器版本：${GM_info.version}\n当前脚本版本：${GM_info.script.version}\n是否开启调试模式：${enableDebug}`
  );
  if (enableDebug) {
    debug();
  }
  let linkList;
  if (rule.linkList[Symbol.toStringTag] === "AsyncFunction") {
    // eslint-disable-next-line no-return-assign
    await rule.linkList().then((result) => (linkList = result));
  } else {
    linkList = rule.linkList();
  }
  if (linkList.length !== 0) {
    addButton();
  }
});

function addButton(): void {
  let button = document.createElement("button");
  button.id = "novel-downloader";
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

  let img = document.createElement("img");
  img.src = icon0;
  img.style.cssText = "height: 2em;";

  button.onclick = function () {
    if (downloading) {
      alert("正在下载中，请耐心等待……");
    } else {
      setDownloadingTrue();
      img.src = icon1;
      console.log("开始下载……");
      main(rule);
    }
  };
  button.appendChild(img);
  document.body.appendChild(button);
}

async function main(rule) {
  let bookname;
  let author;
  let intro;
  let linkList;
  let cover;
  let sourceUrl;
  let infoText;
  [
    bookname,
    author,
    intro,
    linkList,
    cover,
    sourceUrl,
    infoText,
  ] = await getMetadate(rule);

  const pageNum = linkList.length;
  let pageTaskQueue = genPageTaskQueue(linkList);
  let pageWorkerResolved = new Map();
  let pageWorkerRejected = new Map();

  let loopId = setInterval(loop, 300);
  let imgLoopId = setInterval(imgDownLoop, 800);

  function loop() {
    let finishNum = pageWorkerResolved.size + pageWorkerRejected.size;
    let finishImgNum = imgWorkerResolved.size + imgWorkerRejected.size;
    if (finishNum !== pageNum || finishImgNum !== imgTaskQueueSet.size) {
      updateProgress(finishNum, pageNum, finishImgNum, imgTaskQueueSet.size);
      for (let i = nowWorking; i < maxConcurrency; i++) {
        const pageTask = pageTaskQueue.pop();
        if (pageTask) {
          nowWorkingInc();
          console.log(
            `开始下载：${pageTask.id}\t${pageTask.dom.innerText}\t${pageTask.url}\t第${pageTask.retry}次重试`
          );
          pageWorker(
            pageTask,
            pageWorkerResolved,
            pageWorkerRejected,
            pageTaskQueue,
            rule
          );
        } else {
          break;
        }
      }
    } else {
      updateProgress(finishNum, pageNum, finishImgNum, imgTaskQueueSet.size);
      clearInterval(loopId);
      clearInterval(imgLoopId);
      save(
        pageWorkerResolved,
        pageWorkerRejected,
        bookname,
        author,
        infoText,
        cover,
        pageNum
      );
    }
  }
}

function debug() {
  unsafeWindow.rule = rule;
  unsafeWindow.main = main;
  unsafeWindow.convertDomNode = convertDomNode;
  unsafeWindow.ruleTest = ruleTest;
  unsafeWindow.gfetch = gfetch;
}

/* eslint-disable no-return-assign */
/* eslint-disable max-params */
/* eslint-disable no-param-reassign */
import { gfetch, rm } from "./lib";
import {
  enableDebug,
  rule,
  charset,
  CORS,
  maxRetryTimes,
  maxConcurrency,
  maxImgConcurrency,
  icon0,
  icon1,
} from "./rules";

let nowWorking = 0;
const nowWorkingInc = () => nowWorking++;
let downloading = false;
const setDownloadingTrue = () => (downloading = true);
let corsDomains = new Set();

let imgNowWorking = 0;
let imgTaskQueue: Object[] = [];
let imgTaskQueueSet = new Set();
let imgWorkerResolved = new Map();
let imgWorkerRejected = new Map();

function save(
  pageWorkerResolved: Map<number, Object>,
  pageWorkerRejected: Map<number, Object>,
  bookname: string,
  author: string,
  infoText: string,
  cover: Object,
  pageNum: number
) {
  console.log("保存文件中……");
  let sortKeys = [];
  for (let key of pageWorkerResolved.keys()) {
    sortKeys.push(key);
  }
  sortKeys.sort(compareNumeric);

  let savedTxt = infoText;
  let savedZip = new JSZip();
  for (let key of sortKeys) {
    let v = pageWorkerResolved.get(key);
    savedTxt =
      savedTxt +
      "\n\n\n\n" +
      `## ${v.chapterName}` +
      "\n" +
      "=".repeat(30) +
      "\n\n" +
      v.txt.trim();
    const htmlFileName =
      "Chapter" +
      "0".repeat(pageNum.toString().length - key.toString().length) +
      key.toString() +
      ".html";
    const htmlFile = genHtml(v.chapterName, v.dom);
    savedZip.file(htmlFileName, htmlFile);
  }

  const saveBaseFileName = `[${author}]${bookname}`;
  saveAs(
    new Blob([savedTxt], { type: "text/plain;charset=utf-8" }),
    saveBaseFileName + ".txt"
  );
  if (pageWorkerRejected.size) {
    let failedTxt = "";
    for (let entry of pageWorkerRejected.entries()) {
      let id;
      let url;
      [id, url] = entry;
      failedTxt = failedTxt + `\n${id}\t${url}`;
    }
    savedZip.file(
      "failed.txt",
      new Blob([failedTxt], { type: "text/plain;charset=utf-8" })
    );
  }
  savedZip.file(
    "info.txt",
    new Blob([infoText], { type: "text/plain;charset=utf-8" })
  );

  savedZip.file(`cover.${cover.type}`, cover.file);
  for (let entry of imgWorkerResolved) {
    let filename;
    let imgObj;
    [filename, imgObj] = entry;
    savedZip.file(filename, imgObj.file);
  }

  savedZip
    .generateAsync(
      {
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: {
          level: 6,
        },
      },
      (metadata) => updateProgress(1, 1, 1, 1, metadata.percent)
    )
    .then((blob: Blob) => {
      saveAs(blob, saveBaseFileName + ".zip");
      document.querySelector("#progress").remove();
    })
    .catch((err: Error) => console.log("saveZip: " + err));

  downloading = false;
  (document.querySelector(
    "#novel-downloader > img"
  ) as HTMLImageElement).src = icon0;
  console.log("下载完毕！");

  function compareNumeric(a: number, b: number) {
    if (a > b) return 1;
    if (a === b) return 0;
    if (a < b) return -1;
  }
}

function updateProgress(
  finishNum: number,
  pageNum: number,
  finishImgNum: number,
  imgNum: number,
  zipPercent: number | null = null
) {
  if (!document.querySelector("#progress")) {
    let progress = document.createElement("div");
    progress.id = "progress";
    progress.innerHTML = `
        <div id='page-progress' title="页面"></div>
        <div id='img-progress' title="图片"></div>
        <div id='zip-progress' title="ZIP"></div>
        `;
    let progressStyle = document.createElement("style");
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
        #zip-progress{
            --color:yellow;
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
        `;
    document.head.appendChild(progressStyle);
    document.body.appendChild(progress);
  }

  let pagePercent = `${Math.trunc((finishNum / pageNum) * 100)}%`;
  (document.querySelector(
    "#page-progress"
  ) as HTMLDivElement).style.cssText = `--position:${pagePercent};`;

  if (imgNum !== 0) {
    let imgPercent = `${Math.trunc((finishImgNum / imgNum) * 100)}%`;
    (document.querySelector(
      "#img-progress"
    ) as HTMLDivElement).style.cssText = `--position:${imgPercent};`;
  } else {
    (document.querySelector("#img-progress") as HTMLDivElement).style.cssText =
      "display:none;";
  }

  if (zipPercent) {
    (document.querySelector(
      "#zip-progress"
    ) as HTMLDivElement).style.cssText = `--position:${zipPercent}%;`;
  } else {
    (document.querySelector("#zip-progress") as HTMLDivElement).style.cssText =
      "display:none;";
  }
}

function genHtml(chapterName: string, dom: HTMLElement) {
  let htmlFile = new DOMParser().parseFromString(
    `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${chapterName}</title></head><body><h2>${chapterName}</h2></body></html>`,
    "text/html"
  );
  htmlFile.querySelector("body").appendChild(dom);
  return new Blob([htmlFile.documentElement.outerHTML], {
    type: "text/html; charset=UTF-8",
  });
}

async function getMetadate(rule: Rule) {
  let bookname: string;
  let author: string;
  let intro: string;
  let linkList: NodeList;
  let coverUrl: string;
  let cover: Object;
  let sourceUrl: string;
  let infoText: string;
  if (rule.bookname[Symbol.toStringTag] === "AsyncFunction") {
    await rule.bookname().then((result) => (bookname = result));
  } else {
    bookname = rule.bookname();
  }
  if (rule.author[Symbol.toStringTag] === "AsyncFunction") {
    await rule.author().then((result) => (author = result));
  } else {
    author = rule.author();
  }
  if (rule.intro[Symbol.toStringTag] === "AsyncFunction") {
    await rule.intro().then((result) => (intro = result));
  } else {
    intro = rule.intro();
  }
  if (rule.linkList[Symbol.toStringTag] === "AsyncFunction") {
    await rule.linkList().then((result) => (linkList = result));
  } else {
    linkList = rule.linkList();
  }
  if (rule.coverUrl[Symbol.toStringTag] === "AsyncFunction") {
    await rule.coverUrl().then((result) => (coverUrl = result));
  } else {
    coverUrl = rule.coverUrl();
  }

  cover = await imgWorker({ url: coverUrl, filename: "cover", retry: 0 }).catch(
    (error) => {
      console.error(error);
      let file = new Blob(["下载封面失败"], {
        type: "text/plain;charset=utf-8",
      });
      return {
        type: "txt",
        file: file,
        url: coverUrl,
      };
    }
  );
  intro = intro.replace(/\n{2,}/g, "\n");
  sourceUrl = document.location.href;
  infoText = `题名：${bookname}\n作者：${author}\n简介：${intro}\n来源：${document.location.href}`;
  return [bookname, author, intro, linkList, cover, sourceUrl, infoText];
}

function genPageTaskQueue(linkList: NodeList) {
  let pageTaskQueue = [];
  for (let i = 0; i < linkList.length; i++) {
    let pageTask = {
      id: i,
      url: (linkList[i] as HTMLLinkElement).href,
      retry: 0,
      dom: linkList[i],
    };
    pageTaskQueue.push(pageTask);
  }
  return pageTaskQueue;
}

function pageWorker(
  pageTask,
  pageWorkerResolved,
  pageWorkerRejected,
  pageTaskQueue,
  rule
) {
  const id = pageTask.id;
  const url = pageTask.url;
  const host = new URL(url).host;
  let retry = pageTask.retry;
  let dom = pageTask.dom;

  let text;
  if (charset === undefined) {
    if (CORS) {
      text = gfetch(url)
        .then(
          (response) => {
            if (response.status >= 200 && response.status <= 299) {
              return response.responseText;
            } else {
              throw new Error("Bad response!");
            }
          },
          (error) => {
            nowWorking--;
            errorCallback(error);
          }
        )
        .catch((error) => {
          nowWorking--;
          errorCallback(error);
        });
    } else {
      text = fetch(url)
        .then(
          (response) => {
            if (response.ok) {
              return response.text();
            } else {
              throw new Error("Bad response!");
            }
          },
          (error) => {
            nowWorking--;
            errorCallback(error);
          }
        )
        .catch((error) => {
          nowWorking--;
          errorCallback(error);
        });
    }
  } else {
    if (CORS) {
      text = gfetch(url, { responseType: "arraybuffer" })
        .then(
          (response) => {
            if (response.status >= 200 && response.status <= 299) {
              return response.response;
            } else {
              throw new Error("Bad response!");
            }
          },
          (error) => {
            nowWorking--;
            errorCallback(error);
          }
        )
        .then((buffer) => {
          let decoder = new TextDecoder(charset);
          let text = decoder.decode(buffer);
          return text;
        })
        .catch((error) => {
          nowWorking--;
          errorCallback(error);
        });
    } else {
      text = fetch(url)
        .then(
          (response) => {
            if (response.ok) {
              return response.arrayBuffer();
            } else {
              throw new Error("Bad response!");
            }
          },
          (error) => {
            nowWorking--;
            errorCallback(error);
          }
        )
        .then((buffer) => {
          let decoder = new TextDecoder(charset);
          let text = decoder.decode(buffer);
          return text;
        })
        .catch((error) => {
          nowWorking--;
          errorCallback(error);
        });
    }
  }

  text
    .then((text) => {
      if (text) {
        nowWorking--;
        extractData(id, url, text, rule, pageWorkerResolved);
      }
    })
    .catch((error) => errorCallback(error));

  function errorCallback(error) {
    console.error(id, url, pageTask, error);
    retry++;
    if (retry > maxRetryTimes) {
      pageWorkerRejected.set(id, url);
    } else {
      pageTaskQueue.unshift({ id: id, url: url, retry: retry, dom: dom });
    }
  }
}

async function extractData(id, url, text, rule, pageWorkerResolved) {
  let doc = new DOMParser().parseFromString(text, "text/html");
  let base;
  if (doc.querySelector("base")) {
    base = doc.querySelector("base");
  } else {
    base = document.createElement("base");
    doc.head.appendChild(base);
  }
  base.href = url;

  let chapterName;
  let content;
  if (rule.chapterName[Symbol.toStringTag] === "AsyncFunction") {
    await rule.chapterName(doc).then((result) => (chapterName = result));
  } else {
    chapterName = rule.chapterName(doc);
  }
  if (rule.content[Symbol.toStringTag] === "AsyncFunction") {
    await rule.content(doc).then((result) => (content = result));
  } else {
    content = rule.content(doc);
  }
  rm('[style*="display:none"]', true, content);
  rm('[style*="display: none"]', true, content);

  let txtOut;
  let htmlOut;
  [txtOut, htmlOut] = convertDomNode(content);
  pageWorkerResolved.set(id, {
    id: id,
    url: url,
    chapterName: chapterName,
    content: content,
    txt: txtOut,
    dom: htmlOut,
  });
}

function imgDownLoop() {
  for (let i = imgNowWorking; i < maxImgConcurrency; i++) {
    const imgTask = imgTaskQueue.pop();
    if (!imgTask) {
      return;
    }

    const filename = imgTask.filename;
    imgWorker(imgTask).then(
      (imgObj) => imgWorkerResolved.set(filename, imgObj),
      (errorObj) => {
        let error;
        let newImgTask;
        [error, newImgTask] = errorObj;
        console.error(error);
        const newRetry = newImgTask.retry;
        if (newRetry > maxImgConcurrency) {
          imgWorkerRejected.set(filename, error);
        } else {
          imgTaskQueue.push(newImgTask);
        }
      }
    );
  }
}

function imgWorker(imgTask) {
  const url = imgTask.url;
  const filename = imgTask.filename;
  let retry = imgTask.retry;

  const host = new URL(url).host;
  console.log(`正在下载图片:${filename}\t${url}`);

  return new Promise((resolve, reject) => {
    if (corsDomains.has(host)) {
      imgNowWorking++;
      gfetch(url, { responseType: "blob" })
        .then((response) => {
          if (imgNowWorking > 0) {
            imgNowWorking--;
          }
          const _headers = response.responseHeaders.split("\r\n");
          let headers = {};
          for (let _header of _headers) {
            let k;
            let v;
            [k, v] = _header.split(/:\s+/);
            headers[k] = v;
          }
          const imgObject = {
            type: headers["content-type"].split("/")[1],
            file: response.response,
            url: response.finalUrl,
          };
          resolve(imgObject);
        })
        .catch((error) => {
          if (imgNowWorking > 0) {
            imgNowWorking--;
          }
          retry++;
          const newImgTask = { url: url, filename: filename, retry: retry };
          reject([error, newImgTask]);
        });
    } else {
      imgNowWorking++;
      fetch(url)
        .then(
          (response) => {
            if (imgNowWorking > 0) {
              imgNowWorking--;
            }
            const imgObject = {
              type: response.headers.get("Content-Type").split("/")[1],
              file: response.blob(),
              url: response.url,
            };
            resolve(imgObject);
          },
          (error) => {
            if (imgNowWorking > 0) {
              imgNowWorking--;
            }
            retry++;
            imgNowWorking++;
            gfetch(url, { responseType: "blob" }).then((response) => {
              if (imgNowWorking > 0) {
                imgNowWorking--;
              }
              const _headers = response.responseHeaders.split("\r\n");
              let headers = {};
              for (let _header of _headers) {
                let k;
                let v;
                [k, v] = _header.split(/:\s+/);
                headers[k] = v;
              }
              const imgObject = {
                type: headers["content-type"].split("/")[1],
                file: response.response,
                url: response.finalUrl,
              };
              corsDomains.add(host);
              console.log(`将 ${host} 加入跨域请求列表`);
              resolve(imgObject);
            });
          }
        )
        .catch((error) => {
          if (imgNowWorking > 0) {
            imgNowWorking--;
          }
          retry++;
          const newImgTask = { url: url, filename: filename, retry: retry };
          reject([error, newImgTask]);
        });
    }
  });
}

function convertDomNode(node) {
  let txtOut = "";
  let htmlOut = document.createElement("div");
  let brc = 0;
  [txtOut, htmlOut, brc] = walker(
    null,
    node.childNodes[0],
    node,
    brc,
    txtOut,
    htmlOut
  );
  txtOut = txtOut.trim();
  return [txtOut, htmlOut];
}

// eslint-disable-next-line complexity
function walker(p, n, r, brc, txtOut, htmlOut) {
  let pNodeName;
  let nNodeName;
  if (p) {
    pNodeName = p.nodeName;
  } else {
    pNodeName = null;
  }
  if (n) {
    nNodeName = n.nodeName;
  } else {
    nNodeName = null;
  }

  const nodeType2 = [
    "DIV",
    "P",
    "OL",
    "H1",
    "H1",
    "H2",
    "H3",
    "H4",
    "H5",
    "H6",
  ];
  const nodeType3 = ["SCRIPT", "STYLE", "#comment"];

  let lastNode;
  if (htmlOut.childElementCount !== 0) {
    lastNode = htmlOut.childNodes[htmlOut.childElementCount - 1];
  } else {
    lastNode = document.createElement("p");
  }

  if (nodeType3.includes(nNodeName)) {
    // pass
  } else if (nNodeName === "BR") {
    if (
      nodeType2.includes(r.nodeName) &&
      r.childElementCount === r.querySelectorAll("br").length
    ) {
      for (let i = 0; i < r.querySelectorAll("br").length; i++) {
        if (r.childNodes[i].nodeName === "BR") {
          r.childNodes[i].classList.add("remove");
        } else {
          brc++;
          break;
        }
      }
    } else {
      brc++;
    }
  } else if (nNodeName === "HR") {
    txtOut = txtOut + "\n\n" + "-".repeat(15);
    let hr = document.createElement("hr");
    htmlOut.appendChild(hr);
  } else if (nNodeName === "IMG") {
    const url = n.src;
    if (url) {
      const filename = url.split("/").splice(-1)[0];
      let alt;
      if (n.alt) {
        alt = n.alt;
      }

      let imgTask = { url: url, filename: filename, retry: 0 };
      if (url.startsWith("http") && !imgTaskQueueSet.has(url)) {
        imgTaskQueueSet.add(url);
        imgTaskQueue.push(imgTask);
      }

      txtOut = txtOut + "\n\n" + `[Image filename:${filename} url:${url}]`;
      let img = document.createElement("img");
      img.src = filename;
      if (alt) {
        img.alt = alt;
      }
      if (r.nodeName !== "A") {
        htmlOut.appendChild(img);
      } else {
        lastNode.appendChild(img);
      }

      if (nodeType2.includes(r.nodeName)) {
        brc = 0;
      }
    }
  } else if (nNodeName === "A") {
    if (n.childElementCount === 0) {
      txtOut = txtOut + `[link ${n.innerText} href: ${n.href}]`;

      let newLink = document.createElement("a");
      newLink.href = n.href;
      newLink.innerText = n.innerText.trim();
      lastNode.appendChild(newLink);
    } else {
      [txtOut, htmlOut, brc] = walker(
        null,
        n.childNodes[0],
        n,
        brc,
        txtOut,
        htmlOut
      );
    }
  } else if (nNodeName === "#text") {
    const nodetext = n.textContent
      .trim()
      .replace(/(\s+)?\n+(\s+)?/g, "")
      .replace(/\s+/, " ");
    let specialBr =
      r.querySelectorAll("br").length !== 0 &&
      r.querySelectorAll("br").length ===
        r.querySelectorAll("br.remove").length;
    if (nodetext) {
      if (brc === 0 || specialBr) {
        if (
          (nodeType2.includes(pNodeName) || specialBr) &&
          r.nodeName !== "A"
        ) {
          txtOut = txtOut + "\n".repeat(2) + nodetext;
          let p0 = document.createElement("p");
          p0.innerText = nodetext;
          htmlOut.appendChild(p0);
        } else {
          txtOut = txtOut + nodetext;
          lastNode.innerText = lastNode.innerText + nodetext;
        }
      } else if (brc === 1 || brc === 2) {
        txtOut = txtOut + "\n".repeat(brc) + nodetext;

        let p0 = document.createElement("p");
        p0.innerText = nodetext;
        htmlOut.appendChild(p0);
      } else {
        txtOut = txtOut + "\n".repeat(3) + nodetext;

        let p1 = document.createElement("p");
        let p2 = p1.cloneNode();
        let br = document.createElement("br");
        p1.appendChild(br);
        p2.innerText = nodetext;
        htmlOut.appendChild(p1);
        htmlOut.appendChild(p2);
      }
      brc = 0;
    }
  } else if (nodeType2.includes(nNodeName)) {
    if (n.childElementCount === 0) {
      const nodetext = n.innerText.trim();
      if (nodetext) {
        if (brc >= 3) {
          txtOut = txtOut + "\n".repeat(3) + nodetext;

          let p1 = document.createElement("p");
          let p2 = p1.cloneNode();
          let br = document.createElement("br");
          p1.appendChild(br);
          p2.innerText = nodetext;
          htmlOut.appendChild(p1);
          htmlOut.appendChild(p2);
        } else {
          txtOut = txtOut + "\n".repeat(2) + nodetext;

          let p0 = document.createElement("p");
          p0.innerText = nodetext;
          htmlOut.appendChild(p0);
        }
      }
    } else {
      [txtOut, htmlOut, brc] = walker(
        null,
        n.childNodes[0],
        n,
        brc + 2,
        txtOut,
        htmlOut
      );
    }
  } else if (n.childElementCount === 0) {
    const nodetext = n.innerText.trim();
    if (nodetext) {
      txtOut = txtOut + nodetext;
      lastNode.innerText = lastNode.innerText + nodetext;
    }
  } else if (n.childElementCount !== 0) {
    [txtOut, htmlOut, brc] = walker(
      null,
      n.childNodes[0],
      n,
      brc,
      txtOut,
      htmlOut
    );
  }

  p = n;
  n = n.nextSibling;
  if (n === null) {
    return [txtOut, htmlOut, brc];
  } else {
    return walker(p, n, r, brc, txtOut, htmlOut);
  }
}

export {
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
};

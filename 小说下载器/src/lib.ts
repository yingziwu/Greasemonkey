/* eslint-disable no-eval */
/* eslint-disable no-param-reassign */

import { walker } from "./main";

function rm(
  selector: string,
  All = false,
  doc: HTMLDocument | HTMLElement = document
) {
  if (All) {
    let rs = doc.querySelectorAll(selector);
    rs.forEach((e) => e.remove());
  } else {
    let r = doc.querySelector(selector);
    if (r) {
      r.remove();
    }
  }
}

interface GM_xmlhttpRequest {
  finalUrl: string;
  readyState: number;
  status: number;
  statusText: string;
  responseHeaders: Object;
  response: Blob | ArrayBuffer | Object;
  responseXML: XMLDocument;
  responseText: string;
}

function gfetch(
  url: string,
  {
    method = "GET",
    headers,
    data,
    cookie,
    binary,
    nocache,
    revalidate,
    timeout,
    context,
    responseType,
    overrideMimeType,
    anonymous,
    username,
    password,
  }: {
    method?: string;
    headers?: Object;
    data?: string;
    cookie?: string;
    binary?: boolean;
    nocache?: boolean;
    revalidate?: boolean;
    timeout?: number;
    context?: Object;
    responseType?: string;
    overrideMimeType?: string;
    anonymous?: boolean;
    username?: string;
    password?: string;
  } = {}
): Promise<GM_xmlhttpRequest> {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      url: url,
      method: method,
      headers: headers,
      data: data,
      cookie: cookie,
      binary: binary,
      nocache: nocache,
      revalidate: revalidate,
      timeout: timeout,
      context: context,
      responseType: responseType,
      overrideMimeType: overrideMimeType,
      anonymous: anonymous,
      username: username,
      password: password,
      onload: (obj) => {
        resolve(obj);
      },
      onerror: (err) => {
        reject(err);
      },
    });
  });
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function includeLatestChapter(selector: string) {
  let dl: HTMLElement = document.querySelector(selector);
  let rDt: HTMLElement = dl.querySelector("dt:nth-child(1)");
  if (rDt.innerText.includes("最新章节")) {
    let p: HTMLElement | null = null;
    let n: HTMLElement | null = rDt;
    while (true) {
      if (n.nodeName === "DD") {
        p = n;
        n = n.nextSibling;
        p.classList.add("not_download");
      } else if (n.nodeName === "DT" && !n.innerText.includes("最新章节")) {
        break;
      } else {
        p = n;
        n = n.nextSibling;
      }
    }
  }
  return dl.querySelectorAll("dd:not(.not_download) > a");
}

async function crossPage(
  url: string,
  functionString: string,
  charset: string | undefined = undefined
): Promise<NodeList | HTMLElement> {
  let text: string;
  if (charset === undefined) {
    text = await fetch(url).then((response) => response.text());
  } else {
    text = await fetch(url)
      .then((response) => response.arrayBuffer())
      .then((buffer) => {
        let decoder = new TextDecoder(charset);
        let text = decoder.decode(buffer);
        return text;
      });
  }
  const doc: HTMLDocument = new DOMParser().parseFromString(text, "text/html");
  return eval(functionString);
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

export { crossPage, gfetch, includeLatestChapter, rm, sleep, convertDomNode };

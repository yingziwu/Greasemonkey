/* eslint-disable no-eval */
import { crossPage, gfetch, includeLatestChapter, rm, sleep } from "./lib";
import { convertDomNode } from "./main";

const rules = new Map([
  [
    "www.yruan.com",
    {
      bookname() {
        return (document.querySelector(
          "#info > h1:nth-child(1)"
        ) as HTMLElement).innerText.trim();
      },
      author() {
        return (document.querySelector(
          "#info > p:nth-child(2)"
        ) as HTMLElement).innerText
          .replace(/作\s+者:/, "")
          .trim();
      },
      intro() {
        return convertDomNode(document.querySelector("#intro > p"))[0];
      },
      linkList() {
        return document.querySelectorAll("div.box_con div#list dl dd a");
      },
      coverUrl() {
        return (document.querySelector("#fmimg > img") as HTMLImageElement).src;
      },
      chapterName: function (doc: HTMLDocument) {
        return (doc.querySelector(
          ".bookname > h1:nth-child(1)"
        ) as HTMLElement).innerText.trim();
      },
      content: function (doc: HTMLElement) {
        return doc.querySelector("#content") as HTMLElement;
      },
    },
  ],
  [
    "www.jingcaiyuedu.com",
    {
      bookname() {
        return (document.querySelector(
          "div.row.text-center.mb10 > h1:nth-child(1)"
        ) as HTMLElement).innerText.trim();
      },
      author() {
        return (document.querySelector(
          'div.row.text-center.mb10 a[href^="/novel/"]'
        ) as HTMLElement).innerText.trim();
      },
      intro: async () => {
        const indexUrl = document.location.href.replace(
          /\/list.html$/,
          ".html"
        );
        return crossPage(
          indexUrl,
          "convertDomNode(doc.querySelector('#bookIntro'))[0]"
        );
      },
      linkList() {
        return document.querySelectorAll("dd.col-md-4 > a");
      },
      coverUrl: async () => {
        const indexUrl = document.location.href.replace(
          /\/list.html$/,
          ".html"
        );
        return crossPage(
          indexUrl,
          "doc.querySelector('.panel-body img').getAttribute('data-original')"
        );
      },
      chapterName: function (doc: HTMLDocument) {
        return (doc.querySelector(
          "h1.readTitle"
        ) as HTMLElement).innerText.trim();
      },
      content: function (doc: HTMLElement) {
        let c: HTMLElement = doc.querySelector("#htmlContent");
        let ad: HTMLElement = c.querySelector("p:nth-child(1)");
        if (ad?.innerText.includes("精彩小说网")) {
          ad.remove();
        }
        return c;
      },
    },
  ],
  [
    "www.shuquge.com",
    {
      bookname() {
        return (document.querySelector(
          ".info > h2"
        ) as HTMLElement).innerText.trim();
      },
      author() {
        return (document.querySelector(
          ".small > span:nth-child(1)"
        ) as HTMLElement).innerText
          .replace(/作者：/, "")
          .trim();
      },
      intro() {
        let iNode = document.querySelector(".intro");
        iNode.innerHTML = iNode.innerHTML.replace(
          /推荐地址：http:\/\/www.shuquge.com\/txt\/\d+\/index\.html/,
          ""
        );
        return convertDomNode(iNode)[0];
      },
      linkList() {
        return includeLatestChapter(".listmain > dl:nth-child(1)");
      },
      coverUrl() {
        return (document.querySelector(
          ".info > .cover > img"
        ) as HTMLImageElement).src;
      },
      chapterName: function (doc: HTMLDocument) {
        return (doc.querySelector(
          ".content > h1:nth-child(1)"
        ) as HTMLElement).innerText.trim();
      },
      content: function (doc: HTMLDocument) {
        let content = doc.querySelector("#content");
        content.innerHTML = content.innerHTML
          .replace(
            "请记住本书首发域名：www.shuquge.com。书趣阁_笔趣阁手机版阅读网址：m.shuquge.com",
            ""
          )
          .replace(/http:\/\/www.shuquge.com\/txt\/\d+\/\d+\.html/, "");
        return content;
      },
    },
  ],
  [
    "www.dingdiann.com",
    {
      bookname() {
        return (document.querySelector(
          "#info > h1:nth-child(1)"
        ) as HTMLElement).innerText.trim();
      },
      author() {
        return (document.querySelector(
          "#info > p:nth-child(2)"
        ) as HTMLElement).innerText
          .replace(/作\s+者：/, "")
          .trim();
      },
      intro() {
        return convertDomNode(document.querySelector("#intro"))[0];
      },
      linkList() {
        return includeLatestChapter("#list > dl");
      },
      coverUrl() {
        return (document.querySelector("#fmimg > img") as HTMLImageElement).src;
      },
      chapterName: function (doc: HTMLDocument) {
        return (doc.querySelector(
          ".bookname > h1:nth-child(1)"
        ) as HTMLElement).innerText.trim();
      },
      content: function (doc: HTMLDocument) {
        let content = doc.querySelector("#content");
        let ad =
          '<div align="center"><a href="javascript:postError();" style="text-align:center;color:red;">章节错误,点此举报(免注册)</a>,举报后维护人员会在两分钟内校正章节内容,请耐心等待,并刷新页面。</div>';
        content.innerHTML = content.innerHTML
          .replace(ad, "")
          .replace(/http:\/\/www.shuquge.com\/txt\/\d+\/\d+\.html/, "");
        return content;
      },
    },
  ],
  [
    "www.fpzw.com",
    {
      bookname() {
        return (document.querySelector(
          "#title > h1:nth-child(1)"
        ) as HTMLElement).innerText.trim();
      },
      author() {
        return (document.querySelector(
          ".author > a:nth-child(1)"
        ) as HTMLElement).innerText.trim();
      },
      intro: async () => {
        const indexUrl = document.location.href.replace(/xiaoshuo\/\d+\//, "");
        const charset = "GBK";
        return crossPage(
          indexUrl,
          "convertDomNode(doc.querySelector('.wright .Text'))[0]",
          charset
        );
      },
      linkList() {
        return includeLatestChapter(".book");
      },
      coverUrl: async () => {
        const indexUrl = document.location.href.replace(/xiaoshuo\/\d+\//, "");
        const charset = "GBK";
        return crossPage(
          indexUrl,
          "doc.querySelector('div.bortable.wleft > img').src",
          charset
        );
      },
      chapterName: function (doc: HTMLDocument) {
        return doc.querySelector("h2").innerText.trim();
      },
      content: function (doc: HTMLDocument) {
        let content: HTMLElement = doc.querySelector(".Text");
        rm(".Text > a:nth-child(1)", false, content);
        rm('.Text > font[color="#F00"]', false, content);
        rm("strong.top_book", false, content);
        return content;
      },
      charset: "GBK",
    },
  ],
  [
    "www.hetushu.com",
    {
      bookname() {
        return (document.querySelector(
          ".book_info > h2"
        ) as HTMLElement).innerText.trim();
      },
      author() {
        return (document.querySelector(
          ".book_info > div:nth-child(3) > a:nth-child(1)"
        ) as HTMLElement).innerText.trim();
      },
      intro() {
        return convertDomNode(document.querySelector(".intro"))[0];
      },
      linkList() {
        return document.querySelectorAll("#dir dd a");
      },
      coverUrl() {
        return (document.querySelector(".book_info > img") as HTMLImageElement)
          .src;
      },
      chapterName: function (doc: HTMLDocument) {
        return (doc.querySelector(
          "#content .h2"
        ) as HTMLElement).innerText.trim();
      },
      content: function (doc: HTMLDocument) {
        let content: HTMLElement = doc.querySelector("#content");
        rm("h2", true, content);
        return content;
      },
    },
  ],
  [
    "www.biquwo.org",
    {
      bookname() {
        return (document.querySelector(
          "#info > h1"
        ) as HTMLElement).innerText.trim();
      },
      author() {
        return (document.querySelector(
          "#info > p:nth-child(2)"
        ) as HTMLElement).innerText
          .replace(/作\s+者：/, "")
          .trim();
      },
      intro() {
        return convertDomNode(document.querySelector("#intro"))[0];
      },
      linkList() {
        return includeLatestChapter("#list > dl:nth-child(1)");
      },
      coverUrl() {
        return (document.querySelector("#fmimg > img") as HTMLImageElement).src;
      },
      chapterName: function (doc: HTMLDocument) {
        return (doc.querySelector(
          ".bookname > h1:nth-child(1)"
        ) as HTMLElement).innerText.trim();
      },
      content: function (doc: HTMLDocument) {
        return doc.querySelector("#content");
      },
    },
  ],
  [
    "www.xkzw.org",
    {
      bookname() {
        return (document.querySelector(
          "#info > h1"
        ) as HTMLElement).innerText.trim();
      },
      author() {
        return (document.querySelector(
          "#info > p:nth-child(2)"
        ) as HTMLElement).innerText
          .replace(/作\s+者：/, "")
          .trim();
      },
      intro() {
        return convertDomNode(document.querySelector("#intro"))[0];
      },
      linkList() {
        let showmore: HTMLLinkElement = document.querySelector("#showMore a");
        let showmoreJS = showmore.href.replace("javascript:", "");
        if (!showmore.innerText.includes("点击关闭")) {
          eval(showmoreJS);
        }
        return document.querySelectorAll(".list dd > a");
      },
      coverUrl() {
        return (document.querySelector("#fmimg > img") as HTMLImageElement).src;
      },
      chapterName: function (doc: HTMLDocument) {
        return (doc.querySelector(
          ".bookname > h1:nth-child(1)"
        ) as HTMLElement).innerText.trim();
      },
      content: async function (doc: HTMLDocument) {
        runEval(CryptoJS);
        return doc.querySelector("#content");

        function runEval(CryptoJS) {
          function gettt1(str: string, keyStr: string, ivStr: string) {
            let key = CryptoJS.enc.Utf8.parse(keyStr);
            let iv = CryptoJS.enc.Utf8.parse(ivStr);
            let encryptedHexStr = CryptoJS.enc.Hex.parse(str);
            let srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
            let decrypt = CryptoJS.DES.decrypt(srcs, key, {
              iv: iv,
              mode: CryptoJS.mode.CBC,
              padding: CryptoJS.pad.Pkcs7,
            });
            let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
            return decryptedStr.toString();
          }

          function gettt2(str: string, keyStr: string, ivStr: string) {
            let key = CryptoJS.enc.Utf8.parse(keyStr);
            let iv = CryptoJS.enc.Utf8.parse(ivStr);
            let encryptedHexStr = CryptoJS.enc.Hex.parse(str);
            let srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
            let decrypt = CryptoJS.AES.decrypt(srcs, key, {
              iv: iv,
              mode: CryptoJS.mode.CBC,
              padding: CryptoJS.pad.Pkcs7,
            });
            let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
            return decryptedStr.toString();
          }

          function gettt3(str: string, keyStr: string, ivStr: string) {
            let key = CryptoJS.enc.Utf8.parse(keyStr);
            let iv = CryptoJS.enc.Utf8.parse(ivStr);
            let encryptedHexStr = CryptoJS.enc.Hex.parse(str);
            let srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
            let decrypt = CryptoJS.RC4.decrypt(srcs, key, {
              iv: iv,
              mode: CryptoJS.mode.CBC,
              padding: CryptoJS.pad.Pkcs7,
            });
            let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
            return decryptedStr.toString();
          }

          function getttn(str: string, keyStr: string, ivStr: string) {
            let key = CryptoJS.enc.Utf8.parse(keyStr);
            let iv = CryptoJS.enc.Utf8.parse(ivStr);
            let encryptedHexStr = CryptoJS.enc.Hex.parse(str);
            let srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
            let decrypt = CryptoJS.TripleDES.decrypt(srcs, key, {
              iv: iv,
              mode: CryptoJS.mode.CBC,
              padding: CryptoJS.pad.Pkcs7,
            });
            let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
            return decryptedStr.toString();
          }

          function showttt1(doc: HTMLDocument) {
            let obj = doc.getElementById("other");
            let objTips = doc.getElementById("contenttips");
            if (obj) {
              let content = obj.innerHTML.trim();
              // eslint-disable-next-line radix
              let type = parseInt(content.substring(0, 1));
              let key;
              let iv;
              if (type === 1) {
                key = content.substring(1, 9);
                iv = content.substring(9, 17);
                content = content.substring(17);
                obj.innerHTML = gettt1(content, key, iv);
                obj.style.display = "block";
                if (objTips) {
                  objTips.remove();
                }
              } else if (type === 2) {
                key = content.substring(1, 33);
                iv = content.substring(33, 49);
                content = content.substring(49);
                obj.innerHTML = gettt2(content, key, iv);
                obj.style.display = "block";
                if (objTips) {
                  objTips.remove();
                }
              } else if (type === 3) {
                key = content.substring(1, 9);
                iv = content.substring(9, 17);
                content = content.substring(17);
                obj.innerHTML = gettt3(content, key, iv);
                obj.style.display = "block";
                if (objTips) {
                  objTips.remove();
                }
              } else {
                key = content.substring(1, 25);
                iv = content.substring(25, 33);
                content = content.substring(33);
                obj.innerHTML = getttn(content, key, iv);
                obj.style.display = "block";
                if (objTips) {
                  objTips.remove();
                }
              }
            }
          }
          showttt1(doc);
        }
      },
    },
  ],
  [
    "www.shouda8.com",
    {
      bookname() {
        return (document.querySelector(
          ".bread-crumbs > li:nth-child(4)"
        ) as HTMLElement).innerText
          .replace("最新章节列表", "")
          .trim();
      },
      author() {
        return (document.querySelector(
          "div.bookname > h1 > em"
        ) as HTMLElement).innerText
          .replace("作者：", "")
          .trim();
      },
      intro() {
        let intro: HTMLElement = document.querySelector(".intro");
        rm(".book_keywords");
        rm("script", true);
        rm("#cambrian0");
        return convertDomNode(intro)[0];
      },
      linkList() {
        return document.querySelectorAll(".link_14 > dl dd a");
      },
      coverUrl() {
        return (document.querySelector(
          ".pic > img:nth-child(1)"
        ) as HTMLImageElement).src;
      },
      chapterName: function (doc: HTMLDocument) {
        return (doc.querySelector(
          ".kfyd > h2:nth-child(1)"
        ) as HTMLElement).innerText.trim();
      },
      content: function (doc: HTMLDocument) {
        let content: HTMLElement = doc.querySelector("#content");
        rm("p:last-child", false, content);
        return content;
      },
    },
  ],
  [
    "book.qidian.com",
    {
      bookname() {
        return (document.querySelector(
          ".book-info > h1 > em"
        ) as HTMLElement).innerText.trim();
      },
      author() {
        return (document.querySelector(
          ".book-info .writer"
        ) as HTMLElement).innerText
          .replace(/作\s+者:/, "")
          .trim();
      },
      intro() {
        return convertDomNode(
          document.querySelector(".book-info-detail .book-intro")
        )[0];
      },
      linkList: async () => {
        return new Promise((resolve, reject) => {
          let list;
          const getLiLength = () =>
            document.querySelectorAll("#j-catalogWrap li").length;
          const getlinkList = () =>
            document.querySelectorAll(
              '.volume-wrap ul.cf li a:not([href^="//vipreader"]'
            );
          if (getLiLength() !== 0) {
            list = getlinkList();
            setTimeout(() => {
              if (getLiLength() !== 0) {
                list = getlinkList();
                resolve(list);
              } else {
                reject(new Error("Can't found linkList."));
              }
            }, 3000);
          } else {
            list = getlinkList();
            resolve(list);
          }
        });
      },
      coverUrl() {
        return (document.querySelector("#bookImg > img") as HTMLImageElement)
          .src;
      },
      chapterName: function (doc: HTMLDocument) {
        return (doc.querySelector(
          ".j_chapterName > .content-wrap"
        ) as HTMLElement).innerText.trim();
      },
      content: function (doc: HTMLDocument) {
        return doc.querySelector(".read-content");
      },
      CORS: true,
    },
  ],
  [
    "www.ciweimao.com",
    {
      bookname() {
        return (document.querySelector(
          ".book-catalog .hd h3"
        ) as HTMLElement).innerText.trim();
      },
      author() {
        return (document.querySelector(
          ".book-catalog .hd > p > a"
        ) as HTMLElement).innerText.trim();
      },
      intro: async () => {
        const bookid = unsafeWindow.HB.book.book_id;
        const indexUrl = "https://www.ciweimao.com/book/" + bookid;
        return crossPage(
          indexUrl,
          "convertDomNode(doc.querySelector('.book-intro-cnt .book-desc'))[0]"
        );
      },
      linkList() {
        document
          .querySelectorAll(".book-chapter-list > li > a > i")
          .forEach((i) => i.parentElement.classList.add("not_download"));
        return document.querySelectorAll(
          ".book-chapter-list > li > a:not(.not_download)"
        );
      },
      coverUrl: async () => {
        const bookid = unsafeWindow.HB.book.book_id;
        const indexUrl = "https://www.ciweimao.com/book/" + bookid;
        return crossPage(indexUrl, "doc.querySelector('.cover > img').src");
      },
      chapterName: function (doc: HTMLDocument) {
        rm("h3.chapter i", false, doc);
        return (doc.querySelector(
          "h3.chapter"
        ) as HTMLElement).innerText.trim();
      },
      content: async function (doc: HTMLDocument) {
        const url = doc.baseURI;
        const chapter_id = url.split("/").slice(-1)[0];

        let _chapter_author_says = doc.querySelectorAll(
          "#J_BookCnt .chapter.author_say"
        );
        let div_chapter_author_say;
        if (_chapter_author_says.length !== 0) {
          let hr = document.createElement("hr");
          div_chapter_author_say = document.createElement("div");
          div_chapter_author_say.appendChild(hr);
          for (let _chapter_author_say of _chapter_author_says) {
            rm("i", true, _chapter_author_say);
            div_chapter_author_say.appendChild(_chapter_author_say);
          }
        }

        let content = document.createElement("div");
        let decryptDate;
        while (true) {
          if (!window.lock) {
            window.lock = true;
            decryptDate = await chapterDecrypt(chapter_id, url)
              .catch((error) => {
                console.error(error);
                chapterDecrypt(chapter_id, url);
              })
              .catch((error) => {
                window.lock = false;
                throw error;
              });
            window.lock = false;
            break;
          } else {
            await sleep(17);
          }
        }
        content.innerHTML = decryptDate;
        rm(".chapter span", true, content);
        if (_chapter_author_says.length !== 0) {
          content.appendChild(div_chapter_author_say);
        }
        return content;

        async function chapterDecrypt(chapter_id: number, refererUrl: string) {
          const rootPath = "https://www.ciweimao.com/";
          const access_key_url = rootPath + "chapter/ajax_get_session_code";
          const chapter_content_url =
            rootPath + "chapter/get_book_chapter_detail_info";

          console.log(`请求 ${access_key_url} Referer ${refererUrl}`);
          const access_key_obj: Object = await gfetch(access_key_url, {
            method: "POST",
            headers: {
              Accept: "application/json, text/javascript, */*; q=0.01",
              "Content-Type":
                "application/x-www-form-urlencoded; charset=UTF-8",
              Referer: refererUrl,
              Origin: "https://www.ciweimao.com",
              "X-Requested-With": "XMLHttpRequest",
            },
            data: `chapter_id=${chapter_id}`,
            responseType: "json",
          }).then((response) => response.response);
          const chapter_access_key = access_key_obj.chapter_access_key;

          console.log(`请求 ${chapter_content_url} Referer ${refererUrl}`);
          const chapter_content_obj = await gfetch(chapter_content_url, {
            method: "POST",
            headers: {
              Accept: "application/json, text/javascript, */*; q=0.01",
              "Content-Type":
                "application/x-www-form-urlencoded; charset=UTF-8",
              Referer: refererUrl,
              Origin: "https://www.ciweimao.com",
              "X-Requested-With": "XMLHttpRequest",
            },
            data: `chapter_id=${chapter_id}&chapter_access_key=${chapter_access_key}`,
            responseType: "json",
          }).then((response) => response.response);

          if (chapter_content_obj.code !== 100000) {
            console.error(chapter_content_obj);
            throw new Error(`下载 ${refererUrl} 失败`);
          }
          return decrypt({
            content: chapter_content_obj.chapter_content,
            keys: chapter_content_obj.encryt_keys,
            accessKey: chapter_access_key,
          });
        }

        function decrypt(item) {
          let message = item.content;
          let keys = item.keys;
          let len = item.keys.length;
          let accessKey = item.accessKey;
          let accessKeyList = accessKey.split("");
          let charsNotLatinNum = accessKeyList.length;

          let output = new Array();
          output.push(
            keys[accessKeyList[charsNotLatinNum - 1].charCodeAt(0) % len]
          );
          output.push(keys[accessKeyList[0].charCodeAt(0) % len]);

          for (let i = 0; i < output.length; i++) {
            message = atob(message);
            let data = output[i];
            let iv = btoa(message.substr(0, 16));
            let keys255 = btoa(message.substr(16));
            let pass = CryptoJS.format.OpenSSL.parse(keys255);
            message = CryptoJS.AES.decrypt(
              pass,
              CryptoJS.enc.Base64.parse(data),
              {
                iv: CryptoJS.enc.Base64.parse(iv),
                format: CryptoJS.format.OpenSSL,
              }
            );
            if (i < output.length - 1) {
              message = message.toString(CryptoJS.enc.Base64);
              message = atob(message);
            }
          }
          return message.toString(CryptoJS.enc.Utf8);
        }
      },
      maxConcurrency: 3,
    },
  ],
  [
    "www.jjwxc.net",
    {
      bookname() {
        return (document.querySelector(
          'h1[itemprop="name"] > span'
        ) as HTMLSpanElement).innerText.trim();
      },
      author() {
        return (document.querySelector(
          "td.sptd h2 a span"
        ) as HTMLSpanElement).innerText.trim();
      },
      intro() {
        let intro: HTMLElement = document.querySelector("#novelintro");
        rm("img", true, intro);
        return convertDomNode(intro)[0];
      },
      linkList() {
        return document.querySelectorAll(
          'tr[itemprop*="chapter"] > td:nth-child(2) > span a[href]'
        );
      },
      coverUrl() {
        return (document.querySelector(
          ".noveldefaultimage"
        ) as HTMLImageElement).src;
      },
      chapterName: function (doc: HTMLDocument) {
        return (doc.querySelector(
          "div.noveltext h2"
        ) as HTMLElement).innerText.trim();
      },
      content: function (doc: HTMLDocument) {
        let content: HTMLElement = doc.querySelector("div.noveltext");
        rm("div:first-child", false, content);
        rm('div[style="display:none"]', true, content);
        rm("#favoriteshow_3", false, content);
        rm('div[align="right"]', true, content);
        rm('div[style="clear: both;"]', true, content);
        rm('div[style="width:710px;height:70px;float:right;"]', true, content);
        rm("div.noveltext div.readsmall  > hr", true, content);
        rm("div:first-child", false, content);
        return content;
      },
      charset: "GB18030",
    },
  ],
  [
    "book.sfacg.com",
    {
      bookname() {
        return (document.querySelector(
          "h1.story-title"
        ) as HTMLElement).innerText.trim();
      },
      author: async () => {
        const indexUrl = document.location.href.replace("/MainIndex/", "");
        return crossPage(
          indexUrl,
          "doc.querySelector('.author-name').innerText.trim()"
        );
      },
      intro: async () => {
        const indexUrl = document.location.href.replace("/MainIndex/", "");
        return crossPage(
          indexUrl,
          "convertDomNode(doc.querySelector('.introduce'))[0]"
        );
      },
      linkList() {
        return document.querySelectorAll(
          '.catalog-list li a:not([href^="/vip"])'
        );
      },
      coverUrl: async () => {
        const indexUrl = document.location.href.replace("/MainIndex/", "");
        return crossPage(
          indexUrl,
          "doc.querySelector('#hasTicket div.pic img').src"
        );
      },
      chapterName: function (doc: HTMLDocument) {
        return (doc.querySelector(
          "h1.article-title"
        ) as HTMLElement).innerText.trim();
      },
      content: function (doc: HTMLDocument) {
        return doc.querySelector(".article-content");
      },
    },
  ],
  [
    "www.gebiqu.com",
    {
      bookname() {
        return (document.querySelector(
          "#info > h1"
        ) as HTMLElement).innerText.trim();
      },
      author() {
        return (document.querySelector(
          "#info > p:nth-child(2)"
        ) as HTMLElement).innerText
          .replace(/作\s+者：/, "")
          .trim();
      },
      intro() {
        let intro: HTMLElement = document.querySelector("#intro");
        intro.innerHTML = intro.innerHTML.replace(
          /如果您喜欢.+，别忘记分享给朋友/,
          ""
        );
        rm('a[href^="http://down.gebiqu.com"]', false, intro);
        return convertDomNode(intro)[0];
      },
      linkList() {
        return includeLatestChapter("#list > dl:nth-child(1)");
      },
      coverUrl() {
        return (document.querySelector("#fmimg > img") as HTMLImageElement).src;
      },
      chapterName: function (doc: HTMLDocument) {
        return (doc.querySelector(
          ".bookname > h1:nth-child(1)"
        ) as HTMLElement).innerText.trim();
      },
      content: function (doc: HTMLDocument) {
        let content = doc.querySelector("#content");
        content.innerHTML = content.innerHTML.replace("www.gebiqu.com", "");
        return content;
      },
    },
  ],
  [
    "www.meegoq.com",
    {
      bookname() {
        return (document.querySelector(
          "article.info > header > h1"
        ) as HTMLElement).innerText
          .replace(/最新章节$/, "")
          .trim();
      },
      author: async () => {
        const indexUrl = document.location.href.replace("/book", "/info");
        return crossPage(
          indexUrl,
          "doc.querySelector('article.info > p.detail.pt20 > i:nth-child(1) > a').innerText.trim()"
        );
      },
      intro: async () => {
        const indexUrl = document.location.href.replace("/book", "/info");
        return crossPage(
          indexUrl,
          `(() => {
            let intro = doc.querySelector("article.info > p.desc");
            let b = intro.querySelector("b");
            if (b) { b.remove() };
            return convertDomNode(intro)[0];
          })()`
        );
      },
      linkList() {
        let ul: HTMLUListElement = document.querySelector("ul.mulu");
        let rLi: HTMLOListElement = ul.querySelector("li:nth-child(1)");
        if (rLi.innerText.match(/最新.章/)) {
          let p: null | HTMLElement = null;
          let n: HTMLElement | null = rLi;
          while (true) {
            if (n.nodeName === "LI" && n.childElementCount !== 0) {
              p = n;
              n = n.nextSibling;
              p.classList.add("not_download");
            } else if (
              n.nodeName === "LI" &&
              n.childElementCount === 0 &&
              !n.innerText.match(/最新.章/)
            ) {
              break;
            } else {
              p = n;
              n = n.nextSibling;
            }
          }
        }
        return ul.querySelectorAll("li:not(.not_download) > a");
      },
      coverUrl: async () => {
        const indexUrl = document.location.href.replace("/book", "/info");
        return crossPage(
          indexUrl,
          "doc.querySelector('article.info > div.cover > img').src"
        );
      },
      chapterName: function (doc: HTMLDocument) {
        return (doc.querySelector(
          "article > header > h1"
        ) as HTMLElement).innerText.trim();
      },
      content: function (doc: HTMLDocument) {
        return doc.querySelector("#content");
      },
      maxConcurrency: 1,
      maxRetryTimes: 5,
    },
  ],
]);

interface Rule {
  bookname: () => string;
  author: () => string;
  intro: () => string;
  linkList: () => NodeList;
  coverUrl: () => string;
  chapterName: () => string;
  content: () => HTMLElement;
  charset?: string;
  CORS?: boolean;
  maxRetryTimes?: number;
  maxConcurrency?: number;
  maxImgConcurrency?: number;
}

const enableDebug = false;
const defaultMaxRetryTimes = 3;
const defaultMaxConcurrency = 10;
const defaultMaxImgConcurrency = 5;

const host: string = document.location.host;
const rule: Rule = rules.get(host);
const charset: string = rule.charset;
const CORS: boolean = rule.CORS;
const customMaxRetryTimes: number = rule.maxRetryTimes;
const customMaxConcurrency: number = rule.maxConcurrency;
const customMaxImgConcurrency: number = rule.maxImgConcurrency;

let maxRetryTimes: number;
let maxConcurrency: number;
let maxImgConcurrency: number;
if (customMaxRetryTimes) {
  maxRetryTimes = customMaxRetryTimes;
} else {
  maxRetryTimes = defaultMaxRetryTimes;
}
if (customMaxConcurrency) {
  maxConcurrency = customMaxConcurrency;
} else {
  maxConcurrency = defaultMaxConcurrency;
}
if (customMaxImgConcurrency) {
  maxImgConcurrency = customMaxImgConcurrency;
} else {
  maxImgConcurrency = defaultMaxImgConcurrency;
}

const icon0 =
  "data:image/png;base64,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";
const icon1 =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAAAA3NCSVQICAjb4U/gAAAACXBIWXMAAANSAAADUgEQACRKAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAUdQTFRF////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAiYSOVQAAAGx0Uk5TAAECAwQFCAkKCwwNDhETFRkaHB0fICMkKCwwNTg5PD1AQUZKTk9QV1tcX2BjZGhtb3B2eHl6fX6AgYKHi4+QlJicnaChpamur7C3uru+v8LEyMzP0NXZ3N3f4OTn6uvt7/Hy8/T2+Pn6/P3+VI4wmgAAAyxJREFUeNrtmVdT4zAUhTFs6BB6Cb13WLpooffeQjW9hMT//3mVJbsT4li6ahbD6D4y5p5vzrGuFDkry5QpznLSygAYAANgAAyAATAABsAAGAADYAAMgAEwAD8XADlChTQTIM0eIM0pIM3vAdL8JiLNawFpXo1I8zxAmicS0jwTkeapjDTvC8r0gQQK9UEESvUBBIr1qQTK9SkESvR/wQkQ5V95KhS+Q1AC14N34ZCYenD0LGNjoH7ij2ejQV71QPd2lNQapI8rut0d4LMe0Bz4CHMUSetZCGgPMESRYj1cAGARMIqv1kMlgK8pNQq39TARBB8VhCgyW59S414y6frjxDYeUYTCNnnKHw4WeUxl1/wtGjwk97LToyBan6irmRrPfSHj/K+ZuSJ3TImCav3zaqvlvTN57T9W6+ozJAqa9fH9/gLS3kja/wr69+PUKMhGXUxVie0mVVMXZAUSwONys4ztvHn5kQcgttubJ+tEkde7G2MEiExUyD3VVExE4AAPS40qTlaNSw8QgI+dnlxVx8ncnp0PCsD5WJnaI23Z2Lk3wP1igx83jA2L998V4G8E5WrVy0kRfIeXMLkMm1TIN8GWYXIQTVbKVa+cjLCO4r2+fFnq+X17MZ7N6GmlxRJXt1pWnjh3Q1yX09Vi8tXTl/zb8eeB5GCgkFe9cOAgTutPBcD1stbGEYXVtvYCaA4BwHU9W8smXzt7DesMBMB1NFQMVS8eOgK3hQM4zut6ezZdPbt9/ZWhKQsArpu5OrJ83dwNW0dGAFzHwyVe6iXDx8zt2AEc522jI8etntOx8cbRjAcA1+18/Vf5+vlbvk6cALhORkr/qZeOnHC34QdwnPfNTvzjLtC5+S7QRAQg8eNuYcEW6yAIIF4GQD8A9W5IZX3eFQW6tqI61KNbXf9vy4K/T/2Wd90X+hqFnfHG1K8oUq1nuqpVZD3zjal865nvjBVY74pC/qpg/nYkNQqb6+uZrChYrFcQhcBnOwlR2KIfLoUGlIj1EgaUsPVCUcixnjcKmdZzRCHdeqYo1FgPjUKl9YAolFtPjMIf672i8NP6DFH4br2pH1d/AAm28mJJn9pPAAAAAElFTkSuQmCC";

export {
  enableDebug,
  rule,
  charset,
  CORS,
  maxRetryTimes,
  maxConcurrency,
  maxImgConcurrency,
  icon0,
  icon1,
};

// run on https://www.ciweimao.com/chapter-list/100169491/book_detail

(() => {
  if (!window.CryptoJS) {
    let script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/crypto-js@4.0.0/crypto-js.min.js";
    document.body.appendChild(script);
  }

  const chapter_id = 105212208;
  const refererUrl = "https://www.ciweimao.com/chapter/105212208";

  chapterDecrypt(chapter_id, refererUrl).then(console.log);

  async function chapterDecrypt(chapter_id, refererUrl) {
    const rootPath = "https://www.ciweimao.com/";
    const access_key_url = rootPath + "chapter/ajax_get_session_code";
    const chapter_content_url =
      rootPath + "chapter/get_book_chapter_detail_info";

    const access_key_obj = await gfetch(access_key_url, {
      method: "POST",
      headers: {
        Accept: "application/json, text/javascript, */*; q=0.01",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        Referer: refererUrl,
        Origin: "https://www.ciweimao.com",
        "X-Requested-With": "XMLHttpRequest",
      },
      data: `chapter_id=${chapter_id}`,
      responseType: "json",
    }).then((response) => response.response);
    const chapter_access_key = access_key_obj.chapter_access_key;

    const chapter_content_obj = await gfetch(chapter_content_url, {
      //             const chapter_content_obj = await gfetch('https://httpbin.org/post', {
      method: "POST",
      headers: {
        Accept: "application/json, text/javascript, */*; q=0.01",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        Referer: refererUrl,
        Origin: "https://www.ciweimao.com",
        "X-Requested-With": "XMLHttpRequest",
      },
      data: `chapter_id=${chapter_id}&chapter_access_key=${chapter_access_key}`,
      responseType: "json",
    }).then((response) => response.response);

    if (chapter_content_obj.code !== 100000) {
      return new Error("Fail to request chapter_content_obj");
    }
    return decrypt({
      content: chapter_content_obj.chapter_content,
      keys: chapter_content_obj.encryt_keys,
      accessKey: chapter_access_key,
    });
  }

  function decrypt(item) {
    var message = item.content;
    var keys = item.keys;
    var len = item.keys.length;
    var accessKey = item.accessKey;
    var accessKeyList = accessKey.split("");
    var charsNotLatinNum = accessKeyList.length;

    var output = new Array();
    output.push(keys[accessKeyList[charsNotLatinNum - 1].charCodeAt(0) % len]);
    output.push(keys[accessKeyList[0].charCodeAt(0) % len]);

    for (let i = 0; i < output.length; i++) {
      message = atob(message);
      var data = output[i];
      var iv = btoa(message.substr(0, 16));
      var keys255 = btoa(message.substr(16));
      var pass = CryptoJS.format.OpenSSL.parse(keys255);
      message = CryptoJS.AES.decrypt(pass, CryptoJS.enc.Base64.parse(data), {
        iv: CryptoJS.enc.Base64.parse(iv),
        format: CryptoJS.format.OpenSSL,
      });
      if (i < output.length - 1) {
        message = message.toString(CryptoJS.enc.Base64);
        message = atob(message);
      }
    }
    return message.toString(CryptoJS.enc.Utf8);
  }
})();

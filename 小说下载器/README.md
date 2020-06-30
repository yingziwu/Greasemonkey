# 小说下载器

本脚本是一个**可扩展的**通用型小说下载器，适用于大多数小说网站。

## 使用方法

如果本脚本支持该小说网站，当打开小说目录页时，网页右上角会出现下载图标，点击该图标即可开始下载。

当下载完成后，会自动下载一个txt文档及zip压缩包。

如果你要下载的小说章节较多，等待时间可能较长，此时请耐心等待。

你也可以按下F12，打开网页控制台查看当前下载状态。

![demo](demo.png)

## 目前支持小说网站

- [起点](https://www.qidian.com/)、[晋江](http://www.jjwxc.net/)、[SF轻小说](http://book.sfacg.com/)、[刺猬猫](https://www.ciweimao.com)的免费章节
- [亿软小说](http://www.yruan.com/)、[精彩小说网](https://www.jingcaiyuedu.com/)、[书趣阁](http://www.shuquge.com/)、[顶点小说](https://www.dingdiann.com/)、[2k小说阅读网](https://www.fpzw.com/)、[和图书](https://www.hetushu.com/)、[笔趣窝](http://www.biquwo.org/)、[星空文学](http://www.xkzw.org/)、[手打吧](http://www.shouda8.com/)

## 添加更多网站

你可以通过添加抓取规则以添加更多小说网站，即向 `rules` Map 中添加新的条目。

抓取规则示例：

```javascript
["www.yruan.com", {
    bookname() { return document.querySelector('#info > h1:nth-child(1)').innerText.trim() },
    author() { return document.querySelector('#info > p:nth-child(2)').innerText.replace(/作\s+者:/, '').trim() },
    intro() { return convertDomNode(document.querySelector('#intro > p'))[0] },
    linkList() { return document.querySelectorAll('div.box_con div#list dl dd a') },
    coverUrl() { return document.querySelector('#fmimg > img').src; },
    chapterName: function(doc) { return doc.querySelector('.bookname > h1:nth-child(1)').innerText.trim() },
    content: function(doc) { return doc.querySelector('#content') },
}],
```

抓取规则的 `key` 为该抓取规则适用的网站域名，即 `document.location.host`。

抓取规则的 `value` 一对象，该对象由7个函数1个变量组成：

|函数名|功能|返回值|
|----|----|-----|
|`bookname()` |抓取小说题名|[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)|
|`author()`  |抓取小说作者|[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)|
|`intro()`   |抓取小说简介|[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)|
|`linkList()`|抓取小说分章链接列表|[NodeList](https://developer.mozilla.org/en-US/docs/Web/API/NodeList) |
|`coverUrl()`|抓取小说封面图片地址|[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)|

以上5个函数在小说目录页（即按下按钮时的页面）运行。

|函数名|功能|返回值|
|----|----|-----|
|`chapterName(doc)` |抓取小说章节名|[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)|
|`content(doc)`     |抓取小说章节主体部分|[Element](https://developer.mozilla.org/en-US/docs/Web/API/Element)|

以上2个函数在小说章节页运行，输入值 `doc` 为小说章节页的 `document` 。

|变量名|功能|备注|
|----|----|-----|
|`charset`|网站响应的编码方式|可选|
|`CORS`|抓取章节时是否跨域|可选|
|`maxRetryTimes` |最大重试次数（默认为3） |可选|
|`maxConcurrency` |下载文本时最大并发数（默认为10）|可选|
|`maxImgConcurrency` |下载图片时最大并发数（默认为5）|可选|

若网站返回的响应非 `UTF-8` 编码，请添加 `charset` 变量注明编码方式。网站当前编码方式可通过 `document.charset` 查看。

对于起点这样抓取章节页需要跨域的网站，请将 `CORS` 设为 `true` 。

根据上述要求添加好相应网站抓取规则，并在 `// @match` 中添加相应网站，即可在新网站上使用本下载器。

## 调试功能

将 `enableDebug` 变量改为 `true` 可开启调试功能，开启之后可在控制台（console）中访问如下对象：

|对象名|类型|功能|
|-----|---|----|
|`rule`                    |变量    |当前网站抓取规则|
|`main(rule)`              |函数    |运行下载器|
|`convertDomNode(node)`    |函数    |输出处理后的txt文本及Dom节点|
|`ruleTest(rule)`          |函数    |测试抓取规则|
|`gfetch(url,option)`      |函数    |使用 `GM_xmlhttpRequest` 进行请求|


## License

AGPL-3.0-or-later
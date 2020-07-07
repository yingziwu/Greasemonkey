

/*  本下载器可添加抓取规则以支持更多网站

    抓取规则示例：
    ["www.yruan.com", {
        bookname() { return document.querySelector('#info > h1:nth-child(1)').innerText.trim() },
        author() { return document.querySelector('#info > p:nth-child(2)').innerText.replace(/作\s+者:/, '').trim() },
        intro() { return convertDomNode(document.querySelector('#intro > p'))[0] },
        linkList() { return document.querySelectorAll('div.box_con div#list dl dd a') },
        coverUrl() { return document.querySelector('#fmimg > img').src; },
        chapterName: function(doc) { return doc.querySelector('.bookname > h1:nth-child(1)').innerText.trim() },
        content: function(doc) { return doc.querySelector('#content') },
    }],

    抓取规则的 `key` 为该抓取规则适用的网站域名，即 `document.location.host`。

    抓取规则的 `value` 一对象，该对象由7个函数组成：

    函数名          功能                返回值
    bookname()	抓取小说题名            String
    author()	抓取小说作者	        String
    intro()	    抓取小说简介	        String
    linkList()	抓取小说分章链接列表     NodeList
    coverUrl()	抓取小说封面图片地址     String

    以上5个函数在小说目录页（即按下按钮时的页面）运行。

    函数名                  功能                返回值
    chapterName(doc)    抓取小说章节名          String
    content(doc)        抓取小说章节主体部分     Element

    以上2个函数在小说章节页运行，输入值 `doc` 为小说章节页的 `document` 。

    变量名	                功能	                    备注
    charset	            网站响应的编码方式	             可选
    CORS	            抓取章节时是否跨域	             可选
    maxRetryTimes       最大重试次数（默认为3）           可选
    maxConcurrency      下载文本时最大并发数（默认为10）   可选
    maxImgConcurrency   下载图片时最大并发数（默认为5）    可选

    若网站返回的响应非 UTF-8 编码，请添加 charset 变量注明编码方式。网站当前编码方式可通过 document.charset 查看。
    对于起点这样抓取章节页需要跨域的网站，请将 CORS 设为 true 。

    根据上述要求添加好相应网站抓取规则，并在 `// @match` 中添加相应网站，即可在新网站上使用本下载器。

    调试功能：
    将 `enableDebug` 变量改为 `true` 可开启调试功能，开启之后可在控制台（console）中访问如下对象：

    对象名	                    类型	  功能
    rule                        变量    当前抓取规则
    main(rule)                  函数    运行下载器
    convertDomNode(node)        函数    输出处理后的txt文本及Dom节点
    ruleTest(rule[, callback])  函数    测试抓取规则
    gfetch(url,option)          函数	使用 GM_xmlhttpRequest 进行请求

    url                 the destination URL
    gfetch 可用 option 选项：
    method              one of GET, HEAD, POST
    headers             ie. user-agent, referer, ... (some special headers are not supported by Safari and Android browsers)
    data                some string to send via a POST request
    cookie              a cookie to be patched into the sent cookie set
    binary              send the data string in binary mode
    nocache             don't cache the resource
    revalidate          revalidate maybe cached content
    timeout             a timeout in ms
    context             a property which will be added to the response object
    responseType        one of arraybuffer, blob, json
    overrideMimeType    a MIME type for the request
    anonymous           don't send cookies with the requests (please see the fetch notes)
    username            a username for authentication
    password            a password

    gfetch 返回值：
    finalUrl            the final URL after all redirects from where the data was loaded
    readyState          the ready state
    status              the request status
    statusText          the request status text
    responseHeaders     the request response headers
    response            the response data as object if details.responseType was set
    responseXML         the response data as XML document
    responseText        the response data as plain string

*/
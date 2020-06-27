const rules = new Map([
    ["www.yruan.com", {
        bookname() { return document.querySelector('#info > h1:nth-child(1)').innerText.trim() },
        author() { return document.querySelector('#info > p:nth-child(2)').innerText.replace(/作\s+者:/, '').trim() },
        intro() { return convertDomNode(document.querySelector('#intro > p'))[0] },
        linkList() { return document.querySelectorAll('div.box_con div#list dl dd a') },
        coverUrl() { return document.querySelector('#fmimg > img').src },
        chapterName: function(doc) { return doc.querySelector('.bookname > h1:nth-child(1)').innerText.trim() },
        content: function(doc) { return doc.querySelector('#content') },
    }],
    ["www.jingcaiyuedu.com", {
        bookname() { return document.querySelector('div.row.text-center.mb10 > h1:nth-child(1)').innerText.trim() },
        author() { return document.querySelector('div.row.text-center.mb10 a[href^="/novel/"]').innerText.trim() },
        intro: async() => {
            const indexUrl = document.location.href.replace(/\/list.html$/, '.html');
            return (crossPage(indexUrl, "convertDomNode(doc.querySelector('#bookIntro'))[0]"))
        },
        linkList() { return document.querySelectorAll('dd.col-md-4 > a') },
        coverUrl: async() => {
            const indexUrl = document.location.href.replace(/\/list.html$/, '.html');
            return (crossPage(indexUrl, "doc.querySelector('.panel-body img').getAttribute('data-original')"))
        },
        chapterName: function(doc) { return doc.querySelector('h1.readTitle').innerText.trim() },
        content: function(doc) {
            let c = doc.querySelector('#htmlContent');
            let ad = c.querySelector('p:nth-child(1)');
            if (ad.innerText.includes('精彩小说网')) { ad.remove() }
            return c
        },
    }],
    ["www.shuquge.com", {
        bookname() { return document.querySelector('.info > h2').innerText.trim() },
        author() { return document.querySelector('.small > span:nth-child(1)').innerText.replace(/作者：/, '').trim() },
        intro() {
            let iNode = document.querySelector('.intro');
            iNode.innerHTML = iNode.innerHTML.replace(/推荐地址：http:\/\/www.shuquge.com\/txt\/\d+\/index\.html/, '');
            return convertDomNode(iNode)[0];
        },
        linkList() { return includeLatestChapter('.listmain > dl:nth-child(1)') },
        coverUrl() { return document.querySelector('.info > .cover > img').src },
        chapterName: function(doc) { return doc.querySelector('.content > h1:nth-child(1)').innerText.trim() },
        content: function(doc) {
            let content = doc.querySelector('#content');
            content.innerHTML = content.innerHTML.replace('请记住本书首发域名：www.shuquge.com。书趣阁_笔趣阁手机版阅读网址：m.shuquge.com', '').replace(/http:\/\/www.shuquge.com\/txt\/\d+\/\d+\.html/, '');
            return content
        },
    }],
    ["www.dingdiann.com", {
        bookname() { return document.querySelector('#info > h1:nth-child(1)').innerText.trim() },
        author() { return document.querySelector('#info > p:nth-child(2)').innerText.replace(/作\s+者：/, '').trim() },
        intro() { return convertDomNode(document.querySelector('#intro'))[0] },
        linkList() { return includeLatestChapter('#list > dl') },
        coverUrl() { return document.querySelector('#fmimg > img').src },
        chapterName: function(doc) { return doc.querySelector('.bookname > h1:nth-child(1)').innerText.trim() },
        content: function(doc) {
            let content = doc.querySelector('#content');
            let ad = '<div align="center"><a href="javascript:postError();" style="text-align:center;color:red;">章节错误,点此举报(免注册)</a>,举报后维护人员会在两分钟内校正章节内容,请耐心等待,并刷新页面。</div>';
            content.innerHTML = content.innerHTML.replace(ad, '').replace(/http:\/\/www.shuquge.com\/txt\/\d+\/\d+\.html/, '');
            return content
        },
    }],
    ["www.fpzw.com", {
        bookname() { return document.querySelector('#title > h1:nth-child(1)').innerText.trim() },
        author() { return document.querySelector('.author > a:nth-child(1)').innerText.trim() },
        intro: async() => {
            const indexUrl = document.location.href.replace(/xiaoshuo\/\d+\//, '');
            const charset = 'GBK';
            return (crossPage(indexUrl, "convertDomNode(doc.querySelector('.wright .Text'))[0]", charset))
        },
        linkList() { return includeLatestChapter('.book') },
        coverUrl: async() => {
            const indexUrl = document.location.href.replace(/xiaoshuo\/\d+\//, '');
            const charset = 'GBK';
            return (crossPage(indexUrl, "doc.querySelector('div.bortable.wleft > img').src", charset))
        },
        chapterName: function(doc) { return doc.querySelector('h2').innerText.trim() },
        content: function(doc) {
            let content = doc.querySelector('.Text');
            content.querySelector('.Text > a:nth-child(1)').remove();
            content.querySelector('.Text > font[color="#F00"]').remove();
            content.querySelector('strong.top_book').remove();
            return content
        },
        charset: 'GBK',
    }],
    ["www.hetushu.com", {
        bookname() { return document.querySelector('.book_info > h2').innerText.trim() },
        author() { return document.querySelector('.book_info > div:nth-child(3) > a:nth-child(1)').innerText.trim() },
        intro() { return convertDomNode(document.querySelector('.intro'))[0] },
        linkList() { return document.querySelectorAll('#dir dd a') },
        coverUrl() { return document.querySelector('.book_info > img').src },
        chapterName: function(doc) { return doc.querySelector('#content .h2').innerText.trim() },
        content: function(doc) {
            let content = doc.querySelector('#content');
            content.querySelectorAll('h2').forEach(n => n.remove())
            return content
        },
    }]
]);


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
async function imgWorker(imgTask) {
    const url = imgTask.url;
    const filename = imgTask.filename;

    let imgObject;
    await fetch(url)
        .then(response => {
                imgObject = {
                    'type': response.headers.get('Content-Type').split('/')[1],
                    'file': response.blob(),
                    'url': response.url
                };
            },
            async error => {
                console.error(error);
                console.log(`try GM_xmlhttpRequest:\t${url}`);
                await gfetch(url, { responseType: 'blob' })
                    .then(response => {
                        const _headers = response.responseHeaders.split('\r\n');
                        let headers = {};
                        for (let _header of _headers) {
                            let k, v;
                            [k, v] = _header.split(/:\s+/);
                            headers[k] = v;
                        }
                        imgObject = {
                            'type': headers['content-type'].split('/')[1],
                            'file': response.response,
                            'url': response.finalUrl
                        };
                    })
            })

    const output = { 'filename': filename, 'imgObject': imgObject }
    return output
}


function gfetch(url, { method, headers, data, cookie, binary, nocache, revalidate, timeout, context, responseType, overrideMimeType, anonymous, username, password } = {}) {
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
            onload: (obj) => { resolve(obj) },
            onerror: (err) => { reject(err) }
        })
    })
}

function convertDomNode(node) {
    let txtOut = '';
    let htmlOut = document.createElement('div');
    let brc = 0;
    [txtOut, htmlOut, brc] = walker(null, node.childNodes[0], node, brc, txtOut, htmlOut);
    txtOut = txtOut.trim();
    return [txtOut, htmlOut]
}

function walker(p, n, r, brc, txtOut, htmlOut) {
    let pNodeName, nNodeName;
    if (p) { pNodeName = p.nodeName; } else { pNodeName = null; }
    if (n) { nNodeName = n.nodeName; } else { nNodeName = null; }

    const nodeType2 = ['DIV', 'P', 'OL', 'H1', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'];
    const nodeType3 = ['SCRIPT', 'STYLE', '#comment'];

    let lastNode;
    if (htmlOut.childElementCount !== 0) {
        lastNode = htmlOut.childNodes[htmlOut.childElementCount - 1];
    } else {
        lastNode = document.createElement('p');
    }

    if (nodeType3.includes(nNodeName)) {
        //pass
    } else if (nNodeName === 'BR') {
        brc++
    } else if (nNodeName == 'HR') {
        txtOut = txtOut + '\n' + '-'.repeat(15) + 'n';
        let hr = document.createElement('hr');
        htmlOut.appendChild(hr);
    } else if (nNodeName === '#text') {
        const nodetext = n.textContent.trim()
            .replace(/(\s+)?\n+(\s+)?/g, '').replace(/\s+/, ' ');
        if (nodetext) {
            if (brc === 0) {
                if (nodeType2.includes(pNodeName)) {
                    txtOut = txtOut + '\n'.repeat(2) + nodetext;
                    let p0 = document.createElement('p');
                    p0.innerText = nodetext;
                    htmlOut.appendChild(p0);
                } else {
                    txtOut = txtOut + nodetext;
                    lastNode.innerText = lastNode.innerText + nodetext;
                }
            } else if (brc === 1 || brc === 2) {
                txtOut = txtOut + '\n'.repeat(brc) + nodetext;

                let p0 = document.createElement('p');
                p0.innerText = nodetext;
                htmlOut.appendChild(p0);
            } else {
                txtOut = txtOut + '\n'.repeat(3) + nodetext;

                let p1 = document.createElement('p');
                let p2 = p1.cloneNode();
                let br = document.createElement('br');
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
                    txtOut = txtOut + '\n'.repeat(3) + nodetext;

                    let p1 = document.createElement('p');
                    let p2 = p1.cloneNode();
                    let br = document.createElement('br');
                    p1.appendChild(br);
                    p2.innerText = nodetext;
                    htmlOut.appendChild(p1);
                    htmlOut.appendChild(p2);
                } else {
                    txtOut = txtOut + '\n'.repeat(2) + nodetext;

                    let p0 = document.createElement('p');
                    p0.innerText = nodetext;
                    htmlOut.appendChild(p0);
                }
            }
        } else {
            [txtOut, htmlOut, brc] = walker(null, n.childNodes[0], n, brc + 2, txtOut, htmlOut);
        }
    } else if (n.childElementCount === 0) {
        const nodetext = n.innerText.trim();
        if (nodetext) {
            txtOut = txtOut + nodetext;
            lastNode.innerText = lastNode.innerText + nodetext;
        }
    } else if (n.childElementCount !== 0) {
        [txtOut, htmlOut, brc] = walker(null, n.childNodes[0], n, brc, txtOut, htmlOut);
    }


    p = n;
    n = n.nextSibling;
    if (n === null) {
        return [txtOut, htmlOut, brc]
    } else {
        [txtOut, htmlOut, brc] = walker(p, n, r, brc, txtOut, htmlOut)
        return [txtOut, htmlOut, brc]
    }
}
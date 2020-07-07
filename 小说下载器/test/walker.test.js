(function () {
  let div;
  if (document.querySelector("#test")) {
    div = document.querySelector("#test");
  } else {
    div = document.createElement("div");
    div.id = "test";
    document.body.append(div);
  }
  div.innerHTML = `<p>测试ygyy本<br>
  新的文本
  <span>span</span>
  之后
    <span>这样看行不行<b>加粗</b><font>多重嵌套</font></span>
    就是这样
    测试一                                    下看看
  </p>
    又是一行`;

  let t, h;
  [t, h] = convertDomNode(document.querySelector("#test"));
  console.log(t);
  console.log(h.innerHTML);
})();

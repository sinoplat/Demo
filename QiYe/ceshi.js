let wxUtils = {
  groupId: null,
  secretId: null,
  getAccessToken() {
    // 判断是否缓存有

    let accessTokenUrl = "https://qyapi.weixin.qq.com/cgi-bin/gettoken";
    //  fetch(accessTokenUrl, { method: "GET" })
    ajax({
      url: accessTokenUrl, //请求地址
      type: "GET", //请求方式
      data: {
        corpid: this.groupId,
        corpsecret: this.secretId
      }, //请求参数
      success: function(response, xml) {
        alert(response);
        localStorage.setItem("accessToken", data.access_token);
        localStorage.setItem(
          "expires_accessToken",
          new Date().getTime() + data.expires_in * 1000
        );
        wxUtils.printStatuInfo("-------获取到accessToke:" + access_token);
        wxUtils.printStatuInfo("2.正在获取ticket");
        wxUtils.getTicket();
      },
      fail: function(status) {
        alert(status);
      }
    });
  },
  getTicket() {
    //  应用需要绑定安全域名，绑定后可以直接用js获取ticket
    let ticketUrl = "https://qyapi.weixin.qq.com/cgi-bin/get_jsapi_ticket";
    ajax({
      url: ticketUrl, //请求地址
      type: "GET", //请求方式
      data: {
        access_token: localStorage.getItem("accessToken")
      }, //请求参数
      success: function(response, xml) {
        alert(response);
        //保存本次获取的accessToken
        localStorage.setItem("ticket", data.ticket);
        localStorage.setItem(
          "expires_ticket",
          new Date().getTime() + data.expires_in * 1000
        );
        timestamp = new Date().getTime() + "";
        wxUtils.printStatuInfo("-------获取到ticket:" + ticket);
        wxUtils.printStatuInfo("3.正在生Signature");
        let sig = wxUtils.getSignature(timestamp, ticket);
        wxUtils.printStatuInfo("-------获取到Signature:" + sig);
        wxUtils.printStatuInfo("4.正在初始js-sdk配置");
        wx.config({
          beta: true, // 必须这么写，否则wx.invoke调用形式的jsapi会有问题
          debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
          appId: wxUtils.groupId, // 必填，企业微信的corpID
          timestamp: timestamp.substr(0, 10), // 必填，生成签名的时间戳
          nonceStr: timestamp, // 必填，生成签名的随机串
          signature: sig, // 必填，签名，见附录1
          jsApiList: ["chooseImage"] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
        });
      },
      fail: function(status) {
        alert(status);
      }
    });
  },
  getSignature(timestamp, ticket) {
    let url = window.location.href.split("#")[0];
    let jsapi_ticket =
      "jsapi_ticket=" +
      ticket +
      "&noncestr=" +
      timestamp +
      "&timestamp=" +
      timestamp.substr(0, 10) +
      "&url=" +
      url;
    this.printStatuInfo("签名原始信息:" + jsapi_ticket);
    let sha1Str = new jsSHA(decodeURIComponent(jsapi_ticket), "TEXT");
    return sha1Str.getHash("SHA-1", "HEX");
  },
  printStatuInfo(str) {
    let txtInfo = document.querySelector("#txtInfo");
    txtInfo.value = txtInfo.value + str + "\r\n";
    txtInfo.scrollTop = txtInfo.scrollHeight;
  },
  scanCode() {
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ["original", "compressed"], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ["album", "camera"], // 可以指定来源是相册还是相机，默认二者都有
      success: function(res) {
        var localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
      }
    });
  }
};
window.onload = () => {
  alert(getParam("code"));
  var doc = document;
  var code = getParam("code");
  localStorage.setItem("code", code);
  let timestamp = null;

  let btnInitJSDK = document.querySelector("#btnInitJSDK");
  btnInitJSDK.onclick = function(event) {
    alert(1);
    wxUtils.groupId = "wwdd65d710ecd7378b";
    wxUtils.secretId = "1000002";

    wxUtils.printStatuInfo("1.正在获取accessToken");
    wxUtils
      .getAccessToken()
      .then(access_token => {
        wxUtils.printStatuInfo("-------获取到accessToke:" + access_token);
        wxUtils.printStatuInfo("2.正在获取ticket");
        return wxUtils.getTicket();
      })
      .then(ticket => {
        timestamp = new Date().getTime() + "";
        wxUtils.printStatuInfo("-------获取到ticket:" + ticket);
        wxUtils.printStatuInfo("3.正在生Signature");
        let sig = wxUtils.getSignature(timestamp, ticket);
        wxUtils.printStatuInfo("-------获取到Signature:" + sig);
        wxUtils.printStatuInfo("4.正在初始js-sdk配置");
        wx.config({
          beta: true, // 必须这么写，否则wx.invoke调用形式的jsapi会有问题
          debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
          appId: wxUtils.groupId, // 必填，企业微信的corpID
          timestamp: timestamp.substr(0, 10), // 必填，生成签名的时间戳
          nonceStr: timestamp, // 必填，生成签名的随机串
          signature: sig, // 必填，签名，见附录1
          jsApiList: ["chooseImage"] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
        });
      });
  };

  wx.ready(function() {
    // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
    wxUtils.printStatuInfo("-------js-sdk初始完成");
    wxUtils.printStatuInfo("-------js-sdk正在检查接口支持情况");
    wx.checkJsApi({
      jsApiList: ["chooseImage"], // 需要检测的JS接口列表，所有JS接口列表见附录2,
      success: function(res) {
        // 以键值对的形式返回，可用的api值true，不可用为false
        wxUtils.printStatuInfo(JSON.stringify(res));
      }
    });
  });
  wx.error(function(res) {
    // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
    wxUtils.printStatuInfo("-------js-sdk错误:" + JSON.stringify(res));
  });
};

/**
 * 获取指定的URL参数值
 * URL:http://www.quwan.com/index?name=tyler
 * 参数：paramName URL参数
 * 调用方法:getParam("name")
 * 返回值:tyler
 */
function getParam(paramName) {
  //code  获取用户code
  (paramValue = ""), (isFound = !1);
  if (
    this.location.search.indexOf("?") == 0 &&
    this.location.search.indexOf("=") > 1
  ) {
    (arrSource = unescape(this.location.search)
      .substring(1, this.location.search.length)
      .split("&")),
      (i = 0);
    while (i < arrSource.length && !isFound)
      arrSource[i].indexOf("=") > 0 &&
        arrSource[i].split("=")[0].toLowerCase() == paramName.toLowerCase() &&
        ((paramValue = arrSource[i].split("=")[1]), (isFound = !0)),
        i++;
  }
  return paramValue == "" && (paramValue = null), paramValue;
}

function showCamera(object) {
  document.getElementById("camera").click();
}

document.getElementById("camera").onchange = function(event) {
  var doc = document;
  var files = doc.getElementById("camera").files;
  var images = doc.getElementById("cameraImages");
  var width = window.screen.width;

  for (var i = 0; i < files.length; i++) {
    photoCompress(files[i], { quality: 0.5 }, files[i].type, function(
      base64Codes
    ) {
      var newImg = new Image();
      newImg.src = base64Codes;
      newImg.onload = function() {
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");
        var logo = new Image();
        logo.src = "Images/logo.png";
        logo.onload = function() {
          logo.width = newImg.width / 2;
          logo.height = logo.width;
          canvas.width = logo.width;
          canvas.height = logo.height;
          ctx.drawImage(logo, 0, 0, logo.width, logo.height);
          var newlogo = canvas.toDataURL(logo.type, 0.5);
          watermark([base64Codes, newlogo])
            .image(watermark.image.lowerRight())
            .then(function(img) {
              img.setAttribute(
                "style",
                "width: " +
                  (width - 15) / 2 +
                  "px; height: " +
                  (width - 15) / 2 +
                  "px;"
              );
              img.style.marginLeft = "5px";
              images.appendChild(img);
            });
        };
      };
    });
  }
};

function showPhoto(object) {
  document.getElementById("photo").click();
}

document.getElementById("photo").onchange = function() {
  var doc = document;
  var files = doc.getElementById("photo").files;
  var images = doc.getElementById("photoImages");
  var width = window.screen.width;
  for (var i = 0; i < files.length; i++) {
    photoCompress(files[i], { quality: 0.5 }, files[i].type, function(
      base64Codes
    ) {
      var newImg = new Image();
      newImg.src = base64Codes;
      newImg.onload = function() {
        watermark([base64Codes])
          .image(
            watermark.text.upperRight(
              "自定义水印文字",
              newImg.width / 8 + "px serif",
              "red",
              0.5,
              newImg.width / 8
            )
          )
          .then(function(img) {
            img.setAttribute(
              "style",
              "width: " +
                (width - 15) / 2 +
                "px; height: " +
                (width - 15) / 2 +
                "px;"
            );
            img.style.marginLeft = "5px";
            images.appendChild(img);
          });
      };
    });
  }
};

//获取上传图片并处理成正常的图片
function photoCompress(file, w, type, objDiv) {
  var ready = new FileReader();
  /*开始读取指定的Blob对象或File对象中的内容. 当读取操作完成时,readyState属性的值会成为DONE,如果设置了onloadend事件处理程序,则调用之.同时,result属性中将包含一个data: URL格式的字符串以表示所读取文件的内容.*/
  ready.readAsDataURL(file);
  ready.onload = function() {
    var re = this.result;
    canvasDataURL(re, w, type, objDiv);
  };
}

//获取上传图片的Orientation并旋转
function canvasDataURL(path, w, type, callback) {
  var img = new Image();
  var canvas = document.createElement("canvas");
  img.onload = function() {
    EXIF.getData(this, function() {
      Orientation = EXIF.getTag(this, "Orientation");
      //如果方向角不为1，都需要进行旋转
      if (Orientation != "" && Orientation != 1 && Orientation) {
        switch (Orientation) {
          case 6: //需要顺时针（向左）90度旋转
            console.log(66);
            rotateImg(this, "left", canvas, w, type, callback);
            break;
          case 8: //需要逆时针（向右）90度旋转
            rotateImg(this, "right", canvas, w, type, callback);
            break;
          case 3: //需要180度旋转
            rotateImg(this, "right", canvas, w, type, callback); //转两次
            rotateImg(this, "right", canvas, w, type, callback);
            break;
        }
      } else {
        callback(path);
      }
    });
  };
  img.src = path;
}

//根据Orientation旋转图片,生成base64的文件
function rotateImg(img, direction, canvas, w, type, callback) {
  //最小与最大旋转方向，图片旋转4次后回到原方向
  var min_step = 0;
  var max_step = 3;
  if (img == null) return;
  //img的高度和宽度不能在img元素隐藏后获取，否则会出错
  var height = img.height;
  var width = img.width;
  var step = 2;
  if (step == null) {
    step = min_step;
  }
  if (direction == "right") {
    step++;
    //旋转到原位置，即超过最大值
    step > max_step && (step = min_step);
  } else {
    step--;
    step < min_step && (step = max_step);
  }
  //旋转角度以弧度值为参数
  var degree = (step * 90 * Math.PI) / 180;
  var ctx = canvas.getContext("2d");
  switch (step) {
    case 0:
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0);
      break;
    case 1:
      canvas.width = height;
      canvas.height = width;
      ctx.rotate(degree);
      ctx.drawImage(img, 0, -height);
      break;
    case 2:
      canvas.width = width;
      canvas.height = height;
      ctx.rotate(degree);
      ctx.drawImage(img, -width, -height);
      break;
    case 3:
      canvas.width = height;
      canvas.height = width;
      ctx.rotate(degree);
      ctx.drawImage(img, -width, 0);
      break;
  }
  dat = canvas.toDataURL(type, w.quality);
  callback(dat);
}
function login() {
  var url = "https://sinoplat.github.io/Demo/QiYe/CeShi.html";
  document.location =
    "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wwdd65d710ecd7378b&redirect_uri=https://sinoplat.github.io/Demo/QiYe/CeShi.html&response_type=code&scope=snsapi_userinfo&agentid=1000002&state=STATE#wechat_redirect";
}

function getUserInfo() {
  var code = localStorage.getItem("code", "");
  alert(code);
  code = "oCv9srIpexv3rQkaj4Al9Epnsw9Ug7dsYOirDBOXw1I";
  ajax({
    url: "https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo", //请求地址
    type: "GET", //请求方式
    data: {
      access_token:
        "Watz7ve3IqoXTB1QUQXd55zkAKpiAfCxe-jw9mdA3xdEkOezbf2d3NepH7MSkZngTynd7GLGwkN7lUsJrF-7KVZxS8OjqSsByn073BIoYbNA5xEzYNsi3rysnAzgsNoK_2Wbq-RJjE6CxcSdcJI0kP2ZNslEw4BFbseYAetafLQHHYGqxYMyOmd3-V1sYmnu8w_BWamBly9ZqJHsgGb2oA",
      code: code
    }, //请求参数
    success: function(response, xml) {
      alert(response);
    },
    fail: function(status) {
      alert(status);
    }
  });
  // httpGet(
  //   "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wwdd65d710ecd7378b&redirect_uri=www.baidu.com&response_type=code&scope=snsapi_userinfo&agentid=1000002&state=STATE#wechat_redirect",
  //   30 * 1000,
  //   function(response) {
  //     alert(response); //   此处执行请求成功后
  //   },
  //   function(response) {
  //     alert(response); //   此处执行请求失败后
  //   }
  // );
}

function httpGet(url, time, callback, failcallback) {
  var request = new XMLHttpRequest();
  var timeout = false;
  var timer = setTimeout(function() {
    timeout = true;
    request.abort();
  }, time);
  request.open("GET", url);
  request.onreadystatechange = function() {
    if (request.readyState !== 4) return;
    if (timeout) return;
    clearTimeout(timer);
    if (request.status === 200) {
      callback(request.responseText);
    } else {
      failcallback(request.status);
    }
  };
  request.send(null);
}
function setSaveInfo(object) {
  var doc = document;
  var value = doc.getElementById("save_info").value;
  localStorage.setItem("key", value);
}
function showSaveInfo(object) {
  var value = localStorage.getItem("key", "");
  alert(value);

  //  localStorage.removeItem("key")

  //  localStorage.clear()
}

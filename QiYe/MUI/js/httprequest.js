/**
 * 对封装好的ajax请求进行调用
 * */

/**
 * options {type, data: Object, success: Function, fail: Function }
 */
function ajax(options) {
  options = options || {};
  options.type = (options.type || "GET").toUpperCase();
  options.dataType = options.dataType || "json";
  options.async = options.async || true;
  var params = getParams(options.data);
  var xhr;
  if (window.XMLHttpRequest) {
    xhr = new XMLHttpRequest();
  } else {
    xhr = new ActiveXObject("Microsoft.XMLHTTP");
  }
  xhr.onreadystatechange = function() {
    if (options.dataType === "json") {
      if (xhr.readyState == 4) {
        var status = xhr.status;
        if (status >= 200 && status < 300) {
          // 如果需要像 html 表单那样 POST 数据，请使用 setRequestHeader() 来添加 http 头。
          options.success && options.success(xhr.responseText, xhr.responseXML);
        } else {
          options.fail && options.fail(status);
        }
      }
    } else {
      if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
        var oScript = document.createElement("script");
        document.body.appendChild(oScript);

        var callbackname = "monoplasty";
        oScript.src = opt.url + "?" + params + "&callback=" + callbackname;

        window["monoplasty"] = function(data) {
          opt.success(data);
          document.body.removeChild(oScript);
        };
      }
    }
  };
  if (options.type == "GET") {
    xhr.open("GET", options.url + "?" + params, options.async);
    xhr.send(null);
  } else if (options.type == "POST") {
    xhr.open("POST", options.url, options.async);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send(params);
  }
}
function getParams(data) {
  var arr = [];
  for (var param in data) {
    arr.push(encodeURIComponent(param) + "=" + encodeURIComponent(data[param]));
  }
  return arr.join("&");
}

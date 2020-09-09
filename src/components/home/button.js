(function () {
  var didLoad, initButton;
  initButton = function (button) {
    var d, iframe, iframe_css, iframe_src, iframe_width, id;
    d = document.createElement("div");
    d.className = "betaseries-button";
    d.style.cssText = "overflow:hidden;display:inline-block;";
    var show = encodeURIComponent(button.getAttribute("data-show"));
    var season = encodeURIComponent(button.getAttribute("data-season"));
    var episode = encodeURIComponent(button.getAttribute("data-episode"));
    var type = encodeURIComponent(button.getAttribute("data-type"));
    if (type === null) {
      type = "episode";
    }
    iframe = document.createElement("iframe");
    iframe.setAttribute("seamless", "seamless");
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("scrolling", "no");
    if (
      type === "episode" ||
      type === "episode-details" ||
      type === "null" ||
      type === ""
    ) {
      iframe_src =
        "https://www.betaseries.com/button?type=" +
        type +
        "&show=" +
        show +
        "&season=" +
        season +
        "&episode=" +
        episode;
    } else {
      iframe_src =
        "https://www.betaseries.com/button?type=" + type + "&show=" + show;
    }
    iframe_width = "width:275px;";
    iframe_css = "border:none;overflow:hidden;height:30px;" + iframe_width;
    iframe.style.cssText = iframe_css;
    iframe.src = iframe_src;
    d.appendChild(iframe);
    return button.parentNode.replaceChild(d, button);
  };
  didLoad = function () {
    var e, _i, _j, _len, _len1, _ref, _ref1, _results, _results1;
    if (document.addEventListener) {
      document.removeEventListener("load", didLoad, false);
      document.removeEventListener("DOMContentLoaded", didLoad, false);
    }
    if (window.detachEvent) {
      window.detachEvent("onload", didLoad);
    }
    if (document.querySelectorAll) {
      _results = [];
      _ref = document.querySelectorAll("a.betaseries-button");
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        e = _ref[_i];
        _results.push(initButton(e));
      }
      return _results;
    } else {
      _ref1 = document.getElementsByTagName("a");
      _results1 = [];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        e = _ref1[_j];
        if (e.className === "betaseries-button") {
          _results1.push(initButton(e));
        } else {
          _results1.push(void 0);
        }
      }
      return _results1;
    }
  };
  if (window.attachEvent) {
    window.attachEvent("onload", didLoad);
  } else if (window.addEventListener) {
    window.addEventListener("DOMContentLoaded", didLoad, false);
    window.addEventListener("load", didLoad, false);
  }
}.call(this));

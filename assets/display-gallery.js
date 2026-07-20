/**
 * Skin popup — 人种 × 光泽 → 图片组 联动渲染。
 * 数据来自 <script type="application/json" data-display-data="ID">
 */
(function () {
  "use strict";

  if (window.__displayGalleryInitialized) {
    initAll();
    return;
  }
  window.__displayGalleryInitialized = true;

  function escapeHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function uniq(arr) {
    var seen = {};
    var out = [];
    arr.forEach(function (x) {
      if (!seen[x] && x) {
        seen[x] = true;
        out.push(x);
      }
    });
    return out;
  }

  // 占位数据：无 metaobject 数据时用，方便验证 UI
  var PLACEHOLDER = {
    races: [
      { name: "A", thumb: "" },
      { name: "B", thumb: "" },
      { name: "C", thumb: "" },
      { name: "D", thumb: "" },
    ],
    products: ["Glossy", "Sheer Glow"],
    photos: ["", "", "", ""],
  };

  function renderRaces(container, races, current, onPick) {
    container.innerHTML = races
      .map(function (r) {
        var name = typeof r === "string" ? r : r.name;
        var thumb = typeof r === "string" ? "" : r.thumb;
        var active = name === current ? " is-active" : "";
        var imgEl = thumb
          ? '<img src="' + escapeHtml(thumb) + '" alt="' + escapeHtml(name) + '" />'
          : '<span class="wt-display-gallery__race-placeholder"></span>';
        return (
          '<div class="wt-display-gallery__race-item' + active + '">' +
          '<button type="button" class="wt-display-gallery__race" data-race="' +
          escapeHtml(name) + '" aria-label="' + escapeHtml(name) + '">' +
          imgEl +
          "</button>" +
          '<span class="wt-display-gallery__race-name">' + escapeHtml(name) + "</span>" +
          "</div>"
        );
      })
      .join("");
    container.querySelectorAll("[data-race]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        onPick(btn.getAttribute("data-race"));
      });
    });
  }

  function renderFabrics(container, products, current, onPick) {
    container.innerHTML = products
      .map(function (p) {
        var active = p === current ? " is-active" : "";
        return (
          '<button type="button" class="wt-display-gallery__fabric' + active +
          '" data-fabric="' + escapeHtml(p) + '">' + escapeHtml(p) + "</button>"
        );
      })
      .join("");
    container.querySelectorAll("[data-fabric]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        onPick(btn.getAttribute("data-fabric"));
      });
    });
  }

  function renderGrid(grid, emptyEl, photos) {
    if (!photos || photos.length === 0) {
      // 无匹配组合：在网格区域内居中展示缺省文案
      grid.classList.add("is-empty");
      grid.innerHTML =
        '<div class="wt-display-gallery__empty">' +
        (emptyEl ? escapeHtml(emptyEl.textContent.trim()) : "No images for this combination.") +
        "</div>";
      return;
    }
    grid.classList.remove("is-empty");
    // photos 现在是字符串 URL 数组（无 title）
    grid.innerHTML = photos
      .map(function (src) {
        if (!src) {
          return (
            '<figure class="wt-display-gallery__cell">' +
            '<div class="wt-display-gallery__img wt-display-gallery__img--placeholder"></div>' +
            '<figcaption class="wt-display-gallery__caption">color</figcaption>' +
            "</figure>"
          );
        }
        return (
          '<figure class="wt-display-gallery__cell">' +
          '<img class="wt-display-gallery__img" src="' + escapeHtml(src) + '" alt="" loading="lazy" />' +
          '<figcaption class="wt-display-gallery__caption">color</figcaption>' +
          "</figure>"
        );
      })
      .join("");
  }

  function initOne(id) {
    var dataEl = document.querySelector('script[data-display-data="' + id + '"]');
    if (!dataEl || dataEl.getAttribute("data-display-init") === "true") return;

    var data;
    try {
      data = JSON.parse(dataEl.textContent.trim());
    } catch (e) {
      data = [];
    }
    if (!Array.isArray(data)) data = [];

    var drawer = document.getElementById("DisplayGalleryDrawer-" + id);
    var dialog = document.getElementById("DisplayGalleryDialog-" + id);
    if (!drawer) {
      dataEl.setAttribute("data-display-init", "true");
      return;
    }

    var racesEl = drawer.querySelector("[data-display-races]");
    var gridEl = drawer.querySelector("[data-display-grid]");
    var fabricsEl = drawer.querySelector("[data-display-fabrics]");
    var emptyEl = drawer.querySelector("[data-display-empty]");
    if (!racesEl || !gridEl || !fabricsEl) {
      dataEl.setAttribute("data-display-init", "true");
      return;
    }

    // 内容容器（唯一一份）：默认在 drawer 里，按视口在 drawer↔dialog 之间搬移。
    // 节点上的事件监听随搬移保留，所以交互不受影响。
    var contentEl = drawer.querySelector("[data-display-slot]");

    var mqMobile = window.matchMedia("(max-width: 1024px)");

    // 把内容搬到对应容器（移动端 drawer / PC 端 dialog）
    function placeContent() {
      var host = !mqMobile.matches && dialog ? dialog : drawer;
      if (contentEl && contentEl.parentNode !== host) {
        host.appendChild(contentEl);
      }
    }
    placeContent();
    window.addEventListener("resize", placeContent);

    // 绑定触发按钮：按视口打开 drawer（移动）或 dialog（PC）
    var opener = document.getElementById("DisplayGalleryOpener-" + id);
    if (opener) {
      opener.addEventListener("click", function () {
        placeContent();
        if (!mqMobile.matches && dialog && typeof dialog.show === "function") {
          dialog.show();
        } else if (drawer && typeof drawer.show === "function") {
          drawer.show();
        }
      });
    }

    var hasData = data.length > 0;

    // 提取人种 / 光泽(商品) 列表
    var races, products;
    if (hasData) {
      var raceMap = {};
      data.forEach(function (d) {
        if (d.race && !raceMap[d.race]) {
          raceMap[d.race] = { name: d.race, thumb: d.raceThumb || "" };
        }
      });
      races = Object.keys(raceMap).map(function (k) {
        return raceMap[k];
      });
      products = uniq(
        data.map(function (d) {
          return d.product;
        })
      );
    } else {
      races = PLACEHOLDER.races;
      products = PLACEHOLDER.products;
    }

    var state = { race: races[0] ? (races[0].name || races[0]) : "", product: products[0] || "" };

    function update() {
      var set = hasData
        ? data.find(function (d) {
            return d.race === state.race && d.product === state.product;
          })
        : null;
      var photos = set ? set.photos : hasData ? [] : PLACEHOLDER.photos;
      renderGrid(gridEl, emptyEl, photos);
      // 同步 active 态
      racesEl.querySelectorAll(".wt-display-gallery__race-item").forEach(function (item) {
        var btn = item.querySelector("[data-race]");
        item.classList.toggle("is-active", btn && btn.getAttribute("data-race") === state.race);
      });
      fabricsEl.querySelectorAll("[data-fabric]").forEach(function (b) {
        b.classList.toggle("is-active", b.getAttribute("data-fabric") === state.product);
      });
    }

    renderRaces(racesEl, races, state.race, function (picked) {
      state.race = picked;
      update();
    });
    renderFabrics(fabricsEl, products, state.product, function (picked) {
      state.product = picked;
      update();
    });
    update();

    dataEl.setAttribute("data-display-init", "true");
  }

  function initAll() {
    document
      .querySelectorAll("script[data-display-data]")
      .forEach(function (el) {
        initOne(el.getAttribute("data-display-data"));
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }
})();

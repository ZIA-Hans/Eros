/**
 * Display Gallery — 人种 × 光泽(商品) → 图片组 联动渲染。
 *
 * UI 三块（均在弹窗内，由本 JS 渲染）：
 *   [data-display-races]    人种头像选择器（圆形头像，点击切换）
 *   [data-display-grid]     2×2 图片网格
 *   [data-display-fabrics]  光泽(商品)按钮组（点击切换）
 *
 * 数据来自 <script type="application/json" data-display-data="ID">
 *   [{ race, raceThumb, product, photos:[{title, src}] }]
 *
 * 交互：点人种头像 / 点光泽按钮 → 按 (race, product) 过滤出对应图片组 → 渲染网格。
 *
 * 无数据时显示占位 UI（4 个占位头像 + 2 个占位光泽按钮 + 占位格子），便于样式验证。
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
    photos: [
      { title: "black" },
      { title: "flesh" },
      { title: "white" },
      { title: "grey" },
    ],
  };

  function renderRaces(container, races, current, onPick) {
    container.innerHTML = races
      .map(function (r) {
        var name = typeof r === "string" ? r : r.name;
        var thumb = typeof r === "string" ? "" : r.thumb;
        var active = name === current ? " is-active" : "";
        var inner = thumb
          ? '<img src="' + escapeHtml(thumb) + '" alt="' + escapeHtml(name) + '" />'
          : '<span class="wt-display-gallery__race-placeholder">' + escapeHtml(name) + "</span>";
        return (
          '<button type="button" class="wt-display-gallery__race' + active + '" data-race="' +
          escapeHtml(name) + '" aria-label="' + escapeHtml(name) + '">' +
          inner +
          "</button>"
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
      grid.innerHTML = "";
      if (emptyEl) emptyEl.hidden = false;
      return;
    }
    if (emptyEl) emptyEl.hidden = true;
    grid.innerHTML = photos
      .map(function (p) {
        var safeTitle = escapeHtml(p.title || "");
        var img = p.src
          ? '<img class="wt-display-gallery__img" src="' + escapeHtml(p.src) + '" alt="' + safeTitle + '" loading="lazy" />'
          : '<div class="wt-display-gallery__img wt-display-gallery__img--placeholder"></div>';
        return (
          '<figure class="wt-display-gallery__cell">' +
          img +
          (p.title ? '<figcaption class="wt-display-gallery__caption">' + safeTitle + "</figcaption>" : "") +
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

    // 绑定触发按钮：点击打开 drawer
    var opener = document.getElementById("DisplayGalleryOpener-" + id);
    if (opener) {
      opener.addEventListener("click", function () {
        if (drawer && typeof drawer.show === "function") drawer.show();
      });
    }

    // 按视口设置 drawer 方向：≤1024px 底部弹起，>1024px 右侧滑出
    function syncPlacement() {
      var isMobile = window.matchMedia("(max-width: 1024px)").matches;
      drawer.setAttribute("placement", isMobile ? "bottom" : "end");
    }
    syncPlacement();
    window.addEventListener("resize", syncPlacement);

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
      racesEl.querySelectorAll("[data-race]").forEach(function (b) {
        b.classList.toggle("is-active", b.getAttribute("data-race") === state.race);
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

/**
 * Size Guide 弹窗触发器
 *
 * 配合 snippets/popup.liquid 的 Shoelace <sl-dialog> 使用。
 * 采用事件委托：单一 listener 支持页面上多个 Size Guide 实例，
 * 无需逐个绑定，也兼容动态插入的 DOM。
 *
 * 触发按钮统一标记 data-size-guide-open="{{ id }}"，
 * 对应弹窗 id 为 SizeGuideDialog-{{ id }}。
 *
 * typeof show === "function" 的判断用于应对 Shoelace autoloader
 * 异步注册 <sl-dialog> 的场景（与 display-gallery.js 一致）。
 */
(function () {
  if (window.__sizeGuideBound) return;
  window.__sizeGuideBound = true;

  document.addEventListener("click", function (event) {
    var btn = event.target.closest("[data-size-guide-open]");
    if (!btn) return;

    var id = btn.getAttribute("data-size-guide-open");
    if (!id) return;

    var dialog = document.getElementById("SizeGuideDialog-" + id);
    if (!dialog) return;

    // 把弹窗提升到 body 末尾，脱离任何外层浮层（如 xt-product-pickup 的
    // Quick-Add drawer、cart-drawer 等）的 DOM 子树与其堆叠上下文，
    // 否则 sl-dialog 会被这些浮层罩住而无法置顶。
    // 这与原 <modal-dialog> 在 connectedCallback 里 appendChild 到 body
    // 的行为一致（见 base.js ModalDialog.connectedCallback）。
    if (dialog.parentNode !== document.body) {
      document.body.appendChild(dialog);
    }

    // Shoelace autoloader 异步升级 sl-dialog；Quick-Add 等动态注入场景下，
    // 首次点击时 show() 可能尚未挂载，需等待 customElements 定义完成后再打开。
    if (typeof dialog.show === "function") {
      dialog.show();
    } else {
      customElements.whenDefined("sl-dialog").then(function () {
        dialog.show();
      });
    }
  });
})();

/**
 * XT Quick-Add Drawer — 移动端底部快速加购抽屉（共享实现）
 *
 * 装载方：snippets/xt-quick-add-drawer.liquid（传入 scope 选择器后调用 XTQuickAddDrawer.init）。
 * 使用方：cart-cross-sell.liquid（购物车抽屉 cross-sell）、xt-product-pickup.liquid（XT 商品选购区）。
 *
 * 行为约定（与 xt-product-pickup 原内联实现一致）：
 *   - 移动端（<768px）在 capture 阶段拦截 scope 内 quick-add 按钮点击，打开底部 sl-drawer；
 *   - PC 端不拦截，放行主题原生 quick-add.js 右侧栏；
 *   - 抽屉 markup 挂在 document.body（不受 cart-drawer 等 section 重渲染影响），
 *     由装载器的 <template> 提供（Liquid 图标 snippet 只能在模板里渲染）。
 */
(function () {
  'use strict';

  var DRAWER_ID = 'xt-quick-add-drawer';
  var registeredScopes = [];

  var drawer = null;
  var contentEl = null;
  var loaderEl = null;
  var closeBtn = null;
  var viewAllContainer = null;
  var currentTrigger = null;
  var currentAbortController = null;
  var cartUpdateUnsubscriber = null;

  /** 从装载器 <template> 克隆抽屉并挂到 body（幂等；section 重渲染后可自愈重建） */
  function ensureDrawer() {
    if (drawer && document.body.contains(drawer)) return true;
    drawer = document.getElementById(DRAWER_ID);
    if (!drawer) {
      var tpl = document.querySelector('.xt-quick-add-drawer-template');
      if (!tpl) return false;
      drawer = tpl.content.firstElementChild.cloneNode(true);
      document.body.appendChild(drawer);
    }
    contentEl = drawer.querySelector('.xt-quick-add-drawer__content');
    loaderEl = drawer.querySelector('.xt-quick-add-drawer__loader');
    closeBtn = drawer.querySelector('.xt-quick-add-drawer__close');
    viewAllContainer = drawer.querySelector('.xt-quick-add-drawer__view-all-container');

    closeBtn.addEventListener('click', closeDrawer);
    // 覆盖点击关闭 / Esc / 点遮罩等所有关闭路径：清空内容、归还焦点、发布关闭事件
    drawer.addEventListener('sl-after-hide', function () {
      unsubscribeCartUpdate();
      if (typeof publish === 'function' && typeof PUB_SUB_EVENTS !== 'undefined') {
        publish(PUB_SUB_EVENTS.quickBuyDrawerClose, { source: 'xt-quick-add-drawer' });
      }
      contentEl.innerHTML = '';
      hideViewAllDetails();
      currentTrigger?.focus();
    });
    return true;
  }

  /** 抽屉打开期间监听购物车变更：本抽屉加购成功后自动关闭，只留刷新后的 Cart Drawer（对齐原生 quick-buy 行为） */
  function unsubscribeCartUpdate() {
    if (cartUpdateUnsubscriber) {
      cartUpdateUnsubscriber();
      cartUpdateUnsubscriber = null;
    }
  }

  function hideViewAllDetails() {
    viewAllContainer?.classList.add('hidden');
  }

  function showViewAllDetails(productUrl) {
    if (!viewAllContainer) return;
    const link = viewAllContainer.querySelector('a');
    if (link) link.href = productUrl;
    viewAllContainer.classList.remove('hidden');
  }

  // 插入"Quantity"模拟 option：默认档 + 套装档位（点击直接加 N 件跳转 /cart）
  // bundleConfigs: 从商详页 <script data-quantity-bundle> 解析出的套装数组，无配置时为 null
  function injectQuantityBundle(productMain, bundleConfigs) {
    const form = productMain.querySelector('form[data-type="add-to-cart-form"]');
    if (!form) return;
    const buttonWrapper = form.querySelector('.wt-product__add-to-cart_form--wrapper');
    if (!buttonWrapper) return;
    if (form.querySelector('.xt-quantity-bundle')) return;

    // 组装选项列表：仅展示商品配置的套装档位（无选中态，样式统一）
    const optionsHtml = [];

    // 右下角购物车图标（带 + 号），点击加购的视觉指示
    const cartIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="14" fill="#A65D4A"/>
      <path d="M21.984 10.2736L21.0864 15.9808C20.9888 16.7648 20.2688 17.4 19.4464 17.4L10.1536 17.6144C9.8512 17.6256 9.44 17.6032 9.3504 17.3984L8.3824 10.728L7.832 7.6096C7.7984 7.336 7.544 7.1168 7.2976 7.1168H6.5712C6.256 7.1168 6 6.8656 6 6.5584C6 6.2512 6.256 6 6.5712 6H7.2976C8.1296 6 8.8608 6.6368 8.96 7.4496L9.1088 8.352C8.9072 8.3696 9.128 8.472 9.128 8.472L9.1088 8.352C9.128 8.3504 9.1456 8.3488 9.1712 8.3488H20.4368C20.8736 8.3488 21.272 8.5264 21.5648 8.8496C21.8992 9.216 22.0512 9.7328 21.984 10.2736ZM17.8384 12.7248C17.8384 12.5328 17.6832 12.3776 17.4912 12.3776H15.7088V10.6016C15.7088 10.4096 15.5536 10.2544 15.3616 10.2544H15.0976C14.9056 10.2544 14.7504 10.4096 14.7504 10.6016V12.376H13.0656C12.8736 12.376 12.7184 12.5312 12.7184 12.7232V12.984C12.7184 13.176 12.8736 13.3312 13.0656 13.3312H14.7472V15.0064C14.7472 15.1984 14.9024 15.3536 15.0944 15.3536H15.3584C15.5504 15.3536 15.7056 15.1984 15.7056 15.0064V13.3328H17.488C17.68 13.3328 17.8352 13.1776 17.8352 12.9856V12.7248H17.8384ZM11.1424 19.0688C11.7712 19.0688 12.2832 19.5696 12.2832 20.1872C12.2832 20.8048 11.7728 21.3056 11.1424 21.3056C10.512 21.3056 10.0016 20.8048 10.0016 20.1872C10.0016 19.568 10.512 19.0688 11.1424 19.0688ZM19.1264 19.0688C19.7552 19.0688 20.2672 19.5696 20.2672 20.1872C20.2672 20.8048 19.7568 21.3056 19.1264 21.3056C18.496 21.3056 17.9856 20.8048 17.9856 20.1872C17.9856 19.568 18.496 19.0688 19.1264 19.0688Z" fill="white"/>
    </svg>`;

    (bundleConfigs || []).forEach((bundle, idx) => {
      if (!bundle.quantity || bundle.quantity <= 1) return; // 件数≤1 视为无意义，跳过
      // 顶部促销文案：直接取 metaobject 的 discount_label，无配置则不渲染该行
      const saveHtml = bundle.discount_label
        ? `<span class="xt-quantity-bundle__save">${bundle.discount_label}</span>`
        : '';
      optionsHtml.push(`
        <li class="f-button__list__item xt-quantity-bundle__item">
          <button type="button" class="f-button__list__link xt-quantity-bundle__btn" data-qty="${bundle.quantity}" data-bundle-idx="${idx}">
            ${saveHtml}
            <span class="xt-quantity-bundle__bottom">
              <span class="xt-quantity-bundle__qty">${bundle.label || (bundle.quantity + ' items')}</span>
              <span class="xt-quantity-bundle__cart">${cartIconSvg}</span>
            </span>
          </button>
        </li>`);
    });

    // 没有配置任何有效套装档位时，不渲染 Quantity 栏目
    if (optionsHtml.length === 0) return;

    const bundle = document.createElement('div');
    bundle.className = 'wt-product__option js xt-quantity-bundle';
    bundle.innerHTML = `
      <ul class="f-button__list xt-quantity-bundle__list">
        ${optionsHtml.join('')}
      </ul>
    `;
    form.insertBefore(bundle, buttonWrapper);

    // 点击加购（无选中态：点击直接加购跳转 /cart；qty<=1 视为非法，兜底跳过）
    bundle.querySelectorAll('.xt-quantity-bundle__btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const qty = parseInt(btn.getAttribute('data-qty'), 10);
        if (qty <= 1) return;
        const variantIdInput = form.querySelector('input[name="id"]');
        if (!variantIdInput || !variantIdInput.value) return;

        const tempForm = document.createElement('form');
        tempForm.method = 'POST';
        tempForm.action = `${window.Shopify?.routes?.root || '/'}cart/add`;
        tempForm.style.display = 'none';

        const idInput = document.createElement('input');
        idInput.type = 'hidden';
        idInput.name = 'id';
        idInput.value = variantIdInput.value;
        tempForm.appendChild(idInput);

        const qtyInput = document.createElement('input');
        qtyInput.type = 'hidden';
        qtyInput.name = 'quantity';
        qtyInput.value = String(qty);
        tempForm.appendChild(qtyInput);

        const redirectInput = document.createElement('input');
        redirectInput.type = 'hidden';
        redirectInput.name = 'return_to';
        redirectInput.value = '/cart';
        tempForm.appendChild(redirectInput);

        document.body.appendChild(tempForm);
        tempForm.submit();
      });
    });
  }

  function closeDrawer() {
    unsubscribeCartUpdate();
    currentAbortController?.abort();
    drawer.hide();
  }

  function fetchAndRenderProduct(productUrl) {
    contentEl.innerHTML = '';
    hideViewAllDetails();
    loaderEl.classList.remove('hidden');

    currentAbortController?.abort();
    const controller = new AbortController();
    currentAbortController = controller;

    fetch(productUrl, { signal: controller.signal })
      .then((res) => res.text())
      .then((html) => {
        loaderEl.classList.add('hidden');
        const doc = new DOMParser().parseFromString(html, 'text/html');

        const productCard = doc.querySelector('.wt-product');
        const productMain = doc.querySelector('.wt-product__main');
        const productInfo = doc.querySelector('.wt-product__info');
        if (!productCard || !productMain || !productInfo) return;

        // 清理主题动画类，避免依赖滚入视口触发的动画在抽屉里卡在半透明/隐藏状态
        productMain.querySelectorAll('.scroll-trigger.animate--slide-in').forEach((el) => {
          el.classList.remove('scroll-trigger', 'animate--slide-in');
        });

        // 清理不需要的元素（与主题 quick-add.js 保持一致的精简逻辑）
        const removeSelectors = [
          'collapsible-section',
          '[not-quick-add]',
          '.product__inventory',
          '.share-icons__container',
          '#gallery-loader',
          'pickup-availability',
          '.wt-product__sku',
          '.wt-product__feature-icons',
        ];
        removeSelectors.forEach((sel) => {
          productMain.querySelectorAll(sel).forEach((el) => el.remove());
        });

        // 从 gallery-section 摘出所有媒体，组装成主题 <slideshow-section> 多图轮播
        // （gallery-section 自身带 swiper/缩略图联动等复杂状态，整体注入会失效，
        //  所以只取其 slide 节点的 innerHTML，外包 slideshow-section 让 slider.js 接管）
        const productGallery = productCard.querySelector('gallery-section');
        const gallerySlides = productGallery?.querySelectorAll('li[data-swiper-slide]') || [];
        const imageContainer = document.createElement('div');
        imageContainer.className = 'product-image';
        if (gallerySlides.length > 0) {
          const slidesHtml = [...gallerySlides]
            .map((li) => {
              const mediaId = li.getAttribute('data-media-id') || '';
              // 去掉 srcset，避免抽屉里加载多档大图；保留单 src
              const clone = li.cloneNode(true);
              clone.querySelectorAll('img').forEach((img) => img.removeAttribute('srcset'));
              return `<li class="swiper-slide" data-media-id="${mediaId}">${clone.innerHTML}</li>`;
            })
            .join('');
          imageContainer.innerHTML = `
            <slideshow-section class="xt-quick-add-carousel">
              <div class="xt-quick-add-carousel__viewport" data-swiper>
                <ul class="xt-quick-add-carousel__track" data-swiper-container>
                  ${slidesHtml}
                </ul>
              </div>
              <script data-swiper-configuration type="text/json">
                {
                  "slidesPerView": 2.5,
                  "spaceBetween": 8,
                  "speed": 300,
                  "loop": false,
                  "threshold": 5
                }
              <\/script>
            </slideshow-section>
          `;
        }

        // 标题包一层链接（可点击跳转完整详情页），并把品牌/标题/评分/价格/税费提示
        // 一起摘出来放进 product-info，和图片一起组成 wt-product__details
        // （与主题 quick-add.js 的摘要区排布保持一致）
        const titleEl = productInfo.querySelector('.wt-product__name');
        if (titleEl) {
          const link = document.createElement('a');
          link.textContent = titleEl.textContent;
          link.href = productUrl;
          titleEl.innerHTML = '';
          titleEl.appendChild(link);
          titleEl.setAttribute('tabindex', '0');
        }

        const productAbout = document.createElement('div');
        productAbout.className = 'product-info';
        // 按固定顺序逐个摘取，保证 品牌 → 标题 → 评分 → 价格 → 税费 的排列，
        // 不受商详页 Theme Editor 里 block 顺序影响（querySelectorAll 返回的是 DOM 顺序）
        ['.wt-product__brand', '.wt-product__name', '.wt-rating', '.wt-product__price', '.product__tax']
          .forEach((sel) => {
            const el = productInfo.querySelector(sel);
            if (el) productAbout.appendChild(el);
          });

        const productDetails = document.createElement('div');
        productDetails.className = 'wt-product__details';
        productDetails.appendChild(imageContainer);
        productDetails.appendChild(productAbout);

        productInfo.prepend(productDetails);

        // ID 改名（照抄主题 quick-add.js 的处理）：
        // variant-options / 价格 / 加购按钮 / 表单 / radio 都要重命名，
        // 否则 variants.js 内部用 getElementById 拼 id 找不到对应元素，
        // 图片联动、价格联动、按钮禁用状态都不会生效。
        const variantOptions = productMain.querySelector('variant-options');
        if (variantOptions) {
          variantOptions.dataset.updateUrl = 'false';
          const originalSection = variantOptions.getAttribute('data-section');
          variantOptions.setAttribute('data-original-section', originalSection);
          variantOptions.setAttribute('data-section', `quick-${originalSection}`);
        }
        const quickSection = variantOptions?.getAttribute('data-section');

        const priceEl = productMain.querySelector('.wt-product__price');
        if (priceEl && quickSection) priceEl.id = `price-${quickSection}`;

        const addBtn = productMain.querySelector('button[name="add"]');
        if (addBtn && quickSection) addBtn.id = `ProductSubmitButton-${quickSection}`;

        const addForm = productMain.querySelector('form[method="post"][data-type="add-to-cart-form"]');
        if (addForm && quickSection) addForm.id = `product-form-${quickSection}`;

        productMain.querySelectorAll('fieldset').forEach((fieldset) => {
          fieldset.querySelectorAll('input[type="radio"]').forEach((radio) => {
            const originalId = radio.getAttribute('id');
            if (!originalId) return;
            radio.setAttribute('id', `quick-${originalId}`);
            radio.setAttribute('form', `product-form-${quickSection}`);
          });
          fieldset.querySelectorAll('label').forEach((label) => {
            const originalFor = label.getAttribute('for');
            if (!originalFor) return;
            label.setAttribute('for', `quick-${originalFor}`);
          });
        });

        // 礼品卡：解除收件人字段禁用（与主题 quick-add.js 保持一致）
        const giftCardInput = productMain.querySelector(
          '[name="properties[__shopify_send_gift_card_to_recipient]"]',
        );
        giftCardInput?.removeAttribute('disabled');

        // 订阅/分期购：同步 section id，并把隐藏的 selling_plan input 的 form 属性指向新表单
        const subWidget = productMain.querySelector('.wt-subscription-widget');
        if (subWidget && quickSection) {
          const originalSection = variantOptions?.getAttribute('data-original-section');
          subWidget.setAttribute('data-section-id', quickSection);
          if (originalSection) subWidget.setAttribute('data-original-section-id', originalSection);
          subWidget.setAttribute('data-update-url-on-plan-change', 'false');

          const sellingPlanInput = subWidget.querySelector('input[name="selling_plan"]');
          sellingPlanInput?.setAttribute('form', `product-form-${quickSection}`);
        }

        // 把 productMain 包进 .wt-product 容器（保留主题 CSS 作用域，
        // 否则所有 .wt-product .xxx 子代选择器会失效，包括 product-form__input 等）
        const wtProductWrapper = document.createElement('div');
        wtProductWrapper.className = 'wt-product';
        wtProductWrapper.appendChild(productMain);
        contentEl.appendChild(wtProductWrapper);
        showViewAllDetails(productUrl);

        // 解析商详页输出的套装配置（<script data-quantity-bundle>），无配置时为 null
        let bundleConfigs = null;
        try {
          const bundleScript = doc.querySelector('script[data-quantity-bundle]');
          if (bundleScript && bundleScript.textContent.trim()) {
            bundleConfigs = JSON.parse(bundleScript.textContent);
          }
        } catch (e) {
          console.error('Quantity bundle config parse error:', e);
        }

        // 插入"Quantity"栏目（仅在有套装配置时展示）
        injectQuantityBundle(productMain, bundleConfigs);

        // 初始化变体选择器（如果主题用自定义元素承载变体切换逻辑）
        if (variantOptions && typeof variantOptions.initialize === 'function') {
          variantOptions.initialize();
        }

        // 监听 variant-options 的 data-featured-image-id 属性变化，
        // 切换 SKU 时把轮播滑动到对应媒体（替代旧的单图换 src 逻辑）。
        // data-featured-image-id 由 variants.js updateMedia() 写入 = variant.featured_media.id，
        // 与每个 slide 的 data-media-id 一一对应。
        if (variantOptions) {
          let lastFeaturedId = null;
          const observer = new MutationObserver(() => {
            const featuredId = variantOptions.getAttribute('data-featured-image-id');
            if (!featuredId || featuredId === lastFeaturedId) return;
            lastFeaturedId = featuredId;

            const slideshow = imageContainer.querySelector('slideshow-section');
            const swiper = slideshow?.swiper;
            const targetSlide = imageContainer.querySelector(
              `.swiper-slide[data-media-id="${featuredId}"]`,
            );

            if (swiper && targetSlide) {
              // 轮播已初始化：滑动到目标 slide
              const slideIndex = [...targetSlide.parentElement.children].indexOf(targetSlide);
              swiper.slideTo(slideIndex);
              swiper.update();
            } else if (targetSlide) {
              // 轮播还没初始化（slider.js 异步懒加载）：先把目标 slide 置顶，
              // 等 slideshow-section 升级后从这张图开始展示
              targetSlide.parentElement.prepend(targetSlide);
            }
          });
          observer.observe(variantOptions, {
            attributes: true,
            attributeFilter: ['data-featured-image-id'],
          });
        }
      })
      .catch((error) => {
        loaderEl.classList.add('hidden');
        if (error.name === 'AbortError') return;
        console.error('Quick-add drawer fetch error:', error);
      });
  }

  /**
   * 注册一个点击拦截范围。
   * @param {string} scope CSS 选择器，如 '.wt-cart__cross-sell'；
   *   document 级 capture 监听 + closest 判定，section 重渲染不失效，重复注册自动去重。
   */
  function init(scope) {
    if (!scope || typeof scope !== 'string') return;
    if (registeredScopes.indexOf(scope) !== -1) return;
    registeredScopes.push(scope);
    if (!ensureDrawer()) return;

    document.addEventListener(
      'click',
      function (e) {
        const target = e.target instanceof Element ? e.target : null;
        const button = target?.closest(scope + ' quick-add button');
        if (!button) return;
        if (window.innerWidth >= 768) return; // PC 走原生侧边栏，不拦截

        e.preventDefault();
        e.stopImmediatePropagation();

        const productUrl = button.getAttribute('data-product-url');
        if (!productUrl) return;

        // 焦点归还锚：主题卡片 a.card → shoppable 卡片 a.wt-dot__link → 按钮自身
        currentTrigger =
          button.closest('.card__picture-container')?.querySelector('a.card') ||
          button.closest('.shoppable-product-card')?.querySelector('a.wt-dot__link') ||
          button;

        const open = function () {
          ensureDrawer();
          drawer.show();
          // 打开期间订阅购物车变更：抽屉内加购成功（cartUpdate）即自动关闭，
          // 只留刷新后的 Cart Drawer（对齐原生 quick-buy 的 product-form.js 关闭逻辑）
          if (typeof subscribe === 'function' && typeof PUB_SUB_EVENTS !== 'undefined') {
            unsubscribeCartUpdate();
            cartUpdateUnsubscriber = subscribe(PUB_SUB_EVENTS.cartUpdate, function () {
              closeDrawer();
            });
          }
          if (typeof publish === 'function' && typeof PUB_SUB_EVENTS !== 'undefined') {
            publish(PUB_SUB_EVENTS.quickBuyDrawerOpen, { source: 'xt-quick-add-drawer' });
          }
          fetchAndRenderProduct(productUrl);
        };
        // 抽屉可能是动态克隆的，等 Shoelace 升级完成再 show
        if (customElements.get('sl-drawer')) open();
        else customElements.whenDefined('sl-drawer').then(open);
      },
      true, // capture 阶段，抢在主题 <quick-add> 的点击处理器之前
    );
  }

  window.XTQuickAddDrawer = { init: init };
})();

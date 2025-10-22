import Swiper from "./swiper-bundle.esm.browser.min.js";
import PhotoSwipeLightbox from "./photoswipe-lightbox.esm.min.js";

const badges = document.querySelector(".photoswipe > .card__badges");

const lightbox = new PhotoSwipeLightbox({
  // may select multiple "galleries"
  gallery: ".photoswipe",

  // Elements within gallery (slides)
  children: "a",

  // setup PhotoSwipe Core dynamic import
  pswpModule: () => import("./photoswipe.esm.min.js"),

  bgOpacity: 1,
});
lightbox.init();
lightbox.on("beforeOpen", () => {
  badges?.classList.add("hide");
});

lightbox.on("destroy", () => {
  badges?.classList.remove("hide");
});

if (!customElements.get("gallery-section")) {
  customElements.define(
    "gallery-section",
    class GallerySection extends HTMLElement {
      updateSwiperAutoHeight = () => {
        if (this.resolution != this.matchResolution()) {
          this.resolution = this.matchResolution();
          this.destroyCarouselGallery();
          this.initializeGallery();
          this.setStickyGallery();
        }
      };

      constructor() {
        super();
      }

      connectedCallback() {
        this.isProductPage = this.dataset.productPage === "";

        this.galleryLoader = this.querySelector("#gallery-loader");
        this.renderedSlides = [];
        this.readConfiguration();
        this.initializeGallery();
        this.galleryLoader?.classList.add("hidden");
        this.classList.remove("loading");
        this.classList.add("loaded");

        this.setStickyGallery();
      }

      disconnectedCallback() {
        // this.destroyGallery();
      }

      setStickyGallery() {
        if (this.isProductPage) {
          const headerHeight =
            document.querySelector(".wt-header")?.offsetHeight;
          const swiperRect = this.getBoundingClientRect();

          const fitsInViewport =
            swiperRect.top >= 0 &&
            swiperRect.left >= 0 &&
            swiperRect.height <= window.innerHeight;

          const positionTopValue = `${headerHeight + 16}px`;

          this.style.setProperty("--position-top", positionTopValue);
          this.classList.add("wt-product__gallery--sticky", fitsInViewport);
        }
      }

      readConfiguration() {
        // general configuration
        this.configuration = [];

        this.elements = {
          section: this,
          gallery: this.querySelector("[data-gallery]"),
          thumbs: this.querySelector("[data-thumbs]"),
          galleryContainer: this.querySelector("[data-gallery]").querySelector(
            "[data-swiper-container]",
          ),
          thumbsContainer: this.querySelector("[data-thumbs]").querySelector(
            "[data-swiper-container]",
          ),
        };

        this.elements.gallerySlides = Array.from(
          this.elements.gallery.querySelectorAll("[data-swiper-slide]"),
        ).map((e) => e.cloneNode(true));
        this.elements.thumbsSlides = Array.from(
          this.elements.thumbs.querySelectorAll("[data-swiper-slide]"),
        ).map((e) => e.cloneNode(true));

        const default_configuration = {
          sliderEnabledBreakpoint: 900,
          desktopLayout: "carousel-vertical",
        };

        const custom_configuration = JSON.parse(
          this.elements.section.querySelector("[data-configuration]").innerHTML,
        );
        this.configuration = {
          ...default_configuration,
          ...custom_configuration,
        };

        let autoHeightEnabled = window.innerWidth <= 768;

        // gallery swiper configuration
        const default_gallery_configuration = {
          autoHeight: autoHeightEnabled,
          threshold: 10,
          grabCursor: true,
          navigation: {
            nextEl: ".wt-slider__nav-next",
            prevEl: ".wt-slider__nav-prev",
          },
          scrollbar: {
            el: ".wt-slider__scrollbar",
            draggable: true,
          },
          pagination: {
            el: ".swiper-pagination",
            type: "fraction",
          },
        };

        const custom_gallery_configuration = JSON.parse(
          this.elements.gallery.querySelector("[data-swiper-configuration]")
            .innerHTML,
        );
        this.gallery_configuration = {
          ...default_gallery_configuration,
          ...custom_gallery_configuration,
        };

        const updateThumbsSwiperClasses = (swiperInstance) => {
          const container = swiperInstance.el;
          const cls = {
            beginning: "swiper-at-beginning",
            end: "swiper-at-end",
            locked: "swiper-locked",
            ready: "swiper-thumbs-ready",
          };

          container.classList.remove(
            cls.beginning,
            cls.end,
            cls.locked,
            cls.ready,
          );

          if (swiperInstance.isLocked) {
            container.classList.add(cls.locked);
            return;
          }

          container.classList.add(cls.ready);

          if (swiperInstance.isBeginning)
            container.classList.add(cls.beginning);
          if (swiperInstance.isEnd) container.classList.add(cls.end);
        };

        // gallery thumbs swiper configuration
        const default_thumbs_configuration = {
          grabCursor: true,
          spaceBetween: 8,
          slidesPerView: 4,
          freeMode: false,
          threshold: 5,
          direction: "horizontal",
          watchSlidesVisibility: true,
          watchSlidesProgress: true,
          watchOverflow: true,
          navigation: {
            nextEl: ".wt-slider__nav-next",
            prevEl: ".wt-slider__nav-prev",
          },
          on: {
            afterInit(swiper) {
              updateThumbsSwiperClasses(swiper);
            },
            lock: updateThumbsSwiperClasses,
            unlock: updateThumbsSwiperClasses,
            slideChange: updateThumbsSwiperClasses,
            observerUpdate: updateThumbsSwiperClasses,
            resize: updateThumbsSwiperClasses,
          },
        };

        const custom_thumbs_configuration = JSON.parse(
          this.elements.thumbs.querySelector("[data-swiper-configuration]")
            .innerHTML,
        );
        this.thumbs_configuration = {
          ...default_thumbs_configuration,
          ...custom_thumbs_configuration,
        };
        this.resolution = this.matchResolution();
      }

      initializeGallery() {
        window.addEventListener("resize", () => {
          this.updateSwiperAutoHeight(this.gallerySwiper);
        });

        // 移动端特殊处理：显示缩略图
        if (this.matchResolution() === "mobile") {
          this.initializeMobileGallery();
        } else {
          // PC端保持原有逻辑
          switch (this.configuration.desktopLayout) {
            case "carousel-vertical":
            case "carousel-horizontal":
              this.initializeCarouselGallery();
              break;
            case "masonry":
              window.addEventListener(
                "resize",
                function () {
                  this.handleMassonry();
                }.bind(this),
              );
              this.handleMassonry();
              break;
            case "collage":
              window.addEventListener(
                "resize",
                function () {
                  this.handleCollage();
                }.bind(this),
              );
              this.handleCollage();
              break;
          }
        }
      }

      // 移动端专用初始化方法
      initializeMobileGallery() {
        // 检查缩略图容器是否存在
        if (!this.elements.thumbs) {
          console.warn("移动端缩略图容器 [data-thumbs] 未找到");
          return;
        }

        // 显示移动端缩略图
        this.elements.thumbs.style.display = "flex";
        this.elements.thumbs.classList.add("mobile-thumbs-visible");

        // 添加移动端箭头导航
        this.addMobileThumbsNavigation();

        if (this.thumbsSwiper == null) {
          this.decorateSwiper(
            this.elements.thumbs,
            "wt-slider__container--thumbs",
          );
          this.thumbsSwiper = this.swiperThumbsInitilize();
        }
        this.decorateSwiper(this.elements.gallery);
        this.swiperGalleryInitilize(this.thumbsSwiper);

        const disableTouchSlide =
          this.elements.gallery.querySelector(".disable-touch");
        if (disableTouchSlide) {
          disableTouchSlide.classList.add("swiper-no-swiping");
        }
      }

      // 添加移动端缩略图箭头导航
      addMobileThumbsNavigation() {
        // 检查是否已经添加了导航
        if (this.elements.thumbs.querySelector('.mobile-thumbs-nav')) {
          return;
        }

        console.log('添加移动端缩略图导航按钮');

        // 左箭头
        const prevButton = document.createElement('button');
        prevButton.className = 'mobile-thumbs-nav mobile-thumbs-nav--prev';
        prevButton.setAttribute('type', 'button');
        prevButton.setAttribute('aria-label', 'Previous thumbnails');
        prevButton.innerHTML = `
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.336 0C3.288 0 0 3.28 0 7.336C0 11.392 3.288 14.672 7.336 14.672C11.384 14.672 14.672 11.384 14.672 7.336C14.672 3.288 11.392 0 7.336 0ZM9.528 10.968C9.776 11.216 9.776 11.624 9.528 11.872C9.28 12.12 8.872 12.12 8.624 11.872L4.664 7.92C4.536 7.792 4.48 7.632 4.48 7.464C4.48 7.304 4.544 7.136 4.664 7.008L8.624 3.048C8.872 2.8 9.28 2.8 9.528 3.048C9.776 3.296 9.776 3.704 9.528 3.952L6.016 7.464L9.528 10.968Z" fill="#3C2F2F"/>
          </svg>
        `;

        // 右箭头
        const nextButton = document.createElement('button');
        nextButton.className = 'mobile-thumbs-nav mobile-thumbs-nav--next';
        nextButton.setAttribute('type', 'button');
        nextButton.setAttribute('aria-label', 'Next thumbnails');
        nextButton.innerHTML = `
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.336 0C3.288 0 0 3.28 0 7.336C0 11.392 3.288 14.672 7.336 14.672C11.384 14.672 14.672 11.384 14.672 7.336C14.672 3.288 11.392 0 7.336 0ZM9.528 10.968C9.776 11.216 9.776 11.624 9.528 11.872C9.28 12.12 8.872 12.12 8.624 11.872L4.664 7.92C4.536 7.792 4.48 7.632 4.48 7.464C4.48 7.304 4.544 7.136 4.664 7.008L8.624 3.048C8.872 2.8 9.28 2.8 9.528 3.048C9.776 3.296 9.776 3.704 9.528 3.952L6.016 7.464L9.528 10.968Z" fill="#3C2F2F"/>
          </svg>
        `;

        // 添加按钮到容器
        this.elements.thumbs.appendChild(prevButton);
        this.elements.thumbs.appendChild(nextButton);

        console.log('导航按钮已添加:', {
          prevButton: prevButton,
          nextButton: nextButton,
          container: this.elements.thumbs
        });

        // 添加点击事件
        prevButton.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('点击左箭头');
          this.scrollMobileThumbs('prev');
        });

        nextButton.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('点击右箭头');
          this.scrollMobileThumbs('next');
        });

        // 初始状态检查
        setTimeout(() => {
          this.updateMobileThumbsNavState();
        }, 100);
      }

      // 滚动移动端缩略图
      scrollMobileThumbs(direction) {
        const wrapper = this.elements.thumbs.querySelector('.swiper-wrapper');
        if (!wrapper) return;

        const scrollAmount = 200; // 每次滚动的距离
        const currentScroll = wrapper.scrollLeft;
        const maxScroll = wrapper.scrollWidth - wrapper.clientWidth;

        if (direction === 'prev') {
          wrapper.scrollLeft = Math.max(0, currentScroll - scrollAmount);
        } else {
          wrapper.scrollLeft = Math.min(maxScroll, currentScroll + scrollAmount);
        }

        // 更新按钮状态
        setTimeout(() => this.updateMobileThumbsNavState(), 100);
      }

      // 更新移动端缩略图导航按钮状态
      updateMobileThumbsNavState() {
        const wrapper = this.elements.thumbs.querySelector('.swiper-wrapper');
        const prevButton = this.elements.thumbs.querySelector('.mobile-thumbs-nav--prev');
        const nextButton = this.elements.thumbs.querySelector('.mobile-thumbs-nav--next');

        if (!wrapper || !prevButton || !nextButton) return;

        const currentScroll = wrapper.scrollLeft;
        const maxScroll = wrapper.scrollWidth - wrapper.clientWidth;

        prevButton.disabled = currentScroll <= 0;
        nextButton.disabled = currentScroll >= maxScroll;
      }

      initializeCarouselGallery() {
        if (this.thumbsSwiper == null) {
          this.decorateSwiper(
            this.elements.thumbs,
            "wt-slider__container--thumbs",
          );
          this.thumbsSwiper = this.swiperThumbsInitilize();
        }
        this.decorateSwiper(this.elements.gallery);
        this.swiperGalleryInitilize(this.thumbsSwiper);

        const disableTouchSlide =
          this.elements.gallery.querySelector(".disable-touch");
        if (disableTouchSlide) {
          disableTouchSlide.classList.add("swiper-no-swiping");
        }
      }

      swiperGalleryInitilize(thumbsSwiper) {
        if (this.gallerySwiper == null) {
          const thumbs_configuration = {
            thumbs: {
              swiper: thumbsSwiper,
            },
          };
          const desktopRatio = this.getAttribute("desktop-ratio");

          const useAlwaysAutoHeight =
            (this.configuration.desktopLayout === "carousel-vertical" &&
              desktopRatio === "original") ||
            this.configuration.desktopLayout === "carousel-horizontal";

          let autoHeightEnabled = useAlwaysAutoHeight
            ? true
            : window.innerWidth <= 900;
          if (thumbsSwiper)
            this.gallery_configuration = {
              ...this.gallery_configuration,
              ...thumbs_configuration,
              autoHeight: autoHeightEnabled,
            };
          this.gallerySwiper = new Swiper(
            this.elements.gallery,
            this.gallery_configuration,
          );
        }
      }

      swiperThumbsInitilize() {
        let autoHeightEnabled = window.innerWidth <= 900;
        
        // 移动端缩略图配置
        const isMobile = this.matchResolution() === "mobile";
        let thumbsConfig = { ...this.thumbs_configuration };
        
        if (isMobile) {
          // 移动端使用简单的水平布局，不使用滑动
          thumbsConfig = {
            ...thumbsConfig,
            slidesPerView: 'auto',
            spaceBetween: 8,
            freeMode: true,
            allowTouchMove: true,
            direction: 'horizontal',
            autoHeight: false,
            // 禁用移动端的导航按钮
            navigation: false,
            pagination: false,
            scrollbar: false,
          };
        } else {
          thumbsConfig = {
            ...thumbsConfig,
            autoHeight: autoHeightEnabled,
          };
        }
        
        const swiper = new Swiper(
          this.elements.thumbs,
          thumbsConfig,
        );
        return swiper;
      }

      destroyCarouselGallery() {
        if (this.thumbsSwiper != null) {
          this.thumbsSwiper.destroy();
          this.thumbsSwiper = null;
          if (this.elements.thumbs) {
            this.undecorateSwiper(
              this.elements.thumbs,
              "wt-slider__container--thumbs",
            );
            // 移除移动端缩略图显示类
            this.elements.thumbs.classList.remove("mobile-thumbs-visible");
            this.elements.thumbs.style.display = "";
            
            // 清理移动端导航按钮
            const navButtons = this.elements.thumbs.querySelectorAll('.mobile-thumbs-nav');
            navButtons.forEach(button => button.remove());
          }
        }
        if (this.gallerySwiper != null) {
          this.gallerySwiper.destroy();
          this.undecorateSwiper(this.elements.gallery);
          this.gallerySwiper = null;
        }
      }

      handleMassonry() {
        if (this.matchResolution() == "desktop") {
          this.destroyCarouselGallery();
          this.initializeMasonryGallery();
        } else {
          this.destroyMasonryGallery();
          this.initializeCarouselGallery();
        }
      }

      handleCollage() {
        if (this.matchResolution() == "desktop") {
          this.destroyCarouselGallery();
          this.initializeCollageGallery();
        } else {
          this.destroyCollageGallery();
          this.initializeCarouselGallery();
        }
      }

      decorateSwiper(el, element_class) {
        el.classList.add("swiper", "wt-slider__container", element_class);
        el.querySelector("[data-swiper-container]")?.classList.add(
          "swiper-wrapper",
          "wt-slider__wrapper",
        );
        el.querySelectorAll("[data-swiper-slide]").forEach(function (e) {
          e.classList.add("swiper-slide", "wt-slider__slide");
        });
        this.galleryUpdateEvent();
      }

      undecorateSwiper(el, element_class) {
        el.classList.remove("swiper", "wt-slider__container", element_class);
        el.querySelector("[data-swiper-container]").classList.remove(
          "swiper-wrapper",
          "wt-slider__wrapper",
        );
        el.querySelectorAll("[data-swiper-slide]").forEach(function (e) {
          e.classList.remove("swiper-slide", "wt-slider__slide");
        });
      }

      decorateCollage(el, element_class) {
        el.classList.add(`wt-${element_class}`);
        el.querySelector("[data-swiper-container]").classList.add(
          `wt-${element_class}__wrapper`,
        );
        el.querySelectorAll("[data-swiper-slide]").forEach(function (e) {
          e.classList.add(`wt-${element_class}__slide`);
        });
        this.galleryUpdateEvent();
      }

      undecorateCollage(el, element_class) {
        el.classList.remove(`wt-${element_class}`);
        el.querySelector("[data-swiper-container]").classList.remove(
          `wt-${element_class}__wrapper`,
        );
        el.querySelectorAll("[data-swiper-slide]").forEach(function (e) {
          e.classList.remove(`wt-${element_class}__slide`);
        });
      }

      initializeCollageGallery() {
        this.decorateCollage(this.elements.gallery, "collage");
      }

      destroyCollageGallery() {
        this.undecorateCollage(this.elements.gallery, "collage");
      }

      initializeMasonryGallery() {
        this.decorateCollage(this.elements.gallery, "masonry");
      }

      destroyMasonryGallery() {
        this.undecorateCollage(this.elements.gallery, "masonry");
      }

      sortSlides(slides, featured_media_id) {
        // Find the index of the slide with featured_media_id
        const featuredIndex = slides.findIndex((slide) => {
          const mediaId = slide.querySelector("img")
            ? Number(slide.querySelector("img").getAttribute("data-media-id"))
            : null;
          return mediaId === Number(featured_media_id);
        });

        // If a slide with featured_media_id is found, move it to the beginning of the array
        if (featuredIndex > -1) {
          const featuredSlide = slides[featuredIndex];
          slides.splice(featuredIndex, 1);
          slides.unshift(featuredSlide);
        }

        return slides;
      }

      beforeGalleryChange() {
        this.classList.add("loading");
        this.galleryLoader?.classList.remove("hidden");
        this.style.minHeight = `${this.offsetHeight}px`;
      }

      afterGalleryChange() {
        this.style.minHeight = "unset";
        this.galleryLoader?.classList.add("hidden");
        this.classList.remove("loading");
      }

      filterSlidesByOptions(
        slides,
        options,
        featured_media_id,
        matchAll = true,
      ) {
        const lowercaseOptions = options.map((option) =>
          option.toLowerCase().replace(/\s/g, ""),
        );
      
        return slides.filter((slide) => {
          let media = slide.querySelector("img");
          if (media == null) media = slide?.querySelector("video");
          const alt = media ? media.getAttribute("alt") : "";
          const mediaId = media ? media.getAttribute("data-media-id") : "";
      
          if (mediaId === featured_media_id) return true;
      
          const altHashtags = (alt?.match(/#[^\s#]+/g) || []).map((hashtag) =>
            hashtag.slice(1).toLowerCase()
          );
      
          if (altHashtags.length === 0) return true;
          if (altHashtags.some((tag) => tag.split("|").includes("all"))) return true;
      
          if (matchAll) {
            return altHashtags.every((tag) =>
              tag.split("|").some((variant) => lowercaseOptions.includes(variant.trim()))
            );
          } else {
            return altHashtags.some((tag) =>
              tag.split("|").some((variant) => lowercaseOptions.includes(variant.trim()))
            );
          }
        });
      }

      galleryUpdateEvent(opt) {
        const galleryEvent = new CustomEvent("gallery:updated", {
          bubbles: true,
          cancelable: true,
          detail: {
            desc: "gallery updated",
            selector: ".wt-product__gallery",
            ...opt,
          },
        });
        document.dispatchEvent(galleryEvent);
      }

      // 检测最后一张素材是否为视频
      isLastMediaVideo() {
        if (!this.elements || !this.elements.gallerySlides || this.elements.gallerySlides.length === 0) {
          return false;
        }
        
        const lastSlide = this.elements.gallerySlides[this.elements.gallerySlides.length - 1];
        const videoElement = lastSlide.querySelector("video");
        return videoElement !== null;
      }

      // 获取最后一张视频素材
      getLastVideoSlide() {
        if (!this.elements || !this.elements.gallerySlides || this.elements.gallerySlides.length === 0) {
          return null;
        }
        
        const lastSlide = this.elements.gallerySlides[this.elements.gallerySlides.length - 1];
        const videoElement = lastSlide.querySelector("video");
        
        if (videoElement) {
          return {
            gallerySlide: lastSlide.cloneNode(true),
            thumbsSlide: this.elements.thumbsSlides[this.elements.thumbsSlides.length - 1].cloneNode(true)
          };
        }
        
        return null;
      }

      filterSlides(options, featured_media_id, matchAll = true, callback) {
        if (!this.elements) return;
        const originalGallerySlides = Array.from(
          this.elements.gallerySlides,
          (el) => el.cloneNode(true),
        );
        const originalThumbsSlides = Array.from(
          this.elements.thumbsSlides,
          (el) => el.cloneNode(true),
        );

        const getMediaId = (item) => item?.dataset?.mediaId;

        let filteredGallerySlides, filteredThumbsSlides;

        // 如果没有选中变体，显示全部图片
        if (!featured_media_id) {
          filteredGallerySlides = [...originalGallerySlides];
          filteredThumbsSlides = [...originalThumbsSlides];
        } else {
          // 如果有选中变体，基于主图位置显示5张连续图片
          const featuredIndex = originalGallerySlides.findIndex((slide) => {
            const mediaId = slide.querySelector("img")
              ? Number(slide.querySelector("img").getAttribute("data-media-id"))
              : null;
            return mediaId === Number(featured_media_id);
          });

          if (featuredIndex > -1) {
            // 从主图位置开始取5张图片
            const startIndex = featuredIndex;
            const endIndex = Math.min(startIndex + 5, originalGallerySlides.length);
            
            filteredGallerySlides = originalGallerySlides.slice(startIndex, endIndex);
            filteredThumbsSlides = originalThumbsSlides.slice(startIndex, endIndex);
            
            // 检查最后一张素材是否为视频，如果是则添加到筛选结果中
            if (this.isLastMediaVideo()) {
              const lastVideoSlide = this.getLastVideoSlide();
              if (lastVideoSlide) {
                // 确保视频不在已选择的5张图片中
                const lastVideoMediaId = lastVideoSlide.gallerySlide.querySelector("video")?.getAttribute("data-media-id");
                const isVideoAlreadyIncluded = filteredGallerySlides.some(slide => {
                  const slideMediaId = slide.querySelector("video")?.getAttribute("data-media-id");
                  return slideMediaId === lastVideoMediaId;
                });
                
                if (!isVideoAlreadyIncluded) {
                  filteredGallerySlides.push(lastVideoSlide.gallerySlide);
                  filteredThumbsSlides.push(lastVideoSlide.thumbsSlide);
                }
              }
            }
          } else {
            // 如果找不到主图，显示全部图片
            filteredGallerySlides = [...originalGallerySlides];
            filteredThumbsSlides = [...originalThumbsSlides];
          }
        }

        const renderedSlidesChanged =
          this.renderedSlides.map(getMediaId).toString() !==
          filteredGallerySlides.map(getMediaId).toString();

        if (this.gallerySwiper && this.thumbsSwiper && renderedSlidesChanged) {
          this.beforeGalleryChange();
          const thumbSlidesWrapper = this.querySelector(
            "[data-thumbs] [data-swiper-container]",
          );
          const gallerySlidesWrapper = this.querySelector(
            "[data-gallery] [data-swiper-container]",
          );

          // Assuming this.gallerySwiper is the swiper instance for the main gallery
          this.gallerySwiper.removeAllSlides();
          gallerySlidesWrapper.innerHTML = "";
          const swiperContainer = this.querySelector(".swiper-wrapper");
          filteredGallerySlides.forEach((slide, idx) => {
            if (idx === 0) {
              const slideImg = slide.querySelector("img");
              if (slideImg)
                slideImg.onload = function () {
                  swiperContainer.style.height = "auto";
                };
            }
            this.gallerySwiper.appendSlide(slide);
          });
          this.decorateSwiper(this.elements.gallery);

          // Assuming this.thumbsSwiper is the swiper instance for the thumbnails
          this.thumbsSwiper.removeAllSlides();
          thumbSlidesWrapper.innerHTML = "";

          filteredThumbsSlides.forEach((slide) =>
            this.thumbsSwiper.appendSlide(slide),
          );

          this.decorateSwiper(
            this.elements.thumbs,
            "wt-slider__container--thumbs",
          );

          this.thumbsSwiper.update();
          this.gallerySwiper.update();
        } else if (
          this.configuration.desktopLayout == "collage" ||
          this.configuration.desktopLayout == "masonry"
        ) {
          if (renderedSlidesChanged) {
            this.beforeGalleryChange();
            // Remove all existing slides
            this.elements.gallery
              .querySelectorAll("[data-swiper-slide]")
              .forEach((slide) => slide.remove());
            this.elements.thumbs
              .querySelectorAll("[data-swiper-slide]")
              .forEach((slide) => slide.remove());

            filteredGallerySlides.forEach((slide) =>
              this.elements.gallery
                .querySelector("[data-swiper-container]")
                .append(slide),
            );
            filteredThumbsSlides.forEach((slide) =>
              this.elements.thumbs
                .querySelector("[data-swiper-container]")
                .append(slide),
            );

            this.decorateCollage(
              this.elements.gallery,
              this.configuration.desktopLayout,
            );

            // add wt-product__gallery --even --odd classes to MediaGallery container depends on number of slides
            this.elements.gallery.classList.remove("wt-product__gallery--even");
            this.elements.gallery.classList.remove("wt-product__gallery--odd");
            if (filteredGallerySlides.length % 2 == 0) {
              this.elements.gallery.classList.add("wt-product__gallery--even");
            } else {
              this.elements.gallery.classList.add("wt-product__gallery--odd");
            }
          }
        }

        // 设置第一张图片为活动状态
        const firstSlideMediaId = filteredGallerySlides[0]
          ?.querySelector("img")
          ?.getAttribute("data-media-id");
        
        if (firstSlideMediaId) {
          this.setActiveMedia(firstSlideMediaId, true);
        }
        this.gallerySwiper?.update();

        if (renderedSlidesChanged) {
          setTimeout(this.afterGalleryChange.bind(this), 300);
        }

        this.renderedSlides = [...filteredGallerySlides];
      }

      setActiveMedia(mediaId, prepend) {
        let media = this.elements.gallery.querySelector(
          `[data-media-id="${mediaId}"]`,
        );

        if (this.gallerySwiper != null) {
          this.gallerySwiper.slideTo(this.indexInParent(media));
          this.thumbsSwiper.slideTo(this.indexInParent(media));
        }
      }

      matchResolution() {
        if (window.innerWidth < this.configuration.sliderEnabledBreakpoint) {
          return "mobile";
        } else {
          return "desktop";
        }
      }

      indexInParent(node) {
        if (!node) return -1;
        let children = node.parentNode.childNodes;
        let num = 0;
        for (let i = 0; i < children.length; i++) {
          if (children[i] == node) return num;
          if (children[i].nodeType == 1) num++;
        }
        return -1;
      }
    },
  );
}

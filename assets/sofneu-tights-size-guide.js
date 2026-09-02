(function () {

  'use strict';


  /* ========================================================
     SOFNEU TIGHTS SIZE GUIDE
     FINAL SHARED JAVASCRIPT

     Supports:
     - SIZE & FIT / INTERNATIONAL tabs
     - CM/KG / IN/LB switching
     - Multiple size guides
     - Dynamically injected popup content
     - Shopify Page sanitizer-safe markup
     - Strict namespace isolation
  ======================================================== */


  const GUIDE_SELECTOR =
    '.sofneu-tights-size-guide';


  const FIT_ACTIVE =
    'stsg-tab-fit-active';


  const INTERNATIONAL_ACTIVE =
    'stsg-tab-international-active';


  const METRIC_ACTIVE =
    'stsg-unit-metric-active';


  const IMPERIAL_ACTIVE =
    'stsg-unit-imperial-active';



  /* ========================================================
     GET ROOT
  ======================================================== */

  function getGuide(element) {

    if (
      !element ||
      !element.closest
    ) {
      return null;
    }


    return element.closest(
      GUIDE_SELECTOR
    );

  }



  /* ========================================================
     ACCESSIBILITY
  ======================================================== */

  function updateAccessibility(guide) {

    if (!guide) {
      return;
    }


    const fitTab =
      guide.querySelector(
        '.stsg-tab-fit'
      );


    const internationalTab =
      guide.querySelector(
        '.stsg-tab-international'
      );


    const metricButton =
      guide.querySelector(
        '.stsg-unit-metric'
      );


    const imperialButton =
      guide.querySelector(
        '.stsg-unit-imperial'
      );


    const fitPanel =
      guide.querySelector(
        '.stsg-panel-fit'
      );


    const internationalPanel =
      guide.querySelector(
        '.stsg-panel-international'
      );


    const fitActive =
      guide.classList.contains(
        FIT_ACTIVE
      );


    const metricActive =
      guide.classList.contains(
        METRIC_ACTIVE
      );


    if (fitTab) {

      fitTab.setAttribute(
        'aria-selected',
        fitActive
          ? 'true'
          : 'false'
      );

    }


    if (internationalTab) {

      internationalTab.setAttribute(
        'aria-selected',
        fitActive
          ? 'false'
          : 'true'
      );

    }


    if (fitPanel) {

      fitPanel.setAttribute(
        'aria-hidden',
        fitActive
          ? 'false'
          : 'true'
      );

    }


    if (internationalPanel) {

      internationalPanel.setAttribute(
        'aria-hidden',
        fitActive
          ? 'true'
          : 'false'
      );

    }


    if (metricButton) {

      metricButton.setAttribute(
        'aria-pressed',
        metricActive
          ? 'true'
          : 'false'
      );

    }


    if (imperialButton) {

      imperialButton.setAttribute(
        'aria-pressed',
        metricActive
          ? 'false'
          : 'true'
      );

    }

  }



  /* ========================================================
     TAB CONTROL
  ======================================================== */

  function showFit(guide) {

    if (!guide) {
      return;
    }


    guide.classList.remove(
      INTERNATIONAL_ACTIVE
    );


    guide.classList.add(
      FIT_ACTIVE
    );


    updateAccessibility(
      guide
    );

  }



  function showInternational(guide) {

    if (!guide) {
      return;
    }


    guide.classList.remove(
      FIT_ACTIVE
    );


    guide.classList.add(
      INTERNATIONAL_ACTIVE
    );


    updateAccessibility(
      guide
    );

  }



  /* ========================================================
     UNIT CONTROL
  ======================================================== */

  function showMetric(guide) {

    if (!guide) {
      return;
    }


    guide.classList.remove(
      IMPERIAL_ACTIVE
    );


    guide.classList.add(
      METRIC_ACTIVE
    );


    updateAccessibility(
      guide
    );

  }



  function showImperial(guide) {

    if (!guide) {
      return;
    }


    guide.classList.remove(
      METRIC_ACTIVE
    );


    guide.classList.add(
      IMPERIAL_ACTIVE
    );


    updateAccessibility(
      guide
    );

  }



  /* ========================================================
     ACTION HANDLER

     IMPORTANT:
     Anything outside .sofneu-tights-size-guide
     exits immediately.
  ======================================================== */

  function handleAction(target) {

    if (
      !target ||
      !target.closest
    ) {
      return;
    }


    const guide =
      getGuide(
        target
      );


    /* STRICT ROOT GUARD */

    if (!guide) {
      return;
    }



    /* SIZE & FIT */

    const fitButton =
      target.closest(
        '.stsg-tab-fit'
      );


    if (fitButton) {

      showFit(
        guide
      );

      return;

    }



    /* INTERNATIONAL */

    const internationalButton =
      target.closest(
        '.stsg-tab-international'
      );


    if (internationalButton) {

      showInternational(
        guide
      );

      return;

    }



    /* METRIC */

    const metricButton =
      target.closest(
        '.stsg-unit-metric'
      );


    if (metricButton) {

      showMetric(
        guide
      );

      return;

    }



    /* IMPERIAL */

    const imperialButton =
      target.closest(
        '.stsg-unit-imperial'
      );


    if (imperialButton) {

      showImperial(
        guide
      );

    }

  }



  /* ========================================================
     POINTER / TOUCH
  ======================================================== */

  function handlePointerDown(event) {

    handleAction(
      event.target
    );

  }



  /* ========================================================
     KEYBOARD
  ======================================================== */

  function handleKeyDown(event) {

    if (
      event.key !== 'Enter' &&
      event.key !== ' '
    ) {
      return;
    }


    const target =
      event.target;


    if (
      !target ||
      !target.closest
    ) {
      return;
    }


    const guide =
      target.closest(
        GUIDE_SELECTOR
      );


    if (!guide) {
      return;
    }


    const actionable =
      target.closest(
        '.stsg-tab-fit,' +
        '.stsg-tab-international,' +
        '.stsg-unit-metric,' +
        '.stsg-unit-imperial'
      );


    if (!actionable) {
      return;
    }


    event.preventDefault();


    handleAction(
      actionable
    );

  }



  /* ========================================================
     INITIALIZE ONE GUIDE
  ======================================================== */

  function initializeGuide(guide) {

    if (
      !guide ||
      !guide.classList ||
      !guide.matches ||
      !guide.matches(
        GUIDE_SELECTOR
      )
    ) {
      return;
    }



    /* Default tab = SIZE & FIT */

    if (
      !guide.classList.contains(
        FIT_ACTIVE
      ) &&
      !guide.classList.contains(
        INTERNATIONAL_ACTIVE
      )
    ) {

      guide.classList.add(
        FIT_ACTIVE
      );

    }



    /* Default unit = CM / KG */

    if (
      !guide.classList.contains(
        METRIC_ACTIVE
      ) &&
      !guide.classList.contains(
        IMPERIAL_ACTIVE
      )
    ) {

      guide.classList.add(
        METRIC_ACTIVE
      );

    }



    /* Prevent conflicting tab states */

    if (
      guide.classList.contains(
        FIT_ACTIVE
      ) &&
      guide.classList.contains(
        INTERNATIONAL_ACTIVE
      )
    ) {

      guide.classList.remove(
        INTERNATIONAL_ACTIVE
      );

    }



    /* Prevent conflicting unit states */

    if (
      guide.classList.contains(
        METRIC_ACTIVE
      ) &&
      guide.classList.contains(
        IMPERIAL_ACTIVE
      )
    ) {

      guide.classList.remove(
        IMPERIAL_ACTIVE
      );

    }



    updateAccessibility(
      guide
    );

  }



  /* ========================================================
     INITIALIZE ALL GUIDES
  ======================================================== */

  function initializeAllGuides(root) {

    const scope =
      root || document;


    if (
      scope.matches &&
      scope.matches(
        GUIDE_SELECTOR
      )
    ) {

      initializeGuide(
        scope
      );

    }


    if (
      !scope.querySelectorAll
    ) {
      return;
    }


    const guides =
      scope.querySelectorAll(
        GUIDE_SELECTOR
      );


    guides.forEach(
      function (guide) {

        initializeGuide(
          guide
        );

      }
    );

  }



  /* ========================================================
     GLOBAL LISTENERS

     They are global listeners, but all actions are stopped
     unless the click/key happens inside the component root.
  ======================================================== */

  document.addEventListener(
    'pointerdown',
    handlePointerDown,
    true
  );


  document.addEventListener(
    'keydown',
    handleKeyDown,
    true
  );



  /* ========================================================
     INITIAL LOAD
  ======================================================== */

  if (
    document.readyState ===
    'loading'
  ) {

    document.addEventListener(
      'DOMContentLoaded',
      function () {

        initializeAllGuides(
          document
        );

      }
    );

  } else {

    initializeAllGuides(
      document
    );

  }



  /* ========================================================
     MUTATION OBSERVER

     Supports popup systems which load page content
     after the initial Shopify page has loaded.
  ======================================================== */

  const observer =
    new MutationObserver(
      function (mutations) {

        mutations.forEach(
          function (mutation) {

            mutation.addedNodes.forEach(
              function (node) {

                if (
                  !node ||
                  node.nodeType !== 1
                ) {
                  return;
                }


                const isGuide =
                  node.matches &&
                  node.matches(
                    GUIDE_SELECTOR
                  );


                const containsGuide =
                  node.querySelector &&
                  node.querySelector(
                    GUIDE_SELECTOR
                  );


                if (
                  !isGuide &&
                  !containsGuide
                ) {
                  return;
                }


                initializeAllGuides(
                  node
                );

              }
            );

          }
        );

      }
    );


  observer.observe(
    document.documentElement,
    {
      childList: true,
      subtree: true
    }
  );


})();
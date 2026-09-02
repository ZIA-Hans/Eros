(function () {
  'use strict';

  console.log('[SIBSG] Insert Bra Size Guide loaded');

  /*
   * =========================================================
   * SOFNEU INSERT BRA SIZE GUIDE
   *
   * Class-based version.
   * No data-* attributes required.
   *
   * Everything is strictly scoped to:
   * .sofneu-insert-bra-size-guide
   * =========================================================
   */

  const GUIDE_SELECTOR = '.sofneu-insert-bra-size-guide';


  /* =========================================================
     SIZE DATA
  ========================================================== */

  const DATA = {

    au: {

      bands: [
        '6',
        '8',
        '10',
        '12',
        '14',
        '16',
        '18'
      ],

      cups: [
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G'
      ],

      mapping: {

        '6': {
          A: 'A',
          B: 'A',
          C: 'A',
          D: 'A',
          E: 'B',
          F: 'C',
          G: 'D'
        },

        '8': {
          A: 'A',
          B: 'A',
          C: 'A',
          D: 'B',
          E: 'C',
          F: 'D',
          G: null
        },

        '10': {
          A: 'A',
          B: 'A',
          C: 'B',
          D: 'C',
          E: 'D',
          F: null,
          G: null
        },

        '12': {
          A: 'A',
          B: 'B',
          C: 'C',
          D: 'D',
          E: null,
          F: null,
          G: null
        },

        '14': {
          A: 'B',
          B: 'C',
          C: 'D',
          D: null,
          E: null,
          F: null,
          G: null
        },

        '16': {
          A: 'C',
          B: 'D',
          C: null,
          D: null,
          E: null,
          F: null,
          G: null
        },

        '18': {
          A: 'D',
          B: null,
          C: null,
          D: null,
          E: null,
          F: null,
          G: null
        }

      }

    },


    us: {

      bands: [
        '28',
        '30',
        '32',
        '34',
        '36',
        '38',
        '40'
      ],

      cups: [
        'A',
        'B',
        'C',
        'D',
        'DD/E',
        'DDD/F',
        'G'
      ],

      mapping: {

        '28': {
          A: 'A',
          B: 'A',
          C: 'A',
          D: 'A',
          'DD/E': 'B',
          'DDD/F': 'C',
          G: 'D'
        },

        '30': {
          A: 'A',
          B: 'A',
          C: 'A',
          D: 'B',
          'DD/E': 'C',
          'DDD/F': 'D',
          G: null
        },

        '32': {
          A: 'A',
          B: 'A',
          C: 'B',
          D: 'C',
          'DD/E': 'D',
          'DDD/F': null,
          G: null
        },

        '34': {
          A: 'A',
          B: 'B',
          C: 'C',
          D: 'D',
          'DD/E': null,
          'DDD/F': null,
          G: null
        },

        '36': {
          A: 'B',
          B: 'C',
          C: 'D',
          D: null,
          'DD/E': null,
          'DDD/F': null,
          G: null
        },

        '38': {
          A: 'C',
          B: 'D',
          C: null,
          D: null,
          'DD/E': null,
          'DDD/F': null,
          G: null
        },

        '40': {
          A: 'D',
          B: null,
          C: null,
          D: null,
          'DD/E': null,
          'DDD/F': null,
          G: null
        }

      }

    }

  };


  /* =========================================================
     REGION
  ========================================================== */

  function getRegion(guide) {

    if (
      guide.classList.contains(
        'sibsg-region-us-active'
      )
    ) {
      return 'us';
    }

    return 'au';

  }


  /* =========================================================
     RENDER BAND BUTTONS
  ========================================================== */

  function renderBands(guide) {

    const wrapper =
      guide.querySelector(
        '.sibsg-band-options'
      );

    if (!wrapper) return;


    const region =
      getRegion(guide);


    wrapper.innerHTML =
      DATA[region].bands
        .map(function (band) {

          return (
            '<button ' +
              'type="button" ' +
              'class="sibsg-option sibsg-band-option">' +
              band +
            '</button>'
          );

        })
        .join('');

  }


  /* =========================================================
     RENDER CUP BUTTONS
  ========================================================== */

  function renderCups(guide) {

    const wrapper =
      guide.querySelector(
        '.sibsg-cup-options'
      );

    if (!wrapper) return;


    const region =
      getRegion(guide);


    wrapper.innerHTML =
      DATA[region].cups
        .map(function (cup) {

          return (
            '<button ' +
              'type="button" ' +
              'class="sibsg-option sibsg-cup-option">' +
              cup +
            '</button>'
          );

        })
        .join('');

  }


  /* =========================================================
     RENDER SIZE TABLE
  ========================================================== */

  function renderTable(guide) {

    const table =
      guide.querySelector(
        '.sibsg-size-table'
      );

    if (!table) return;


    const region =
      getRegion(guide);

    const data =
      DATA[region];


    let html = '';


    /* HEADER */

    html += '<thead>';
    html += '<tr>';

    html += '<th>Band</th>';


    data.cups.forEach(function (cup) {

      html +=
        '<th>' +
        cup +
        '</th>';

    });


    html += '</tr>';
    html += '</thead>';


    /* BODY */

    html += '<tbody>';


    data.bands.forEach(function (band) {

      html += '<tr>';

      html +=
        '<td class="sibsg-band-cell">' +
        band +
        '</td>';


      data.cups.forEach(function (cup) {

        const size =
          data.mapping[band] &&
          data.mapping[band][cup]
            ? data.mapping[band][cup]
            : null;


        if (size) {

          html +=
            '<td class="sibsg-size-' +
            size.toLowerCase() +
            '">' +
            size +
            '</td>';

        } else {

          html +=
            '<td class="sibsg-size-na">–</td>';

        }

      });


      html += '</tr>';

    });


    html += '</tbody>';


    table.innerHTML = html;

  }


  /* =========================================================
     CLEAR RESULT
  ========================================================== */

  function clearResult(guide) {

    const result =
      guide.querySelector(
        '.sibsg-result'
      );

    const unavailable =
      guide.querySelector(
        '.sibsg-unavailable'
      );


    if (result) {

      result.classList.remove(
        'is-visible'
      );

    }


    if (unavailable) {

      unavailable.classList.remove(
        'is-visible'
      );

    }

  }


  /* =========================================================
     CLEAR SELECTED BUTTONS
  ========================================================== */

  function clearSelections(guide) {

    guide
      .querySelectorAll(
        '.sibsg-band-option.is-active, ' +
        '.sibsg-cup-option.is-active'
      )
      .forEach(function (button) {

        button.classList.remove(
          'is-active'
        );

      });


    clearResult(guide);

  }


  /* =========================================================
     UPDATE RESULT
  ========================================================== */

  function updateResult(guide) {

    const bandButton =
      guide.querySelector(
        '.sibsg-band-option.is-active'
      );

    const cupButton =
      guide.querySelector(
        '.sibsg-cup-option.is-active'
      );


    if (
      !bandButton ||
      !cupButton
    ) {

      clearResult(guide);

      return;

    }


    const region =
      getRegion(guide);


    const band =
      bandButton.textContent.trim();


    const cup =
      cupButton.textContent.trim();


    const size =
      DATA[region].mapping[band] &&
      DATA[region].mapping[band][cup]
        ? DATA[region].mapping[band][cup]
        : null;


    const result =
      guide.querySelector(
        '.sibsg-result'
      );


    const resultSize =
      guide.querySelector(
        '.sibsg-result-size'
      );


    const unavailable =
      guide.querySelector(
        '.sibsg-unavailable'
      );


    /* NO SIZE */

    if (!size) {

      if (result) {

        result.classList.remove(
          'is-visible'
        );

      }


      if (unavailable) {

        unavailable.classList.add(
          'is-visible'
        );

      }


      console.log(
        '[SIBSG] No size:',
        region,
        band,
        cup
      );


      return;

    }


    /* SIZE AVAILABLE */

    if (unavailable) {

      unavailable.classList.remove(
        'is-visible'
      );

    }


    if (resultSize) {

      resultSize.textContent =
        size;

    }


    if (result) {

      result.classList.add(
        'is-visible'
      );

    }


    console.log(
      '[SIBSG] Result:',
      region,
      band,
      cup,
      '→',
      size
    );

  }


  /* =========================================================
     SET REGION
  ========================================================== */

  function setRegion(
    guide,
    region
  ) {

    if (
      region !== 'au' &&
      region !== 'us'
    ) {
      return;
    }


    guide.classList.remove(
      'sibsg-region-au-active',
      'sibsg-region-us-active'
    );


    if (region === 'us') {

      guide.classList.add(
        'sibsg-region-us-active'
      );

    } else {

      guide.classList.add(
        'sibsg-region-au-active'
      );

    }


    const auButton =
      guide.querySelector(
        '.sibsg-region-au'
      );


    const usButton =
      guide.querySelector(
        '.sibsg-region-us'
      );


    if (auButton) {

      auButton.classList.toggle(
        'is-active',
        region === 'au'
      );

    }


    if (usButton) {

      usButton.classList.toggle(
        'is-active',
        region === 'us'
      );

    }


    clearSelections(guide);

    renderBands(guide);

    renderCups(guide);

    renderTable(guide);


    console.log(
      '[SIBSG] Region:',
      region
    );

  }


  /* =========================================================
     INTERACTION HANDLER
  ========================================================== */

  function handleInteraction(event) {

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


    /*
     * Any click outside our guide:
     * immediately ignored.
     */

    if (!guide) {
      return;
    }


    /* =====================================================
       AU / NZ
    ====================================================== */

    const auButton =
      target.closest(
        '.sibsg-region-au'
      );


    if (
      auButton &&
      guide.contains(auButton)
    ) {

      event.preventDefault();


      setRegion(
        guide,
        'au'
      );


      return;

    }


    /* =====================================================
       US
    ====================================================== */

    const usButton =
      target.closest(
        '.sibsg-region-us'
      );


    if (
      usButton &&
      guide.contains(usButton)
    ) {

      event.preventDefault();


      setRegion(
        guide,
        'us'
      );


      return;

    }


    /* =====================================================
       BAND
    ====================================================== */

    const bandButton =
      target.closest(
        '.sibsg-band-option'
      );


    if (
      bandButton &&
      guide.contains(bandButton)
    ) {

      event.preventDefault();


      guide
        .querySelectorAll(
          '.sibsg-band-option'
        )
        .forEach(function (button) {

          button.classList.remove(
            'is-active'
          );

        });


      bandButton.classList.add(
        'is-active'
      );


      console.log(
        '[SIBSG] Band:',
        bandButton.textContent.trim()
      );


      updateResult(guide);


      return;

    }


    /* =====================================================
       CUP
    ====================================================== */

    const cupButton =
      target.closest(
        '.sibsg-cup-option'
      );


    if (
      cupButton &&
      guide.contains(cupButton)
    ) {

      event.preventDefault();


      guide
        .querySelectorAll(
          '.sibsg-cup-option'
        )
        .forEach(function (button) {

          button.classList.remove(
            'is-active'
          );

        });


      cupButton.classList.add(
        'is-active'
      );


      console.log(
        '[SIBSG] Cup:',
        cupButton.textContent.trim()
      );


      updateResult(guide);

    }

  }


  /* =========================================================
     POINTERDOWN

     Capture phase ensures the Size Guide gets
     the interaction before popup/theme click handlers.
  ========================================================== */

  document.addEventListener(
    'pointerdown',
    handleInteraction,
    true
  );


  /* =========================================================
     KEYBOARD SUPPORT
  ========================================================== */

  document.addEventListener(
    'keydown',
    function (event) {

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


      const interactive =
        target.closest(
          '.sibsg-region-au, ' +
          '.sibsg-region-us, ' +
          '.sibsg-band-option, ' +
          '.sibsg-cup-option'
        );


      if (!interactive) {
        return;
      }


      handleInteraction(event);

    },
    true
  );


  /* =========================================================
     INITIALIZE ONE GUIDE
  ========================================================== */

  function initializeGuide(guide) {

    if (!guide) {
      return;
    }


    if (
      guide.classList.contains(
        'sibsg-js-ready'
      )
    ) {

      return;

    }


    guide.classList.add(
      'sibsg-js-ready'
    );


    setRegion(
      guide,
      'au'
    );


    console.log(
      '[SIBSG] Guide initialized'
    );

  }


  /* =========================================================
     INITIALIZE ALL EXISTING GUIDES
  ========================================================== */

  function initializeExistingGuides() {

    document
      .querySelectorAll(
        GUIDE_SELECTOR
      )
      .forEach(function (guide) {

        initializeGuide(
          guide
        );

      });

  }


  /* =========================================================
     INITIAL LOAD
  ========================================================== */

  if (
    document.readyState === 'loading'
  ) {

    document.addEventListener(
      'DOMContentLoaded',
      initializeExistingGuides
    );

  } else {

    initializeExistingGuides();

  }


  /* =========================================================
     DYNAMIC POPUP SUPPORT
  ========================================================== */

  function startObserver() {

    if (!document.body) {
      return;
    }


    const observer =
      new MutationObserver(
        function () {

          initializeExistingGuides();

        }
      );


    observer.observe(
      document.body,
      {
        childList: true,
        subtree: true
      }
    );

  }


  if (document.body) {

    startObserver();

  } else {

    document.addEventListener(
      'DOMContentLoaded',
      startObserver
    );

  }

})();
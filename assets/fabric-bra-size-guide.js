(function () {
  'use strict';

  const ROOT_SELECTOR = '.sofneu-fabric-bra-size-guide';

  /* =========================================================
     SOFNEU FABRIC STICKY BRA SIZE DATA

     Base sizing model:
     A-G

     Breathable:
     Available A-E
     Base F/G recommendations are capped at E

     Strong Adhesive:
     Available A-G
     ========================================================= */

  const DATA = {
    au: {
      bands: ['6', '8', '10', '12', '14', '16', '18', '20', '22'],
      cups: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],

      mapping: {
        '6': {
          A: 'A',
          B: 'A',
          C: 'A',
          D: 'A',
          E: 'B',
          F: 'B',
          G: 'C'
        },

        '8': {
          A: 'A',
          B: 'A',
          C: 'A',
          D: 'B',
          E: 'B',
          F: 'C',
          G: 'C'
        },

        '10': {
          A: 'A',
          B: 'A',
          C: 'B',
          D: 'B',
          E: 'C',
          F: 'C',
          G: 'D'
        },

        '12': {
          A: 'A',
          B: 'B',
          C: 'B',
          D: 'C',
          E: 'C',
          F: 'D',
          G: 'D'
        },

        '14': {
          A: 'B',
          B: 'B',
          C: 'C',
          D: 'C',
          E: 'D',
          F: 'D',
          G: 'E'
        },

        '16': {
          A: 'B',
          B: 'C',
          C: 'C',
          D: 'D',
          E: 'D',
          F: 'E',
          G: 'E'
        },

        '18': {
          A: 'C',
          B: 'C',
          C: 'D',
          D: 'D',
          E: 'E',
          F: 'E',
          G: 'F'
        },

        '20': {
          A: 'C',
          B: 'D',
          C: 'D',
          D: 'E',
          E: 'E',
          F: 'F',
          G: 'F'
        },

        '22': {
          A: 'D',
          B: 'D',
          C: 'E',
          D: 'E',
          E: 'F',
          F: 'F',
          G: 'G'
        }
      }
    },

    us: {
      bands: ['28', '30', '32', '34', '36', '38', '40', '42', '44'],
      cups: ['A', 'B', 'C', 'D', 'DD/E', 'DDD/F', 'G'],

      mapping: {
        '28': {
          A: 'A',
          B: 'A',
          C: 'A',
          D: 'A',
          'DD/E': 'B',
          'DDD/F': 'B',
          G: 'C'
        },

        '30': {
          A: 'A',
          B: 'A',
          C: 'A',
          D: 'B',
          'DD/E': 'B',
          'DDD/F': 'C',
          G: 'C'
        },

        '32': {
          A: 'A',
          B: 'A',
          C: 'B',
          D: 'B',
          'DD/E': 'C',
          'DDD/F': 'C',
          G: 'D'
        },

        '34': {
          A: 'A',
          B: 'B',
          C: 'B',
          D: 'C',
          'DD/E': 'C',
          'DDD/F': 'D',
          G: 'D'
        },

        '36': {
          A: 'B',
          B: 'B',
          C: 'C',
          D: 'C',
          'DD/E': 'D',
          'DDD/F': 'D',
          G: 'E'
        },

        '38': {
          A: 'B',
          B: 'C',
          C: 'C',
          D: 'D',
          'DD/E': 'D',
          'DDD/F': 'E',
          G: 'E'
        },

        '40': {
          A: 'C',
          B: 'C',
          C: 'D',
          D: 'D',
          'DD/E': 'E',
          'DDD/F': 'E',
          G: 'F'
        },

        '42': {
          A: 'C',
          B: 'D',
          C: 'D',
          D: 'E',
          'DD/E': 'E',
          'DDD/F': 'F',
          G: 'F'
        },

        '44': {
          A: 'D',
          B: 'D',
          C: 'E',
          D: 'E',
          'DD/E': 'F',
          'DDD/F': 'F',
          G: 'G'
        }
      }
    }
  };


  /* =========================================================
     HELPERS
     ========================================================= */

  function getRegion(root) {
    return root.classList.contains('fbsg-region-us-active')
      ? 'us'
      : 'au';
  }


  function getStyle(root) {
    return root.classList.contains('fbsg-style-strong-active')
      ? 'strong'
      : 'breathable';
  }


  function getSelectedText(root, selector) {
    const selected = root.querySelector(
      selector + '.is-active'
    );

    return selected
      ? selected.textContent.trim()
      : null;
  }


  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }


  function getFinalRecommendation(baseSize, style) {
    if (!baseSize) {
      return null;
    }

    if (
      style === 'breathable' &&
      (baseSize === 'F' || baseSize === 'G')
    ) {
      return {
        size: 'E',
        capped: true,
        base: baseSize
      };
    }

    return {
      size: baseSize,
      capped: false,
      base: baseSize
    };
  }


  function sizeClass(size) {
    if (size === 'A') return 'fbsg-size-a';
    if (size === 'B') return 'fbsg-size-b';
    if (size === 'C') return 'fbsg-size-c';
    if (size === 'D') return 'fbsg-size-d';
    if (size === 'E') return 'fbsg-size-e';
    if (size === 'F') return 'fbsg-size-f';
    if (size === 'G') return 'fbsg-size-g';

    return 'fbsg-size-na';
  }


  /* =========================================================
     RENDER SELECTORS
     ========================================================= */

  function renderBands(root) {
    const region = getRegion(root);

    const container = root.querySelector(
      '.fbsg-band-options'
    );

    if (!container) {
      return;
    }

    container.innerHTML = DATA[region].bands
      .map(function (band) {
        return (
          '<button type="button" ' +
          'class="fbsg-option fbsg-band-option">' +
          escapeHTML(band) +
          '</button>'
        );
      })
      .join('');
  }


  function renderCups(root) {
    const region = getRegion(root);

    const container = root.querySelector(
      '.fbsg-cup-options'
    );

    if (!container) {
      return;
    }

    container.innerHTML = DATA[region].cups
      .map(function (cup) {
        return (
          '<button type="button" ' +
          'class="fbsg-option fbsg-cup-option">' +
          escapeHTML(cup) +
          '</button>'
        );
      })
      .join('');
  }


  /* =========================================================
     RENDER SIZE CHART
     ========================================================= */

  function renderChart(root) {
    const region = getRegion(root);
    const style = getStyle(root);

    const table = root.querySelector(
      '.fbsg-table'
    );

    const chartNote = root.querySelector(
      '.fbsg-chart-style-note'
    );

    if (!table) {
      return;
    }

    const regionData = DATA[region];

    let html = '<thead><tr>';

    html += '<th>Band</th>';

    regionData.cups.forEach(function (cup) {
      html += '<th>' + escapeHTML(cup) + '</th>';
    });

    html += '</tr></thead><tbody>';

    regionData.bands.forEach(function (band) {

      html += '<tr>';

      html +=
        '<td class="fbsg-band-cell">' +
        escapeHTML(band) +
        '</td>';

      regionData.cups.forEach(function (cup) {

        const base =
          regionData.mapping[band] &&
          regionData.mapping[band][cup]
            ? regionData.mapping[band][cup]
            : null;

        if (!base) {
          html +=
            '<td class="fbsg-size-na">–</td>';

          return;
        }

        const result =
          getFinalRecommendation(
            base,
            style
          );

        if (
          style === 'breathable' &&
          result.capped
        ) {
          html +=
            '<td class="fbsg-size-e fbsg-size-capped">' +
            'E<span>*</span>' +
            '</td>';

          return;
        }

        html +=
          '<td class="' +
          sizeClass(result.size) +
          '">' +
          escapeHTML(result.size) +
          '</td>';
      });

      html += '</tr>';
    });

    html += '</tbody>';

    table.innerHTML = html;


    if (chartNote) {

      if (style === 'breathable') {

        chartNote.innerHTML =
          '<strong>* E is the largest size available in the Breathable style.</strong> ' +
          'For fuller coverage in these bra sizes, consider the Strong Adhesive style.';

        chartNote.classList.add(
          'is-visible'
        );

      } else {

        chartNote.innerHTML =
          'Strong Adhesive is available in the full Sofneu A–G size range.';

        chartNote.classList.add(
          'is-visible'
        );
      }
    }
  }


  /* =========================================================
     RESULT
     ========================================================= */

  function resetSelection(root) {

    root
      .querySelectorAll(
        '.fbsg-option.is-active'
      )
      .forEach(function (button) {
        button.classList.remove(
          'is-active'
        );
      });

    const result = root.querySelector(
      '.fbsg-result'
    );

    if (result) {
      result.classList.remove(
        'is-visible'
      );
    }
  }


  function updateResult(root) {

    const region = getRegion(root);
    const style = getStyle(root);

    const band = getSelectedText(
      root,
      '.fbsg-band-option'
    );

    const cup = getSelectedText(
      root,
      '.fbsg-cup-option'
    );

    const result = root.querySelector(
      '.fbsg-result'
    );

    const resultSize = root.querySelector(
      '.fbsg-result-size'
    );

    const resultTitle = root.querySelector(
      '.fbsg-result-title'
    );

    const resultCopy = root.querySelector(
      '.fbsg-result-copy'
    );

    const capNote = root.querySelector(
      '.fbsg-result-cap-note'
    );

    if (
      !result ||
      !resultSize
    ) {
      return;
    }

    if (
      !band ||
      !cup
    ) {
      result.classList.remove(
        'is-visible'
      );

      return;
    }

    const base =
      DATA[region].mapping[band] &&
      DATA[region].mapping[band][cup]
        ? DATA[region].mapping[band][cup]
        : null;

    if (!base) {
      result.classList.remove(
        'is-visible'
      );

      return;
    }

    const recommendation =
      getFinalRecommendation(
        base,
        style
      );

    resultSize.textContent =
      recommendation.size;

    if (resultTitle) {

      resultTitle.textContent =
        'Recommended for your usual bra size.';
    }


    if (resultCopy) {

      if (style === 'breathable') {

        resultCopy.textContent =
          'A flexible starting fit for lightweight, breathable coverage.';

      } else {

        resultCopy.textContent =
          'A flexible starting fit with stronger adhesive support and coverage.';
      }
    }


    if (capNote) {

      if (
        style === 'breathable' &&
        recommendation.capped
      ) {

        capNote.innerHTML =
          '<strong>E is the largest size in this style.</strong> ' +
          'For fuller coverage, consider the Strong Adhesive style.';

        capNote.classList.add(
          'is-visible'
        );

      } else {

        capNote.classList.remove(
          'is-visible'
        );
      }
    }

    result.classList.add(
      'is-visible'
    );
  }


  /* =========================================================
     REGION
     ========================================================= */

  function setRegion(root, region) {

    root.classList.remove(
      'fbsg-region-au-active',
      'fbsg-region-us-active'
    );

    root.classList.add(
      region === 'us'
        ? 'fbsg-region-us-active'
        : 'fbsg-region-au-active'
    );

    renderBands(root);
    renderCups(root);
    renderChart(root);

    resetSelection(root);
  }


  /* =========================================================
     STYLE
     ========================================================= */

  function setStyle(root, style) {

    root.classList.remove(
      'fbsg-style-breathable-active',
      'fbsg-style-strong-active'
    );

    root.classList.add(
      style === 'strong'
        ? 'fbsg-style-strong-active'
        : 'fbsg-style-breathable-active'
    );

    renderChart(root);

    /*
      Keep the user's selected band/cup
      when only changing style.
    */

    updateResult(root);
  }


  /* =========================================================
     OPTION SELECTION
     ========================================================= */

  function selectOption(
    root,
    clicked,
    selector
  ) {

    root
      .querySelectorAll(selector)
      .forEach(function (button) {

        button.classList.remove(
          'is-active'
        );
      });

    clicked.classList.add(
      'is-active'
    );

    updateResult(root);
  }


  /* =========================================================
     INTERACTION
     ========================================================= */

  function handleInteraction(event) {

    const root = event.target.closest(
      ROOT_SELECTOR
    );

    if (!root) {
      return;
    }


    const breathableButton =
      event.target.closest(
        '.fbsg-style-breathable'
      );

    if (
      breathableButton &&
      root.contains(breathableButton)
    ) {

      event.preventDefault();

      setStyle(
        root,
        'breathable'
      );

      return;
    }


    const strongButton =
      event.target.closest(
        '.fbsg-style-strong'
      );

    if (
      strongButton &&
      root.contains(strongButton)
    ) {

      event.preventDefault();

      setStyle(
        root,
        'strong'
      );

      return;
    }


    const auButton =
      event.target.closest(
        '.fbsg-region-au'
      );

    if (
      auButton &&
      root.contains(auButton)
    ) {

      event.preventDefault();

      setRegion(
        root,
        'au'
      );

      return;
    }


    const usButton =
      event.target.closest(
        '.fbsg-region-us'
      );

    if (
      usButton &&
      root.contains(usButton)
    ) {

      event.preventDefault();

      setRegion(
        root,
        'us'
      );

      return;
    }


    const bandButton =
      event.target.closest(
        '.fbsg-band-option'
      );

    if (
      bandButton &&
      root.contains(bandButton)
    ) {

      event.preventDefault();

      selectOption(
        root,
        bandButton,
        '.fbsg-band-option'
      );

      return;
    }


    const cupButton =
      event.target.closest(
        '.fbsg-cup-option'
      );

    if (
      cupButton &&
      root.contains(cupButton)
    ) {

      event.preventDefault();

      selectOption(
        root,
        cupButton,
        '.fbsg-cup-option'
      );
    }
  }


  function handleKeyboard(event) {

    if (
      event.key !== 'Enter' &&
      event.key !== ' '
    ) {
      return;
    }

    const root =
      event.target.closest(
        ROOT_SELECTOR
      );

    if (!root) {
      return;
    }

    if (
      event.target.matches(
        '.fbsg-style-btn, ' +
        '.fbsg-region-btn, ' +
        '.fbsg-band-option, ' +
        '.fbsg-cup-option'
      )
    ) {

      event.preventDefault();

      handleInteraction({
        target: event.target,
        preventDefault: function () {}
      });
    }
  }


  /* =========================================================
     INITIALIZATION
     ========================================================= */

  function initializeGuide(root) {

    if (
      root.classList.contains(
        'fbsg-initialized'
      )
    ) {
      return;
    }

    root.classList.add(
      'fbsg-initialized'
    );


    if (
      !root.classList.contains(
        'fbsg-region-us-active'
      )
    ) {

      root.classList.add(
        'fbsg-region-au-active'
      );
    }


    if (
      !root.classList.contains(
        'fbsg-style-strong-active'
      )
    ) {

      root.classList.add(
        'fbsg-style-breathable-active'
      );
    }


    renderBands(root);
    renderCups(root);
    renderChart(root);
  }


  function initializeExistingGuides() {

    document
      .querySelectorAll(
        ROOT_SELECTOR
      )
      .forEach(
        initializeGuide
      );
  }


  document.addEventListener(
    'pointerdown',
    handleInteraction,
    true
  );


  document.addEventListener(
    'keydown',
    handleKeyboard,
    true
  );


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


  const observer =
    new MutationObserver(
      function () {
        initializeExistingGuides();
      }
    );


  if (document.body) {

    observer.observe(
      document.body,
      {
        childList: true,
        subtree: true
      }
    );

  } else {

    document.addEventListener(
      'DOMContentLoaded',
      function () {

        observer.observe(
          document.body,
          {
            childList: true,
            subtree: true
          }
        );
      }
    );
  }

})();
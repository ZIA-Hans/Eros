(function () {
  'use strict';

  const ROOT_SELECTOR = '.sofneu-cleavage-bra-size-guide';

  const DATA = {
    au: {
      bands: ['6', '8', '10', '12', '14', '16', '18', '20', '22'],
      cups: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],

      mapping: {
        '6': {
          A: 'A–B',
          B: 'A–B',
          C: 'A–B',
          D: 'C–D',
          E: 'C–D',
          F: 'C–D',
          G: 'C–D'
        },

        '8': {
          A: 'A–B',
          B: 'A–B',
          C: 'A–B',
          D: 'A–B',
          E: 'A–B',
          F: 'C–D',
          G: 'C–D'
        },

        '10': {
          A: 'A–B',
          B: 'A–B',
          C: 'A–B',
          D: 'C–D',
          E: 'C–D',
          F: 'DD+',
          G: 'DD+'
        },

        '12': {
          A: 'A–B',
          B: 'C–D',
          C: 'C–D',
          D: 'DD+',
          E: 'DD+',
          F: 'DD+',
          G: 'DD+'
        },

        '14': {
          A: 'C–D',
          B: 'C–D',
          C: 'DD+',
          D: 'DD+',
          E: 'DD+',
          F: 'DD+',
          G: 'DD+'
        },

        '16': {
          A: 'C–D',
          B: 'DD+',
          C: 'DD+',
          D: 'DD+',
          E: 'DD+',
          F: 'DD+',
          G: 'DD+'
        },

        '18': {
          A: 'DD+',
          B: 'DD+',
          C: 'DD+',
          D: 'DD+',
          E: 'DD+',
          F: 'DD+',
          G: 'DD+'
        },

        '20': {
          A: 'DD+',
          B: 'DD+',
          C: 'DD+',
          D: 'DD+',
          E: 'DD+',
          F: 'DD+',
          G: 'DD+'
        },

        '22': {
          A: 'DD+',
          B: 'DD+',
          C: 'DD+',
          D: 'DD+',
          E: 'DD+',
          F: 'DD+',
          G: 'DD+'
        }
      },

      alternatives: {
        '14|B': 'DD+',
        '16|A': 'DD+'
      }
    },

    us: {
      bands: ['28', '30', '32', '34', '36', '38', '40', '42', '44'],
      cups: ['A', 'B', 'C', 'D', 'DD/E', 'DDD/F', 'G'],

      mapping: {
        '28': {
          A: 'A–B',
          B: 'A–B',
          C: 'A–B',
          D: 'C–D',
          'DD/E': 'C–D',
          'DDD/F': 'C–D',
          G: 'C–D'
        },

        '30': {
          A: 'A–B',
          B: 'A–B',
          C: 'A–B',
          D: 'A–B',
          'DD/E': 'A–B',
          'DDD/F': 'C–D',
          G: 'C–D'
        },

        '32': {
          A: 'A–B',
          B: 'A–B',
          C: 'A–B',
          D: 'C–D',
          'DD/E': 'C–D',
          'DDD/F': 'DD+',
          G: 'DD+'
        },

        '34': {
          A: 'A–B',
          B: 'C–D',
          C: 'C–D',
          D: 'DD+',
          'DD/E': 'DD+',
          'DDD/F': 'DD+',
          G: 'DD+'
        },

        '36': {
          A: 'C–D',
          B: 'C–D',
          C: 'DD+',
          D: 'DD+',
          'DD/E': 'DD+',
          'DDD/F': 'DD+',
          G: 'DD+'
        },

        '38': {
          A: 'C–D',
          B: 'DD+',
          C: 'DD+',
          D: 'DD+',
          'DD/E': 'DD+',
          'DDD/F': 'DD+',
          G: 'DD+'
        },

        '40': {
          A: 'DD+',
          B: 'DD+',
          C: 'DD+',
          D: 'DD+',
          'DD/E': 'DD+',
          'DDD/F': 'DD+',
          G: 'DD+'
        },

        '42': {
          A: 'DD+',
          B: 'DD+',
          C: 'DD+',
          D: 'DD+',
          'DD/E': 'DD+',
          'DDD/F': 'DD+',
          G: 'DD+'
        },

        '44': {
          A: 'DD+',
          B: 'DD+',
          C: 'DD+',
          D: 'DD+',
          'DD/E': 'DD+',
          'DDD/F': 'DD+',
          G: 'DD+'
        }
      },

      alternatives: {
        '36|B': 'DD+',
        '38|A': 'DD+'
      }
    }
  };


  function getRegion(root) {
    return root.classList.contains('csbsg-region-us-active')
      ? 'us'
      : 'au';
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


  function sizeClass(size) {
    if (size === 'A–B') {
      return 'csbsg-size-ab';
    }

    if (size === 'C–D') {
      return 'csbsg-size-cd';
    }

    if (size === 'DD+') {
      return 'csbsg-size-dd';
    }

    return 'csbsg-size-na';
  }


  function renderBands(root) {
    const region = getRegion(root);
    const container = root.querySelector(
      '.csbsg-band-options'
    );

    if (!container) {
      return;
    }

    container.innerHTML = DATA[region].bands
      .map(function (band) {
        return (
          '<button type="button" ' +
          'class="csbsg-option csbsg-band-option">' +
          escapeHTML(band) +
          '</button>'
        );
      })
      .join('');
  }


  function renderCups(root) {
    const region = getRegion(root);
    const container = root.querySelector(
      '.csbsg-cup-options'
    );

    if (!container) {
      return;
    }

    container.innerHTML = DATA[region].cups
      .map(function (cup) {
        return (
          '<button type="button" ' +
          'class="csbsg-option csbsg-cup-option">' +
          escapeHTML(cup) +
          '</button>'
        );
      })
      .join('');
  }


  function renderChart(root) {
    const region = getRegion(root);
    const table = root.querySelector(
      '.csbsg-table'
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
      html += '<td>' + escapeHTML(band) + '</td>';

      regionData.cups.forEach(function (cup) {
        const primary =
          regionData.mapping[band] &&
          regionData.mapping[band][cup]
            ? regionData.mapping[band][cup]
            : null;

        const alternative =
          regionData.alternatives[
            band + '|' + cup
          ] || null;

        if (!primary) {
          html +=
            '<td class="csbsg-size-na">–</td>';
          return;
        }

        if (alternative) {
          html +=
            '<td class="csbsg-size-overlap">' +
            '<span>' +
            escapeHTML(primary) +
            '</span>' +
            '<small>' +
            escapeHTML(alternative) +
            '</small>' +
            '</td>';
          return;
        }

        html +=
          '<td class="' +
          sizeClass(primary) +
          '">' +
          escapeHTML(primary) +
          '</td>';
      });

      html += '</tr>';
    });

    html += '</tbody>';

    table.innerHTML = html;
  }


  function resetSelection(root) {
    root
      .querySelectorAll(
        '.csbsg-option.is-active'
      )
      .forEach(function (button) {
        button.classList.remove('is-active');
      });

    const result = root.querySelector(
      '.csbsg-result'
    );

    const alternative = root.querySelector(
      '.csbsg-result-alternative'
    );

    if (result) {
      result.classList.remove('is-visible');
    }

    if (alternative) {
      alternative.classList.remove(
        'is-visible'
      );
    }
  }


  function updateResult(root) {
    const region = getRegion(root);

    const band = getSelectedText(
      root,
      '.csbsg-band-option'
    );

    const cup = getSelectedText(
      root,
      '.csbsg-cup-option'
    );

    const result = root.querySelector(
      '.csbsg-result'
    );

    const resultSize = root.querySelector(
      '.csbsg-result-size'
    );

    const alternativeBox = root.querySelector(
      '.csbsg-result-alternative'
    );

    const alternativeSize = root.querySelector(
      '.csbsg-alternative-size'
    );

    if (!result || !resultSize) {
      return;
    }

    if (!band || !cup) {
      result.classList.remove('is-visible');

      if (alternativeBox) {
        alternativeBox.classList.remove(
          'is-visible'
        );
      }

      return;
    }

    const primary =
      DATA[region].mapping[band] &&
      DATA[region].mapping[band][cup]
        ? DATA[region].mapping[band][cup]
        : null;

    const alternative =
      DATA[region].alternatives[
        band + '|' + cup
      ] || null;

    if (!primary) {
      result.classList.remove('is-visible');

      if (alternativeBox) {
        alternativeBox.classList.remove(
          'is-visible'
        );
      }

      return;
    }

    resultSize.textContent = primary;
    result.classList.add('is-visible');

    if (
      alternative &&
      alternativeBox &&
      alternativeSize
    ) {
      alternativeSize.textContent =
        alternative;

      alternativeBox.classList.add(
        'is-visible'
      );
    } else if (alternativeBox) {
      alternativeBox.classList.remove(
        'is-visible'
      );
    }
  }


  function setRegion(root, region) {
    root.classList.remove(
      'csbsg-region-au-active',
      'csbsg-region-us-active'
    );

    root.classList.add(
      region === 'us'
        ? 'csbsg-region-us-active'
        : 'csbsg-region-au-active'
    );

    renderBands(root);
    renderCups(root);
    renderChart(root);
    resetSelection(root);
  }


  function selectOption(
    root,
    clicked,
    selector
  ) {
    root
      .querySelectorAll(selector)
      .forEach(function (button) {
        button.classList.remove('is-active');
      });

    clicked.classList.add('is-active');

    updateResult(root);
  }


  function handleInteraction(event) {
    const root = event.target.closest(
      ROOT_SELECTOR
    );

    if (!root) {
      return;
    }

    const auButton = event.target.closest(
      '.csbsg-region-au'
    );

    if (auButton && root.contains(auButton)) {
      event.preventDefault();
      setRegion(root, 'au');
      return;
    }

    const usButton = event.target.closest(
      '.csbsg-region-us'
    );

    if (usButton && root.contains(usButton)) {
      event.preventDefault();
      setRegion(root, 'us');
      return;
    }

    const bandButton = event.target.closest(
      '.csbsg-band-option'
    );

    if (
      bandButton &&
      root.contains(bandButton)
    ) {
      event.preventDefault();

      selectOption(
        root,
        bandButton,
        '.csbsg-band-option'
      );

      return;
    }

    const cupButton = event.target.closest(
      '.csbsg-cup-option'
    );

    if (
      cupButton &&
      root.contains(cupButton)
    ) {
      event.preventDefault();

      selectOption(
        root,
        cupButton,
        '.csbsg-cup-option'
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

    const root = event.target.closest(
      ROOT_SELECTOR
    );

    if (!root) {
      return;
    }

    if (
      event.target.matches(
        '.csbsg-region-btn, ' +
        '.csbsg-band-option, ' +
        '.csbsg-cup-option'
      )
    ) {
      event.preventDefault();

      handleInteraction({
        target: event.target,
        preventDefault: function () {}
      });
    }
  }


  function initializeGuide(root) {
    if (
      root.classList.contains(
        'csbsg-initialized'
      )
    ) {
      return;
    }

    root.classList.add(
      'csbsg-initialized'
    );

    if (
      !root.classList.contains(
        'csbsg-region-us-active'
      )
    ) {
      root.classList.add(
        'csbsg-region-au-active'
      );
    }

    renderBands(root);
    renderCups(root);
    renderChart(root);
  }


  function initializeExistingGuides() {
    document
      .querySelectorAll(ROOT_SELECTOR)
      .forEach(initializeGuide);
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


  const observer = new MutationObserver(
    function () {
      initializeExistingGuides();
    }
  );

  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  } else {
    document.addEventListener(
      'DOMContentLoaded',
      function () {
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
      }
    );
  }
})();
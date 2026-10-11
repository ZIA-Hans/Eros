/* SOFNEU PAJAMA SIZE GUIDE — shared class-driven controller */
(function () {
  'use strict';

  const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL'];
  const SIZE_CODES = {
    au: ['6–8', '10', '12', '14', '16', '18'],
    us: ['2–4', '6', '8', '10', '12', '14']
  };

  const COMMON = {
    height: [[152,158],[155,163],[160,168],[163,172],[168,175],[170,178]],
    weight: [[45,55],[50,60],[55,65],[60,72],[68,80],[75,90]]
  };

  const DATA = {
    short: {
      name: 'Short Sleeve & Shorts Set',
      body: {
        bust: [[85,88],[91,93],[96,98],[101,103],[107,109],[112,115]],
        waist: [[61,64],[67,70],[73,76],[79,82],[87,90],[95,98]],
        hip: [[90,92],[95,97],[100,102],[105,107],[112,114],[118,120]]
      },
      garment: [
        ['Front Length', [63,66,68,70,71,72]],
        ['Back Length', [62,65,67,69,70,71]],
        ['Shoulder Width', [40,41.5,43,44.5,46,47.5]],
        ['Shorts Length', [35,36,37,38,39,40]]
      ]
    },
    long: {
      name: 'Long Sleeve & Pants Set',
      body: {
        bust: [[85,89],[90,94],[95,99],[100,104],[105,110],[111,116]],
        waist: [[61,66],[67,72],[73,78],[79,85],[86,93],[94,101]],
        hip: [[89,94],[95,98],[99,102],[103,106],[107,111],[112,116]]
      },
      garment: [
        ['Front Length', [62,65,68,70,71,72]],
        ['Back Length', [61,64,67,69,70,71]],
        ['Shoulder Width', [40,41.5,43,44.5,46,47.5]],
        ['1/2 Chest (lay flat)', [50,52.5,55,57.5,60,62.5]],
        ['1/2 Hem (lay flat)', [51,54,57,60,63,66]],
        ['Sleeve Length', [54,56,58,59,60,61]],
        ['1/2 Cuff (lay flat)', [14.5,15,16,16.5,17,17]],
        ['Pants Length', [94,97,100,102,104,106]],
        ['1/2 Waist (relaxed)', [30,32,34,36,38,40]],
        ['1/2 Hip (lay flat)', [50,52,54,56,58,60]],
        ['1/2 Leg Opening', [25,26,27,28,29,30]],
        ['Front Rise', [28.8,29.4,30,30.6,31.2,31.8]],
        ['Back Rise', [38.4,39.2,40,40.8,41.6,42.4]],
        ['Waistband Width', [3,3,3,3,3,3]]
      ]
    }
  };

  const states = new WeakMap();
  const cmToIn = n => n / 2.54;
  const kgToLb = n => n * 2.2046226218;
  const round1 = n => Math.round(n * 10) / 10;

  function cmToFeetInches(cm) {
    const totalInches = Math.round(cmToIn(cm));
    const feet = Math.floor(totalInches / 12);
    const inches = totalInches % 12;
    return `${feet}′${inches}″`;
  }

  function stateFor(root) {
    if (!states.has(root)) {
      states.set(root, {
        style: root.classList.contains('sg-popup-long') ? 'long' : 'short',
        region: 'au',
        unit: 'metric'
      });
    }
    return states.get(root);
  }

  function buttons(root, selector, active) {
    root.querySelectorAll(selector).forEach(btn => {
      const on = btn.classList.contains(active);
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  function setActive(root, group, activeClass) {
    root.querySelectorAll(group).forEach(btn => {
      const on = btn.classList.contains(activeClass);
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  function formatRange(range, type, unit) {
    let a = range[0], b = range[1];
    if (unit === 'imperial') {
      if (type === 'weight') return `${Math.round(kgToLb(a))}–${Math.round(kgToLb(b))}`;
      if (type === 'height') return `${cmToFeetInches(a)}–${cmToFeetInches(b)}`;
      a = round1(cmToIn(a)); b = round1(cmToIn(b));
    }
    return `${a}–${b}`;
  }

  function renderBodyTable(root) {
    const state = stateFor(root);
    const table = root.querySelector('.sg-body-table');
    if (!table) return;
    const body = DATA[state.style].body;
    const lengthUnit = state.unit === 'metric' ? 'cm' : 'in';
    const weightUnit = state.unit === 'metric' ? 'kg' : 'lb';
    const rows = [
      ['Bust', body.bust, 'length', lengthUnit],
      ['Waist', body.waist, 'length', lengthUnit],
      ['Hip', body.hip, 'length', lengthUnit],
      ['Height', COMMON.height, 'height', state.unit === 'metric' ? 'cm' : 'ft / in'],
      ['Weight', COMMON.weight, 'weight', weightUnit]
    ];
    table.innerHTML = `<thead><tr><th><span class="sg-first-header">Body measurement</span></th>${SIZES.map((s,i) =>
      `<th>${s}<small>${state.region.toUpperCase()} ${SIZE_CODES[state.region][i]}</small></th>`).join('')}</tr></thead>` +
      `<tbody>${rows.map(([name,ranges,type,unit]) => `<tr class="${['Bust','Waist','Hip'].includes(name) ? 'sg-primary-row' : ''}"><th>${name}<small>${unit}</small></th>${ranges.map(r => `<td>${formatRange(r,type,state.unit)}</td>`).join('')}</tr>`).join('')}</tbody>`;
  }

  function renderGarmentTable(root) {
    const state = stateFor(root);
    const table = root.querySelector('.sg-garment-table');
    if (!table) return;
    const unit = state.unit === 'metric' ? 'cm' : 'in';
    const wanted = state.style === 'long'
      ? ['Front Length', 'Back Length', 'Shoulder Width', 'Pants Length']
      : ['Front Length', 'Back Length', 'Shoulder Width', 'Shorts Length'];
    const rows = DATA[state.style].garment.filter(([name]) => wanted.includes(name));
    table.innerHTML = `<thead><tr><th>Garment measurement</th>${SIZES.map(s => `<th>${s}</th>`).join('')}</tr></thead>` +
      `<tbody>${rows.map(([name,values]) => `<tr><th><span class="sg-first-header">${name}</span><small>${unit}</small></th>${values.map(v => `<td>${state.unit === 'metric' ? v : round1(cmToIn(v))}</td>`).join('')}</tr>`).join('')}</tbody>`;
  }

  function renderQuickCards(root) {
    const state = stateFor(root);
    const wrap = root.querySelector('.sg-quick-grid');
    if (!wrap) return;
    const hUnit = state.unit === 'metric' ? 'cm' : 'in';
    const wUnit = state.unit === 'metric' ? 'kg' : 'lb';
    wrap.innerHTML = SIZES.map((size,i) => `<article class="sg-quick-card"><strong>${size}</strong><small>${state.region.toUpperCase()} ${SIZE_CODES[state.region][i]}</small><span>H ${formatRange(COMMON.height[i],state.unit === 'metric' ? 'length' : 'height',state.unit)}${state.unit === 'metric' ? ` ${hUnit}` : ''}</span><span>W ${formatRange(COMMON.weight[i],'weight',state.unit)} ${wUnit}</span></article>`).join('');
  }

  function renderKeyLengths(root) {
    const state = stateFor(root), wrap = root.querySelector('.sg-key-list');
    if (!wrap) return;
    const wanted = state.style === 'long' ? ['Front Length','Sleeve Length','Pants Length'] : ['Front Length','Back Length','Shorts Length'];
    const items = DATA[state.style].garment.filter(([name]) => wanted.includes(name));
    const unit = state.unit === 'metric' ? 'cm' : 'in';
    wrap.innerHTML = items.map(([name,values]) => {
      const min = Math.min(...values), max = Math.max(...values);
      const shown = state.unit === 'metric' ? `${min}–${max}` : `${round1(cmToIn(min))}–${round1(cmToIn(max))}`;
      return `<p><strong>${name}</strong><span>${shown} ${unit}</span></p>`;
    }).join('');
  }

  function render(root) {
    const state = stateFor(root);
    setActive(root, '.sg-style-button', state.style === 'short' ? 'sg-style-short' : 'sg-style-long');
    setActive(root, '.sg-region-button', state.region === 'au' ? 'sg-region-au' : 'sg-region-us');
    setActive(root, '.sg-unit-button', state.unit === 'metric' ? 'sg-unit-metric' : 'sg-unit-imperial');
    root.querySelectorAll('.sg-current-style').forEach(el => el.textContent = DATA[state.style].name);
    root.querySelectorAll('.sg-length-unit').forEach(el => el.textContent = state.unit === 'metric' ? 'cm' : 'in');
    root.querySelectorAll('.sg-weight-unit').forEach(el => el.textContent = state.unit === 'metric' ? 'kg' : 'lb');
    root.querySelectorAll('.sg-garment-measure-image').forEach(image => {
      const isShort = state.style === 'short';
      image.src = isShort ? image.dataset.shortSrc : image.dataset.longSrc;
      image.alt = isShort
        ? 'Short sleeve pajama garment measurement guide'
        : 'Long sleeve pajama garment measurement guide';
    });
    renderBodyTable(root); renderGarmentTable(root); renderQuickCards(root); renderKeyLengths(root);
  }

  function convertInputs(root, oldUnit, newUnit) {
    if (oldUnit === newUnit) return;
    root.querySelectorAll('.sg-measure-input').forEach(input => {
      if (!input.value) return;
      let value = Number(input.value);
      if (!Number.isFinite(value)) return;
      const isWeight = input.classList.contains('sg-input-weight');
      if (oldUnit === 'metric') value = isWeight ? kgToLb(value) : cmToIn(value);
      else value = isWeight ? value / 2.2046226218 : value * 2.54;
      input.value = round1(value);
    });
  }

  function normalizeInput(input, unit) {
    if (!input || input.value.trim() === '') return null;
    const raw = Number(input.value);
    if (!Number.isFinite(raw) || raw <= 0) return NaN;
    const isWeight = input.classList.contains('sg-input-weight');
    if (unit === 'metric') return raw;
    return isWeight ? raw / 2.2046226218 : raw * 2.54;
  }

  function rangeIndex(value, ranges) {
    if (value == null || Number.isNaN(value)) return null;
    for (let i = 0; i < ranges.length; i++) if (value >= ranges[i][0] && value <= ranges[i][1]) return i;
    if (value < ranges[0][0]) return 0;
    if (value > ranges[ranges.length - 1][1]) return ranges.length - 1;
    for (let i = 0; i < ranges.length - 1; i++) {
      if (value > ranges[i][1] && value < ranges[i + 1][0]) {
        const left = value - ranges[i][1], right = ranges[i + 1][0] - value;
        return left <= right ? i : i + 1; // ties intentionally choose smaller size
      }
    }
    return 0;
  }

  function invalidReason(values) {
    const bounds = { bust:[55,150], waist:[45,145], hip:[65,160], height:[130,205], weight:[30,180] };
    for (const key of Object.keys(values)) {
      const value = values[key];
      if (Number.isNaN(value)) return `Please enter a valid ${key} measurement.`;
      if (value != null && (value < bounds[key][0] || value > bounds[key][1])) return `Please check your ${key} measurement.`;
    }
    return '';
  }

  function calculate(root) {
    const state = stateFor(root), body = DATA[state.style].body;
    const get = cls => normalizeInput(root.querySelector(cls), state.unit);
    const values = { bust:get('.sg-input-bust'), waist:get('.sg-input-waist'), hip:get('.sg-input-hip'), height:get('.sg-input-height'), weight:get('.sg-input-weight') };
    const error = root.querySelector('.sg-error');
    const result = root.querySelector('.sg-result');
    const invalid = invalidReason(values);
    if (invalid) { error.textContent = invalid; error.hidden = false; result.hidden = true; return; }
    if (Object.values(values).every(v => v == null)) { error.textContent = 'Please enter at least one measurement.'; error.hidden = false; result.hidden = true; return; }
    error.hidden = true;

    const maxima = {
      bust: body.bust[5][1], waist: body.waist[5][1], hip: body.hip[5][1],
      height: COMMON.height[5][1], weight: COMMON.weight[5][1]
    };
    const excessive =
      (values.bust != null && values.bust > maxima.bust + 5) ||
      (values.waist != null && values.waist > maxima.waist + 7) ||
      (values.hip != null && values.hip > maxima.hip + 5) ||
      (values.height != null && values.height > maxima.height + 5) ||
      (values.weight != null && values.weight > maxima.weight + 8);
    if (excessive) {
      error.textContent = 'Your measurements are outside our current size range. We do not want to recommend a size that may not fit comfortably.';
      error.hidden = false;
      result.hidden = true;
      return;
    }

    const indexes = {
      bust: rangeIndex(values.bust, body.bust), waist: rangeIndex(values.waist, body.waist),
      hip: rangeIndex(values.hip, body.hip), height: rangeIndex(values.height, COMMON.height),
      weight: rangeIndex(values.weight, COMMON.weight)
    };
    const hasPrimary = indexes.bust != null || indexes.hip != null || indexes.waist != null;
    let chosen, title, detail;
    if (hasPrimary) {
      const hard = [indexes.bust, indexes.hip].filter(v => v != null);
      chosen = hard.length ? Math.max(...hard) : indexes.waist;
      if (indexes.waist != null && indexes.waist >= chosen + 2) chosen += 1;
      chosen = Math.min(5, chosen);
      title = 'Recommended Size';
      detail = 'Bust and hip are prioritised so both the top and bottoms remain comfortable.';
      if (indexes.bust != null && indexes.hip != null && Math.abs(indexes.bust - indexes.hip) >= 2) {
        detail += indexes.hip > indexes.bust ? ' The bottoms determine this recommendation; the top will fit more loosely.' : ' The top determines this recommendation; the bottoms will fit more loosely.';
      } else detail += ' This style already has a generous, relaxed fit.';
    } else {
      const quick = [indexes.height, indexes.weight].filter(v => v != null);
      chosen = Math.min(...quick); // overlap/ties bias smaller for oversized fit
      if (indexes.height != null && indexes.weight != null && Math.abs(indexes.height - indexes.weight) >= 2) chosen = indexes.weight;
      title = 'Quick Size Estimate';
      detail = 'Based on height and/or weight. Add bust or hip for a more precise recommendation.';
    }

    const highBust = values.bust != null && values.bust > body.bust[5][1];
    const highHip = values.hip != null && values.hip > body.hip[5][1];
    if (chosen === 5 && (highBust || highHip)) {
      title = 'Closest Available Size';
      detail = '2XL (AU 18 / US 14) is the closest available size. Your measurement is slightly outside the standard range, so fit cannot be guaranteed.';
    }
    root.querySelector('.sg-result-title').textContent = title;
    root.querySelector('.sg-result-size').textContent = SIZES[chosen];
    root.querySelector('.sg-result-code').textContent = `${state.region.toUpperCase()} ${SIZE_CODES[state.region][chosen]}`;
    root.querySelector('.sg-result-detail').textContent = detail;
    result.hidden = false;
    result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function init(root) {
    if (root.classList.contains('sg-is-ready')) return;
    root.classList.add('sg-is-ready');
    stateFor(root); render(root);
  }

  function initAll(scope) {
    if (scope.matches && scope.matches('.sofneu-pajama-guide,.sofneu-pajama-popup')) init(scope);
    scope.querySelectorAll && scope.querySelectorAll('.sofneu-pajama-guide,.sofneu-pajama-popup').forEach(init);
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('.sg-style-button,.sg-region-button,.sg-unit-button,.sg-calculate');
    if (!button) return;
    const root = button.closest('.sofneu-pajama-guide,.sofneu-pajama-popup');
    if (!root) return;
    const state = stateFor(root);
    if (button.classList.contains('sg-calculate')) { calculate(root); return; }
    if (button.classList.contains('sg-style-short')) state.style = 'short';
    if (button.classList.contains('sg-style-long')) state.style = 'long';
    if (button.classList.contains('sg-region-au')) state.region = 'au';
    if (button.classList.contains('sg-region-us')) state.region = 'us';
    if (button.classList.contains('sg-unit-metric') || button.classList.contains('sg-unit-imperial')) {
      const next = button.classList.contains('sg-unit-metric') ? 'metric' : 'imperial';
      convertInputs(root, state.unit, next); state.unit = next;
    }
    const result = root.querySelector('.sg-result'); if (result) result.hidden = true;
    render(root);
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => initAll(document), { once:true });
  else initAll(document);
  document.addEventListener('shopify:section:load', e => initAll(e.target));
  new MutationObserver(records => records.forEach(r => r.addedNodes.forEach(n => { if (n.nodeType === 1) initAll(n); }))).observe(document.documentElement, { childList:true, subtree:true });
})();

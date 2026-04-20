// Real GPT-2 small embedding-table vectors, projected to 2D via PCA.
// Data is precomputed by scripts/precompute_gpt2_data.py.
//
// The in-browser bit:
//   - Renders the scatter on canvas (cheap & crisp).
//   - For analogies, computes a − b + c on the high-dim vectors we shipped,
//     then finds the closest word in the analogy set by cosine similarity.

import data from './data.json';

// Categorical palette tuned for the dark demo surface — 15 distinguishable hues
// at enough saturation/lightness to pop on #0f0d1f.
const CAT_COLORS = {
  royalty:      '#c7bff4',   // pale violet
  people:       '#ffb380',   // warm peach
  country:      '#7a90ff',   // cobalt
  city:         '#5dd6ff',   // sky
  color:        '#8cd39a',   // mint
  animal:       '#e3b96b',   // amber
  fruit:        '#ff8ec5',   // pink
  food:         '#f0a86b',   // tangerine
  body:         '#ff6f91',   // coral
  vehicle:      '#4fd0d4',   // teal
  weather:      '#b8b1d4',   // cool grey
  emotion:      '#f0d68c',   // warm gold
  'verb-motion': '#64e6a0',  // spring
  'verb-think':  '#a59aec',  // violet
  tech:         '#6dd9d0',   // aqua
};

const ANALOGIES = [
  { a: 'king',    b: 'man',    c: 'woman',   expected: 'queen'    },
  { a: 'France',  b: 'Paris',  c: 'Berlin',  expected: 'Germany'  },
  { a: 'Italy',   b: 'Rome',   c: 'Tokyo',   expected: 'Japan'    },
  { a: 'father',  b: 'man',    c: 'woman',   expected: 'mother'   },
  { a: 'uncle',   b: 'man',    c: 'woman',   expected: 'aunt'     },
  { a: 'son',     b: 'boy',    c: 'girl',    expected: 'daughter' },
  { a: 'prince',  b: 'man',    c: 'woman',   expected: 'princess' },
];

const $canvas = document.getElementById('plot');
const $hover  = document.getElementById('hover-card');
const $catChips = document.getElementById('cat-chips');
const $analogyRow = document.getElementById('analogy-row');
const $analogyExplainer = document.getElementById('analogy-explainer');
const $showLabels = document.getElementById('show-labels');
const ctx = $canvas.getContext('2d');

const dpr = window.devicePixelRatio || 1;
function resize() {
  const cssW = $canvas.clientWidth;
  const cssH = $canvas.clientHeight;
  $canvas.width = cssW * dpr;
  $canvas.height = cssH * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  draw();
}
window.addEventListener('resize', resize);

const enabledCats = new Set(Object.keys(CAT_COLORS));
let highlightedWords = new Set();   // result of an analogy
let arrowPoints = null;             // {a, b, c, result} for drawing the parallelogram

const PADDING = 36;
function plotCoords(x, y) {
  const w = $canvas.clientWidth - PADDING * 2;
  const h = $canvas.clientHeight - PADDING * 2;
  return [
    PADDING + ((x + 1) / 2) * w,
    PADDING + ((1 - (y + 1) / 2)) * h,    // flip y
  ];
}

function draw() {
  const w = $canvas.clientWidth;
  const h = $canvas.clientHeight;
  ctx.clearRect(0, 0, w, h);

  // Axes
  ctx.strokeStyle = 'rgba(165, 154, 236, 0.18)';
  ctx.lineWidth = 1;
  const [cx, cy] = plotCoords(0, 0);
  ctx.beginPath();
  ctx.moveTo(PADDING, cy);   ctx.lineTo(w - PADDING, cy);
  ctx.moveTo(cx, PADDING);   ctx.lineTo(cx, h - PADDING);
  ctx.stroke();

  // Caption
  ctx.fillStyle = 'rgba(233, 230, 247, 0.55)';
  ctx.font = `11px 'Geist Variable', 'Geist', sans-serif`;
  const evx = (data.pca_explained_variance[0] * 100).toFixed(1);
  const evy = (data.pca_explained_variance[1] * 100).toFixed(1);
  ctx.fillText(`PC1 (${evx}%)`, w - PADDING - 70, cy - 4);
  ctx.save();
  ctx.translate(cx + 6, PADDING + 56);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(`PC2 (${evy}%)`, 0, 0);
  ctx.restore();

  // Arrow / parallelogram for analogy
  if (arrowPoints) {
    drawArrow(arrowPoints);
  }

  // Points
  const showLabels = $showLabels.checked;
  for (const w of data.words) {
    if (!enabledCats.has(w.category)) continue;
    const [px, py] = plotCoords(w.x, w.y);
    const isAnalogyHighlight = highlightedWords.has(w.word);
    ctx.beginPath();
    ctx.arc(px, py, isAnalogyHighlight ? 6 : 3.5, 0, Math.PI * 2);
    ctx.fillStyle = CAT_COLORS[w.category] || '#888';
    ctx.fill();
    if (isAnalogyHighlight) {
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#f0d68c';
      ctx.stroke();
    }
    if (showLabels) {
      ctx.fillStyle = isAnalogyHighlight ? '#f0d68c' : 'rgba(233, 230, 247, 0.72)';
      ctx.font = isAnalogyHighlight
        ? `600 12px 'Geist Variable', 'Geist', sans-serif`
        : `11px 'Geist Variable', 'Geist', sans-serif`;
      ctx.fillText(w.word, px + 6, py + 3);
    }
  }
}

function drawArrow({a, b, c, result}) {
  const wa = wordLookup(a);
  const wb = wordLookup(b);
  const wcw = wordLookup(c);
  const wr = wordLookup(result);
  if (!wa || !wb || !wcw || !wr) return;

  // Two parallel arrows: b → a, and c → result. They should be roughly parallel
  // if the analogy direction lives cleanly in the embedding space.
  drawArrowSeg(wb, wa, '#a59aec');     // violet-300 (pops on dark)
  drawArrowSeg(wcw, wr, '#7a90ff');    // cobalt-400 (pops on dark)
}

function drawArrowSeg(p1, p2, color) {
  const [x1, y1] = plotCoords(p1.x, p1.y);
  const [x2, y2] = plotCoords(p2.x, p2.y);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.setLineDash([]);
  // Arrowhead
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len > 4) {
    const ux = dx / len, uy = dy / len;
    const ax = x2 - ux * 8, ay = y2 - uy * 8;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(ax + uy * 4, ay - ux * 4);
    ctx.lineTo(ax - uy * 4, ay + ux * 4);
    ctx.closePath();
    ctx.fill();
  }
}

function wordLookup(word) {
  return data.words.find((w) => w.word === word);
}

// ---- hover ----
$canvas.addEventListener('mousemove', (e) => {
  const rect = $canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  let best = null;
  let bestDist = 12;
  for (const w of data.words) {
    if (!enabledCats.has(w.category)) continue;
    const [px, py] = plotCoords(w.x, w.y);
    const d = Math.hypot(px - mx, py - my);
    if (d < bestDist) { bestDist = d; best = w; }
  }
  if (best) {
    $hover.hidden = false;
    $hover.style.left = (e.clientX + 12) + 'px';
    $hover.style.top  = (e.clientY + 12) + 'px';
    const neighbors = nearestInScatter(best, 4);
    $hover.innerHTML = `
      <div class="hov-word">${best.word}</div>
      <div class="hov-cat" style="color: ${CAT_COLORS[best.category]}">${best.category}</div>
      <div class="hov-nbr">nearest in 2D:</div>
      <ol>${neighbors.map((n) => `<li>${n.word} <span class="hov-tag">${n.category}</span></li>`).join('')}</ol>
    `;
  } else {
    $hover.hidden = true;
  }
});
$canvas.addEventListener('mouseleave', () => { $hover.hidden = true; });

function nearestInScatter(target, k) {
  const out = data.words
    .filter((w) => w.word !== target.word && enabledCats.has(w.category))
    .map((w) => ({ ...w, d: Math.hypot(w.x - target.x, w.y - target.y) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, k);
  return out;
}

// ---- analogy buttons ----
function buildAnalogyButtons() {
  for (const an of ANALOGIES) {
    const btn = document.createElement('button');
    btn.className = 'analogy-btn';
    btn.innerHTML = `<b>${an.a}</b><span class="op">−</span><b>${an.b}</b><span class="op">+</span><b>${an.c}</b>`;
    btn.addEventListener('click', () => runAnalogy(an));
    $analogyRow.appendChild(btn);
  }
}

function vecOf(word) { return data.analogy_vectors[word]; }

function cosine(u, v) {
  let dot = 0, nu = 0, nv = 0;
  for (let i = 0; i < u.length; i++) {
    dot += u[i] * v[i];
    nu += u[i] * u[i];
    nv += v[i] * v[i];
  }
  return dot / (Math.sqrt(nu) * Math.sqrt(nv));
}

function vecSub(u, v) { return u.map((x, i) => x - v[i]); }
function vecAdd(u, v) { return u.map((x, i) => x + v[i]); }

function runAnalogy(an) {
  const va = vecOf(an.a), vb = vecOf(an.b), vc = vecOf(an.c);
  if (!va || !vb || !vc) {
    $analogyExplainer.textContent = `Sorry — one of those words isn't in the analogy set.`;
    return;
  }
  const target = vecAdd(vecSub(va, vb), vc);
  // Closest word in the analogy_vectors set, excluding the inputs
  const inputs = new Set([an.a, an.b, an.c]);
  const ranked = Object.entries(data.analogy_vectors)
    .filter(([w]) => !inputs.has(w))
    .map(([w, v]) => ({ word: w, score: cosine(target, v) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  const top = ranked[0];
  highlightedWords = new Set([an.a, an.b, an.c, top.word]);
  arrowPoints = { a: an.a, b: an.b, c: an.c, result: top.word };
  draw();
  const right = top.word === an.expected;
  $analogyExplainer.innerHTML = `
    <div class="analogy-result">
      <code>${an.a} − ${an.b} + ${an.c}</code>
      <span class="arrow">→</span>
      <b style="color: ${right ? '#8cd39a' : '#f0a86b'}">${top.word}</b>
      <span class="analogy-meta">cos ${top.score.toFixed(3)}</span>
      ${right
        ? '<span class="analogy-tag tag-good">expected</span>'
        : `<span class="analogy-tag tag-bad">got ${top.word}, expected ${an.expected}</span>`}
    </div>
    <div class="analogy-runners">
      Runners-up:
      ${ranked.slice(1).map((r) => `<span><code>${r.word}</code> ${r.score.toFixed(3)}</span>`).join('')}
    </div>
    <div class="analogy-hint">
      Arrows drawn on the scatter: <span style="color:var(--loa-violet-700); font-weight:600">${an.b} → ${an.a}</span>
      and <span style="color:var(--loa-cobalt-600); font-weight:600">${an.c} → ${top.word}</span>. If the direction
      is clean, they're roughly parallel.
    </div>
  `;
  // highlight the active analogy button
  document.querySelectorAll('.analogy-btn').forEach((b) => b.classList.remove('active'));
  const idx = ANALOGIES.indexOf(an);
  const activeBtn = $analogyRow.children[idx];
  if (activeBtn) activeBtn.classList.add('active');
}

// ---- category chips ----
function buildCatChips() {
  const cats = new Set(data.words.map((w) => w.category));
  for (const c of cats) {
    const chip = document.createElement('button');
    chip.className = 'cat-chip';
    chip.dataset.cat = c;
    chip.innerHTML = `<span class="dot" style="background:${CAT_COLORS[c]}"></span>${c}`;
    chip.addEventListener('click', () => {
      if (enabledCats.has(c)) enabledCats.delete(c); else enabledCats.add(c);
      chip.classList.toggle('off', !enabledCats.has(c));
      draw();
    });
    $catChips.appendChild(chip);
  }
}

$showLabels.addEventListener('change', draw);

buildCatChips();
buildAnalogyButtons();
resize();

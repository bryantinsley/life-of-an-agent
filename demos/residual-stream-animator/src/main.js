// Residual-stream animator.
// Data is precomputed by scripts/precompute_gpt2_data.py — real GPT-2 small activations.
//
// Two views, side-by-side:
//   1. A grid (rows = blocks, cols = token positions) showing each block's delta norm.
//   2. A "logit lens" panel showing the top-5 next-token predictions at the LAST position,
//      after each stage of the model.

import data from './data.json';

const $exChips    = document.getElementById('ex-chips');
const $gridTokens = document.getElementById('grid-tokens');
const $gridBody   = document.getElementById('grid-body');
const $lensList   = document.getElementById('lens-list');
const $stageNum   = document.getElementById('stage-num');
const $stageTotal = document.getElementById('stage-total');
const $stageName  = document.getElementById('stage-name');
const $btnPrev    = document.getElementById('btn-prev');
const $btnNext    = document.getElementById('btn-next');
const $btnReset   = document.getElementById('btn-reset');
const $btnPlay    = document.getElementById('btn-play');

let currentEx = data.examples[0];
let stage = 0;       // 0 = after embedding (no blocks applied), 1..12 = after block N
let playing = null;
let selectedPos = null;  // null = "last position"

const N_LAYERS = data.n_layers;        // 12
const N_STAGES = N_LAYERS + 1;         // 13: embedding + 12 blocks

function buildExampleChips() {
  for (const ex of data.examples) {
    const chip = document.createElement('button');
    chip.className = 'ex-chip';
    chip.textContent = ex.label;
    chip.dataset.id = ex.id;
    chip.addEventListener('click', () => selectExample(ex));
    $exChips.appendChild(chip);
  }
  refreshChipState();
}

function refreshChipState() {
  for (const chip of $exChips.querySelectorAll('.ex-chip')) {
    chip.classList.toggle('active', chip.dataset.id === currentEx.id);
  }
}

function selectExample(ex) {
  currentEx = ex;
  stage = 0;
  selectedPos = null;
  stopPlay();
  refreshChipState();
  renderGrid();
  renderLens();
}

function maxDelta(ex) {
  let m = 0;
  for (const row of ex.deltas) for (const v of row) if (v > m) m = v;
  return m;
}

function renderGrid() {
  // Header row: token strings
  $gridTokens.innerHTML = '';
  $gridTokens.style.setProperty('--n-cols', String(currentEx.seq_len));
  for (let p = 0; p < currentEx.seq_len; p++) {
    const cell = document.createElement('div');
    cell.className = 'tok-cell';
    if (selectedPos === p || (selectedPos === null && p === currentEx.seq_len - 1)) {
      cell.classList.add('selected');
    }
    cell.textContent = displayToken(currentEx.tokens[p]);
    cell.title = currentEx.tokens[p];
    cell.addEventListener('click', () => {
      selectedPos = (selectedPos === p) ? null : p;
      renderGrid();
      renderLens();   // (logit lens always uses last-pos predictions in our data; selected just changes highlight)
    });
    $gridTokens.appendChild(cell);
  }

  // Body: 12 rows × seq_len columns of bars
  $gridBody.innerHTML = '';
  $gridBody.style.setProperty('--n-cols', String(currentEx.seq_len));
  const m = maxDelta(currentEx);

  for (let L = 0; L < N_LAYERS; L++) {
    const row = document.createElement('div');
    row.className = 'g-row';
    if (L < stage) row.classList.add('applied');
    if (L === stage - 1) row.classList.add('current');

    const lbl = document.createElement('div');
    lbl.className = 'g-row-label';
    lbl.textContent = `block ${L + 1}`;
    row.appendChild(lbl);

    for (let p = 0; p < currentEx.seq_len; p++) {
      const cell = document.createElement('div');
      cell.className = 'g-cell';
      const isSel = (selectedPos === p) || (selectedPos === null && p === currentEx.seq_len - 1);
      if (isSel) cell.classList.add('sel');
      const delta = currentEx.deltas[L][p];
      const norm = delta / m;
      const bar = document.createElement('div');
      bar.className = 'g-bar';
      bar.style.height = `${Math.max(2, norm * 100)}%`;
      bar.style.background = colorFor(L);
      bar.title = `block ${L + 1}, pos ${p} (${currentEx.tokens[p]}): Δ‖ = ${delta.toFixed(2)}`;
      cell.appendChild(bar);
      row.appendChild(cell);
    }
    $gridBody.appendChild(row);
  }
}

function colorFor(L) {
  // Smooth gradient: cool early, warm late. Encodes "depth in network".
  const t = L / (N_LAYERS - 1);
  // mix #58a6ff (blue) → #d2a8ff (lavender) → #f78166 (orange)
  const stops = [
    [0.0, [88,166,255]],
    [0.5, [210,168,255]],
    [1.0, [247,129,102]],
  ];
  let i = 0;
  while (i < stops.length - 1 && t > stops[i + 1][0]) i++;
  const [t0, c0] = stops[i];
  const [t1, c1] = stops[i + 1];
  const u = (t - t0) / (t1 - t0);
  const r = Math.round(c0[0] + (c1[0] - c0[0]) * u);
  const g = Math.round(c0[1] + (c1[1] - c0[1]) * u);
  const b = Math.round(c0[2] + (c1[2] - c0[2]) * u);
  return `rgb(${r}, ${g}, ${b})`;
}

function displayToken(t) {
  return t.replace(/ /g, '␣').replace(/\n/g, '⏎');
}

function renderLens() {
  $stageNum.textContent  = String(stage);
  $stageTotal.textContent = String(N_LAYERS);
  $stageName.textContent  = stage === 0 ? 'embedding (no blocks applied yet)' : `after block ${stage}`;

  const top = currentEx.logit_lens_last_pos[stage];
  $lensList.innerHTML = '';
  const maxLogit = Math.max(...top.map((t) => t.logit));
  const minLogit = Math.min(...top.map((t) => t.logit));
  const span = Math.max(0.01, maxLogit - minLogit);
  for (let i = 0; i < top.length; i++) {
    const t = top[i];
    const row = document.createElement('div');
    row.className = 'lens-item';
    if (i === 0) row.classList.add('top');
    const widthPct = ((t.logit - minLogit) / span) * 100;
    row.innerHTML = `
      <div class="lens-rank">${i + 1}</div>
      <div class="lens-tok">${displayToken(escapeHtml(t.token))}</div>
      <div class="lens-bar"><div class="lens-bar-fill" style="width: ${widthPct}%"></div></div>
      <div class="lens-logit">${t.logit.toFixed(2)}</div>
    `;
    $lensList.appendChild(row);
  }

  $btnPrev.disabled = stage === 0;
  $btnNext.disabled = stage >= N_LAYERS;
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function next()  { if (stage < N_LAYERS) { stage++; renderGrid(); renderLens(); } }
function prev()  { if (stage > 0)         { stage--; renderGrid(); renderLens(); } }
function reset() { stopPlay(); stage = 0; renderGrid(); renderLens(); }

function play() {
  if (playing) { stopPlay(); return; }
  $btnPlay.textContent = '⏸ pause';
  playing = setInterval(() => {
    if (stage >= N_LAYERS) { stopPlay(); return; }
    next();
  }, 700);
}
function stopPlay() {
  if (playing) { clearInterval(playing); playing = null; }
  $btnPlay.textContent = '▶ play';
}

$btnNext.addEventListener('click',  () => { stopPlay(); next();  });
$btnPrev.addEventListener('click',  () => { stopPlay(); prev();  });
$btnReset.addEventListener('click', reset);
$btnPlay.addEventListener('click',  play);
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); stopPlay(); next(); }
  else if (e.key === 'ArrowLeft') { stopPlay(); prev(); }
  else if (e.key === 'r') reset();
});

buildExampleChips();
renderGrid();
renderLens();

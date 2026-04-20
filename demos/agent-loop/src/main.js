import { userMessage, steps, wrapUp } from './scenario.js';

const $loop = document.getElementById('loop');
const $scenarioBody = document.getElementById('scenario-body');
const $btnPrev = document.getElementById('btn-prev');
const $btnNext = document.getElementById('btn-next');
const $btnReset = document.getElementById('btn-reset');
const $btnAuto = document.getElementById('btn-auto');
const $stepCur = document.getElementById('step-cur');
const $stepTotal = document.getElementById('step-total');

let cursor = 0; // number of steps shown (0..steps.length, then steps.length+1 for wrapup)
let autoPlayTimer = null;
const TOTAL = steps.length + 1; // +1 for wrap-up card

$scenarioBody.textContent = userMessage;
$stepTotal.textContent = String(TOTAL);

function render() {
  // Clear and rebuild — simpler than diffing for a 13-step demo.
  $loop.innerHTML = '';

  for (let i = 0; i < cursor && i < steps.length; i++) {
    const s = steps[i];
    const card = document.createElement('div');
    card.className = `step type-${s.type}`;
    if (i === cursor - 1 && cursor <= steps.length) card.classList.add('current');
    card.innerHTML = `
      <div class="step-header">
        <span class="step-num">step ${i + 1}</span>
        <span class="step-type">${s.label}</span>
        <span class="step-explain">${s.explain}</span>
      </div>
      <div class="step-content"></div>
    `;
    card.querySelector('.step-content').textContent = s.content;
    $loop.appendChild(card);
    // Trigger fade-in
    requestAnimationFrame(() => card.classList.add('shown'));
  }

  if (cursor > steps.length) {
    const card = document.createElement('div');
    card.className = 'step type-final current';
    card.innerHTML = `
      <div class="step-header">
        <span class="step-num">wrap-up</span>
        <span class="step-type">what just happened</span>
      </div>
      <div class="step-content" style="white-space: pre-wrap; font-family: var(--sans); font-size: 13px;"></div>
    `;
    card.querySelector('.step-content').textContent = wrapUp;
    $loop.appendChild(card);
    requestAnimationFrame(() => card.classList.add('shown'));
  }

  $stepCur.textContent = String(cursor);
  $btnPrev.disabled = cursor === 0;
  $btnNext.disabled = cursor >= TOTAL;

  // Scroll the newest card into view.
  const last = $loop.lastElementChild;
  if (last) last.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function next() {
  if (cursor < TOTAL) {
    cursor++;
    render();
  }
}
function prev() {
  if (cursor > 0) {
    cursor--;
    render();
  }
}
function reset() {
  stopAutoPlay();
  cursor = 0;
  render();
}

function startAutoPlay() {
  if (autoPlayTimer) return;
  $btnAuto.textContent = '⏸ pause';
  autoPlayTimer = setInterval(() => {
    if (cursor >= TOTAL) {
      stopAutoPlay();
      return;
    }
    next();
  }, 2200);
}
function stopAutoPlay() {
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer);
    autoPlayTimer = null;
  }
  $btnAuto.textContent = 'auto-play';
}

$btnNext.addEventListener('click', () => {
  stopAutoPlay();
  next();
});
$btnPrev.addEventListener('click', () => {
  stopAutoPlay();
  prev();
});
$btnReset.addEventListener('click', reset);
$btnAuto.addEventListener('click', () => {
  if (autoPlayTimer) stopAutoPlay();
  else startAutoPlay();
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === ' ') {
    e.preventDefault();
    stopAutoPlay();
    next();
  } else if (e.key === 'ArrowLeft') {
    stopAutoPlay();
    prev();
  } else if (e.key === 'r') {
    reset();
  }
});

render();

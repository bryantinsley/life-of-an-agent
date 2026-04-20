import { encode, decode } from 'gpt-tokenizer';

const $input = document.getElementById('input');
const $tokens = document.getElementById('tokens');
const $statChars = document.getElementById('stat-chars');
const $statBytes = document.getElementById('stat-bytes');
const $statTokens = document.getElementById('stat-tokens');
const $statRatio = document.getElementById('stat-ratio');
const $statCost = document.getElementById('stat-cost');
const $samplesRow = document.getElementById('samples-row');

// Distinct, accessible-on-dark colors. Cycles through tokens in order.
const TOKEN_COLORS = [
  'rgba(88,166,255,0.22)',   // blue
  'rgba(247,129,102,0.22)',  // orange
  'rgba(86,211,100,0.22)',   // green
  'rgba(210,168,255,0.22)',  // purple
  'rgba(241,196,15,0.22)',   // yellow
  'rgba(255,121,198,0.22)',  // pink
  'rgba(72,187,184,0.22)',   // teal
];

const SAMPLES = [
  { label: 'plain English', text: 'The quick brown fox jumps over the lazy dog.' },
  { label: 'leading-space gotcha', text: 'the The  the\nthe' },
  { label: 'a name', text: 'Bryan Tinsley' },
  { label: 'an unusual name', text: 'Bryndís Þórhallsdóttir' },
  { label: 'emoji', text: '🚀 ✨ 🦀 👨‍👩‍👧‍👦 🇬🇧' },
  { label: 'code', text: `def fibonacci(n: int) -> int:\n    if n < 2: return n\n    return fibonacci(n - 1) + fibonacci(n - 2)` },
  { label: 'Mandarin', text: '人工智能正在改变世界。' },
  { label: 'Hindi', text: 'मॉडल टोकन में बात करता है, शब्दों में नहीं।' },
  { label: 'made-up word', text: 'antidisestablishmentarianism flibbergibbet xyzzy' },
  { label: 'JSON', text: `{"id": 42, "name": "Sarah", "tags": ["sre", "ml"]}` },
  { label: 'numbers', text: '1234567890 3.14159 1,234,567.89 2026-04-20' },
];

function tokenize(text) {
  if (!text) return [];
  const ids = encode(text);
  return ids.map((id) => ({ id, text: decode([id]) }));
}

function classifyToken(text) {
  // Visual treatment for invisibles. The text is preserved; we just tag it.
  if (text === '\n') return 'newline';
  if (/^\s+$/.test(text)) return 'whitespace';
  return null;
}

function fmtBytes(text) {
  return new TextEncoder().encode(text).length;
}

function render() {
  const text = $input.value;
  const tokens = tokenize(text);
  const charCount = [...text].length; // grapheme-aware-ish (counts code points, not UTF-16 units)
  const byteCount = fmtBytes(text);
  const tokenCount = tokens.length;
  const ratio = tokenCount > 0 ? (charCount / tokenCount).toFixed(2) : '—';
  // $5 / 1M tokens — chosen as a representative, not authoritative
  const cost = (tokenCount * 5) / 1_000_000;

  $statChars.textContent = charCount.toLocaleString();
  $statBytes.textContent = byteCount.toLocaleString();
  $statTokens.textContent = tokenCount.toLocaleString();
  $statRatio.textContent = ratio;
  $statCost.textContent = `$${cost.toFixed(6)}`;

  $tokens.innerHTML = '';
  if (tokens.length === 0) {
    $tokens.innerHTML = '<span style="color: var(--loa-demo-fg-dim);">paste or type something above…</span>';
    return;
  }
  tokens.forEach((t, i) => {
    const span = document.createElement('span');
    span.className = 'token';
    span.style.background = TOKEN_COLORS[i % TOKEN_COLORS.length];
    const cls = classifyToken(t.text);
    if (cls) span.classList.add(cls);
    // Preserve whitespace and newlines in the rendered output
    if (t.text === '\n') {
      span.textContent = '↵';
      const br = document.createElement('br');
      const tip = document.createElement('span');
      tip.className = 'token-id';
      tip.textContent = `id ${t.id}  ·  "\\n"`;
      span.appendChild(tip);
      $tokens.appendChild(span);
      $tokens.appendChild(br);
      return;
    }
    span.textContent = t.text;
    const tip = document.createElement('span');
    tip.className = 'token-id';
    tip.textContent = `id ${t.id}  ·  ${JSON.stringify(t.text)}`;
    span.appendChild(tip);
    $tokens.appendChild(span);
  });
}

SAMPLES.forEach((s) => {
  const btn = document.createElement('button');
  btn.className = 'loa-demo-chip';
  btn.textContent = s.label;
  btn.addEventListener('click', () => {
    $input.value = s.text;
    render();
  });
  $samplesRow.appendChild(btn);
});

$input.addEventListener('input', render);

// Default starter text
$input.value = 'Tokens are not words. The model never sees text — it sees integers like 464 (" The") and 21831 (" fox").';
render();

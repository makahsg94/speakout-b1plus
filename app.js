'use strict';

/* Speakout B1+ Course Companion — hash-routed SPA.
   Design tokens/classes come from reference.css; ALL learning content is
   built from the local Speakout 3rd edition B1+ PDFs (summarised in data/). */

const SITE_TITLE = 'Speakout B1+ · Course Companion';

/* SVG icon set replicated from the reference site's Icons.tsx (design only). */
const ICON_PATHS = {
  home: ['M3 10.5 12 3l9 7.5', 'M5 9.5V21h14V9.5', 'M9.5 21v-6h5v6'],
  book: ['M4 19.5A2.5 2.5 0 0 1 6.5 17H20', 'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z'],
  search: ['M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z', 'm21 21-4.3-4.3'],
  sun: ['M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z', 'M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4'],
  moon: ['M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z'],
  list: ['M4 6h16M4 12h16M4 18h16'],
  close: ['M18 6 6 18M6 6l12 12'],
  check: ['M20 6 9 17l-5-5'],
  layers: ['m12 2 9 5-9 5-9-5 9-5Z', 'm3 12 9 5 9-5', 'm3 17 9 5 9-5'],
  mic: ['M12 15a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v7a3 3 0 0 0 3 3Z', 'M19 11a7 7 0 0 1-14 0', 'M12 18v3'],
  share: ['M12 16V3', 'm7 8 5-5 5 5', 'M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5'],
  flame: ['M12 22a7 7 0 0 0 7-7c0-4-3-6-4-9-2 2-3 3-4 3-1-2-1-4-1-6-3 3-5 6-5 12a7 7 0 0 0 7 7Z'],
  volume: ['M4 9v6h4l5 4V5L8 9H4Z', 'M16.5 8.5a5 5 0 0 1 0 7', 'M19 6a8.5 8.5 0 0 1 0 12'],
  volumeOff: ['M4 9v6h4l5 4V5L8 9H4Z', 'm17 9 5 6m0-6-5 6'],
  chevronRight: ['m9 18 6-6-6-6'],
  chevronLeft: ['m15 18-6-6 6-6'],
  spark: ['M12 3v4m0 10v4m9-9h-4M7 12H3m13.5-5.5-2.8 2.8m-3.4 3.4-2.8 2.8m8.6-8.6 2.8-2.8M7.3 16.7 4.5 19.5'],
  play: ['m8 5 11 7-11 7V5Z'],
  pause: ['M8 5v14M16 5v14'],
  rewind: ['M11 6 5 12l6 6', 'M19 6l-6 6 6 6'],
  forward: ['m13 6 6 6-6 6', 'M5 6l6 6-6 6'],
  shield: ['M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Z', 'm9 12 2 2 4-4'],
  target: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z', 'M12 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z']
};
function icon(name, size = 16, cls = '') {
  const paths = ICON_PATHS[name] || ICON_PATHS.spark;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="${cls}">${paths.map(d => `<path d="${d}"/>`).join('')}</svg>`;
}

const UNIT_TITLES = {
  1: ['me & mine', 'أنا وأشيائي'], 2: ['behaviour', 'السلوك'], 3: ['working life', 'الحياة العملية'],
  4: ['fact or fiction?', 'حقيقة أم خيال؟'], 5: ['consumer', 'المستهلك'], 6: ['places', 'الأماكن'],
  7: ['connect', 'التواصل'], 8: ['wisdom', 'الحكمة']
};

const state = {
  media: null, units: {}, theme: 'dark', sound: true, user: null,
  progress: { lessons: {}, quizzes: {}, writing: {}, lastUnit: 0, lastLesson: '' },
  transcripts: '', shadowUnit: 1, shadowFile: '', audioStarted: false, audioRate: 1
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const enc = (f) => './media/' + String(f || '').replace(/^\/+/, '').split('/').map(s => encodeURIComponent(s)).join('/');

function lsGet(k, d) { try { const v = localStorage.getItem('meb_' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
function lsSet(k, v) { try { localStorage.setItem('meb_' + k, JSON.stringify(v)); } catch (e) { /* storage full/blocked */ } }

/* ---------------- vocabulary speech (US / GB) ---------------- */
const SPEECH_KEY = 'meb-speech-accent-v1';
const ACCENTS = [
  { id: 'en-GB', label: 'بريطاني' },
  { id: 'en-US', label: 'أمريكي' },
];

function speechAccent() {
  try { const v = localStorage.getItem(SPEECH_KEY); return v === 'en-US' ? 'en-US' : 'en-GB'; }
  catch (e) { return 'en-GB'; }
}

function setSpeechAccent(lang) {
  try { localStorage.setItem(SPEECH_KEY, lang === 'en-US' ? 'en-US' : 'en-GB'); } catch (e) { /* storage blocked */ }
}

function sayWord(word, lang) {
  if (!('speechSynthesis' in window) || !word || !String(word).trim()) return;
  try {
    const synth = window.speechSynthesis;
    synth.cancel();
    const parts = String(word).split('/').map(s => s.trim()).filter(Boolean);
    const texts = parts.length ? parts : [String(word).trim()];
    const speakAt = (i) => {
      if (i >= texts.length) return;
      const u = new SpeechSynthesisUtterance(texts[i]);
      u.lang = lang === 'en-US' ? 'en-US' : 'en-GB';
      u.rate = 0.9;
      const voices = synth.getVoices ? synth.getVoices() : [];
      const voice = voices.find(v => v.lang.toLowerCase().startsWith(u.lang.toLowerCase())) || voices.find(v => v.lang.toLowerCase().startsWith('en'));
      if (voice) u.voice = voice;
      const next = () => { if (i + 1 < texts.length) setTimeout(() => speakAt(i + 1), 200); };
      u.onend = next; u.onerror = next;
      synth.speak(u);
    };
    speakAt(0);
  } catch (e) { /* speech unavailable */ }
}

function accentChips() {
  const cur = speechAccent();
  return `<span class="meb-speech-controls" role="group" aria-label="نطق الكلمات">${ACCENTS.map(a => `<button type="button" class="meb-accent-chip ${cur === a.id ? 'on' : ''}" data-action="set-accent" data-lang="${a.id}" aria-pressed="${cur === a.id}">${a.label}</button>`).join('')}</span>`;
}

function sayButton(word) {
  const safe = esc(word);
  return `<button type="button" class="meb-say-btn" data-action="say-word" data-word="${safe}" data-lang="${speechAccent()}" aria-label="اسمع ${safe}" title="اسمع ${safe}">${icon('volume', 14)}</button>`;
}

function beep() {
  if (!state.sound) return;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC(), osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.type = 'sine'; osc.frequency.value = 520; gain.gain.setValueAtTime(.035, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + .08);
    osc.connect(gain).connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + .09);
    osc.onended = () => ctx.close();
  } catch (e) { /* audio not available */ }
}

function toast(msg) {
  let t = $('#meb-toast');
  if (!t) { t = document.createElement('div'); t.id = 'meb-toast'; t.style.cssText = 'position:fixed;bottom:1.2rem;left:50%;transform:translateX(-50%);z-index:100;background:var(--color-brand-600);color:#fff;padding:.6rem 1rem;border-radius:.6rem;font-size:.85rem;box-shadow:0 10px 30px #0006;transition:opacity .3s'; document.body.appendChild(t); }
  t.textContent = msg; t.style.opacity = '1';
  clearTimeout(t._timer); t._timer = setTimeout(() => { t.style.opacity = '0'; }, 2200);
}

/* ---------------- data ---------------- */
async function loadData() {
  const mediaRes = await fetch('./data/media.json');
  state.media = await mediaRes.json();
  const results = await Promise.allSettled(
    Array.from({ length: 8 }, (_, i) => fetch(`./data/unit${i + 1}.json`).then(r => { if (!r.ok) throw new Error(String(r.status)); return r.json(); }))
  );
  results.forEach((r, i) => { if (r.status === 'fulfilled') state.units[i + 1] = r.value; });
  try { state.transcripts = await (await fetch('./data/videoscripts.txt')).text(); } catch (e) { state.transcripts = ''; }
}

/* ---------------- routing ---------------- */
function route() {
  const raw = location.hash.replace(/^#/, '') || '/';
  const [path, query = ''] = raw.split('?');
  const p = path.split('/').filter(Boolean);
  if (!p.length) return { name: 'home' };
  if (p[0] === 'book') return { name: 'book' };
  if (p[0] === 'unit') {
    if (p[1] === 'lead-in') return { name: 'leadin' };
    const n = Number(String(p[1] || '').replace('unit-', ''));
    if (p[2] === 'quiz') return { name: 'unitquiz', unit: n };
    if (p[2] === 'writing') return { name: 'writing', unit: n };
    if (p[2] === 'lesson') {
      const key = (p[3] || '').toLowerCase();
      if (/^\d+r$/.test(key)) return { name: 'review', unit: n };
      return { name: 'lesson', unit: n, lesson: key };
    }
    return { name: 'unit', unit: n };
  }
  if (p[0] === 'bank') return { name: 'bank', bank: p[1] || 'grammar' };
  if (p[0] === 'review') return { name: 'review' };
  if (p[0] === 'shadowing') return { name: 'shadowing' };
  if (p[0] === 'account') return { name: 'account' };
  if (p[0] === 'search') return { name: 'search', q: new URLSearchParams(query).get('q') || '' };
  if (p[0] === 'page') return { name: 'page', pdf: decodeURIComponent(p.slice(1).join('/')) };
  return { name: 'home' };
}

function unitData(n) { return state.units[n] || { unit: n, title: UNIT_TITLES[n]?.[0] || `Unit ${n}`, titleAr: UNIT_TITLES[n]?.[1] || '', lessons: [], review: { quiz: [], tasks: [] } }; }
function allLessons() { return Array.from({ length: 8 }, (_, i) => unitData(i + 1)).flatMap(u => (u.lessons || []).map(l => ({ u, l }))); }
function findLesson(key) { return allLessons().find(x => x.l.id === key) || null; }

/* Progress figures used by the home page (mirrors the reference progress card). */
function progressStats() {
  const lessons = allLessons();
  const done = lessons.filter(x => state.progress.lessons[x.l.id]?.done).length;
  const quizzes = Object.values(state.progress.quizzes || {});
  const xp = done * 10 + quizzes.reduce((a, q) => a + (q.score || 0) * 2, 0);
  const level = Math.floor(xp / 80) + 1;
  const days = new Set(Object.values(state.progress.lessons || {}).filter(x => x.done && x.at).map(x => new Date(x.at).toDateString()));
  const cursor = new Date();
  if (!days.has(cursor.toDateString())) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(cursor.toDateString())) { streak++; cursor.setDate(cursor.getDate() - 1); }
  return { done, total: lessons.length, pct: Math.round(done / Math.max(1, lessons.length) * 100), xp, level, levelPct: Math.round((xp % 80) / 80 * 100), streak, quizzes: quizzes.length };
}
function pdfList() { return (state.media?.pdfs || []).map(p => ({ ...p, href: '#/page/' + encodeURIComponent(p.siteFile || p.file) })); }

/* Reference-style achievement set (labels/emoji from the design source; progress from local data). */
function achievementList() {
  const s = progressStats();
  const quizzes = Object.values(state.progress.quizzes || {});
  const writes = Object.values(state.progress.writing || {});
  const perfect = quizzes.some(q => q.total > 0 && q.pct === 100);
  const starWrite = writes.some(w => w.grade === 'A' && w.score >= 85);
  const flags = {
    'first-lesson': s.done >= 1,
    'five-lessons': s.done >= 5,
    'ten-lessons': s.done >= 10,
    'all-course': s.total > 0 && s.done >= s.total,
    'first-quiz': quizzes.length >= 1,
    'perfect-quiz': perfect,
    'first-write': writes.length >= 1,
    'star-writer': starWrite,
    'day-streak': s.streak >= 3,
    'week-streak': s.streak >= 7
  };
  return [
    ['first-lesson', 'First steps', 'Complete your first lesson', '🎯'],
    ['five-lessons', 'Reader', 'Complete 5 lessons', '📚'],
    ['ten-lessons', 'Bookworm', 'Complete 10 lessons', '🧠'],
    ['all-course', 'Full journey', 'Complete every lesson in the course', '🏁'],
    ['first-quiz', 'Quizzer', 'Finish your first unit quiz', '🎮'],
    ['perfect-quiz', 'Perfect score', 'Get 100% on a quiz', '💯'],
    ['first-write', 'Writer', 'Check your first piece of writing', '✍️'],
    ['star-writer', 'Star writer', 'Get grade A on a writing task', '⭐'],
    ['day-streak', 'On fire', 'Study 3 days in a row', '🔥'],
    ['week-streak', 'Unstoppable', 'Study 7 days in a row', '🚀']
  ].map(a => ({ id: a[0], title: a[1], desc: a[2], emoji: a[3], earned: !!flags[a[0]] }));
}

function firstPage(pages) { return String(pages || '–').split(/[–-]/)[0].trim(); }
function lessonStatus(l) {
  if (state.progress.lessons[l.id]?.done) return 'done';
  if (state.progress.lessons[l.id]?.lastVisit) return 'started';
  return 'todo';
}

/* SVG journey map from the reference layout. */
function lineMap() {
  const units = Array.from({ length: 8 }, (_, i) => unitData(i + 1));
  const W = 1200, H = 380, X0 = 96, SPAN = W - X0 * 2;
  const pts = units.map((_, i) => ({ x: X0 + i * SPAN / Math.max(1, units.length - 1), y: H / 2 + Math.sin((i / Math.max(1, units.length - 1)) * Math.PI * 1.7) * 96 }));
  const path = (to) => {
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i <= Math.min(to, pts.length - 1); i++) {
      const p0 = pts[i - 1], p1 = pts[i];
      d += ` q ${(p1.x - p0.x) / 2} 0, ${p1.x - p0.x} ${p1.y - p0.y}`;
    }
    return d;
  };
  const findIndex = units.findIndex(u => u.unit === Number(state.progress.lastUnit));
  const currentIndex = findIndex >= 0 ? findIndex : 0;
  const carried = path(currentIndex), full = path(units.length - 1);
  const frac = Math.max(0, Math.min(1, currentIndex / Math.max(1, units.length - 1)));
  const stations = units.map((u, i) => {
    const p = pts[i];
    const done = (u.lessons || []).length > 0 && u.lessons.every(l => state.progress.lessons[l.id]?.done);
    const current = i === currentIndex;
    const fill = done ? 'var(--color-brand-600)' : current ? 'var(--color-accent-500)' : 'var(--surface)';
    const stroke = done || current ? 'none' : 'var(--line-strong)';
    const numFill = done || current ? '#fff' : 'var(--ink-faint)';
    const above = p.y > H * 0.62;
    const labelY = above ? p.y - 40 : p.y + 46;
    const check = done ? `<path d="M0 0l3.5 3.5L9-2" transform="translate(${p.x - (current ? 9 : 7)} ${p.y - (current ? 3 : 2)}) scale(${current ? 1.25 : 1})" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>` : '';
    return `<g class="station-dot${done ? ' reached' : ''}" data-action="go-unit" data-unit="${u.unit}" role="link" tabindex="0" aria-label="Unit ${u.unit}">
      ${current ? `<circle cx="${p.x}" cy="${p.y}" r="22" class="station-pulse" fill="var(--color-accent-500)"/>` : ''}
      <circle class="dot" cx="${p.x}" cy="${p.y}" r="${current ? 22 : 16}" fill="${fill}" stroke="${stroke}" stroke-width="2.5"/>
      ${done ? `<circle class="dot-ring" cx="${p.x}" cy="${p.y}" r="${current ? 28 : 21}"/>` : ''}
      ${check || `<text class="num" x="${p.x}" y="${p.y + 6}" text-anchor="middle" font-size="${current ? 17 : 14}" fill="${numFill}">${u.unit}</text>`}
      <text class="label" x="${p.x}" y="${labelY}" text-anchor="middle" font-size="13" font-weight="${current ? 700 : 500}">Unit ${u.unit}</text>
    </g>`;
  }).join('');
  return `<div class="line-card overflow-hidden px-4 pb-3 pt-6 sm:px-6">
    <svg viewBox="0 0 ${W} ${H}" class="h-auto w-full" role="img" aria-label="The Speakout line: ${units.length} stations">
      <path d="${full}" class="line-track"/>
      <path d="${full}" class="line-track-dash"/>
      ${currentIndex > 0 ? `<path d="${carried}" class="line-traveled"/>` : ''}
      ${stations}
      ${currentIndex > 0 ? `<g class="train-body train-glow"><animateMotion dur="2.6s" repeatCount="1" fill="freeze" keyPoints="0;${frac}" keyTimes="0;1" calcMode="linear" path="${carried}"/><rect class="tm" x="-26" y="-15" width="48" height="30" rx="7"/><path class="tnose" d="M26-12 36 0 26 12Z"/><rect class="twin" x="-18" y="-10" width="10" height="9" rx="2"/><rect class="twin" x="-4" y="-10" width="10" height="9" rx="2"/><rect class="twin" x="10" y="-10" width="10" height="9" rx="2"/></g>` : ''}
    </svg>
    <div class="meb-line-caption"><span>Single track · ${units.length} stations · board at ‘Unit ${units[currentIndex].unit}’</span><span>End of the line: reference banks</span></div>
  </div>`;
}

/* Cover deck from the reference book page, using local unit titles rather than copied page images. */
function coverStack() {
  const units = Array.from({ length: 8 }, (_, i) => unitData(i + 1));
  const mid = (units.length - 1) / 2;
  return `<div class="meb-stack-wrap fade-up"><div class="stack-deck meb-stack-deck">
    ${units.map((u, k) => {
      const gap = k - mid;
      const stacked = `translateY(${k * 6}px)`;
      const fanned = `translateX(${gap * 52}px) translateY(${-Math.abs(gap) * 3}px) rotateY(${gap * 9}deg)`;
      const done = (u.lessons || []).length > 0 && u.lessons.every(l => state.progress.lessons[l.id]?.done);
      return `<div class="stack-card meb-stack-card" style="--t:${stacked};--f:${fanned};z-index:${units.length - k}">
        <a class="meb-stack-cover" href="#/unit/unit-${u.unit}" aria-label="Open Unit ${u.unit}">
          <span class="meb-stack-top"><b>${u.unit}</b><small>B1+ · UNIT</small>${done ? `<span class="meb-stack-check">${icon('check', 11)}</span>` : ''}</span>
          <span class="stack-caption meb-stack-caption"><span><small>Unit ${u.unit}</small><strong>${esc(u.title || '')}</strong></span>${icon('chevronRight', 13)}</span>
        </a>
      </div>`;
    }).join('')}
  </div><p class="meb-stack-hint">Hover the stack to fan the covers open · click any cover to open the unit</p></div>`;
}

function formatTime(sec) {
  const n = Math.max(0, Math.floor(Number(sec) || 0));
  return `${Math.floor(n / 60)}:${String(n % 60).padStart(2, '0')}`;
}

function miniPlayer() {
  return `<div id="meb-mini" class="meb-mini" hidden>
    <button type="button" id="meb-mini-toggle" data-action="mini-toggle" aria-label="Play" class="meb-mini-play">${icon('play', 16)}</button>
    <span id="meb-mini-eq" class="eq text-accent-500" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
    <span class="meb-mini-copy"><strong id="meb-mini-label">Audio</strong><small id="meb-mini-file"></small></span>
    <button type="button" data-action="mini-rate" class="meb-mini-rate" id="meb-mini-rate" title="Playback speed">1×</button>
    <button type="button" data-action="mini-seek" data-step="-10" class="meb-mini-step" title="Back 10 seconds">${icon('rewind', 16)}<small>10</small></button>
    <span id="meb-mini-time" class="meb-mini-time">0:00</span>
    <input id="meb-mini-range" type="range" min="0" max="1" step="1" value="0" aria-label="Seek" data-action="mini-seek-range" />
    <span id="meb-mini-duration" class="meb-mini-time">0:00</span>
    <button type="button" data-action="mini-seek" data-step="10" class="meb-mini-step" title="Forward 10 seconds">${icon('forward', 16)}<small>10</small></button>
    <button type="button" data-action="mini-stop" aria-label="Stop" class="meb-mini-stop">${icon('close', 14)}</button>
  </div>`;
}

function backToTop() {
  return `<button type="button" id="meb-back-top" class="meb-back-top" data-action="back-top" aria-label="Back to top">${icon('chevronRight', 18)}</button>`;
}

function syncMiniPlayer() {
  const a = $('#meb-audio'), m = $('#meb-mini');
  if (!a || !m) return;
  const src = a.currentSrc || a.src || '';
  const active = state.audioStarted && !!src;
  m.hidden = !active;
  const label = $('#meb-mini-label'), file = $('#meb-mini-file');
  if (label) label.textContent = state.audioLabel || 'Audio';
  if (file) file.textContent = decodeURIComponent(String(src).split('/').pop() || '');
  if (!active) return;
  const dur = Number.isFinite(a.duration) ? a.duration : 0;
  const time = $('#meb-mini-time'), duration = $('#meb-mini-duration'), range = $('#meb-mini-range');
  if (time) time.textContent = formatTime(a.currentTime);
  if (duration) duration.textContent = formatTime(dur);
  if (range) { range.max = String(Math.max(1, dur)); range.value = String(Math.min(a.currentTime, Math.max(1, dur))); }
  const toggle = $('#meb-mini-toggle');
  if (toggle) { toggle.innerHTML = a.paused ? icon('play', 16) : icon('pause', 16); toggle.setAttribute('aria-label', a.paused ? 'Play' : 'Pause'); }
  const eq = $('#meb-mini-eq'); if (eq) eq.classList.toggle('eq-on', !a.paused);
  const rate = $('#meb-mini-rate'); if (rate) rate.textContent = state.audioRate + '×';
}

/* ---------------- layout ---------------- */
function header() {
  const themeIcon = state.theme === 'dark' ? icon('sun', 17) : state.theme === 'reading' ? icon('book', 17) : icon('moon', 17);
  return `<header class="meb-header">
    <div class="meb-header-inner">
      <button class="meb-contents-btn" data-action="drawer" aria-label="Open contents">${icon('list', 16)} <span class="hidden sm:inline">Contents</span></button>
      <a class="meb-brand" href="#/"><span class="font-display text-sm font-bold uppercase tracking-[0.22em]">Speakout</span><span class="hidden text-[10px] tracking-widest md:inline">the line · B1+ · 3rd edition</span></a>
      <div class="meb-header-actions">
        <div class="hidden w-48 lg:block"><input class="meb-search-inline" data-action="header-search" placeholder="Search…" aria-label="Search" /></div>
        <a href="#/account" class="meb-account-btn ${state.user ? 'signed' : ''}" aria-label="Account">
          ${state.user ? `<span class="meb-avatar">${esc(state.user.name.slice(0, 1).toUpperCase())}</span><span class="hidden max-w-28 truncate sm:inline">${esc(state.user.name)}</span>` : `<span class="px-1.5">إنشاء حساب / دخول</span>`}
        </a>
        <button class="meb-icon-btn ${state.sound ? '' : 'off'}" data-action="sound" aria-label="Sound effects ${state.sound ? 'on' : 'off'}. Toggle sound" aria-pressed="${state.sound}">${state.sound ? icon('volume', 17) : icon('volumeOff', 17)}</button>
        <button class="meb-icon-btn" data-action="theme" aria-label="Switch theme. Current theme: ${state.theme}">${themeIcon}</button>
      </div>
    </div>
  </header>`;
}

function drawer() {
  const units = Array.from({ length: 8 }, (_, i) => unitData(i + 1));
  const s = progressStats();
  return `<div class="meb-drawer-backdrop" data-action="drawer-close"></div>
  <div class="meb-drawer-overlay" role="dialog" aria-modal="true" aria-label="Contents">
    <aside class="meb-drawer" aria-label="Contents">
      <div class="meb-drawer-head"><span class="meb-drawer-kicker">Contents</span><button class="meb-icon-btn" data-action="drawer-close" aria-label="Close contents">${icon('close', 16)}</button></div>
      <div class="meb-drawer-scroll scrollbar-thin">
        <p class="meb-drawer-kicker meb-drawer-lead">Contents of the book</p>
        <div class="meb-drawer-progress">
          <div class="meb-progress-top"><span class="meb-pill">Book progress</span><strong>${s.pct}%</strong></div>
          <div class="meb-bar-track"><div class="meb-bar-fill" style="width:${s.pct}%"></div></div>
          <p>${s.done} of ${s.total} lessons</p>
        </div>
        <a class="meb-drawer-link meb-drawer-account" href="#/account" data-action="drawer-close">
          <span>${icon('layers', 13)} <strong dir="rtl" lang="ar">${state.user ? `حساب ${esc(state.user.name)}` : 'أنشئ حسابك / دخول'}</strong></span>
          <small dir="rtl" lang="ar">سجّل تقدّمك وقابله على أي جهاز</small>
        </a>
        <div class="meb-drawer-heading">${icon('book', 13)} <span>This course</span><span class="toc-dots"></span><span class="toc-page">book map</span></div>
        <a class="meb-drawer-link" href="#/book" data-action="drawer-close">Open the full contents of this course, unit by unit.</a>
        <a class="meb-drawer-link meb-drawer-warm" href="#/review" data-action="drawer-close"><strong dir="rtl" lang="ar">المراجعة الشاملة</strong><small>Vocab tables · grammar · 25-question quiz</small></a>
        <a class="meb-drawer-link meb-drawer-accent" href="#/shadowing" data-action="drawer-close"><span>${icon('mic', 13)} <strong dir="rtl" lang="ar">استوديو الشادونج</strong></span><small>Listen · loop · repeat</small></a>
        ${units.map(u => `<div class="meb-drawer-unit">
          <a class="meb-drawer-unit-title" href="#/unit/unit-${u.unit}" data-action="drawer-close"><strong>${u.unit}</strong><span>Unit ${u.unit} — ${esc(u.title || '')}</span><span class="toc-dots"></span><span class="toc-page">${firstPage(u.pages)}</span></a>
          <div class="meb-drawer-unit-body">
            ${(u.lessons || []).map(l => {
              const st = lessonStatus(l);
              return `<a class="meb-drawer-link meb-toc-link" href="#/unit/unit-${u.unit}/lesson/${esc(l.id)}" data-action="drawer-close"><span class="meb-status">${st === 'done' ? icon('check', 10) : st === 'started' ? '●' : '○'}</span><span>${esc(l.code || l.id)} ${esc(l.title || '')}</span><span class="toc-dots"></span><span class="toc-page">${firstPage(l.pages)}</span></a>`;
            }).join('')}
            <a class="meb-drawer-link meb-toc-link meb-drawer-warm" href="#/unit/unit-${u.unit}/writing" data-action="drawer-close">${icon('layers', 11)} <span>Writing task</span><span class="toc-dots"></span><span class="toc-page">94</span></a>
            <a class="meb-drawer-link meb-toc-link" href="#/unit/unit-${u.unit}/quiz" data-action="drawer-close">${icon('target', 11)} <span>Unit ${u.unit} quiz</span><span class="toc-dots"></span><span class="toc-page">end</span></a>
          </div>
        </div>`).join('')}
        <div class="meb-drawer-unit">
          <div class="meb-drawer-unit-title"><strong>A</strong><span>Reference banks</span><span class="toc-dots"></span><span class="toc-page">back</span></div>
          <div class="meb-drawer-unit-body">
            ${[['grammar', 'Grammar Bank'], ['vocabulary', 'Vocabulary Bank'], ['writing', 'Writing Bank']].map(b => `<a class="meb-drawer-link meb-toc-link" href="#/bank/${b[0]}" data-action="drawer-close"><span class="meb-status">▲</span><span>${b[1]}</span><span class="toc-dots"></span><span class="toc-page">back</span></a>`).join('')}
          </div>
        </div>
      </div>
    </aside>
  </div>`;
}

const PARTS = [
  { n: 1, label: 'الجزء الأول', name: 'Speakout A2', url: 'https://makahsg94.github.io/speakout-A2/' },
  { n: 2, label: 'الجزء الثاني', name: 'Speakout B1', url: 'https://makahsg94.github.io/speakout-B1/' },
  { n: 3, label: 'الجزء الثالث', name: 'Speakout B1+', url: 'https://makahsg94.github.io/speakout-b1plus/' },
  { n: 4, label: 'الجزء الرابع', name: 'Speakout B2', url: 'https://makahsg94.github.io/speakout-B2/' },
];

function partsBanner(current) {
  return `<section class="meb-parts-banner" aria-label="Course parts">
    <div class="meb-parts-head">
      <span class="meb-parts-eyebrow">Four parts · from A2 to B2</span>
      <span class="meb-parts-hint" dir="rtl" lang="ar">اختار الجزء اللي تدرسه · كل جزء كورس مستقل</span>
    </div>
    <div class="meb-parts-grid">
      ${PARTS.map(p => {
        const active = p.n === current;
        return `<a class="meb-part-card ${active ? 'is-current' : ''}" href="${p.url}" ${active ? 'aria-current="page"' : ''}>
          <span class="meb-part-num">${p.n}</span>
          <span class="meb-part-copy"><strong dir="rtl" lang="ar">${p.label}</strong><small>${p.name}</small></span>
          <span class="meb-part-mark">${active ? icon('check', 16) : icon('chevronRight', 16)}</span>
        </a>`;
      }).join('')}
    </div>
  </section>`;
}

const PARTS_IDENTITY = {
  1: { label: 'الجزء الأول', code: 'A2', title: 'بداية الخط', tagline: 'أول حرف… أول محادثة واثقة.', mark: '◈', color: '#0284c7', soft: '#e0f2fe' },
  2: { label: 'الجزء الثاني', code: 'B1', title: 'خطوة التقدّم', tagline: 'من الجملة القصيرة إلى التعبير الواضح.', mark: '✦', color: '#7c3aed', soft: '#ede9fe' },
  3: { label: 'الجزء الثالث', code: 'B1+', title: 'حافة الإتقان', tagline: 'ما بين B1 وB2 — أفكار أدقّ وقراءة أعمق.', mark: '◆', color: '#d97706', soft: '#fef3c7' },
  4: { label: 'الجزء الرابع', code: 'B2', title: 'قِمّة الخط', tagline: 'رأي، حجّة، وسرد يوقف عنده المستمع.', mark: '✧', color: '#059669', soft: '#d1fae5' },
};

function partIdentity(current) {
  const p = PARTS_IDENTITY[current];
  return `<section class="meb-part-identity" data-part="${current}" style="--pi-color:${p.color};--pi-soft:${p.soft}" aria-label="${p.label} · ${p.code}">
    <span class="meb-part-identity__num" aria-hidden="true">${current}</span>
    <span class="meb-part-identity__mark" aria-hidden="true">${p.mark}</span>
    <div class="meb-part-identity__body">
      <p class="meb-part-identity__eyebrow"><span dir="rtl" lang="ar">${p.label}</span> · <span dir="ltr">${p.code}</span></p>
      <p class="meb-part-identity__title" dir="rtl" lang="ar">${p.title}</p>
      <p class="meb-part-identity__tagline" dir="rtl" lang="ar">${p.tagline}</p>
    </div>
    <span class="meb-part-identity__dots" aria-hidden="true">${[1, 2, 3, 4].map(n => `<i class="${n === current ? 'on' : ''}"></i>`).join('')}</span>
  </section>`;
}

function footer() {
  return `<footer class="meb-footer mx-auto max-w-4xl px-4 pb-8 pt-4 text-center text-xs text-[var(--ink-faint)]">
    <p>Speakout 3rd Edition B1+ · course companion – condensed from the local book for studying with your class</p>
    <div class="meb-footer-links" dir="rtl" lang="ar">
      <p>المطور: <a href="https://www.facebook.com/mahmoud.atef.239821" target="_blank" rel="noopener noreferrer">Mahmoud Atef</a></p>
      <p>واتساب: <a href="https://wa.me/201224552685" target="_blank" rel="noopener noreferrer" dir="ltr">01224552685</a></p>
      <p>لدعم المطور: <span dir="ltr">01042682754</span> (فودافون كاش)</p>
    </div>
  </footer>`;
}

function layout(content, r) {
  return `${header()}<main class="meb-shell page-enter" id="main"><div class="meb-page">${content}</div></main>${footer()}${miniPlayer()}${backToTop()}${drawer()}`;
}

/* ---------------- pages ---------------- */
function homePage() {
  const units = Array.from({ length: 8 }, (_, i) => unitData(i + 1));
  const s = progressStats();
  const lessons = allLessons();
  const first = lessons[0];
  const hasContinue = Number(state.progress.lastUnit) > 0 && !!state.progress.lastLesson;
  const continueHref = hasContinue ? `#/unit/unit-${state.progress.lastUnit}/lesson/${esc(state.progress.lastLesson)}` : (first ? `#/unit/unit-${first.u.unit}/lesson/${first.l.id}` : '#/book');
  const achievements = achievementList();
  const earnedCount = achievements.filter(a => a.earned).length;
  const bookHref = pdfList()[0]?.href || '#/book';
  return `<div class="fade-up space-y-16">
    ${partIdentity(3)}
    <section class="title-page mx-auto max-w-2xl pt-6">
      <p class="meb-kicker">THIRD EDITION · LEVEL B1+</p>
      <h1 class="display mt-4 text-7xl leading-none tracking-tight sm:text-8xl">Speakout</h1>
      <p class="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">THE LINE · B1+ · COURSE COMPANION</p>
      <p class="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-[var(--ink-soft)]">محتوى كتاب Speakout B1+ ملخّص ومنظّم في دروس قصيرة: مفردات بالمعاني، قواعد بأمثلة، استماع وفيديو، وتمارين وكويزات بتصحيح فوري.</p>
      <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
        <a class="page-turn bg-brand-600 text-white hover:text-white" href="${continueHref}">${icon('book', 16)} ${hasContinue ? 'Continue reading' : 'Start reading'}</a>
        <a class="page-turn" href="#/book">Contents of this course</a>
      </div>
      <div class="mx-auto mt-9 max-w-md">
        <div class="meb-progress-card rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-sm">
          <div class="meb-progress-top text-xs"><span class="meb-pill">Level ${s.level}</span><span class="inline-flex items-center gap-1.5 font-semibold text-[var(--ink-soft)]">${icon('flame', 14)} ${s.streak} day${s.streak === 1 ? '' : 's'} streak</span></div>
          <p class="meb-progress-meta"><span class="font-medium">${s.xp} XP</span><span>${s.levelPct}% to level ${s.level + 1}</span></p>
          <div class="meb-bar-track mt-1.5"><div class="meb-bar-fill" style="width:${Math.max(s.levelPct, s.pct)}%"></div></div>
          <p class="meb-progress-foot">${s.done} of ${s.total} lessons · ${s.pct}% of the course</p>
          <button type="button" class="tactile meb-share-btn" data-action="share">${icon('share', 14)} Share today’s card</button>
        </div>
      </div>
    </section>

    ${partsBanner(3)}

    ${state.user ? '' : `<section class="mx-auto max-w-2xl"><a class="meb-ref-banner meb-cta-account" href="#/account">
      <span class="meb-ref-ic bg-white/15 text-white">${icon('layers', 22)}</span>
      <span class="meb-ref-copy"><strong dir="rtl" lang="ar">أنشئ حسابك وخلّي تقدّمك معاك على أي جهاز</strong><small dir="rtl" lang="ar">تسجيل دخول مجاني — الكويزات والدروس والإنجازات تتسجّل لك، وترجعها أول ما تدخل</small></span>
      <span class="meb-ref-action bg-white text-brand-700">دخول / تسجيل</span></a></section>`}

    <section class="mx-auto max-w-2xl"><a class="meb-ref-banner meb-cta-review" href="#/review">
      <span class="meb-ref-ic meb-ic-brand">${icon('layers', 22)}</span>
      <span class="meb-ref-copy"><strong dir="rtl" lang="ar">المراجعة الشاملة</strong><small dir="rtl" lang="ar">كلمات في جداول بالعربي وأمثلة · ملخص الجرامر · كويز 25 سؤال بتصحيح فوري</small></span>
      <span class="meb-ref-action meb-action-brand">افتح الصفحة</span></a></section>

    <section class="mx-auto max-w-2xl"><a class="meb-ref-banner meb-cta-shadow" href="#/shadowing">
      <span class="meb-ref-ic meb-ic-accent">${icon('mic', 22)}</span>
      <span class="meb-ref-copy"><strong dir="rtl" lang="ar">استوديو الشادونج</strong><small dir="rtl" lang="ar">اسمع الفيديو، قفّف على الجملة، وكررها ورا الستارة لحد ما تتروس عليها</small></span>
      <span class="meb-ref-action meb-action-accent">افتح الاستوديو</span></a></section>

    <section class="mx-auto max-w-2xl"><a class="meb-ref-banner meb-cta-book" href="${bookHref}">
      <span class="meb-ref-ic meb-ic-brand">${icon('book', 22)}</span>
      <span class="meb-ref-copy"><strong dir="rtl" lang="ar">كتاب Speakout B1+ الأصلي</strong><small dir="rtl" lang="ar">النسخة الأصلية من الكتاب المحلي + نصوص الاستماع والفيديو</small></span>
      <span class="meb-ref-action meb-action-brand">افتح الكتاب</span></a></section>

    <section>${lineMap()}</section>

    <section>
      <div class="meb-achievement-head"><h2 class="display text-2xl tracking-tight">Achievements</h2><span class="section-label">${earnedCount}/${achievements.length} unlocked</span></div>
      <div class="meb-achievement-grid">
        ${achievements.map(a => `<div class="meb-achievement ${a.earned ? 'earned' : 'locked'}">
          <span class="meb-achievement-emoji ${a.earned ? 'pop' : ''}" aria-hidden="true">${a.emoji}</span>
          <strong>${esc(a.title)}</strong><small>${esc(a.desc)}</small></div>`).join('')}
      </div>
    </section>

    <section class="book-page meb-printed">
      <div class="running-head"><span>Speakout · Level B1+</span><span class="rh-right">Contents</span></div>
      <ol class="meb-toc-list">
        ${units.map(u => {
          const unitDone = (u.lessons || []).filter(l => state.progress.lessons[l.id]?.done).length;
          const unitPct = Math.round(unitDone / Math.max(1, (u.lessons || []).length) * 100);
          return `<li class="meb-toc-unit"><a class="meb-toc-unit-top" href="#/unit/unit-${u.unit}">
            <span class="chapter-num font-display text-5xl leading-none">${u.unit}</span>
            <span class="meb-toc-unit-name"><small>Unit ${u.unit}</small><strong>${esc(u.title || '')}</strong></span>
            <span class="meb-toc-pct">${unitPct}%</span><span class="toc-page">${firstPage(u.pages)}</span></a>
            <ul class="meb-toc-lessons">${(u.lessons || []).map(l => {
              const done = state.progress.lessons[l.id]?.done;
              return `<li><a class="toc-row text-[13px]" href="#/unit/unit-${u.unit}/lesson/${esc(l.id)}"><span class="meb-status">${done ? icon('check', 10) : '○'}</span><span>${esc(l.code || l.id)} ${esc(l.title || '')}</span><span class="toc-dots"></span><span class="toc-page">${firstPage(l.pages)}</span></a></li>`;
            }).join('')}</ul></li>`;
        }).join('')}
      </ol>
      <div class="meb-toc-banks"><div class="meb-drawer-heading">${icon('layers', 14)} <span class="font-display text-lg font-semibold tracking-tight">Reference banks</span><span class="toc-dots"></span><span class="toc-page">back</span></div>
        <ul class="meb-toc-lessons">${[['grammar', 'Grammar Bank'], ['vocabulary', 'Vocabulary Bank'], ['writing', 'Writing Bank']].map(b => `<li><a class="toc-row text-[13px]" href="#/bank/${b[0]}"><span class="meb-status">▲</span><span>${b[1]}</span><span class="toc-dots"></span><span class="toc-page">back</span></a></li>`).join('')}</ul></div>
    </section>
  </div>`;
}

function bookPage() {
  const units = Array.from({ length: 8 }, (_, i) => unitData(i + 1));
  return `<div class="fade-up book-page meb-book-page">
    <div class="running-head"><span>Speakout · Level B1+</span><span class="rh-right">Contents of the book</span></div>
    <header class="title-page mx-auto max-w-xl pb-8">
      <p class="meb-kicker">THIRD EDITION · LEVEL B1+</p>
      <h1 class="display mt-3 text-4xl tracking-tight sm:text-5xl">Speakout</h1>
      <p class="mt-3 text-sm leading-relaxed text-[var(--ink-soft)]">Frances Eales · Steve Oakes · One course companion for every lesson, review and bank.</p>
    </header>
    ${coverStack()}
    <ol class="meb-toc-list mt-8">
      ${units.map(u => {
        const unitDone = (u.lessons || []).filter(l => state.progress.lessons[l.id]?.done).length;
        const unitPct = Math.round(unitDone / Math.max(1, (u.lessons || []).length) * 100);
        return `<li class="meb-toc-unit"><a class="meb-toc-unit-top" href="#/unit/unit-${u.unit}">
          <span class="chapter-num font-display text-4xl leading-none">${u.unit}</span>
          <span class="meb-toc-unit-name"><small>Unit ${u.unit}</small><strong>${esc(u.title || '')}</strong></span>
          <span class="meb-toc-pct">${unitDone}/${(u.lessons || []).length} · ${unitPct}%</span><span class="toc-page">${firstPage(u.pages)}</span></a>
          <ul class="meb-toc-lessons">${(u.lessons || []).map(l => {
            const done = state.progress.lessons[l.id]?.done;
            return `<li><a class="toc-row text-[13px]" href="#/unit/unit-${u.unit}/lesson/${esc(l.id)}"><span class="meb-status">${done ? icon('check', 10) : '○'}</span><span>${esc(l.code || l.id)} ${esc(l.title || '')}</span><span class="toc-dots"></span><span class="toc-page">${firstPage(l.pages)}</span></a></li>`;
          }).join('')}</ul></li>`;
      }).join('')}
    </ol>
    <section class="meb-toc-banks"><div class="meb-drawer-heading">${icon('layers', 14)} <h2 class="font-display text-lg font-semibold tracking-tight">Reference banks</h2><span class="toc-dots"></span><span class="toc-page">back of the book</span></div>
      <ul class="meb-toc-lessons">${[['grammar', 'Grammar Bank'], ['vocabulary', 'Vocabulary Bank'], ['writing', 'Writing Bank']].map(b => `<li><a class="toc-row text-[13px]" href="#/bank/${b[0]}"><span class="meb-status">▲</span><span>${b[1]}</span><span class="toc-dots"></span><span class="toc-page">back</span></a></li>`).join('')}</ul></section>
  </div>`;
}

function unitPage(n) {
  const u = unitData(n);
  const done = (u.lessons || []).filter(l => state.progress.lessons[l.id]?.done).length;
  const total = (u.lessons || []).length || 4;
  const pct = Math.round(done / total * 100);
  const next = n < 8 ? unitData(n + 1) : null;
  const objectives = u.objectives || [];
  return `<div class="fade-up book-page meb-unit-page">
    <div class="running-head"><span>Station Unit ${n} · ${esc(u.title || '')}</span><span class="rh-right">pages ${esc(u.pages || '')}</span></div>
    <nav class="meb-breadcrumb"><a href="#/">${icon('home', 14)} Home</a>${icon('chevronRight', 13)}<span>Unit ${n}</span></nav>
    ${partsBanner(3)}
    <header class="meb-unit-header">
      <div>
        <div class="meb-unit-heading"><span class="chapter-num text-6xl" aria-hidden="true">${n}</span><div><p class="meb-kicker">Unit ${n}</p><p class="page-number mt-1">${esc(u.title || '')}</p></div></div>
        <h1 class="display mt-3 text-4xl tracking-tight lg:text-5xl">${esc(u.aim || UNIT_TITLES[n]?.[0] || '')}</h1>
        <p class="mt-4 max-w-xl text-[15px] leading-relaxed text-[var(--ink-soft)]" dir="rtl" lang="ar">${esc(u.titleAr || '')} · ${esc((u.lessons || []).map(l => l.title).join(' · '))}</p>
        ${objectives.length ? `<div class="meb-objectives"><p class="meb-kicker">Unit objectives</p><ol>${objectives.map((o, i) => `<li><span>${i + 1}</span><span>${esc(o)}</span></li>`).join('')}</ol></div>` : ''}
        <div class="meb-unit-progress"><div><span>Progress</span><strong>${done}/${total} (${pct}%)</strong></div><div class="meb-bar-track"><div class="meb-bar-fill" style="width:${pct}%"></div></div></div>
      </div>
      <aside class="meb-unit-figure" aria-hidden="true"><div class="meb-unit-figure-page"><span>B1+</span><strong>${n}</strong><small>${esc(u.title || '')}</small></div></aside>
    </header>
    <div class="section-divider"><span>${icon('list', 12)} In this chapter</span></div>
    <a class="meb-ref-banner meb-inline-warm" href="#/unit/unit-${n}/writing"><span class="meb-ref-ic meb-ic-warm">${icon('spark', 22)}</span><span class="meb-ref-copy"><strong>Unit ${n} writing desk</strong><small>${esc(u.aim || '')} · check your writing and get a grade</small></span>${icon('chevronRight', 18)}</a>
    <a class="meb-ref-banner meb-inline-brand" href="#/unit/unit-${n}/quiz"><span class="meb-ref-ic meb-ic-brand">${icon('target', 22)}</span><span class="meb-ref-copy"><strong>Take the Unit ${n} Quiz</strong><small>${(u.review?.quiz || []).length || 12} questions · grammar, vocabulary and local book tasks</small></span>${icon('chevronRight', 18)}</a>
    <ol class="meb-unit-lessons">
      ${(u.lessons || []).map(l => {
        const st = lessonStatus(l);
        const mark = st === 'done' ? icon('check', 12) : st === 'started' ? '●' : /r$/i.test(l.id) ? '★' : '○';
        return `<li><a class="meb-unit-lesson" href="#/unit/unit-${n}/lesson/${esc(l.id)}" title="${esc((l.goals || []).join(' · ') || (l.grammar?.title || ''))}"><span class="meb-status">${mark}</span><span class="meb-unit-lesson-name"><strong>${esc(l.code || l.id)} ${esc(l.title || '')}</strong>${l.grammar?.title ? `<small>${esc(l.grammar.title)}</small>` : ''}</span><span class="toc-dots"></span><span class="toc-page">${firstPage(l.pages)}</span></a></li>`;
      }).join('')}
    </ol>
    ${next ? `<a class="page-corner tactile meb-next-unit" href="#/unit/unit-${n + 1}"><span class="meb-kicker">Next unit</span><strong>Unit ${n + 1}: ${esc(next.aim || next.title || '')}</strong>${icon('chevronRight', 18)}</a>` : ''}
  </div>`;
}

function audioSection(l, n) {
  const tracks = (l.listening || []).filter(t => t.audioFile);
  if (!tracks.length) return '';
  return `<div class="meb-section" id="listening">
    <h2>Listening</h2>
    <div class="meb-audio-bar">
      <button data-action="audio-play" data-src="${esc(tracks[0].audioFile)}" data-label="${esc(`${l.code || ''} · ${tracks[0].track || 'Audio'}`)}">▶ تشغيل</button>
      <span class="meb-muted" id="audio-label" style="font-size:.82rem">${esc(tracks[0].track || 'Audio')} · ${esc(tracks[0].summary || '')}</span>
    </div>
    ${tracks.map(t => `<button class="meb-track" data-action="audio-play" data-src="${esc(t.audioFile)}" data-label="${esc(`${l.code || ''} · ${t.track || t.summary || t.audioFile}`)}">🎧 ${esc(t.track || t.audioFile)} — ${esc(t.summary || '')}</button>`).join('')}
    <p class="meb-muted" style="font-size:.75rem">الملفات الصوتية من نُسخة الصف بالكتاب الأصلي.</p>
  </div>`;
}

function videoSection(l) {
  if (!l.video?.file) return '';
  return `<div class="meb-section" id="video"><h2>Video · BBC</h2>
    <p class="meb-muted" style="font-size:.85rem">${esc(l.video.summary || '')}</p>
    <video class="meb-player" controls preload="metadata" src="${enc('video/' + l.video.file)}"></video>
    <p><a class="meb-link" href="#/shadowing">افتح استوديو الشادونج ←</a></p>
  </div>`;
}

function vocabSection(l) {
  const words = l.vocab || [];
  if (!words.length) return '';
  return `<div class="meb-section" id="vocabulary"><h2>${esc(words.length)} key words</h2>
    <span class="meb-vocab-tools"><button class="meb-btn ghost" data-action="meanings">${state.hideMeanings ? 'إظهار المعاني' : 'إخفاء المعاني'}</button>${accentChips()}</span>
    <table class="meb-table"><thead><tr><th>WORD</th><th class="meb-meaning">MEANING</th><th>EXAMPLE / NOTE</th></tr></thead><tbody>
      ${words.map(w => `<tr><td><strong>${esc(w.word)}</strong> ${sayButton(w.word)}</td><td class="meb-meaning">${esc(w.ar || '')}</td><td>${esc(w.example || '')}</td></tr>`).join('')}
    </tbody></table>
  </div>`;
}

function practiceHTML(l, n) {
  const qs = l.practice || [];
  if (!qs.length) return '';
  return `<div class="meb-section" id="practice"><h2>Practice</h2>
    ${qs.map((q, i) => `<div class="meb-q" data-answer="${esc(q.answer)}">
      <p>${i + 1}. ${esc(q.q)}</p>
      ${(q.options || []).map(o => `<label class="meb-opt"><input type="radio" name="p_${n}_${esc(l.id)}_${i}" value="${esc(o)}" /> <span>${esc(o)}</span></label>`).join('')}
      <div class="feedback">${esc(q.why || '')}</div>
    </div>`).join('')}
    <div style="display:flex;gap:.5rem;margin-top:.8rem"><button class="meb-btn" data-action="check-practice" data-scope="p_${n}_${esc(l.id)}_">Check answers</button><button class="meb-btn ghost" data-action="reset-practice" data-scope="p_${n}_${esc(l.id)}_">Reset</button></div>
  </div>`;
}

function grammarSection(l) {
  const g = l.grammar;
  if (!g) return '';
  return `<div class="meb-section" id="grammar"><h2>${esc(g.title || 'Grammar')}</h2>
    <div class="meb-ar meb-note">${esc(g.shortAr || '')}</div>
    ${(g.points || []).length ? `<ul style="margin:.7rem 0;padding-left:1.2rem;font-size:.88rem;line-height:1.8">${g.points.map(p => `<li>${esc(p)}</li>`).join('')}</ul>` : ''}
    ${(g.table || []).length ? `<table class="meb-table"><thead><tr><th>FORM / USE</th><th>EXAMPLE</th></tr></thead><tbody>${g.table.map(row => `<tr><td>${esc(row[0] || '')}</td><td>${esc(row[1] || '')}</td></tr>`).join('')}</tbody></table>` : ''}
    ${(g.exceptions || []).length ? `<div class="meb-note" style="border-color:var(--color-warm-500)"><strong>ملاحظات:</strong> ${g.exceptions.map(e => esc(e)).join(' · ')}</div>` : ''}
  </div>`;
}

function lessonPage(n, key) {
  const u = unitData(n);
  const l = (u.lessons || []).find(x => x.id === key);
  if (!l) return unitPage(n);
  const idx = (u.lessons || []).indexOf(l);
  const prev = idx > 0 ? u.lessons[idx - 1] : null;
  const next = idx < u.lessons.length - 1 ? u.lessons[idx + 1] : null;
  const done = !!state.progress.lessons[l.id]?.done;
  const toc = [
    ['grammar', 'Grammar'], ['vocabulary', 'Vocabulary'], ['reading', 'Reading'],
    ['listening', 'Listening'], ['video', 'Video'], ['practice', 'Practice'], ['speaking', 'Speaking']
  ].filter(([id]) => $('#dummy') || true);
  return `<div class="book-page fade-up" style="padding:0 1.25rem 2rem">
    <div class="running-head" style="display:flex;justify-content:space-between;font-size:.68rem;letter-spacing:.16em;text-transform:uppercase;color:var(--ink-faint);padding:1rem 0;border-bottom:1px solid var(--line)">
      <span>UNIT ${n} · ${esc(l.title || '')}</span><span>PAGES ${esc(l.pages || '')}</span>
    </div>
    <div style="display:flex;gap:.4rem;flex-wrap:wrap;font-size:.82rem;color:var(--ink-faint);margin:1rem 0"><a class="meb-link" href="#/">Home</a> › <a class="meb-link" href="#/unit/unit-${n}">Unit ${n}</a> › <span>${esc(l.code || l.id)}</span></div>
    <div style="display:flex;gap:1rem;align-items:flex-start;border-bottom:1px solid var(--line);padding-bottom:1.5rem;flex-wrap:wrap">
      <div style="width:2.9rem;height:2.9rem;display:grid;place-items:center;border-radius:.75rem;background:var(--color-brand-600);color:#fff;font-family:var(--font-display);font-weight:700;font-size:1.15rem;flex:none">${esc(l.code || l.id)}</div>
      <div style="flex:1;min-width:min(100%,18rem)">
        <div class="meb-kicker">UNIT ${n} · PAGES ${esc(l.pages || '')}</div>
        <h1 class="meb-title" style="font-size:2.6rem;margin:.35rem 0">${esc(l.title || '')}</h1>
        <div class="meb-muted" style="font-size:.85rem">${esc(u.titleAr || '')}</div>
      </div>
      <div style="display:flex;gap:.4rem;flex-wrap:wrap;align-items:center">
        <span class="meb-pill">🎧 Audio</span><span class="meb-pill">${Math.max(2, Math.round(JSON.stringify(l).length / 900))} min read</span>
        <button class="meb-btn ghost" data-action="mark-done" data-lesson="${esc(l.id)}">${done ? '✓ تم' : 'Mark as done'}</button>
      </div>
    </div>
    <div class="meb-toc"><h4>WHAT YOU'LL LEARN</h4>
      <ol style="margin:0;padding-left:1.2rem;font-size:.85rem;line-height:1.8">${(l.goals || []).map(g => `<li>${esc(g)}</li>`).join('')}</ol>
    </div>
    <div class="meb-toc"><h4>ON THIS PAGE</h4>
      ${toc.map(([id, label]) => `<a href="#${id}">${label}</a>`).join('')}
    </div>
    <p class="meb-ar" style="font-size:.88rem;margin:0 0 1rem">${esc((l.goals || []).join(' · '))}</p>
    ${grammarSection(l)}
    ${vocabSection(l)}
    ${l.reading?.summary ? `<div class="meb-section" id="reading"><h2>Reading</h2><p class="meb-muted" style="font-size:.88rem">${esc(l.reading.summary)}</p></div>` : ''}
    ${audioSection(l, n)}
    ${videoSection(l)}
    ${practiceHTML(l, n)}
    <div class="meb-section" id="speaking"><h2>Speaking & Writing</h2>
      <ul style="font-size:.88rem;line-height:1.9;padding-left:1.2rem">${[...(l.speaking || []), ...(l.writing || [])].map(t => `<li>${esc(t)}</li>`).join('')}</ul>
    </div>
    <div class="meb-card" style="margin-top:2rem"><div class="meb-kicker">Ready to finish this chapter?</div>
      <div style="display:flex;gap:.6rem;flex-wrap:wrap;margin-top:.6rem">
        <button class="meb-btn" data-action="mark-done" data-lesson="${esc(l.id)}">${done ? '✓ تم إكمال الدرس' : 'Mark complete'}</button>
        ${next ? `<a class="meb-btn ghost" href="#/unit/unit-${n}/lesson/${esc(next.id)}">Next: ${esc(next.title || next.code)} →</a>` : `<a class="meb-btn ghost" href="#/unit/unit-${n}/lesson/${n}r">Unit ${n} Review →</a>`}
      </div>
    </div>
    ${prev ? `<p style="margin-top:1rem"><a class="meb-link" href="#/unit/unit-${n}/lesson/${esc(prev.id)}">← ${esc(prev.title || prev.code)}</a></p>` : ''}
  </div>`;
}

function quizHTML(id, questions) {
  const qs = questions || [];
  if (!qs.length) return `<div class="meb-card">لا توجد أسئلة متاحة لهذا الكويز.</div>`;
  return `<form data-quiz="${esc(id)}" class="meb-quiz">
    ${qs.map((q, i) => `<div class="meb-q" data-answer="${esc(q.answer)}"><p>${i + 1}. ${esc(q.q)}</p>
      ${(q.options || []).map(o => `<label class="meb-opt"><input type="radio" name="q_${esc(id)}_${i}" value="${esc(o)}" /> <span>${esc(o)}</span></label>`).join('')}
      <div class="feedback">${esc(q.skill || '')}</div></div>`).join('')}
    <div style="display:flex;gap:.6rem;margin-top:1rem"><button class="meb-btn" type="submit">Check answers</button><button class="meb-btn ghost" type="button" data-action="reset-quiz" data-quiz="${esc(id)}">Reset</button></div>
  </form><div id="result_${esc(id)}"></div>`;
}

function reviewPage(n) {
  const u = unitData(n);
  return `<div class="fade-up"><div class="meb-kicker">UNIT ${n} · REVIEW</div>
    <h1 class="meb-title" style="font-size:2.4rem;margin:.4rem 0">Unit ${n} Review</h1>
    <p class="meb-muted" style="font-size:.9rem">${esc(u.review?.summary || '')}</p>
    <div class="meb-grid cols-2" style="margin:1rem 0">${(u.review?.tasks || []).map(t => `<div class="meb-card" style="font-size:.85rem">${esc(t)}</div>`).join('')}</div>
    <div class="meb-card"><h2 class="meb-title" style="font-size:1.4rem">Unit ${n} Quiz · ${(u.review?.quiz || []).length} questions</h2>
      ${quizHTML('u' + n, u.review?.quiz || [])}</div>
    <p style="margin-top:1rem"><a class="meb-link" href="#/unit/unit-${n}">← Unit ${n}</a></p>
  </div>`;
}

function comprehensivePage() {
  const questions = [];
  for (let n = 1; n <= 8; n++) {
    const q = (unitData(n).review?.quiz || []).slice(0, 3);
    questions.push(...q.map(x => ({ ...x, q: `[U${n}] ${x.q}` })));
  }
  const extra = allLessons().flatMap(x => (x.l.practice || []).slice(0, 1).map(p => ({ q: `[${x.l.code}] ${p.q}`, options: p.options, answer: p.answer, skill: 'grammar' })));
  questions.push(...extra.slice(0, 25 - questions.length));
  return `<div class="fade-up"><div class="meb-kicker">SPEAKOUT B1+ · FINAL REVIEW</div>
    <h1 class="meb-title" style="font-size:2.6rem;margin:.4rem 0">المراجعة الشاملة</h1>
    <p class="meb-ar meb-muted" style="max-width:38rem">كلمات في جداول بالعربية وأمثلة · ملخص الجرامر · كويز ${questions.length} سؤال بتصحيح فوري.</p>
    <div class="meb-grid cols-3" style="margin:1.2rem 0">
      <a class="meb-feature" href="#/bank/vocabulary"><div class="ic">A</div><h3>Vocabulary Bank</h3><p>المفردات والمعاني.</p></a>
      <a class="meb-feature" href="#/bank/grammar"><div class="ic">▲</div><h3>Grammar Bank</h3><p>قواعد الدروس.</p></a>
      <a class="meb-feature" href="#/bank/writing"><div class="ic">✎</div><h3>Writing Bank</h3><p>مهام الكتابة.</p></a>
    </div>
    <div class="meb-card"><h2 class="meb-title" style="font-size:1.5rem">Final quiz · ${questions.length} questions</h2>${quizHTML('all', questions)}</div>
  </div>`;
}

function bankPage(kind) {
  const lessons = allLessons();
  if (kind === 'vocabulary') {
    const groups = Array.from({ length: 8 }, (_, i) => unitData(i + 1)).map(u => ({ u, words: (u.lessons || []).flatMap(l => (l.vocab || []).map(w => ({ ...w, lesson: l.code }))) }));
    return `<div class="fade-up"><a class="meb-link" href="#/">Home</a> › Vocabulary Bank
      <h1 class="meb-title" style="font-size:2.4rem;margin:.4rem 0">Vocabulary Bank</h1>
      <p class="meb-muted" style="font-size:.85rem">Words from the local B1+ book, grouped by unit, with concise Arabic meanings.</p>
      ${accentChips()}
      ${groups.map(g => `<div class="meb-card" style="margin:.9rem 0"><div class="meb-kicker">UNIT ${g.u.unit} · ${esc(g.u.title || '')}</div>
        <table class="meb-table"><thead><tr><th>WORD</th><th>MEANING</th><th>EXAMPLE</th><th>LESSON</th></tr></thead><tbody>
        ${g.words.map(w => `<tr><td><strong>${esc(w.word)}</strong> ${sayButton(w.word)}</td><td>${esc(w.ar || '')}</td><td>${esc(w.example || '')}</td><td>${esc(w.lesson || '')}</td></tr>`).join('')}
        </tbody></table></div>`).join('')}</div>`;
  }
  if (kind === 'writing') {
    return `<div class="fade-up"><a class="meb-link" href="#/">Home</a> › Writing Bank
      <h1 class="meb-title" style="font-size:2.4rem;margin:.4rem 0">Writing Bank</h1>
      ${Array.from({ length: 8 }, (_, i) => unitData(i + 1)).map(u => `<div class="meb-card" style="margin:.8rem 0"><div class="meb-kicker">UNIT ${u.unit}</div>
        ${(u.lessons || []).filter(l => (l.writing || []).length).map(l => `<p style="font-size:.86rem"><strong>${esc(l.code)}:</strong> ${(l.writing || []).map(esc).join(' · ')}</p>`).join('')}</div>`).join('')}</div>`;
  }
  return `<div class="fade-up"><a class="meb-link" href="#/">Home</a> › Grammar Bank
    <h1 class="meb-title" style="font-size:2.4rem;margin:.4rem 0">Grammar Bank</h1>
    <p class="meb-muted" style="font-size:.85rem">Reference and practice summaries for the grammar of each lesson.</p>
    <div class="meb-grid cols-3" style="margin-top:1rem">
      ${lessons.map(({ u, l }) => `<a class="meb-card" href="#/unit/unit-${u.unit}/lesson/${esc(l.id)}" style="text-decoration:none;color:inherit">
        <div class="meb-kicker">${esc(l.code || l.id)} · p.${esc(l.pages || '')}</div>
        <strong style="display:block;margin:.3rem 0;font-size:.95rem">${esc(l.grammar?.title || l.title || '')}</strong>
        <span class="meb-muted" style="font-size:.78rem">${esc(l.grammar?.points?.[0] || '')}</span></a>`).join('')}
    </div></div>`;
}

function shadowingPage() {
  const vids = (state.media?.video || []).slice().sort((a, b) => a.unit.localeCompare(b.unit) || a.type.localeCompare(b.type));
  const current = vids.find(v => v.file === state.shadowFile) || vids[0];
  let transcript = '';
  if (current) {
    const start = state.transcripts.indexOf(`UNIT ${current.unit}`);
    if (start >= 0) {
      const next = state.transcripts.indexOf(`UNIT ${Number(current.unit) + 1}`, start + 5);
      transcript = state.transcripts.slice(start, next > 0 ? next : start + 6000).trim();
    }
  }
  return `<div class="fade-up"><div class="meb-kicker" style="text-align:center">SPEAKOUT B1+ · SHADOWING STUDIO</div>
    <h1 class="meb-title" style="font-size:2.8rem;text-align:center;margin:.4rem 0">استوديو الشادونج</h1>
    <p class="meb-ar meb-muted" style="max-width:38rem;margin:0 auto 1.5rem">فيديوهات الكتاب المحلية (BBC Vlogs / Street Interviews / Programmes). اسمع، كرّر ورا المتحدث، وقفّف على الجملة واستخدم التحكم في السرعة والتكرار.</p>
    <div class="meb-grid cols-3" style="margin-bottom:1.5rem">
      <div class="meb-card"><b>1</b> <span class="meb-muted">اسمع · Play the scene</span></div>
      <div class="meb-card"><b>2</b> <span class="meb-muted">كرّر · Shadow the line</span></div>
      <div class="meb-card"><b>3</b> <span class="meb-muted">قارن · Loop & compare</span></div>
    </div>
    ${current ? `<div class="meb-card"><div style="display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap"><strong>UNIT ${esc(current.unit)} · ${esc(current.type)}</strong><span class="meb-muted" style="font-size:.8rem">${esc(current.file)} · ${current.mb} MB</span></div>
      <video id="meb-video" class="meb-player" style="margin-top:.8rem" controls preload="metadata" src="${enc('video/' + current.file)}"></video>
      <div style="display:flex;flex-wrap:wrap;gap:.5rem;margin-top:.8rem">
        <button class="meb-btn" data-action="video-play">▶ تشغيل</button>
        <button class="meb-btn ghost" data-action="loop-a">A · بداية التكرار</button>
        <button class="meb-btn ghost" data-action="loop-b">B · نهاية التكرار</button>
        <button class="meb-btn ghost" data-action="loop-clear">إلغاء التكرار</button>
        <button class="meb-btn ghost" data-action="speed" data-speed="0.75">0.75×</button>
        <button class="meb-btn ghost" data-action="speed" data-speed="1">1×</button>
        <span class="meb-pill" id="loop-status">لا يوجد تكرار</span>
      </div>
      <details style="margin-top:1rem"><summary>نص الفيديو من الكتاب (VIDEOSCRIPTS)</summary><pre class="meb-transcript" style="white-space:pre-wrap">${esc(transcript.slice(0, 7000) || 'لا يوجد نص لهذه الوحدة.')}</pre></details>
    </div>` : ''}
    <h2 class="meb-title" style="font-size:1.5rem;margin:2rem 0 .8rem">فيديوهات الوحدة ${state.shadowUnit}</h2>
    <div style="display:flex;gap:.4rem;flex-wrap:wrap;margin-bottom:.8rem">${Array.from({ length: 8 }, (_, i) => `<button class="meb-btn ${state.shadowUnit === i + 1 ? '' : 'ghost'}" data-action="shadow-unit" data-unit="${i + 1}">U${i + 1}</button>`).join('')}</div>
    <div class="meb-video-grid">${vids.filter(v => Number(v.unit) === state.shadowUnit).map(v => `<button class="meb-video-card ${current?.file === v.file ? 'active' : ''}" data-action="select-video" data-file="${esc(v.file)}"><div class="meb-kicker">UNIT ${esc(v.unit)} · ${esc(v.type)}</div><strong style="font-size:.85rem;display:block;margin:.3rem 0">${esc(v.file)}</strong><span class="meb-muted" style="font-size:.75rem">${v.mb} MB · افتح الاستوديو</span></button>`).join('')}</div>
  </div>`;
}

async function hashPassword(pw) {
  const data = new TextEncoder().encode('meb::' + pw);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function accountPage() {
  const users = lsGet('users', []);
  const done = Object.values(state.progress.lessons || {}).filter(x => x.done).length;
  const quizzes = Object.values(state.progress.quizzes || {});
  return `<div class="auth-scene fade-up" style="border-radius:1rem;padding:1.5rem">
    <div class="meb-auth meb-card">
      <div class="meb-kicker" style="text-align:center">SPEAKOUT B1+ · YOUR ACCOUNT</div>
      <h1 class="meb-title" style="font-size:2rem;text-align:center;margin:.5rem 0">ابدأ من تاني بس تقدّمك يفضل معاك</h1>
      ${state.user ? `<div style="text-align:center;margin:1rem 0"><div class="meb-pill">👤 ${esc(state.user.name)}</div>
          <p class="meb-muted" style="font-size:.85rem">دروس مكتملة: ${done} · كويزات: ${quizzes.length} · متوسط الدرجات: ${quizzes.length ? Math.round(quizzes.reduce((a, b) => a + b.score / b.total, 0) / quizzes.length * 100) : 0}%</p>
          <button class="meb-btn ghost" data-action="logout">تسجيل الخروج</button></div>`
      : `<div class="meb-tabs"><button class="on" data-action="auth-tab" data-tab="login">تسجيل الدخول</button><button data-action="auth-tab" data-tab="register">إنشاء حساب جديد</button></div>
        <form id="auth-form"><div class="meb-field"><label>الاسم</label><input name="name" required /></div>
          <div class="meb-field"><label>العمر</label><input name="age" type="number" min="5" max="100" /></div>
          <div class="meb-field"><label>كلمة السر</label><input name="pw" type="password" required minlength="4" /></div>
          <div class="meb-field" id="confirm-field" style="display:none"><label>تأكيد كلمة السر</label><input name="pw2" type="password" minlength="4" /></div>
          <button class="meb-btn" type="submit" style="width:100%;margin-top:.6rem" id="auth-submit">تسجيل الدخول</button>
        </form>
        <p class="meb-muted" style="font-size:.72rem;text-align:center;margin-top:.8rem">الحساب والتقدم محفوظان محلياً على هذا الجهاز (بدون خادم). كلمات السر مخزّنة كتجزئة SHA-256 فقط.</p>
        <p class="meb-muted" style="font-size:.7rem;text-align:center">حسابات مسجّلة: ${users.length}</p>`}
    </div>
  </div>`;
}

function leadinPage() {
  const tracks = (state.media?.audio || []).filter(a => a.unit === '0' || a.lesson === 'LI');
  return `<div class="fade-up"><div class="meb-kicker">LEAD-IN</div><h1 class="meb-title" style="font-size:2.4rem;margin:.4rem 0">me & mine · get started</h1>
    <p class="meb-muted" style="font-size:.88rem">تمهيد الكتاب: أصوات/page 6، then Unit 1.</p>
    <div class="meb-card"><h2>Audio</h2>${tracks.map(t => `<button class="meb-track" data-action="audio-play" data-src="${esc(t.file)}">🎧 ${esc(t.file)}</button>`).join('') || '<p class="meb-muted">لا توجد ملفات.</p>'}</div>
    <p style="margin-top:1rem"><a class="meb-link" href="#/unit/unit-1">Unit 1 →</a></p></div>`;
}

function unitQuizPage(n) {
  const u = unitData(n);
  return `<div class="fade-up"><a class="meb-link" href="#/unit/unit-${n}">← Unit ${n}</a>
    <div class="meb-kicker" style="margin-top:1rem">UNIT ${n} · QUIZ</div>
    <h1 class="meb-title" style="font-size:2.4rem;margin:.4rem 0">Unit ${n} Quiz</h1>
    <p class="meb-muted" style="font-size:.88rem">${esc(u.title || '')} · ${(u.review?.quiz || []).length} questions from this unit.</p>
    <div class="meb-card">${quizHTML('u' + n, u.review?.quiz || [])}</div>
    <p style="margin-top:1rem"><a class="meb-link" href="#/unit/unit-${n}/writing">Unit ${n} Writing →</a></p></div>`;
}

function writingPage(n) {
  const u = unitData(n);
  const saved = lsGet('writings', {});
  const records = state.progress.writing || {};
  const tasks = (u.lessons || []).map(l => ({ l, items: [l.writing].flat(Infinity).filter(Boolean) })).filter(x => x.items.length);
  return `<div class="fade-up book-page meb-writing-page"><a class="meb-link" href="#/unit/unit-${n}">← Unit ${n}</a>
    <div class="running-head" style="margin-top:1rem"><span>Station Unit ${n} · writing desk</span><span class="rh-right">${esc(u.pages || '')}</span></div>
    <h1 class="display mt-3 text-4xl tracking-tight">Unit ${n} Writing</h1>
    <p class="meb-muted mt-2 text-[15px]">Writing prompts from the local B1+ book. Drafts and checks are saved only on this device.</p>
    ${tasks.map(({ l, items }) => `<div class="meb-card" style="margin:.9rem 0">
      <div class="meb-kicker">${esc(l.code || l.id)} · p.${esc(l.pages || '')}</div>
      ${items.map(t => `<p style="font-size:.9rem">${esc(String(t))}</p>`).join('')}
      <textarea class="meb-writing-area" data-writing="${esc(l.id)}" placeholder="Write your answer here…">${esc(saved[l.id] || '')}</textarea>
      <div class="meb-writing-actions"><button class="meb-btn" data-action="save-writing" data-unit="${n}">Save drafts</button><button class="meb-btn ghost" data-action="check-writing" data-writing="${esc(l.id)}" data-unit="${n}">Check writing</button></div>
      <p class="meb-writing-feedback" id="writing-${esc(l.id)}">${records[l.id] ? `Last check: grade ${esc(records[l.id].grade)} · ${esc(records[l.id].score)}% · ${esc(records[l.id].words)} words` : ''}</p>
    </div>`).join('') || '<div class="meb-card">No writing tasks for this unit.</div>'}
    <p style="margin-top:1rem"><a class="meb-btn ghost" href="#/unit/unit-${n}/quiz">Unit quiz →</a></p></div>`;
}

function pdfPage(file) {
  const pdfs = pdfList();
  const chosen = pdfs.find(p => (p.siteFile || p.file) === file) || pdfs[0];
  return `<div class="fade-up book-page meb-pdf-page"><a class="meb-link" href="#/book">← Contents</a>
    <div class="running-head" style="margin-top:1rem"><span>Speakout · Level B1+</span><span class="rh-right">Local book · PDF</span></div>
    <h1 class="display mt-3 text-3xl tracking-tight">${esc(chosen?.file || 'PDF')}</h1>
    ${chosen ? `<div style="display:flex;gap:.6rem;flex-wrap:wrap;margin:.8rem 0">
      <a class="meb-btn" href="./books/${encodeURIComponent(chosen.siteFile || chosen.file)}" target="_blank" rel="noopener">Open in new tab</a>
      <a class="meb-btn ghost" href="./books/${encodeURIComponent(chosen.siteFile || chosen.file)}" download>Download</a></div>
      <iframe class="meb-pdf-frame" title="${esc(chosen.file)}" src="./books/${encodeURIComponent(chosen.siteFile || chosen.file)}"></iframe>`
    : '<div class="meb-card">No PDF available.</div>'}
    <h2 class="meb-title" style="font-size:1.3rem;margin:1.5rem 0 .5rem">Other PDFs</h2>
    <div class="meb-grid cols-3">${pdfs.map(p => `<a class="meb-card" href="${p.href}" style="text-decoration:none;color:inherit;font-size:.85rem">${esc(p.file)}<br><span class="meb-muted">${p.mb} MB</span></a>`).join('')}</div></div>`;
}

function searchPage(q) {
  const term = String(q || '').trim().toLowerCase();
  const items = [];
  allLessons().forEach(({ u, l }) => {
    const hay = [l.title, l.goals, l.grammar?.title, l.grammar?.points, l.writing,
      (l.vocab || []).map(w => `${w.word} ${w.ar || ''} ${w.example || ''}`),
      (l.practice || []).map(p => p.q)].flat(Infinity).join(' ').toLowerCase();
    items.push({ type: `${u.unit}${l.code || ''} · lesson`, title: l.title || l.id, text: hay + ' ' + (l.title || ''), href: `#/unit/unit-${u.unit}/lesson/${l.id}` });
  });
  (state.media?.audio || []).forEach(a => items.push({ type: `U${a.unit} · audio`, title: a.file, text: a.file.toLowerCase(), href: `#/unit/unit-${a.unit || 1}` }));
  pdfList().forEach(p => items.push({ type: 'PDF', title: p.file, text: p.file.toLowerCase(), href: p.href }));
  const hits = term ? items.filter(i => i.text.includes(term) || i.title.toLowerCase().includes(term)).slice(0, 80) : [];
  return `<div class="fade-up"><div class="meb-kicker">SPEAKOUT B1+ · SEARCH</div>
    <h1 class="meb-title" style="font-size:2.2rem;margin:.4rem 0">Search the course</h1>
    <form id="meb-search-form" style="display:flex;gap:.5rem;margin:1rem 0 1.5rem">
      <input class="meb-field-input meb-search-inline" name="q" value="${esc(q || '')}" placeholder="كلمة، درس، قاعدة…" style="flex:1" />
      <button class="meb-btn" type="submit">${icon('search', 15)} Search</button></form>
    ${term ? `<p class="meb-muted" style="font-size:.85rem">${hits.length} result${hits.length === 1 ? '' : 's'} for “${esc(q)}”</p>
      ${hits.map(h => `<div class="meb-search-result"><div class="meb-kicker">${esc(h.type)}</div>
        <a class="meb-link" href="${h.href}">${esc(h.title)}</a><p class="meb-muted" style="font-size:.8rem;margin:.25rem 0">${esc(h.text.slice(0, 240))}</p></div>`).join('') || '<div class="meb-card">No results. Try another word.</div>'}`
    : `<div class="meb-card"><p class="meb-muted">ابحث في دروس الكتاب المحلي: المفردات، القواعد، التمارين وأسماء الملفات.</p>
        <p style="font-size:.85rem"><a class="meb-link" href="#/bank/vocabulary">Vocabulary Bank</a> · <a class="meb-link" href="#/bank/grammar">Grammar Bank</a></p></div>`}</div>`;
}

/* ---------------- rendering ---------------- */
function render() {
  const r = route();
  let content = '';
  switch (r.name) {
    case 'book': content = bookPage(); break;
    case 'unit': content = unitPage(r.unit); break;
    case 'lesson': content = lessonPage(r.unit, r.lesson); break;
    case 'unitquiz': content = unitQuizPage(r.unit); break;
    case 'writing': content = writingPage(r.unit); break;
    case 'page': content = pdfPage(r.pdf); break;
    case 'search': content = searchPage(r.q); break;
    case 'review': content = r.unit ? reviewPage(r.unit) : comprehensivePage(); break;
    case 'bank': content = bankPage(r.bank); break;
    case 'shadowing': content = shadowingPage(); break;
    case 'account': content = accountPage(); break;
    case 'leadin': content = leadinPage(); break;
    default: content = homePage();
  }
  if (r.name === 'lesson' && r.unit && r.lesson) {
    const prev = state.progress.lessons[r.lesson] || {};
    state.progress.lessons[r.lesson] = { ...prev, lastVisit: Date.now(), done: !!prev.done };
    state.progress.lastUnit = r.unit;
    state.progress.lastLesson = r.lesson;
    lsSet('progress', state.progress);
  } else if (r.name === 'unit' && r.unit) {
    state.progress.lastUnit = r.unit;
    lsSet('progress', state.progress);
  }
  document.getElementById('root').innerHTML = layout(content, r);
  const titles = { book: 'Contents', search: 'Search', account: 'Account', shadowing: 'Shadowing', review: 'Review', leadin: 'Lead-in', page: 'Local book', bank: 'Reference bank' };
  const pageTitle = r.name === 'bank' && r.bank ? `${r.bank.charAt(0).toUpperCase()}${r.bank.slice(1)} Bank` : titles[r.name];
  document.title = (pageTitle || (r.unit ? `Unit ${r.unit}` : 'Home')) + ' · ' + SITE_TITLE;
  document.documentElement.classList.toggle('dark', state.theme === 'dark');
  document.documentElement.classList.toggle('reading', state.theme === 'reading');
  document.body.classList.remove('drawer-open');
  if (state.hideMeanings) $$('.meb-meaning').forEach(el => el.style.visibility = 'hidden');
  if (r.name === 'lesson' || r.name === 'unit') {
    const bar = $('.reading-progress');
    if (bar) bar.style.width = '100%';
  }
  bindVideo();
  syncMiniPlayer();
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
}

/* ---------------- interactions ---------------- */
function playAudio(file, label) {
  const a = $('#meb-audio');
  if (!a) return;
  a.src = enc('audio/' + file);
  state.audioLabel = label || file;
  state.audioStarted = true;
  a.playbackRate = state.audioRate;
  a.play().then(() => {
    const el = $('#audio-label'); if (el && label) el.textContent = label;
    toast('▶ ' + file);
    syncMiniPlayer();
  }).catch(() => toast('تعذّر تشغيل الملف الصوتي'));
}

function checkPractice(scope) {
  let correct = 0, total = 0;
  const boxes = [...new Set($$(`input[name^="${scope}"]`).map(i => i.closest('.meb-q')))];
  boxes.forEach(box => {
    const selected = $('input:checked', box);
    total++;
    const ok = selected && selected.value === box.dataset.answer;
    if (ok) correct++;
    box.classList.add('answered');
    $$('.meb-opt', box).forEach(opt => {
      const val = $('input', opt)?.value;
      if (val === box.dataset.answer) opt.classList.add('correct');
      else if (selected && val === selected.value) opt.classList.add('wrong');
    });
  });
  toast(`النتيجة: ${correct} / ${total}`);
}

function resetScope(scope) {
  $$(`input[name^="${scope}"]`).forEach(i => { i.checked = false; });
  $$('.meb-q.answered').forEach(b => b.classList.remove('answered'));
  $$('.meb-opt.correct,.meb-opt.wrong').forEach(o => o.classList.remove('correct', 'wrong'));
}

function submitQuiz(form) {
  const id = form.dataset.quiz;
  let correct = 0, total = 0;
  $$('.meb-q', form).forEach(box => {
    total++;
    const sel = $('input:checked', box);
    const ok = sel && sel.value === box.dataset.answer;
    if (ok) correct++;
    box.classList.add('answered');
    $$('.meb-opt', box).forEach(opt => {
      const val = $('input', opt)?.value;
      if (val === box.dataset.answer) opt.classList.add('correct');
      else if (sel && val === sel.value) opt.classList.add('wrong');
    });
  });
  const pct = total ? Math.round(correct / total * 100) : 0;
  state.progress.quizzes[id] = { score: correct, total, pct };
  lsSet('progress', state.progress);
  const res = document.getElementById('result_' + id);
  if (res) res.innerHTML = `<div class="meb-result">النتيجة: <b>${correct} / ${total}</b> · ${pct}% ${pct >= 70 ? '👏 أحسنت!' : 'راجع الدروس وحاول مرة تانية.'}</div>`;
  beep();
}

let loopA = null, loopB = null;
function setLoopStatus() {
  const s = $('#loop-status');
  if (s) s.textContent = (loopA !== null && loopB !== null) ? `تكرار: ${loopA.toFixed(1)}s → ${loopB.toFixed(1)}s` : 'لا يوجد تكرار';
}
function bindVideo() {
  const v = $('#meb-video'); if (!v) return;
  v.addEventListener('timeupdate', () => {
    if (loopA !== null && loopB !== null && loopB > loopA && v.currentTime >= loopB) v.currentTime = loopA;
  });
  setLoopStatus();
}

function bindGlobal() {
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]'); if (!el) return;
    const a = el.dataset.action;
    const video = $('#meb-video');
    if (video && ['video-play', 'loop-a', 'loop-b', 'loop-clear', 'speed'].includes(a)) {
      if (a === 'video-play') { video.paused ? video.play().catch(() => {}) : video.pause(); }
      if (a === 'loop-a') { loopA = video.currentTime; setLoopStatus(); toast('بداية التكرار: ' + loopA.toFixed(1) + 's'); }
      if (a === 'loop-b') { loopB = video.currentTime; setLoopStatus(); toast('نهاية التكرار: ' + loopB.toFixed(1) + 's'); }
      if (a === 'loop-clear') { loopA = loopB = null; setLoopStatus(); }
      if (a === 'speed') { video.playbackRate = Number(el.dataset.speed); toast('السرعة: ' + video.playbackRate + '×'); }
      return;
    }
    if (a === 'drawer') { document.body.classList.add('drawer-open'); beep(); }
    if (a === 'drawer-close') document.body.classList.remove('drawer-open');
    if (a === 'go-unit') { location.hash = `#/unit/unit-${el.dataset.unit}`; return; }
    if (a === 'back-top') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    if (a === 'mini-toggle') { const au = $('#meb-audio'); if (au) au.paused ? au.play().catch(() => {}) : au.pause(); syncMiniPlayer(); return; }
    if (a === 'mini-stop') { const au = $('#meb-audio'); if (au) { au.pause(); au.currentTime = 0; } syncMiniPlayer(); return; }
    if (a === 'mini-seek') { const au = $('#meb-audio'); if (au) au.currentTime = Math.max(0, Math.min(au.duration || 0, au.currentTime + Number(el.dataset.step || 0))); syncMiniPlayer(); return; }
    if (a === 'mini-rate') { const rates = [1, 1.25, 1.5, 0.75]; state.audioRate = rates[(rates.indexOf(state.audioRate) + 1) % rates.length]; const au = $('#meb-audio'); if (au) au.playbackRate = state.audioRate; syncMiniPlayer(); return; }
    if (a === 'check-writing') {
      const box = $(`textarea[data-writing="${el.dataset.writing}"]`);
      const text = box ? box.value.trim() : '';
      const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
      const score = Math.min(100, Math.round(words / 1.2));
      const grade = score >= 85 ? 'A' : score >= 70 ? 'B' : score >= 50 ? 'C' : 'D';
      state.progress.writing[el.dataset.writing] = { grade, score, words, at: Date.now() };
      lsSet('progress', state.progress);
      const out = $(`#writing-${el.dataset.writing}`);
      if (out) out.textContent = `Last check: grade ${grade} · ${score}% · ${words} words`;
      toast(`✎ ${grade} · ${score}% · ${words} words`); beep(); return;
    }
    if (a === 'set-accent') { setSpeechAccent(el.dataset.lang); render(); return; }
    if (a === 'say-word') { sayWord(el.dataset.word, el.dataset.lang); return; }
    if (a === 'theme') {
      const cycle = { light: 'dark', dark: 'reading', reading: 'light' };
      state.theme = cycle[state.theme] || 'light'; lsSet('theme', state.theme); render();
    }
    if (a === 'sound') { state.sound = !state.sound; lsSet('sound', state.sound); render(); }
    if (a === 'audio-play') playAudio(el.dataset.src, el.dataset.label || el.textContent.trim());
    if (a === 'share') {
      const text = `Speakout B1+ · ${progressStats().done}/${progressStats().total} lessons · Level ${progressStats().level}`;
      if (navigator.share) navigator.share({ title: SITE_TITLE, text, url: location.href }).catch(() => {});
      else if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(() => toast('تم نسخ الرابط')).catch(() => toast(text));
      else toast(text);
    }
    if (a === 'save-writing') {
      const saved = lsGet('writings', {});
      $$('textarea[data-writing]').forEach(t => { saved[t.dataset.writing] = t.value; });
      lsSet('writings', saved); toast('✓ تم حفظ المسوّدات'); beep();
    }
    if (a === 'mark-done') {
      state.progress.lessons[el.dataset.lesson] = { done: true, at: Date.now() };
      lsSet('progress', state.progress); toast('✓ تم حفظ التقدم'); beep(); render();
    }
    if (a === 'meanings') {
      state.hideMeanings = !state.hideMeanings;
      $$('.meb-meaning').forEach(x => x.style.visibility = state.hideMeanings ? 'hidden' : 'visible');
      el.textContent = state.hideMeanings ? 'إظهار المعاني' : 'إخفاء المعاني';
    }
    if (a === 'check-practice') checkPractice(el.dataset.scope);
    if (a === 'reset-practice') resetScope(el.dataset.scope);
    if (a === 'reset-quiz') {
      const form = el.closest('form'); if (form) {
        $$('input', form).forEach(i => i.checked = false);
        $$('.meb-q.answered', form).forEach(b => b.classList.remove('answered'));
        $$('.meb-opt.correct,.meb-opt.wrong', form).forEach(o => o.classList.remove('correct', 'wrong'));
        const id = form.dataset.quiz; const res = document.getElementById('result_' + id); if (res) res.innerHTML = '';
      }
    }
    if (a === 'auth-tab') {
      $$('.meb-tabs button').forEach(b => b.classList.toggle('on', b === el));
      const reg = el.dataset.tab === 'register';
      $('#confirm-field').style.display = reg ? 'flex' : 'none';
      $('#auth-submit').textContent = reg ? 'إنشاء الحساب والبدء' : 'تسجيل الدخول';
    }
    if (a === 'logout') { state.user = null; lsSet('user', null); render(); }
    if (a === 'select-video') { state.shadowFile = el.dataset.file; render(); beep(); }
    if (a === 'shadow-unit') { state.shadowUnit = Number(el.dataset.unit); state.shadowFile = ''; render(); }
  });

  document.addEventListener('submit', async (e) => {
    if (e.target.matches('form[data-quiz]')) { e.preventDefault(); submitQuiz(e.target); return; }
    if (e.target.id !== 'auth-form') return;
    e.preventDefault();
    const f = e.target, data = new FormData(f);
    const name = String(data.get('name') || '').trim(), pw = String(data.get('pw') || '');
    const reg = $('#confirm-field').style.display !== 'none';
    const users = lsGet('users', []);
    if (reg) {
      if (pw !== String(data.get('pw2') || '')) { toast('كلمات السر غير متطابقة'); return; }
      if (users.some(u => u.name.toLowerCase() === name.toLowerCase())) { toast('الاسم مستخدم بالفعل'); return; }
      users.push({ name, age: Number(data.get('age')) || 0, hash: await hashPassword(pw) });
      lsSet('users', users);
      state.user = { name, age: Number(data.get('age')) || 0 };
      toast('تم إنشاء الحساب');
    } else {
      const u = users.find(x => x.name.toLowerCase() === name.toLowerCase());
      if (!u || u.hash !== await hashPassword(pw)) { toast('بيانات الدخول غير صحيحة'); return; }
      state.user = { name: u.name, age: u.age }; toast('أهلاً ' + u.name);
    }
    lsSet('user', state.user); render();
  });

  document.addEventListener('input', (e) => {
    if (e.target.id === 'meb-search') {
      const q = e.target.value.trim().toLowerCase();
      $$('.meb-drawer-link').forEach(a => { a.style.display = !q || a.textContent.toLowerCase().includes(q) ? '' : 'none'; });
    }
    if (e.target.id === 'meb-mini-range') {
      const au = $('#meb-audio');
      if (au && Number.isFinite(au.duration)) au.currentTime = Number(e.target.value);
      syncMiniPlayer();
    }
  });

  document.addEventListener('submit', (e) => {
    if (e.target.id !== 'meb-search-form') return;
    e.preventDefault();
    const q = String(new FormData(e.target).get('q') || '').trim();
    location.hash = '#/search?q=' + encodeURIComponent(q);
    if (!q) render();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.matches('[data-action="header-search"]')) {
      const q = e.target.value.trim();
      location.hash = '#/search?q=' + encodeURIComponent(q);
      if (!q) render();
    }
  });

  const audio = $('#meb-audio');
  if (audio) {
    ['play', 'pause', 'ended', 'loadedmetadata', 'timeupdate'].forEach(evt => audio.addEventListener(evt, () => {
      if (evt === 'play') state.audioStarted = true;
      syncMiniPlayer();
    }));
  }
  window.addEventListener('scroll', () => {
    const btn = $('#meb-back-top');
    if (btn) btn.classList.toggle('visible', window.scrollY > 700);
  }, { passive: true });
  window.addEventListener('hashchange', () => { render(); beep(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') document.body.classList.remove('drawer-open'); });
}

/* ---------------- boot ---------------- */
async function boot() {
  state.theme = lsGet('theme', 'dark');
  state.sound = lsGet('sound', true);
  state.user = lsGet('user', null);
  state.progress = { lessons: {}, quizzes: {}, writing: {}, lastUnit: 0, lastLesson: '', ...(lsGet('progress', {}) || {}) };
  state.progress.writing = state.progress.writing || {};
  state.progress.quizzes = state.progress.quizzes || {};
  state.progress.lessons = state.progress.lessons || {};
  bindGlobal();
  try { await loadData(); } catch (e) { console.error('Data load failed', e); }
  render();
}
boot();

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
  spark: ['M12 3v4m0 10v4m9-9h-4M7 12H3m13.5-5.5-2.8 2.8m-3.4 3.4-2.8 2.8m8.6-8.6 2.8-2.8M7.3 16.7 4.5 19.5']
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
  progress: { lessons: {}, quizzes: {} }, transcripts: '', shadowUnit: 1, shadowFile: ''
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const enc = (f) => './media/' + String(f || '').replace(/^\/+/, '').split('/').map(s => encodeURIComponent(s)).join('/');

function lsGet(k, d) { try { const v = localStorage.getItem('meb_' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
function lsSet(k, v) { try { localStorage.setItem('meb_' + k, JSON.stringify(v)); } catch (e) { /* storage full/blocked */ } }

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
  if (p[0] === 'trainer') return { name: 'trainer' };
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
        <button class="meb-icon-btn" data-action="sound" aria-label="Sound effects ${state.sound ? 'on' : 'off'}. Toggle sound" aria-pressed="${state.sound}">${state.sound ? icon('volume', 17) : icon('volumeOff', 17)}</button>
        <button class="meb-icon-btn" data-action="theme" aria-label="Switch theme. Current theme: ${state.theme}">${themeIcon}</button>
      </div>
    </div>
  </header>`;
}

function drawer() {
  const units = Array.from({ length: 8 }, (_, i) => unitData(i + 1));
  return `<div class="meb-drawer-backdrop" data-action="drawer-close"></div>
  <aside class="meb-drawer" aria-label="Contents">
    <div class="meb-drawer-head"><div><div class="meb-kicker">Course companion</div><strong class="meb-title" style="font-size:1.35rem">Contents</strong></div><button class="meb-icon-btn" data-action="drawer-close" aria-label="Close">✕</button></div>
    <input class="meb-drawer-search" id="meb-search" placeholder="ابحث عن درس / كلمة…" />
    <div class="meb-drawer-group"><h3>Quick links</h3>
      <a class="meb-drawer-link" href="#/book"><b>▤</b> Contents of this course</a>
      <a class="meb-drawer-link" href="#/search"><b>⌕</b> Search the course</a>
      <a class="meb-drawer-link" href="#/review"><b>★</b> المراجعة الشاملة</a>
      <a class="meb-drawer-link" href="#/shadowing"><b>▶</b> استوديو الشادونج</a>
      <a class="meb-drawer-link" href="#/trainer"><b>◎</b> خطّة التعلّم</a>
      ${pdfList().map(p => `<a class="meb-drawer-link" href="${p.href}"><b>PDF</b> ${esc(p.file)}</a>`).join('')}
      <a class="meb-drawer-link" href="#/bank/grammar"><b>▲</b> Grammar Bank</a>
      <a class="meb-drawer-link" href="#/bank/vocabulary"><b>▲</b> Vocabulary Bank</a>
      <a class="meb-drawer-link" href="#/bank/writing"><b>▲</b> Writing Bank</a>
    </div>
    ${units.map(u => `<div class="meb-drawer-group"><h3>${esc(u.title || UNIT_TITLES[u.unit]?.[0] || '')}</h3>
      <a class="meb-drawer-link" href="#/unit/unit-${u.unit}"><b>${u.unit}</b> Unit overview</a>
      ${(u.lessons || []).map(l => `<a class="meb-drawer-link" href="#/unit/unit-${u.unit}/lesson/${esc(l.id)}"><b>${esc(l.code || l.id)}</b> ${esc(l.title || '')}</a>`).join('')}
      <a class="meb-drawer-link" href="#/unit/unit-${u.unit}/lesson/${u.unit}r"><b>★</b> Unit ${u.unit} Review</a>
      <a class="meb-drawer-link" href="#/unit/unit-${u.unit}/quiz"><b>?</b> Unit ${u.unit} Quiz</a>
      <a class="meb-drawer-link" href="#/unit/unit-${u.unit}/writing"><b>✎</b> Unit ${u.unit} Writing</a>
    </div>`).join('')}
  </aside>`;
}

function footer() {
  return `<footer class="meb-footer">
    <p>Speakout 3rd Edition B1+ · course companion – condensed from the local book for studying with your class.</p>
    <p>المصدر: كتاب Speakout B1+ المحلي · التصميم: نسخة طبق الأصل من الموقع المرجعي · <a href="#/book">الفهرس</a></p>
  </footer>`;
}

function layout(content, r) {
  return `${header()}<main class="meb-shell" id="main"><div class="meb-page">${content}</div></main>${footer()}${drawer()}`;
}

/* ---------------- pages ---------------- */
function homePage() {
  const units = Array.from({ length: 8 }, (_, i) => unitData(i + 1));
  const s = progressStats();
  const lessons = allLessons();
  const next = lessons.find(x => !state.progress.lessons[x.l.id]?.done) || lessons[0];
  const continueHref = next ? `#/unit/unit-${next.u.unit}/lesson/${next.l.id}` : '#/review';
  const badges = [
    ['first', 'أول درس', s.done >= 1], ['eight', 'ثمانية دروس', s.done >= 8],
    ['sixteen', 'نص الكتاب', s.done >= 16], ['all', 'كل الدروس', s.done >= s.total],
    ['quiz', 'أول كويز', s.quizzes >= 1]
  ];
  return `<section class="title-page fade-up" style="margin:1rem auto 2.5rem">
    <span class="badge">SPEAKOUT · B1+ · 3RD EDITION</span>
    <h1 class="display" style="font-size:clamp(3.5rem,12vw,5.5rem);margin:.6rem 0 .1rem">Speakout</h1>
    <div class="meb-kicker">THE LINE · B1+ · COURSE COMPANION</div>
    <p class="meb-ar meb-muted" style="max-width:34rem;margin:1.1rem auto">محتوى كتاب Speakout B1+ ملخّص ومنظّم في دروس قصيرة: مفردات بالمعاني، قواعد بأمثلة، استماع وفيديو، وتمارين وكويزات بتصحيح فوري.</p>
    <a class="page-turn" href="${continueHref}">${icon('book', 16)} ${s.done ? 'Continue reading' : 'Start reading'}</a>
  </section>

  <section class="meb-card meb-progress-card fade-up">
    <div class="meb-progress-top">
      <div class="meb-stats">
        <div class="meb-stat"><span>Level</span><b>${s.level}</b></div>
        <div class="meb-stat"><span>XP</span><b>${s.xp}</b></div>
        <div class="meb-stat"><span>${icon('flame', 13)} Streak</span><b>${s.streak}</b></div>
        <div class="meb-stat"><span>Lessons</span><b>${s.done}/${s.total}</b></div>
      </div>
      <button class="meb-btn ghost" data-action="share">${icon('share', 15)} Share</button>
    </div>
    <div class="meb-bar-track"><div class="meb-bar-fill" style="width:${Math.max(s.levelPct, s.pct)}%"></div></div>
    <p class="meb-muted" style="font-size:.75rem;margin:.5rem 0 0">${s.pct}% من الدروس اكتمل · ${s.levelPct}% للمستوى الجاي</p>
  </section>

  ${state.user ? '' : `<a class="meb-banner accent fade-up" href="#/account">
    <span class="banner-ic">${icon('spark', 20)}</span>
    <span class="banner-body"><strong>احفظ تقدّمك وابدأ من حيث وقفت</strong><small>حساب محلي على جهازك — بدون خادم أو بيانات شخصية.</small></span>
    <span class="banner-go">${icon('chevronRight', 18)}</span></a>`}

  <a class="meb-banner fade-up" href="#/review">
    <span class="banner-ic">${icon('layers', 20)}</span>
    <span class="banner-body"><strong>المراجعة الشاملة</strong><small>كلمات بالمعاني، ملخص قواعد، وكويز ${Math.min(25, s.total)} سؤال بتصحيح فوري.</small></span>
    <span class="banner-go">${icon('chevronRight', 18)}</span></a>

  <a class="meb-banner warm fade-up" href="#/trainer">
    <span class="banner-ic">${icon('mic', 20)}</span>
    <span class="banner-body"><strong>خطّة تعلّمك</strong><small>ترتيب الدروس والمراجعة والشادونج في مسار واحد واضح.</small></span>
    <span class="banner-go">${icon('chevronRight', 18)}</span></a>

  <a class="meb-banner fade-up" href="#/shadowing">
    <span class="banner-ic">${icon('volume', 20)}</span>
    <span class="banner-body"><strong>استوديو الشادونج</strong><small>16 فيديو من الكتاب مع تكرار جملة وتحكّم في السرعة والنص.</small></span>
    <span class="banner-go">${icon('chevronRight', 18)}</span></a>

  <a class="meb-banner fade-up" href="${pdfList()[0]?.href || '#/book'}">
    <span class="banner-ic">${icon('book', 20)}</span>
    <span class="banner-body" dir="rtl" lang="ar"><strong>الجزء الأول · كتاب Speakout B1+</strong><small>النسخة الأصلية من الكتاب المحلي + نصوص الاستماع والفيديو.</small></span>
    <span class="banner-go">${icon('chevronRight', 18)}</span></a>

  <section style="margin-top:3rem">
    <div class="meb-kicker fade-up">The line · 8 units</div>
    <h2 class="meb-title fade-up" style="font-size:2rem;margin:.3rem 0 1rem">مسار الكورس</h2>
    <div class="meb-line fade-up">
      ${units.map(u => {
        const done = (u.lessons || []).filter(l => state.progress.lessons[l.id]?.done).length;
        const total = (u.lessons || []).length || 4;
        return `<a class="meb-station" href="#/unit/unit-${u.unit}"><span class="num">${u.unit}</span>
          <span><strong>UNIT ${u.unit} · ${esc(u.title || '')}</strong><small>${esc(u.aim || '')} · ${done}/${total}</small></span>
          <span class="meb-pill">${Math.round(done / total * 100)}%</span></a>`;
      }).join('')}
    </div>
  </section>

  <section class="fade-up" style="margin-top:3rem">
    <div class="meb-kicker">Achievements</div>
    <h2 class="meb-title" style="font-size:1.5rem;margin:.3rem 0">إنجازاتك</h2>
    <div class="meb-badges">${badges.map(b => `<span class="meb-badge-item ${b[2] ? 'earned' : ''}">${b[2] ? icon('check', 13) : '·'} ${esc(b[1])}</span>`).join('')}</div>
  </section>

  <section class="book-page meb-printed fade-up" style="margin-top:3rem">
    <div class="running-head"><span>Contents</span><span class="rh-right">SPEAKOUT B1+ · 3RD EDITION</span></div>
    <h2 class="meb-title" style="font-size:1.6rem;margin:.2rem 0 1rem">Printed contents</h2>
    ${units.map(u => `<a class="toc-row" href="#/unit/unit-${u.unit}"><strong>${u.unit}</strong><span>${esc(u.title || '')}</span><span class="toc-dots"></span><span class="toc-page">${esc(u.pages || '')}</span></a>`).join('')}
    <a class="toc-row" href="#/unit/lead-in"><strong>·</strong><span>Lead-in</span><span class="toc-dots"></span><span class="toc-page">6</span></a>
    <a class="toc-row" href="#/bank/grammar"><strong>·</strong><span>Grammar / Vocabulary / Writing banks</span><span class="toc-dots"></span><span class="toc-page">—</span></a>
  </section>`;
}

function bookPage() {
  const units = Array.from({ length: 8 }, (_, i) => unitData(i + 1));
  return `<section class="title-page fade-up" style="margin-bottom:3rem">
    <div class="meb-kicker">SPEAKOUT · LEVEL B1+</div>
    <div class="meb-kicker" style="margin-top:.6rem">CONTENTS OF THE BOOK</div>
    <h1 class="meb-title" style="font-size:3.2rem;margin:.8rem 0">Speakout</h1>
    <p class="meb-muted" style="font-size:.85rem">Frances Eales • Steve Oakes · 3rd edition · condensed companion</p>
  </section>
  <div class="meb-grid cols-4 fade-up" style="grid-template-columns:repeat(auto-fill,minmax(8rem,1fr))">
    ${units.map(u => `<a class="meb-cover" href="#/unit/unit-${u.unit}"><div class="cover-top"><b>${u.unit}</b><span style="font-size:.7rem;opacity:.85">B1+ · UNIT</span></div><div class="cover-cap"><strong>${esc(u.title || '')}</strong><br><span class="meb-muted">pages ${esc(u.pages || '')}</span></div></a>`).join('')}
  </div>
  <section style="margin-top:3rem">
    <h2 class="meb-title fade-up" style="font-size:1.8rem">All lessons</h2>
    ${units.map(u => `<div class="meb-card fade-up" style="margin:.8rem 0">
      <div style="display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap"><strong>UNIT ${u.unit} · ${esc(u.title || '')}</strong><span class="meb-muted" style="font-size:.8rem">p. ${esc(u.pages || '')}</span></div>
      <p class="meb-muted" style="font-size:.85rem;margin:.25rem 0 .6rem">${esc(u.aim || '')}</p>
      <div style="display:flex;flex-wrap:wrap;gap:.5rem">
        ${(u.lessons || []).map(l => `<a class="meb-pill" href="#/unit/unit-${u.unit}/lesson/${esc(l.id)}">${esc(l.code || l.id)} · ${esc(l.title || '')}</a>`).join('')}
        <a class="meb-pill" href="#/unit/unit-${u.unit}/lesson/${u.unit}r">★ Review</a>
      </div></div>`).join('')}
    <h2 class="meb-title" style="font-size:1.8rem;margin-top:2rem">Reference banks</h2>
    <div class="meb-grid cols-3">
      <a class="meb-feature" href="#/bank/grammar"><div class="ic">▲</div><h3>Grammar Bank</h3><p>كل قواعد الدروس في مكان واحد.</p></a>
      <a class="meb-feature" href="#/bank/vocabulary"><div class="ic">▲</div><h3>Vocabulary Bank</h3><p>المفردات والمعاني حسب الوحدة.</p></a>
      <a class="meb-feature" href="#/bank/writing"><div class="ic">▲</div><h3>Writing Bank</h3><p>مهام الكتابة والمهارات.</p></a>
    </div>
  </section>`;
}

function unitPage(n) {
  const u = unitData(n);
  const done = (u.lessons || []).filter(l => state.progress.lessons[l.id]?.done).length;
  const total = (u.lessons || []).length || 4;
  const pct = Math.round(done / total * 100);
  const next = n < 8 ? unitData(n + 1) : null;
  return `<div class="book-page fade-up" style="padding:1.5rem">
    <div class="meb-kicker" style="text-align:right">STATION UNIT ${n} · ${esc(u.titleAr || '')}</div>
    <div class="meb-muted" style="font-size:.72rem;text-align:right">PAGES ${esc(u.pages || '')}</div>
    <div style="display:flex;gap:1.5rem;align-items:flex-start;margin-top:1rem;flex-wrap:wrap">
      <div style="font-family:var(--font-display);font-size:4.5rem;line-height:1;color:var(--color-brand-600)">${n}</div>
      <div style="flex:1;min-width:min(100%,20rem)">
        <div class="meb-kicker">UNIT ${n} · ${esc(u.title || '')}</div>
        <h1 class="meb-title" style="font-size:2.4rem;margin:.5rem 0">${esc(u.aim || UNIT_TITLES[n]?.[0] || '')}</h1>
        <p class="meb-muted" style="font-size:.9rem;max-width:38rem">${esc((u.lessons || []).map(l => l.title).join(' · '))}</p>
      </div>
      <div class="meb-card" style="width:13rem"><div class="meb-kicker">Progress</div><strong style="font-size:1.5rem">${done}/${total} (${pct}%)</strong>
        <div style="height:.5rem;background:var(--line);border-radius:999px;margin-top:.5rem;overflow:hidden"><div style="height:100%;width:${pct}%;background:linear-gradient(90deg,var(--color-brand-500),var(--color-accent-500),var(--color-warm-500));transition:width .7s"></div></div>
      </div>
    </div>
    <div class="meb-grid cols-2" style="margin-top:1.8rem">
      <a class="meb-feature" href="#/unit/unit-${n}/lesson/${n}r"><div class="ic">✎</div><h3>Unit ${n} writing desk</h3><p>مراجعة الوحدة + كتابة قصيرة + تقييم.</p></a>
      <a class="meb-feature" href="#/unit/unit-${n}/lesson/${n}r"><div class="ic">✓</div><h3>Take the Unit ${n} Quiz</h3><p>${(u.review?.quiz || []).length || 12} سؤالاً · قواعد ومفردات · تصحيح فوري.</p></a>
    </div>
    <h2 class="meb-title" style="font-size:1.6rem;margin:2rem 0 .8rem">IN THIS CHAPTER</h2>
    <div class="meb-grid">
      ${(u.lessons || []).map(l => `<a class="meb-station" href="#/unit/unit-${n}/lesson/${esc(l.id)}"><span class="num" style="font-size:.9rem">${esc(l.code || l.id)}</span><span><strong>${esc(l.title || '')}</strong><small>${esc((l.goals || []).join(' · ') || (l.grammar?.title || ''))}</small></span><span class="meb-pill">p.${esc(l.pages || '')}</span></a>`).join('')}
      <a class="meb-station" href="#/unit/unit-${n}/lesson/${n}r"><span class="num" style="font-size:1rem">★</span><span><strong>Unit ${n} Review</strong><small>quiz + summary</small></span><span class="meb-pill">p.${esc((u.pages || '').split('–').pop() || '')}</span></a>
    </div>
    ${next ? `<div style="margin-top:2rem"><div class="meb-kicker">NEXT UNIT</div><a class="meb-link" href="#/unit/unit-${n + 1}">Unit ${n + 1}: ${esc(next.aim || next.title || '')} →</a></div>` : ''}
  </div>`;
}

function audioSection(l, n) {
  const tracks = (l.listening || []).filter(t => t.audioFile);
  if (!tracks.length) return '';
  return `<div class="meb-section" id="listening">
    <h2>Listening</h2>
    <div class="meb-audio-bar">
      <button data-action="audio-play" data-src="${esc(tracks[0].audioFile)}">▶ تشغيل</button>
      <span class="meb-muted" id="audio-label" style="font-size:.82rem">${esc(tracks[0].track || 'Audio')} · ${esc(tracks[0].summary || '')}</span>
    </div>
    ${tracks.map(t => `<button class="meb-track" data-action="audio-play" data-src="${esc(t.audioFile)}" data-label="${esc(t.track || '')}">🎧 ${esc(t.track || t.audioFile)} — ${esc(t.summary || '')}</button>`).join('')}
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
    <button class="meb-btn ghost" data-action="meanings">${state.hideMeanings ? 'إظهار المعاني' : 'إخفاء المعاني'}</button>
    <table class="meb-table"><thead><tr><th>WORD</th><th class="meb-meaning">MEANING</th><th>EXAMPLE / NOTE</th></tr></thead><tbody>
      ${words.map(w => `<tr><td><strong>${esc(w.word)}</strong></td><td class="meb-meaning">${esc(w.ar || '')}</td><td>${esc(w.example || '')}</td></tr>`).join('')}
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
      ${groups.map(g => `<div class="meb-card" style="margin:.9rem 0"><div class="meb-kicker">UNIT ${g.u.unit} · ${esc(g.u.title || '')}</div>
        <table class="meb-table"><thead><tr><th>WORD</th><th>MEANING</th><th>EXAMPLE</th><th>LESSON</th></tr></thead><tbody>
        ${g.words.map(w => `<tr><td><strong>${esc(w.word)}</strong></td><td>${esc(w.ar || '')}</td><td>${esc(w.example || '')}</td><td>${esc(w.lesson || '')}</td></tr>`).join('')}
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
  const tasks = (u.lessons || []).map(l => ({ l, items: [l.writing].flat(Infinity).filter(Boolean) })).filter(x => x.items.length);
  return `<div class="fade-up"><a class="meb-link" href="#/unit/unit-${n}">← Unit ${n}</a>
    <div class="meb-kicker" style="margin-top:1rem">UNIT ${n} · WRITING BANK</div>
    <h1 class="meb-title" style="font-size:2.4rem;margin:.4rem 0">Unit ${n} Writing</h1>
    <p class="meb-muted" style="font-size:.88rem">Writing prompts from the local B1+ book. Drafts are saved only on this device.</p>
    ${tasks.map(({ l, items }) => `<div class="meb-card" style="margin:.9rem 0">
      <div class="meb-kicker">${esc(l.code || l.id)} · p.${esc(l.pages || '')}</div>
      ${items.map(t => `<p style="font-size:.9rem">${esc(String(t))}</p>`).join('')}
      <textarea class="meb-writing-area" data-writing="${esc(l.id)}" placeholder="Write your answer here…">${esc(saved[l.id] || '')}</textarea>
    </div>`).join('') || '<div class="meb-card">No writing tasks for this unit.</div>'}
    <div style="display:flex;gap:.6rem;flex-wrap:wrap;margin-top:1rem">
      <button class="meb-btn" data-action="save-writing" data-unit="${n}">Save drafts</button>
      <a class="meb-btn ghost" href="#/unit/unit-${n}/quiz">Unit quiz →</a></div></div>`;
}

function pdfPage(file) {
  const pdfs = pdfList();
  const chosen = pdfs.find(p => (p.siteFile || p.file) === file) || pdfs[0];
  return `<div class="fade-up"><a class="meb-link" href="#/book">← Contents</a>
    <div class="meb-kicker" style="margin-top:1rem">LOCAL BOOK · PDF</div>
    <h1 class="meb-title" style="font-size:2rem;margin:.4rem 0">${esc(chosen?.file || 'PDF')}</h1>
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

function trainerPage() {
  const s = progressStats();
  const steps = [
    ['1', 'ابدأ بالدرس', 'افتح الدرس التالي واقرأ الملخص والأمثلة.', '#/' + (allLessons()[0] ? `unit/unit-${allLessons()[0].u.unit}/lesson/${allLessons()[0].l.id}` : '')],
    ['2', 'استمع وشاهد', 'شغّل ملفات الاستماع والفيديو المرتبطة بالدرس.', '#/shadowing'],
    ['3', 'تدرّب', 'حلّ تمارين الدرس وتأكد من الإجابات.', `#/unit/unit-${s.done ? Math.min(8, Math.ceil(s.done / 4)) : 1}/quiz`],
    ['4', 'راجع', 'استخدم البنوك والمراجعة الشاملة قبل الكويز النهائي.', '#/review']
  ];
  return `<div class="fade-up"><div class="meb-kicker" style="text-align:center">SPEAKOUT B1+ · STUDY PLAN</div>
    <h1 class="meb-title" style="font-size:2.6rem;text-align:center;margin:.4rem 0">خطّة تعلّمك</h1>
    <p class="meb-ar meb-muted" style="max-width:36rem;margin:0 auto 1.5rem">أربع خطوات بسيطة تساعدك تنتظم بين الدروس والاستماع والمراجعة — كل المحتوى من كتابك المحلي.</p>
    <div class="meb-grid cols-2">${steps.map(st => `<a class="meb-feature" href="${st[3]}"><div class="ic">${st[0]}</div><h3>${st[1]}</h3><p>${st[2]}</p></a>`).join('')}</div>
    <p style="text-align:center;margin-top:1.5rem"><a class="meb-btn" href="#/">العودة للرئيسية</a></p></div>`;
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
    case 'trainer': content = trainerPage(); break;
    case 'review': content = r.unit ? reviewPage(r.unit) : comprehensivePage(); break;
    case 'bank': content = bankPage(r.bank); break;
    case 'shadowing': content = shadowingPage(); break;
    case 'account': content = accountPage(); break;
    case 'leadin': content = leadinPage(); break;
    default: content = homePage();
  }
  document.getElementById('root').innerHTML = layout(content, r);
  const titles = { book: 'Contents', search: 'Search', trainer: 'Study plan', account: 'Account', shadowing: 'Shadowing', review: 'Review' };
  document.title = (titles[r.name] || (r.unit ? `Unit ${r.unit}` : 'Home')) + ' · ' + SITE_TITLE;
  document.documentElement.classList.toggle('dark', state.theme === 'dark');
  document.documentElement.classList.toggle('reading', state.theme === 'reading');
  document.body.classList.remove('drawer-open');
  if (state.hideMeanings) $$('.meb-meaning').forEach(el => el.style.visibility = 'hidden');
  if (r.name === 'lesson' || r.name === 'unit') {
    const bar = $('.reading-progress');
    if (bar) bar.style.width = '100%';
  }
  bindVideo();
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
}

/* ---------------- interactions ---------------- */
function playAudio(file, label) {
  const a = $('#meb-audio');
  if (!a) return;
  a.src = enc('audio/' + file);
  a.play().then(() => {
    const el = $('#audio-label'); if (el && label) el.textContent = label;
    toast('▶ ' + file);
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

  window.addEventListener('hashchange', () => { render(); beep(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') document.body.classList.remove('drawer-open'); });
}

/* ---------------- boot ---------------- */
async function boot() {
  state.theme = lsGet('theme', 'dark');
  state.sound = lsGet('sound', true);
  state.user = lsGet('user', null);
  state.progress = lsGet('progress', { lessons: {}, quizzes: {} });
  bindGlobal();
  try { await loadData(); } catch (e) { console.error('Data load failed', e); }
  render();
}
boot();

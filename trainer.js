'use strict';

/* ============================================================
   Online English trainer promo — vanilla port of the B1 feature.
   Same copy, prices, links and assets as speakout-B1/src/content/trainer.ts
   and src/pages/TrainerPage.tsx. No analytics/backend calls.
   Exposes window.MEB_TRAINER = { page, homeBanner, shellExtras, afterRender, init }.
   ============================================================ */
(function () {
  const WHATSAPP = '201224552685';
  const WHATSAPP_DISPLAY = '01224552685';
  const TRAINER_LINK = 'https://abu-bakr-english.abwrabhmhmwd180.workers.dev/';
  const SHOW_AFTER_MS = 1000;
  const SPONSOR_KEY = 'sponsor-dismissed';
  const BAR_H = '64px';

  const TRAINER = {
    name: 'Abu Bakr Mokhtar',
    nameAr: 'أبو بكر مختار',
    role: 'Professional online English trainer',
    roleAr: 'مدرب إنجليزي أونلاين محترف',
    years: 9,
    tagline: 'Nine years of live 1:1 teaching — a structured plan built around your level, your goals and your real schedule.',
    taglineAr: 'تسع سنوات من التدريس المباشر ١:١ — خطة مذاكرة منظّمة تُبنى على مستواك وهدفك وجدولك الفعلي.',
    bio: [
      'I teach English online the way it actually gets used: you talk from the first minute, and every grammar point lands on something you just said out loud.',
      'Nine years of weekly students taught me what keeps people going — small, measurable wins and a plan that fits a real schedule, not a perfect one.',
    ],
    bioAr: [
      'بشرح إنجليزي أونلاين بالطريقة اللي بتتقال فعلاً: إنت بتتكلم من أول دقيقة، وكل قاعدة جرامر بتترجم لشيء قلته بصوت عالي.',
      'تسع سنين مع طلاب أسبوعياً علمتني اللي بيخلّي الناس تكمّل — تقدّم صغير ملموس وخطة تناسب جدول حقيقي، مش مثالي.',
    ],
    languages: ['Arabic', 'English'],
  };

  const TRAINER_STATS = [
    { value: '9+', label: 'years teaching', labelAr: 'سنة خبرة' },
    { value: '1:1', label: 'live lessons', labelAr: 'حصص لايف' },
    { value: '60', label: 'minutes each', labelAr: 'دقيقة للحصة' },
    { value: 'Free', label: 'diagnostic test', labelAr: 'اختبار تحديد مستوى' },
  ];

  const PREPAY_RULES = [
    { months: 3, off: 0.1 },
    { months: 12, off: 0.15 },
  ];

  function prepayFor(price) {
    return PREPAY_RULES.map(function (r) {
      const total = Math.round((price * r.months * (1 - r.off)) / 10) * 10;
      return { months: r.months, total: total, save: price * r.months - total };
    });
  }

  function perLesson(price, perMonth) {
    return Math.round(price / perMonth / 5) * 5;
  }

  const PLANS = [
    {
      id: 'weekly', name: 'Weekly', nameAr: 'حصة في الأسبوع', perWeek: 1, perMonth: 4,
      perLesson: perLesson(450, 4), price: 450, prepay: prepayFor(450),
      features: [
        { en: '1 live 1:1 lesson a week (60 min)', ar: 'حصة لايف ١:١ كل أسبوع (٦٠ دقيقة)' },
        { en: 'Free diagnostic in the first week', ar: 'اختبار تحديد مستوى مجاني في أول أسبوع' },
        { en: 'Personal study plan for your goal', ar: 'خطة مذاكرة شخصية على هدفك' },
        { en: 'Homework + voice-note correction', ar: 'واجبات مع تصحيح صوتي' },
        { en: 'Same weekly slot, cancel any month', ar: 'نفس ميعاد كل أسبوع، وتلغي في أي شهر' },
      ],
    },
    {
      id: 'twice', name: 'Twice a week', nameAr: 'حصتين في الأسبوع', perWeek: 2, perMonth: 8,
      perLesson: perLesson(800, 8), price: 800, badge: 'Most popular', featured: true, prepay: prepayFor(800),
      features: [
        { en: '2 live 1:1 lessons a week (60 min)', ar: 'حصتين لايف ١:١ كل أسبوع (٦٠ دقيقة)' },
        { en: 'Free diagnostic in the first week', ar: 'اختبار تحديد مستوى مجاني في أول أسبوع' },
        { en: 'Writing corrected every lesson', ar: 'تصحيح الكتابة في كل حصة' },
        { en: 'Monthly progress report', ar: 'تقرير تقدّم كل شهر' },
        { en: 'Free course-material pack', ar: 'ملازم ومواد كورس مجانية' },
        { en: 'Priority booking on your slots', ar: 'أولوية حجز على مواعيدك' },
      ],
    },
    {
      id: 'thrice', name: 'Intensive', nameAr: '٣ حصص في الأسبوع', perWeek: 3, perMonth: 12,
      perLesson: perLesson(1100, 12), price: 1100, badge: 'Fastest progress', prepay: prepayFor(1100),
      features: [
        { en: '3 live 1:1 lessons a week (60 min)', ar: '٣ حصص لايف ١:١ كل أسبوع (٦٠ دقيقة)' },
        { en: 'Everything in the twice-a-week plan', ar: 'كل مزايا باقة الحصتين' },
        { en: 'Exam or interview simulation', ar: 'محاكاة امتحان أو مقابلة' },
        { en: 'Daily voice notes between lessons', ar: 'ملاحظات صوتية يومية بين الحصص' },
        { en: 'Free make-up lessons', ar: 'حصص تعويض مجانية' },
        { en: 'Certificate of completion', ar: 'شهادة إتمام' },
      ],
    },
  ];

  const LESSONS_PER_MONTH_NOTE =
    'All plans run on a monthly subscription. Lesson counts assume a 4-week month.';

  const WHY = [
    {
      id: 'speak-first', title: 'You talk in minute one', titleAr: 'إنت بتتكلم من أول دقيقة',
      body: 'No silent lectures. Every lesson is built around you producing English, not watching me explain it.',
      bodyAr: 'مفيش محاضرات صامتة. كل حصة مبنية على إنك إنت اللي بتنتج إنجليزي، مش أنا اللي بشرح.', icon: 'mic',
    },
    {
      id: 'your-goal', title: 'Built around your goal', titleAr: 'مبنية على هدفك',
      body: 'Exam, job interview, travel, or movies. We use your real life as the textbook.',
      bodyAr: 'امتحان، مقابلة شغل، سفر، أو أفلام. بنستخدم حياتك الحقيقية ككتاب.', icon: 'target',
    },
    {
      id: 'corrected-voice', title: 'You speak, I correct', titleAr: 'إنت تتكلم، أنا صحّح',
      body: 'You record a short answer, I send it back with the exact mistakes fixed — not a wall of grammar rules.',
      bodyAr: 'بتبعت إجابة قصيرة صوتية، وأرجعها لك مصحّحة — مش محاضرة قواعد.', icon: 'chat',
    },
    {
      id: 'diagnostic', title: 'Level tested properly', titleAr: 'مستواك بيتحدد صح',
      body: 'A real diagnostic in week one, so you never pay for lessons that are too easy or too hard.',
      bodyAr: 'اختبار تحديد مستوى في الأسبوع الأول، عشان ما تدفعش على حصص سهلة عليك أو صعبة.', icon: 'award',
    },
    {
      id: 'flexible', title: 'Your schedule, not mine', titleAr: 'مواعيدك إنت',
      body: 'A fixed weekly slot you keep for months, plus free make-up lessons when life happens.',
      bodyAr: 'ميعاد أسبوعي ثابت تحافظ عليه شهور، وحصص تعويض مجانية لما الحياة تتأخر.', icon: 'clock',
    },
    {
      id: 'course-fit', title: 'Fits this course', titleAr: 'متماشي مع الكورس ده',
      body: 'A2 Speakout is the practice lab. Nine years of marking writing and speaking means he knows exactly where A2 students slip.',
      bodyAr: 'كورس A2 هو المعمل. تسع سنين في تصحيح الكتابة والمحادثة معناها إنه عارف بالظبط A2 بيعيط فين.', icon: 'book',
    },
  ];

  const STEPS = [
    {
      id: 'send', title: 'Send one WhatsApp message', titleAr: 'ابعت رسالة واتساب واحدة',
      body: 'Tell me your level and what you need. No forms, no waiting.',
      bodyAr: 'قولي مستواك واللي محتاجه. من غير فورم ومن غير انتظار.', icon: 'chat',
    },
    {
      id: 'diagnostic', title: 'Free 20-minute diagnostic', titleAr: 'اختبار مجاني ٢٠ دقيقة',
      body: 'We find your level together and agree on the goal.',
      bodyAr: 'نحدد مستواك مع بعض ونتفق على الهدف.', icon: 'target',
    },
    {
      id: 'plan', title: 'Choose your weekly rhythm', titleAr: 'اختار عدد الحصص في الأسبوع',
      body: 'One lesson, two, or three a week — then pick monthly, 3 months, or a year.',
      bodyAr: 'حصة أو اتنين أو تلاتة في الأسبوع — ثم اختار تدفع شهري ولا ٣ شهور ولا سنة.', icon: 'layers',
    },
    {
      id: 'start', title: 'First lesson booked', titleAr: 'أول حصة محجوزة',
      body: 'You get the Zoom link, the study plan, and the first homework before we start.',
      bodyAr: 'هتاخد لينك زووم والخطة وأول واجب قبل ما نبدأ.', icon: 'spark',
    },
  ];

  const FAQ = [
    {
      q: 'How many lessons a week do I get?', qAr: 'كام حصة في الأسبوع؟',
      a: 'You choose: one lesson a week (about 4 a month), two a week (about 8), or three a week (about 12). The price drops the more you take.',
      aAr: 'إنت بتختار: حصة في الأسبوع (يعني ٤ في الشهر تقريباً)، ولا اتنين (٨)، ولا تلاتة (١٢). وكل ما تاخد أكتر السعر بيقل.',
    },
    {
      q: 'Do I need a specific level to start?', qAr: 'محتاج مستوى معين عشان أبدأ؟',
      a: 'No. The diagnostic in the first call places you exactly, from beginner to advanced.',
      aAr: 'لأ. اختبار تحديد المستوى في أول مكالمة بيحدد مستواك بالظبط، من المبتدئ للمتقدم.',
    },
    {
      q: 'How do the lessons run?', qAr: 'الحصص بتمشي إزاي؟',
      a: 'Live on Zoom, 60 minutes, one-to-one. Screen-share for pronunciation and writing, camera on for speaking.',
      aAr: 'لايف على زووم، ٦٠ دقيقة، واحد لواحد. شيرنج الشاشة للنطق والكتابة، والكاميرا مفتوحة وقت الكلام.',
    },
    {
      q: 'What if I miss a lesson?', qAr: 'لو فاتتني حصة؟',
      a: 'You move it to another slot in the same week, or book a free make-up lesson.',
      aAr: 'تأجلها لشق تاني في نفس الأسبوع، أو تحجز حصة تعويض مجانية.',
    },
    {
      q: 'How does payment work?', qAr: 'الدفع بيتم إزاي؟',
      a: 'Every plan is a monthly subscription, paid by the month. You can also pay 3 months ahead and save 10%, or a full year and save 15%. Everything is confirmed on WhatsApp.',
      aAr: 'كل الباقات اشتراك شهري بيتدفع بالشهر. ينفع كمان تدفع ٣ شهور مقدماً وتوفّر ١٠٪، أو سنة وتوفّر ١٥٪. والتأكيد كله على الواتساب.',
    },
    {
      q: 'Do I get a certificate?', qAr: 'هل بتاخد شهادة؟',
      a: 'Yes, on the intensive plan you get a certificate of completion after you finish the course.',
      aAr: 'أيوه، في الباقة المكثفة (٣ حصص) بتاخد شهادة إتمام لما تخلص الكورس.',
    },
  ];

  /* ---------------- booking links (verbatim from trainer.ts) ---------------- */
  const AR_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

  function toArabicDigits(input) {
    return String(input).replace(/\d/g, function (d) { return AR_DIGITS[Number(d)]; });
  }

  function planById(id) {
    return PLANS.find(function (p) { return p.id === id; });
  }

  function planMessage(planId) {
    const plan = planById(planId);
    const planLine = plan
      ? '• الباقة المطلوبة: ' + plan.nameAr + '\n' +
        '• الوتيرة: ' + plan.perWeek + ' حصة أسبوعياً (~' + plan.perMonth + ' حصة شهرياً)\n' +
        '• الاشتراك الشهري: ' + plan.price + ' جنيه\n'
      : '• الباقة المطلوبة: ____________________\n';
    return (
      'السلام عليكم أستاذ أبو بكر،\n\n' +
      'أنا [الاسم]، وأرغب في حجز اشتراك شهري لتدريس الإنجليزي أونلاين عن طريقكم.\n' +
      'اطّلعت على صفحة المدرب داخل الموقع، وأود تأكيد التفاصيل التالية:\n\n' +
      planLine +
      '\n' +
      'ولكي أجهّز خطة مذاكرة مناسبة لي من أول حصة، أرجو إفادتي بالتالي:\n\n' +
      '1) مستواي الحالي في الإنجليزي: ____________________\n' +
      '2) هدفي من الدراسة ( speaking / listening / writing / exam ): ____________________\n' +
      '3) الأيام والأوقات المتاحة عندي أسبوعياً: ____________________\n\n' +
      'كما أود الاستفسار عن:\n' +
      '• مواعيد الحصص المتاحة تعاوناً مع جدولي،\n' +
      '• طريقة الدفع، وما إذا كان الدفع مقدماً لحصص متعددة،\n' +
      '• أي متطلبات أو ملفات أحتاج تجهيزها قبل أول حصة.\n\n' +
      'شاكر لكم حسن تعاونكم، وأتطلع لردكم.\n' +
      'مع خالص التقدير،\n' +
      '[الاسم]'
    );
  }

  function whatsappLink(message) {
    return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(message);
  }

  function generalWhatsappLink() {
    return whatsappLink(
      'السلام عليكم أستاذ أبو بكر،\n\n' +
      'أنا [الاسم]، وأرغب في الاشتراك في دروس إنجليزي أونلاين فردية عن طريقكم.\n\n' +
      'قرأت صفحة المدرب داخل الموقع وأود الاستفسار عن:\n\n' +
      '1) الباقات المتاحة (حصة / حصتين / تلاتة في الأسبوع) وأفضل الأنسب لمستواي،\n' +
      '2) التكلفة الشهرية وخصم الدفع المقدم،\n' +
      '3) توقيت الحصص المتاحة وتوافقها مع جدولي،\n' +
      '4) مضمون اختبار تحديد المستوى في أول مرة،\n' +
      '5) طريقة الدفع، وأي متطلبات قبل أول حصة.\n\n' +
      'مستواي الحالي: ____________________\n' +
      'هدفي من الدراسة: ____________________\n' +
      'الأيام والأوقات المتاحة عندي: ____________________\n\n' +
      'شاكر لكم حسن تعاونكم، وأتطلع لردكم.\n' +
      'مع خالص التقدير،\n' +
      '[الاسم]'
    );
  }

  /* ---------------- icons (same shapes as the reference Icons.tsx) ---------------- */
  const PATHS = {
    mic: ['M12 15a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v7a3 3 0 0 0 3 3Z', 'M19 11a7 7 0 0 1-14 0', 'M12 18v3'],
    target: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z', 'M12 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z'],
    chat: ['M21 12a8 8 0 0 1-8 8H7l-4 2 1.3-4.2A8 8 0 1 1 21 12Z'],
    award: ['M12 3a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z', 'm8.5 14-1.5 7 5-3 5 3-1.5-7'],
    clock: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M12 7v5l3.5 2'],
    book: ['M4 19.5A2.5 2.5 0 0 1 6.5 17H20', 'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z'],
    spark: ['M12 3v4m0 10v4m9-9h-4M7 12H3m13.5-5.5-2.8 2.8m-3.4 3.4-2.8 2.8m8.6-8.6 2.8-2.8M7.3 16.7 4.5 19.5'],
    layers: ['m12 2 9 5-9 5-9-5 9-5Z', 'm3 12 9 5 9-5', 'm3 17 9 5 9-5'],
    check: ['M20 6 9 17l-5-5'],
    close: ['M18 6 6 18M6 6l12 12'],
    chevron: ['m6 9 6 6 6-6'],
    arrowUpRight: ['M7 17 17 7', 'M8 7h9v9'],
  };

  function svg(name, size, cls) {
    const paths = PATHS[name] || PATHS.spark;
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + (size || 18) + '" height="' + (size || 18) +
      '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"' +
      (cls ? ' class="' + cls + '"' : '') + '>' + paths.map(function (d) { return '<path d="' + d + '"/>'; }).join('') + '</svg>';
  }

  const WA_PATH = 'M12.04 2c-5.52 0-10 4.48-10 10 0 1.76.46 3.48 1.34 5L2 22l5.15-1.35a9.96 9.96 0 0 0 4.89 1.24h.01c5.52 0 10-4.48 10-10 0-2.65-1.05-5.15-2.93-7.02A9.94 9.94 0 0 0 12.04 2Zm0 1.8c2.15 0 4.17.84 5.69 2.36a7.98 7.98 0 0 1 2.35 5.69c0 4.43-3.6 8.03-8.04 8.03a8 8 0 0 1-4.08-1.12l-.29-.17-3.06.8.82-3-.18-.31a7.96 7.96 0 0 1-1.22-4.29c0-4.43 3.6-7.99 8.01-7.99Zm-2.6 4.2c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.06 2.86 1.21 3.06c.15.2 2.06 3.14 5 4.4.7.3 1.24.48 1.67.61.7.23 1.34.19 1.84.12.56-.09 1.73-.71 1.97-1.39.25-.68.25-1.26.17-1.38-.07-.13-.27-.2-.57-.35-.3-.15-1.73-.86-2-1.15-.27-.3-.45-.43-.65-.15-.2.27-.75.95-.92 1.14-.17.2-.34.22-.64.08-.3-.15-1.26-.47-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.65-1.56-.89-2.14-.23-.56-.47-.48-.64-.49h-.55Z';
  function waIcon(size) {
    return '<svg width="' + (size || 18) + '" height="' + (size || 18) + '" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="' + WA_PATH + '"/></svg>';
  }

  function tap() {
    try { if (typeof beep === 'function') beep(); } catch (e) { /* audio unavailable */ }
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------------- small page parts ---------------- */
  function sectionLabel(en, ar) {
    return '<div class="meb-tr-label"><span>' + en + '</span><span class="meb-tr-label-ar" dir="rtl" lang="ar">' + ar + '</span></div>';
  }

  function sectionTitle(en, ar) {
    return '<h2 class="meb-tr-h2">' + en + ' <span class="meb-tr-h2-ar" dir="rtl" lang="ar">' + ar + '</span></h2>';
  }

  function waButton(href, label, variant, cls) {
    return '<a class="meb-tr-wa' + (variant === 'ghost' ? ' ghost' : '') + (cls ? ' ' + cls : '') +
      '" href="' + href + '" target="_blank" rel="noopener noreferrer" data-tr-tap>' +
      waIcon(18) + '<span>' + esc(label) + '</span></a>';
  }

  function featureCard(item, i) {
    return '<div class="meb-tr-card" style="--tr-i:' + i + '">' +
      '<span class="meb-tr-ic">' + svg(item.icon, 20) + '</span>' +
      '<h3>' + esc(item.title) + '</h3>' +
      '<p class="meb-tr-sub-ar" dir="rtl" lang="ar">' + esc(item.titleAr) + '</p>' +
      '<p class="meb-tr-body">' + esc(item.body) + '</p>' +
      '<p class="meb-tr-body" dir="rtl" lang="ar">' + esc(item.bodyAr) + '</p>' +
      '</div>';
  }

  function planCard(plan, i) {
    const featuresEn = plan.features.map(function (f) {
      return '<li>' + svg('check', 14) + '<span>' + esc(f.en) + '</span></li>';
    }).join('');
    const featuresAr = plan.features.map(function (f) {
      return '<li><i></i><span>' + esc(f.ar) + '</span></li>';
    }).join('');
    const prepay = plan.prepay.map(function (p) {
      return '<li><span>' + (p.months === 3 ? '3 months' : '12 months') + '</span><span><b>' + p.total +
        ' EGP</b> <em>save ' + p.save + '</em></span></li>';
    }).join('');
    return '<div class="meb-tr-plan' + (plan.featured ? ' featured' : '') + '" style="--tr-i:' + i + '">' +
      (plan.badge ? '<span class="meb-tr-badge">' + esc(plan.badge) + '</span>' : '') +
      '<h3>' + esc(plan.name) + '</h3>' +
      '<p class="meb-tr-sub-ar" dir="rtl" lang="ar">' + esc(plan.nameAr) + '</p>' +
      '<div class="meb-tr-price"><strong>' + plan.price + '</strong><span>EGP</span><small>/ month</small></div>' +
      '<p class="meb-tr-muted">about ' + plan.perLesson + ' EGP per 60-minute lesson</p>' +
      '<div class="meb-tr-pills"><span>' + svg('clock', 13) + ' ' + plan.perWeek + ' lesson' + (plan.perWeek > 1 ? 's' : '') + ' a week</span>' +
      '<span>~' + plan.perMonth + ' lessons / month</span></div>' +
      '<ul class="meb-tr-features">' + featuresEn + '</ul>' +
      '<ul class="meb-tr-features-ar" dir="rtl" lang="ar">' + featuresAr + '</ul>' +
      '<div class="meb-tr-prepay"><p>Pay upfront and save</p><ul>' + prepay + '</ul></div>' +
      waButton(whatsappLink(planMessage(plan.id)), 'Book ' + plan.name, plan.featured ? 'solid' : 'ghost', 'meb-tr-plan-btn') +
      '</div>';
  }

  function faqItem(item, i) {
    return '<details class="meb-tr-faq" name="meb-trainer-faq"' + (i === 0 ? ' open' : '') + '>' +
      '<summary><span><strong>' + esc(item.q) + '</strong><small dir="rtl" lang="ar">' + esc(item.qAr) + '</small></span>' +
      svg('chevron', 18, 'meb-tr-chev') + '</summary>' +
      '<div class="meb-tr-faq-body"><p>' + esc(item.a) + '</p><p dir="rtl" lang="ar">' + esc(item.aAr) + '</p></div>' +
      '</details>';
  }

  /* ---------------- landing page ---------------- */
  function page() {
    const heroStats = TRAINER_STATS.map(function (s) {
      return '<div class="meb-tr-stat"><strong>' + esc(s.value) + '</strong><span>' + esc(s.label) + '</span>' +
        '<span class="meb-tr-stat-ar" dir="rtl" lang="ar">' + esc(s.labelAr) + '</span></div>';
    }).join('');

    const bioEn = TRAINER.bio.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
    const bioAr = TRAINER.bioAr.map(function (p) { return '<p dir="rtl" lang="ar">' + esc(p) + '</p>'; }).join('');
    const langs = TRAINER.languages.map(function (l) { return '<span>' + esc(l) + '</span>'; }).join('');

    const why = WHY.map(featureCard).join('');
    const plans = PLANS.map(planCard).join('');
    const steps = STEPS.map(function (step, i) {
      return '<li class="meb-tr-step"><span class="meb-tr-step-num">' + (i + 1) + '</span>' +
        '<span class="meb-tr-step-ic">' + svg(step.icon, 17) + '</span>' +
        '<h3>' + esc(step.title) + '</h3>' +
        '<p class="meb-tr-sub-ar" dir="rtl" lang="ar">' + esc(step.titleAr) + '</p>' +
        '<p class="meb-tr-body">' + esc(step.body) + '</p></li>';
    }).join('');
    const faq = FAQ.map(faqItem).join('');

    return '<div class="meb-tr-page fade-up">' +

      '<section class="meb-tr-hero">' +
        '<div class="meb-tr-hero-top">' +
          '<div class="meb-tr-photo">' +
            '<picture>' +
              '<source media="(min-width: 640px)" srcset="./assets/trainer/abubakr-640.webp" type="image/webp">' +
              '<source srcset="./assets/trainer/abubakr-320.webp" type="image/webp">' +
              '<img src="./assets/trainer/abubakr-320.png" alt="' + esc(TRAINER.name) + '" width="320" height="320">' +
            '</picture>' +
            '<span class="meb-tr-photo-check">' + svg('check', 15) + '</span>' +
          '</div>' +
          '<div class="meb-tr-hero-copy">' +
            '<p class="meb-tr-role">' + svg('mic', 12) + esc(TRAINER.role) + '</p>' +
            '<h1 class="meb-tr-h1">' + esc(TRAINER.nameAr) + '</h1>' +
            '<p class="meb-tr-hero-meta">' + esc(TRAINER.name) + ' · ' + TRAINER.years + ' years online · ' + esc(TRAINER.role) + '</p>' +
            '<p class="meb-tr-lead">' + esc(TRAINER.tagline) + '</p>' +
            '<p class="meb-tr-lead-ar" dir="rtl" lang="ar">' + esc(TRAINER.taglineAr) + '</p>' +
            '<div class="meb-tr-hero-actions">' +
              waButton(generalWhatsappLink(), 'ابدأ الحجز الآن عبر واتساب · ' + WHATSAPP_DISPLAY, 'solid') +
              (TRAINER_LINK ? '<a class="meb-tr-portfolio" href="' + TRAINER_LINK + '" target="_blank" rel="noopener noreferrer" data-tr-tap>' +
                '<span>Portfolio</span><span class="meb-tr-portfolio-ar" dir="rtl" lang="ar">شوف أعماله</span>' + svg('arrowUpRight', 15) + '</a>' : '') +
            '</div>' +
            '<p class="meb-tr-note" dir="rtl" lang="ar">التسجيل بيتم على الواتساب — رد خلال ساعات النهار، ومواعيد من الصبح لحد بالليل.</p>' +
          '</div>' +
        '</div>' +
        '<div class="meb-tr-stats">' + heroStats + '</div>' +
      '</section>' +

      '<section class="meb-tr-about">' +
        '<div class="meb-tr-running"><span>' + esc(TRAINER.name) + '</span><span>About the trainer</span></div>' +
        '<div class="meb-tr-about-grid"><div>' + bioEn + '<div class="meb-tr-langs">' + langs + '</div></div>' +
        '<div>' + bioAr + '</div></div>' +
      '</section>' +

      '<section class="meb-tr-section">' +
        sectionLabel('Why him', 'ليه تتعلم معاه') +
        sectionTitle('A trainer built around how you actually improve', 'مدرب شغال على الطريقة اللي بتتعلم بيها فعلاً') +
        '<div class="meb-tr-grid-3">' + why + '</div>' +
      '</section>' +

      '<section class="meb-tr-section">' +
        sectionLabel('Monthly subscription', 'الاشتراك الشهري') +
        sectionTitle('One price, pick how many lessons a week', 'سعر واحد — اختار عدد الحصص في الأسبوع') +
        '<p class="meb-tr-intro-ar" dir="rtl" lang="ar">كل الباقات اشتراك شهري بحصص لايف ١:١ على زووم. اختار حصة في الأسبوع ولا اتنين ولا تلاتة، والدفع بيتم على الواتساب.</p>' +
        '<div class="meb-tr-plans">' + plans + '</div>' +
        '<p class="meb-tr-footnote">* ' + esc(LESSONS_PER_MONTH_NOTE) + ' The free diagnostic session and the Zoom link are included in every plan.</p>' +
      '</section>' +

      '<section class="meb-tr-section">' +
        sectionLabel('How to start', 'إزاي تبدأ') +
        sectionTitle('Four steps, about ten minutes', 'أربع خطوات في عشر دقايق') +
        '<ol class="meb-tr-steps">' + steps + '</ol>' +
      '</section>' +

      '<section class="meb-tr-section">' +
        sectionLabel('Questions', 'أسئلة متكررة') +
        sectionTitle('Before you book', 'قبل ما تحجز') +
        '<div class="meb-tr-faqs">' + faq + '</div>' +
      '</section>' +

      '<section class="meb-tr-cta">' +
        '<p class="meb-tr-cta-tag">' + svg('spark', 12) + 'limited slots</p>' +
        '<h2 class="meb-tr-cta-h">ابدأ أول حصة مع أبو بكر</h2>' +
        '<p class="meb-tr-cta-copy" dir="rtl" lang="ar">تدرّب مع تسع سنوات من الخبرة، وابدأ باختبار تحديد مستوى مجاني قبل أي التزام مالي. راسلني على الواتساب وسيتم الرد على المواعيد المتاحة وتفاصيل الدفع.</p>' +
        '<div class="meb-tr-cta-actions">' +
          waButton(whatsappLink(planMessage('twice')), 'احجز باقة الحصتين أسبوعياً · ' + WHATSAPP_DISPLAY, 'solid') +
          '<a class="meb-tr-cta-link" href="#/shadowing" data-tr-tap>جرّب الشادونج الأول' + svg('arrowUpRight', 15) + '</a>' +
        '</div>' +
      '</section>' +

      '</div>';
  }

  /* ---------------- home banner ---------------- */
  function homeBanner() {
    return '<section class="meb-tr-home"><a class="meb-ref-banner meb-cta-trainer" href="#/trainer">' +
      '<span class="meb-ref-ic">' + svg('mic', 22) + '</span>' +
      '<span class="meb-ref-copy"><strong dir="rtl" lang="ar">مدرب إنجليزي أونلاين · أبو بكر مختار</strong>' +
      '<small dir="rtl" lang="ar">٩ سنين خبرة · حصص لايف ١:١ على زووم · اشتراك شهري: حصة أو اتنين أو تلاتة في الأسبوع</small></span>' +
      '<span class="meb-ref-action">الباقات</span></a></section>';
  }

  /* ---------------- sponsor bar (site-wide, dismissible) ---------------- */
  function dismissed() {
    try { return localStorage.getItem(SPONSOR_KEY) === '1'; } catch (e) { return false; }
  }

  function shellExtras() {
    if (dismissed()) return '';
    return '<div class="meb-tr-sponsor sponsor-aware-bottom" id="meb-tr-sponsor">' +
      '<div class="meb-tr-sponsor-inner">' +
        '<img src="./assets/trainer/abubakr-320.webp" alt="" width="40" height="40" loading="lazy">' +
        '<div class="meb-tr-sponsor-copy">' +
          '<strong dir="rtl" lang="ar">محتاجة مساعدة في الإنجليزي؟ ' + esc(TRAINER.nameAr) + ' بياخد اشتراكات</strong>' +
          '<span>9+ years teaching · live 1:1 on Zoom · monthly plans</span>' +
        '</div>' +
        '<a class="meb-tr-sponsor-wa" href="' + generalWhatsappLink() + '" target="_blank" rel="noopener noreferrer" data-tr-tap>' +
          '<span dir="rtl" lang="ar">واتساب ' + WHATSAPP_DISPLAY + '</span></a>' +
        '<a class="meb-tr-sponsor-plans" href="#/trainer" data-tr-tap><span dir="rtl" lang="ar">الباقات</span></a>' +
        '<button type="button" class="meb-tr-sponsor-close" data-action="trainer-sponsor-close" aria-label="Hide the trainer banner" title="Hide">' +
          svg('close', 15) + '</button>' +
      '</div>' +
    '</div>';
  }

  /* ---------------- timed offer modal ---------------- */
  let timer = null;
  let host = null;
  let lastSuppressed = null;

  function ensureHost() {
    if (host && document.body.contains(host)) return host;
    host = document.getElementById('meb-trainer-modal');
    if (!host) {
      host = document.createElement('div');
      host.id = 'meb-trainer-modal';
      document.body.appendChild(host);
    }
    return host;
  }

  function closeModal() {
    clearTimeout(timer); timer = null;
    if (host) host.innerHTML = '';
    document.body.style.overflow = '';
  }

  function openModal() {
    const h = ensureHost();
    const perkList = [
      'اختبار تحديد مستوى مجاني قبل أول حصة',
      'خطة مذاكرة مخصصة على هدفك',
      'تصحيح صوتي للواجبات خلال ٢٤ ساعة',
      'خصم ١٠٪ عند الدفع لـ ٣ شهور مقدماً',
    ];
    const perks = perkList.map(function (t) {
      return '<li dir="rtl" lang="ar">' + svg('check', 13) + '<span>' + esc(t) + '</span></li>';
    }).join('');
    const planLinks = PLANS.map(function (plan) {
      return '<a class="meb-tr-modal-plan' + (plan.featured ? ' featured' : '') + '" href="' +
        whatsappLink(planMessage(plan.id)) + '" target="_blank" rel="noopener noreferrer" data-tr-modal-close>' +
        '<span dir="rtl" lang="ar">' + esc(plan.nameAr) + '</span>' +
        '<strong>' + plan.price + '</strong>' +
        '<small>جنيه / شهر</small></a>';
    }).join('');

    h.innerHTML =
      '<div class="meb-tr-modal" role="presentation">' +
        '<button type="button" class="meb-tr-modal-overlay" aria-label="Close" data-action="trainer-modal-close"></button>' +
        '<div class="meb-tr-modal-dialog" role="dialog" aria-modal="true" aria-label="' + esc(TRAINER.nameAr) + ' - online English trainer">' +
          '<div class="meb-tr-modal-cap">' +
            '<button type="button" class="meb-tr-modal-x" aria-label="Close" data-action="trainer-modal-close">' + svg('close', 16) + '</button>' +
            '<div class="meb-tr-modal-person">' +
              '<img src="./assets/trainer/abubakr-320.webp" alt="" width="56" height="56">' +
              '<div><p>Online English trainer</p><strong>' + esc(TRAINER.nameAr) + '</strong>' +
              '<span dir="rtl" lang="ar">' + TRAINER.years + ' سنوات خبرة · حصص فردية مباشرة على زووم</span></div>' +
            '</div>' +
            '<p class="meb-tr-modal-lead" dir="rtl" lang="ar">عايز تتكلم إنجليزي بثقة؟ احجز اشتراك شهري مع المدرب أبو بكر مختار، لخطة مخصصة ليك من أول حصة.</p>' +
          '</div>' +
          '<div class="meb-tr-modal-body">' +
            '<div class="meb-tr-modal-plans">' + planLinks + '</div>' +
            '<ul class="meb-tr-modal-perks">' + perks + '</ul>' +
            '<a class="meb-tr-wa meb-tr-modal-wa" href="' + generalWhatsappLink() + '" target="_blank" rel="noopener noreferrer" data-tr-modal-close>' +
              waIcon(17) + '<span>احجز حصصك الآن عبر واتساب</span><span dir="ltr">' + WHATSAPP_DISPLAY + '</span></a>' +
            '<div class="meb-tr-modal-foot">' +
              '<a href="#/trainer" data-tr-modal-close>' +
                '<span dir="rtl" lang="ar">شوف كل الباقات والتفاصيل</span>' + svg('arrowUpRight', 14) + '</a>' +
              '<span class="meb-tr-modal-hours">' + svg('clock', 12) + '<span dir="rtl" lang="ar">مواعيد من ٩ صباحاً لـ ١١ مساءً</span></span>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    document.body.style.overflow = 'hidden';
    const x = h.querySelector('.meb-tr-modal-x');
    if (x) x.focus();
  }

  /* Called at the end of every app.js render(). */
  function afterRender(routeName) {
    document.documentElement.style.setProperty('--meb-sponsor-h', dismissed() ? '0px' : BAR_H);
    ensureHost();
    const suppressed = routeName === 'trainer';
    if (suppressed !== lastSuppressed) {
      clearTimeout(timer); timer = null;
      closeModal();
      if (!suppressed) timer = setTimeout(function () { openModal(); }, SHOW_AFTER_MS);
      lastSuppressed = suppressed;
    }
  }

  let bound = false;
  function init() {
    if (bound) return;
    bound = true;
    ensureHost();
    document.addEventListener('click', function (e) {
      const tapEl = e.target.closest('[data-tr-tap]');
      if (tapEl) tap();
      const closeBtn = e.target.closest('[data-action="trainer-modal-close"], [data-tr-modal-close]');
      if (closeBtn) { closeModal(); return; }
      const sponsorBtn = e.target.closest('[data-action="trainer-sponsor-close"]');
      if (sponsorBtn) {
        try { localStorage.setItem(SPONSOR_KEY, '1'); } catch (err) { /* storage blocked */ }
        tap();
        const bar = document.getElementById('meb-tr-sponsor');
        if (bar) bar.remove();
        document.documentElement.style.setProperty('--meb-sponsor-h', '0px');
        return;
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && host && host.firstChild) closeModal();
    });
  }

  window.MEB_TRAINER = {
    page: page,
    homeBanner: homeBanner,
    shellExtras: shellExtras,
    afterRender: afterRender,
    init: init,
  };
})();

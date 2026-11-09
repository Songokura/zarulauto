/* ZARUL AUTO - сценарии страницы */
(function () {
  'use strict';
  var d = document, w = window;
  var reduce = w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var G = w.gsap, ST = w.ScrollTrigger;
  if (G && ST) G.registerPlugin(ST);

  /* ---------- плавная прокрутка ---------- */
  var lenis = null;
  if (G && ST && w.Lenis && !reduce) {
    lenis = new w.Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', ST.update);
    G.ticker.add(function (t) { lenis.raf(t * 1000); });
    G.ticker.lagSmoothing(0);
  }
  function scrollToY(y) {
    if (lenis) lenis.scrollTo(y, { duration: 1.1, easing: function (t) { return 1 - Math.pow(1 - t, 4); } });
    else w.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
  }

  /* ---------- шапка ---------- */
  var hdr = d.getElementById('hdr');
  var hero = d.getElementById('hero');
  function onScrollHdr() {
    var y = w.scrollY || d.documentElement.scrollTop;
    hdr.classList.toggle('solid', y > 40);
    hero.classList.toggle('scrolled', y > 80);
  }
  w.addEventListener('scroll', onScrollHdr, { passive: true });
  onScrollHdr();

  var burger = d.getElementById('burger');
  function setMenu(open) {
    d.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    if (lenis) { open ? lenis.stop() : lenis.start(); }
  }
  burger.addEventListener('click', function () { setMenu(!d.body.classList.contains('menu-open')); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* якоря: плавно, с учётом шапки */
  d.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    var el = id && d.getElementById(id);
    if (!el) return;
    e.preventDefault();
    setMenu(false);
    var off = el.classList.contains('pw') ? 0 : (d.getElementById('hdr').offsetHeight - 1);
    var y = el.getBoundingClientRect().top + (w.scrollY || 0) - off;
    scrollToY(Math.max(0, y));
    history.replaceState(null, '', '#' + id);
  });

  /* ---------- ссылки WhatsApp с текстом ---------- */
  var WA = {
    main: 'Здравствуйте. Хочу записаться на курс категории B на автомате в ZARUL AUTO. Подскажите, пожалуйста, расписание ближайших групп.',
    pack: 'Здравствуйте. Интересует пакет «{pack}» (курс категории B на автомате, Алматы). Подскажите расписание ближайших групп и условия рассрочки.',
    branch: 'Здравствуйте. Хочу записаться на курс категории B в филиале {branch}. Подскажите расписание ближайших групп.',
    'tdk-lesson': 'Здравствуйте. Хочу записаться на индивидуальный урок вождения на автодроме в Талдыкоргане.',
    'tdk-trial': 'Здравствуйте. Хочу записаться на пробный заезд перед экзаменом в Талдыкоргане.'
  };
  d.querySelectorAll('a[data-wa]').forEach(function (a) {
    var t = WA[a.dataset.wa];
    if (!t) return;
    t = t.replace('{pack}', a.dataset.pack || '').replace('{branch}', a.dataset.branch || '');
    var base = a.getAttribute('href').split('?')[0];
    a.setAttribute('href', base + '?text=' + encodeURIComponent(t));
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener');
  });

  /* ---------- форма записи -> WhatsApp ---------- */
  var form = d.getElementById('form');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = form.name.value.trim(), phone = form.phone.value.trim();
    if (!name || !phone) {
      (!name ? form.name : form.phone).focus();
      return;
    }
    var t = 'Здравствуйте. Заявка с сайта zarulauto.kz. Имя: ' + name + '. Телефон: ' + phone +
      '. Филиал: ' + form.branch.value + '. Пакет: ' + form.pack.value + '.';
    var num = form.branch.value === 'Талдыкорган' ? '77773423336' : '77773423338';
    w.open('https://wa.me/' + num + '?text=' + encodeURIComponent(t), '_blank', 'noopener');
  });

  /* ---------- проявление блоков и боксов ---------- */
  d.querySelectorAll('.box').forEach(function (b) {
    var m = d.createElement('span'); m.className = 'box-mark'; b.appendChild(m);
  });
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
  d.querySelectorAll('.rv, .box, .lot').forEach(function (el) { io.observe(el); });

  /* ---------- герой: сцена ---------- */
  var scene = d.getElementById('scene');
  var route = d.getElementById('route');
  var routeDone = d.getElementById('routeDone');
  var car = d.getElementById('car');
  var labels = Array.prototype.slice.call(d.querySelectorAll('#labels .lbl'));
  var L = route.getTotalLength();
  routeDone.setAttribute('d', route.getAttribute('d'));
  routeDone.style.strokeDasharray = L + ' ' + L;
  routeDone.style.strokeDashoffset = L;

  function setSceneViewBox() {
    var portrait = w.innerWidth / w.innerHeight < 0.9 || w.innerWidth <= 720;
    if (portrait) {
      scene.setAttribute('viewBox', '580 60 1020 880');
      scene.setAttribute('preserveAspectRatio', 'xMidYMin meet');
    } else {
      scene.setAttribute('viewBox', '560 0 1040 1000');
      scene.setAttribute('preserveAspectRatio', 'xMaxYMid meet');
    }
  }
  setSceneViewBox();

  /* длины для прочерчивания */
  scene.querySelectorAll('.draw').forEach(function (p) {
    var len = 2000;
    try { len = p.getTotalLength(); } catch (e) { }
    p.style.setProperty('--len', Math.ceil(len + 2));
  });

  /* точки подписей -> длина вдоль маршрута */
  var samples = [];
  (function () {
    var n = 500;
    for (var i = 0; i <= n; i++) {
      var pt = route.getPointAtLength(L * i / n);
      samples.push({ l: L * i / n, x: pt.x, y: pt.y });
    }
  })();
  labels.forEach(function (lb) {
    var at = lb.dataset.at.split(',').map(Number);
    var best = Infinity, bl = 0;
    samples.forEach(function (s) {
      var dx = s.x - at[0], dy = s.y - at[1], dd = dx * dx + dy * dy;
      if (dd < best) { best = dd; bl = s.l; }
    });
    lb._at = bl;
  });

  var lastP = -1, curP = 0;
  function drive(p) {
    p = Math.max(0, Math.min(1, p));
    curP = p;
    if (Math.abs(p - lastP) < 0.0005) return;
    lastP = p;
    var len = L * p;
    var a = route.getPointAtLength(Math.max(0, len - 6));
    var b = route.getPointAtLength(Math.min(L, len + 6));
    var pt = route.getPointAtLength(len);
    var ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
    car.setAttribute('transform', 'translate(' + pt.x.toFixed(1) + ' ' + pt.y.toFixed(1) + ') rotate(' + ang.toFixed(1) + ')');
    routeDone.style.strokeDashoffset = L - len;
    labels.forEach(function (lb) {
      lb.classList.toggle('on', len >= lb._at - 60);
      lb.classList.toggle('now', len >= lb._at - 60 && len < lb._at + 160);
    });
  }
  drive(0);

  /* интро: прочерчивание, затем заголовок */
  function heroIntro() {
    scene.classList.add('ready');
    var h1 = d.getElementById('h1');
    var words = h1.textContent.trim().split(/\s+/);
    h1.innerHTML = words.map(function (wd) { return '<span class="w"><span>' + wd + '</span></span>'; }).join(' ');
    var spans = h1.querySelectorAll('.w>span');
    spans.forEach(function (s, i) { s.style.transitionDelay = (0.25 + i * 0.045) + 's'; });
    requestAnimationFrame(function () { requestAnimationFrame(function () { h1.classList.add('in'); hero.classList.add('in'); }); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(heroIntro); else heroIntro();

  /* телефон: машина ездит по маршруту в цикле; компьютер: проезд по прокрутке */
  var mobileHero = w.matchMedia('(max-width: 720px)');
  var heroVisible = true, loopRaf = 0, loopT0 = 0, LOOP_MS = 16000;
  function loopTick(t) {
    if (!loopT0) loopT0 = t;
    drive(((t - loopT0) % LOOP_MS) / LOOP_MS);
    loopRaf = requestAnimationFrame(loopTick);
  }
  function loopStart() { if (!loopRaf && !reduce) { loopT0 = 0; loopRaf = requestAnimationFrame(loopTick); } }
  function loopStop() { if (loopRaf) { cancelAnimationFrame(loopRaf); loopRaf = 0; } }
  var heroST = null;
  function setupHeroMode() {
    if (mobileHero.matches) {
      if (heroST) { heroST.kill(); heroST = null; }
      if (reduce) drive(1); else if (heroVisible) loopStart();
    } else {
      loopStop();
      if (G && ST && !heroST) {
        heroST = ST.create({
          trigger: hero, start: 'top top', end: 'bottom bottom', scrub: 0.6,
          onUpdate: function (self) { drive(self.progress); }
        });
      }
    }
  }
  if (G && ST || mobileHero.matches) {
    setupHeroMode();
  } else {
    w.addEventListener('scroll', function () {
      if (mobileHero.matches) return;
      var r = hero.getBoundingClientRect();
      var total = r.height - w.innerHeight;
      drive(total > 0 ? (-r.top) / total : 0);
    }, { passive: true });
  }

  /* пауза анимаций сцены вне экрана */
  var heroIO = new IntersectionObserver(function (es) {
    es.forEach(function (en) {
      heroVisible = en.isIntersecting;
      scene.style.visibility = heroVisible ? '' : 'hidden';
      if (mobileHero.matches) { heroVisible ? loopStart() : loopStop(); }
    });
  });
  heroIO.observe(hero);

  /* ---------- плиты обучения ---------- */
  var pws = Array.prototype.slice.call(d.querySelectorAll('.pw'));
  if (G && ST && !reduce) {
    pws.forEach(function (pw, i) {
      var plate = pw.querySelector('.plate');
      var next = pws[i + 1];
      ST.create({
        trigger: pw, start: 'top 60%', end: 'bottom bottom',
        onToggle: function (self) { plate.classList.toggle('on', self.isActive); }
      });
      if (!next) return;
      /* уход текущей плиты, когда наезжает следующая */
      /* затемнение - отдельным слоем (opacity), без пересчёта стилей всей плиты */
      var dim = d.createElement('i'); dim.className = 'plate-dim'; plate.appendChild(dim);
      var stUse = { trigger: next, start: 'top bottom', end: 'top top', scrub: true };
      G.fromTo(plate, { scale: 1 }, { scale: 0.94, ease: 'none', force3D: true, scrollTrigger: stUse });
      G.fromTo(dim, { opacity: 0 }, { opacity: 0.55, ease: 'none', scrollTrigger: { trigger: next, start: 'top bottom', end: 'top top', scrub: true } });
    });
  } else {
    pws.forEach(function (pw) { pw.querySelector('.plate').classList.add('on'); });
  }

  /* ---------- филиалы: карточка <-> точка на схеме ---------- */
  var pins = {};
  d.querySelectorAll('.map [data-pin]').forEach(function (g) { pins[g.dataset.pin] = g; });
  d.querySelectorAll('.bcard[data-pin]').forEach(function (c) {
    var g = pins[c.dataset.pin];
    if (!g) return;
    function hot(on) { g.classList.toggle('hot', on); }
    c.addEventListener('mouseenter', function () { hot(true); });
    c.addEventListener('mouseleave', function () { hot(false); });
    c.addEventListener('focusin', function () { hot(true); });
    c.addEventListener('focusout', function () { hot(false); });
    g.style.cursor = 'pointer';
    g.addEventListener('click', function () {
      var y = c.getBoundingClientRect().top + (w.scrollY || 0) - 100;
      scrollToY(y);
      c.classList.add('hot');
      setTimeout(function () { c.classList.remove('hot'); }, 1400);
    });
  });
  /* стартовая подсветка точек по очереди при появлении схемы */
  var mapWrap = d.querySelector('.map-wrap');
  var mapIO = new IntersectionObserver(function (es) {
    if (!es[0].isIntersecting) return;
    mapIO.disconnect();
    var order = ['Сайран', 'Абая', 'Желтоксан', 'Саяхат', 'Талдыкорган'];
    order.forEach(function (k, i) {
      setTimeout(function () {
        var g = pins[k]; if (!g) return;
        g.classList.add('hot');
        setTimeout(function () { g.classList.remove('hot'); }, 700);
      }, 900 + i * 260);
    });
  }, { threshold: 0.4 });
  mapIO.observe(mapWrap);

  /* ---------- лента выпускников ---------- */
  var track = d.getElementById('grads');
  var rbtns = d.querySelectorAll('.grads-nav .rbtn');
  function stepW() {
    var b = track.querySelector('.box');
    return b ? b.getBoundingClientRect().width + 18 : 300;
  }
  function updBtns() {
    var max = track.scrollWidth - track.clientWidth - 2;
    rbtns[0].disabled = track.scrollLeft <= 2;
    rbtns[1].disabled = track.scrollLeft >= max;
    var fits = track.scrollWidth <= track.clientWidth + 2;
    rbtns.forEach(function (b) { b.hidden = fits; });
  }
  rbtns.forEach(function (b) {
    b.addEventListener('click', function () {
      track.scrollBy({ left: stepW() * Number(b.dataset.dir), behavior: reduce ? 'auto' : 'smooth' });
    });
  });
  track.addEventListener('scroll', updBtns, { passive: true });
  w.addEventListener('resize', updBtns);
  track.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); rbtns[1].click(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); rbtns[0].click(); }
  });
  updBtns();

  /* ---------- вопросы: один открыт ---------- */
  var qs = d.querySelectorAll('.q');
  qs.forEach(function (q) {
    q.addEventListener('toggle', function () {
      if (!q.open) return;
      qs.forEach(function (o) { if (o !== q) o.open = false; });
      if (ST) ST.refresh();
    });
  });

  /* ---------- пересчёт при смене ширины ---------- */
  var lastW = w.innerWidth;
  w.addEventListener('resize', function () {
    if (w.innerWidth === lastW) return;
    lastW = w.innerWidth;
    setSceneViewBox();
    setupHeroMode();
    lastP = -1; drive(curP);
    if (ST) ST.refresh();
  });
  w.addEventListener('load', function () { if (ST) ST.refresh(); updBtns(); });
})();

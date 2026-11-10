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
    main: 'Здравствуйте. Хочу записаться на курс категории B на автомате в ZARUL AUTO в Талдыкоргане. Подскажите, пожалуйста, расписание ближайших групп.',
    pack: 'Здравствуйте. Интересует пакет «{pack}» (курс категории B на автомате, Талдыкорган). Подскажите расписание ближайших групп и условия рассрочки.',
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
    var t = 'Здравствуйте. Заявка с сайта zarulauto.kz (Талдыкорган). Имя: ' + name + '. Телефон: ' + phone +
      '. Интересует: ' + form.what.value + '. Пакет: ' + form.pack.value + '.';
    w.open('https://wa.me/77773423336?text=' + encodeURIComponent(t), '_blank', 'noopener');
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
  var TAIL = 520; /* след за машиной */
  routeDone.style.strokeDasharray = TAIL + ' ' + (L + TAIL);
  routeDone.style.strokeDashoffset = TAIL;

  function setSceneViewBox() {
    var portrait = w.innerWidth / w.innerHeight < 0.9 || w.innerWidth <= 720;
    if (portrait) {
      scene.setAttribute('viewBox', '-10 -10 1190 1100');
      scene.setAttribute('preserveAspectRatio', 'xMidYMin meet');
    } else {
      scene.setAttribute('viewBox', '-30 -20 1230 1120');
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
    p = ((p % 1) + 1) % 1;
    curP = p;
    if (Math.abs(p - lastP) < 0.0005) return;
    lastP = p;
    var len = L * p;
    var a = route.getPointAtLength((len - 6 + L) % L);
    var b = route.getPointAtLength((len + 6) % L);
    var pt = route.getPointAtLength(len);
    var ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
    car.setAttribute('transform', 'translate(' + pt.x.toFixed(1) + ' ' + pt.y.toFixed(1) + ') rotate(' + ang.toFixed(1) + ')');
    routeDone.style.strokeDashoffset = TAIL - len;
    labels.forEach(function (lb) {
      lb.classList.add('on');
      lb.classList.toggle('now', len >= lb._at - 140 && len < lb._at + 160);
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

  /* машина ездит по маршруту автодрома в цикле, на всех экранах */
  var heroVisible = true, loopRaf = 0, loopT0 = 0, LOOP_MS = 36000, loopOff = 0;
  function loopTick(t) {
    if (!loopT0) loopT0 = t - loopOff * LOOP_MS;
    drive(((t - loopT0) % LOOP_MS) / LOOP_MS);
    loopRaf = requestAnimationFrame(loopTick);
  }
  function loopStart() { if (!loopRaf && !reduce) { loopOff = curP; loopT0 = 0; loopRaf = requestAnimationFrame(loopTick); } }
  function loopStop() { if (loopRaf) { cancelAnimationFrame(loopRaf); loopRaf = 0; } }
  function setupHeroMode() { if (reduce) drive(0.02); else if (heroVisible) loopStart(); }
  setupHeroMode();

  /* пауза анимаций сцены вне экрана */
  var heroIO = new IntersectionObserver(function (es) {
    es.forEach(function (en) {
      heroVisible = en.isIntersecting;
      scene.style.visibility = heroVisible ? '' : 'hidden';
      heroVisible ? loopStart() : loopStop();
    });
  });
  heroIO.observe(hero);

  /* ---------- плиты обучения: обычные блоки, проявление при появлении ---------- */
  var plateIO = new IntersectionObserver(function (es) {
    es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('on'); plateIO.unobserve(en.target); } });
  }, { threshold: 0.25 });
  d.querySelectorAll('.plate').forEach(function (pl) { plateIO.observe(pl); });

  /* ---------- видео: немая петля в кадре, полный ролик по клику ---------- */
  var vthumbs = Array.prototype.slice.call(d.querySelectorAll('.vthumb'));
  var vIO = new IntersectionObserver(function (es) {
    es.forEach(function (en) {
      var v = en.target.querySelector('video');
      if (en.isIntersecting && !reduce) {
        if (!v.getAttribute('src')) v.setAttribute('src', v.dataset.loop);
        var p = v.play(); if (p && p.catch) p.catch(function () { });
      } else if (v.getAttribute('src')) { v.pause(); }
    });
  }, { threshold: 0.55 });
  vthumbs.forEach(function (b) {
    var v = b.querySelector('video');
    v.addEventListener('playing', function () { b.classList.add('is-live'); });
    vIO.observe(b);
    b.addEventListener('click', function () { openVideo(b.dataset.video, b); });
  });
  var vmodal = d.getElementById('vmodal'), vplayer = d.getElementById('vplayer'), vFrom = null;
  function openVideo(src, from) {
    vFrom = from;
    vplayer.setAttribute('src', src);
    vmodal.classList.add('open');
    d.body.classList.add('v-open');
    if (lenis) lenis.stop();
    var p = vplayer.play(); if (p && p.catch) p.catch(function () { });
    vmodal.querySelector('.vmodal-x').focus();
  }
  function closeVideo() {
    if (!vmodal.classList.contains('open')) return;
    vplayer.pause(); vplayer.removeAttribute('src'); vplayer.load();
    vmodal.classList.remove('open');
    d.body.classList.remove('v-open');
    if (lenis) lenis.start();
    if (vFrom) vFrom.focus();
  }
  vmodal.querySelector('.vmodal-x').addEventListener('click', closeVideo);
  vmodal.addEventListener('click', function (e) { if (e.target === vmodal) closeVideo(); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeVideo(); });

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

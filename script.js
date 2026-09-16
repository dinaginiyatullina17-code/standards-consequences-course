/* ════════════════════════════════════════════════════════════════════════
   E-LEARNING KIT — переиспользуемые интерактивности для курсов-лонгридов
   ────────────────────────────────────────────────────────────────────────
   Чистый ванильный JS, без зависимостей. Парный файл к elearning-kit.css.

   Архитектура:
     • Курс — одна HTML-страница (SPA). «Страницы» — <div class="page">.
     • Глобальные функции вызываются прямо из onclick в разметке
       (navigateTo, checkSortOrder, toggleFaq, …). Это сознательный выбор:
       никакой сборки, всё читается «как есть» и легко переносится.

   СОДЕРЖАНИЕ
     1.  Роутер SPA (navigateTo)
     2.  Появление по скроллу (IntersectionObserver)
     3.  Прогресс + сохранение (SCORM 1.2 + localStorage)
     4.  Последовательная разблокировка глав / разделов
     5.  Галерея / карусель
     6.  Аккордеон FAQ
     7.  Сортировка списка (drag-and-drop + тач)
     8.  Два контейнера drag-and-drop (drag-chip → drop-zone)
     9.  Выбор варианта (matching / викторина)
     10. Пошаговая видеовикторина с кнопкой «Далее»
     11. Модальное окно
     12. Утилиты (перемешивание, set-сравнение)
     13. Инициализация
   ════════════════════════════════════════════════════════════════════════ */


/* ════════════════════════════════════════════════════════════════════════
   КОНФИГ — поправь под свой курс
   ════════════════════════════════════════════════════════════════════════ */
// Порядок «страниц» в DOM. Для каждой ожидается элемент с id="page-<name>".
const PAGES = ['home', 'intro', 'consequences', 'control', 'algorithm', 'system', 'conclusion'];

// Главы для прогресс-бара и последовательной разблокировки (без 'home').
const CHAPTER_ORDER = ['intro', 'consequences', 'control', 'algorithm', 'system', 'conclusion'];

// Человекочитаемые названия глав для шапки.
const CHAPTER_NAMES = {
  home: '',
  intro: 'Введение',
  consequences: 'Последствия нарушений',
  control: 'Контроль сотрудников',
  algorithm: 'Алгоритм действий',
  system: 'Контроль как система',
  conclusion: 'Заключение',
};

let currentPage = 'home';
let unlockedChapters = 1;          // сколько глав открыто (1..N)
const chapterDone = {
  intro: false,
  consequences: false,
  control: false,
  algorithm: false,
  system: false,
};

const NEXT_FEEDBACK_IDS = {
  intro: 'intro-feedback',
  consequences: 'match-feedback-0',
  control: 'shift-feedback',
  algorithm: 'sort-feedback',
  system: 'control-feedback',
};


/* ════════════════════════════════════════════════════════════════════════
   1. РОУТЕР SPA
   Прячет все .page, показывает целевую, обновляет шапку/прогресс и запускает
   нужные инициализаторы. Вызывается из onclick="navigateTo('section2')".
   ════════════════════════════════════════════════════════════════════════ */
function navigateTo(pageId) {
  const targetIdx = CHAPTER_ORDER.indexOf(pageId);
  if (targetIdx !== -1 && CHAPTER_ORDER.slice(0, targetIdx).some(id => !chapterReady(id))) return;

  // 1) переключаем активную страницу
  PAGES.forEach(id => document.getElementById('page-' + id)?.classList.remove('active'));
  const target = document.getElementById('page-' + pageId);
  if (!target) return;
  target.classList.add('active');
  currentPage = pageId;
  document.body.classList.toggle('is-home', pageId === 'home');
  document.getElementById('top-nav')?.classList.toggle('home-nav-hidden', pageId === 'home');
  window.scrollTo({ top: 0, behavior: 'instant' });

  // 2) шапка + прогресс-бар
  const idx = CHAPTER_ORDER.indexOf(pageId);
  document.getElementById('nav-chapter').textContent = CHAPTER_NAMES[pageId] || '';
  if (idx !== -1) {
    document.getElementById('nav-progress').textContent = (idx + 1) + ' / ' + CHAPTER_ORDER.length;
    document.getElementById('progress-bar').style.width =
      Math.round(((idx + 1) / CHAPTER_ORDER.length) * 100) + '%';
  } else {
    document.getElementById('nav-progress').textContent = '';
    document.getElementById('progress-bar').style.width = '0%';
  }

  // 3) анимация появления (после того как страница стала видимой)
  setTimeout(initFadeIn, 50);

  // 4) инициализаторы конкретных страниц — добавляй свои
  if (pageId !== 'algorithm' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
  const fprAudio = document.getElementById('fpr-audio');
  if (fprAudio && pageId !== 'algorithm') fprAudio.pause();

  // Следующая глава открывается только после ответа на вопрос текущей.
  applyHomeLocks();
}


/* ════════════════════════════════════════════════════════════════════════
   2. ПОЯВЛЕНИЕ ПО СКРОЛЛУ
   Элементы .fade-in становятся .visible, когда входят во вьюпорт.
   Те, что уже видны на момент вызова, показываем сразу (без ожидания скролла).
   ════════════════════════════════════════════════════════════════════════ */
function initFadeIn() {
  const els = document.querySelectorAll('.page.active .fade-in:not(.visible)');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight) el.classList.add('visible'); // уже на экране
    else io.observe(el);
  });
}


/* ════════════════════════════════════════════════════════════════════════
   3. ПРОГРЕСС + СОХРАНЕНИЕ
   Состояние — крошечный JSON. Пишем в SCORM (cmi.suspend_data), если курс
   запущен в LMS, и дублируем в localStorage (для работы вне LMS).
   ВАЖНО про статус: «Завершён» НЕ ставим автоматически — только по кнопке
   «Завершить» (SCORM.complete()). Прогресс открытия глав хранится отдельно.
   ════════════════════════════════════════════════════════════════════════ */
const PROGRESS_KEY = 'standards_consequences_course_progress';
// Новая версия начинает маршрут заново: при первом открытии доступно только «Введение».
const PROGRESS_VERSION = 14;
const hubDone = [false, false, false];   // флаги пройденных подразделов (если есть)


function saveProgress() {
  const json = JSON.stringify(collectState());
  try { localStorage.setItem(PROGRESS_KEY, json); } catch (e) {}

  if (window.SCORM && typeof SCORM.set === 'function') {
    SCORM.set('cmi.suspend_data', json);
    // Помечаем «попытка начата» один раз и НИКОГДА не понижаем зачтённый статус.
    const status = SCORM.get('cmi.core.lesson_status');
    if (status === '' || status === 'not attempted' || status === 'unknown') {
      SCORM.set('cmi.core.lesson_status', 'incomplete');
    }
    SCORM.commit(); // без commit LMS может не сохранить
  }
}




/* ════════════════════════════════════════════════════════════════════════
   4. ПОСЛЕДОВАТЕЛЬНАЯ РАЗБЛОКИРОВКА
   На главной для каждой главы ожидается карточка id="home-card-<N>".
   Карточка блокируется (класс .locked), пока её индекс >= unlockedChapters.
   ════════════════════════════════════════════════════════════════════════ */
function applyHomeLocks() {
  CHAPTER_ORDER.forEach((ch, i) => {
    const card = document.getElementById('home-card-' + (i + 1));
    if (card) {
      const locked = i >= unlockedChapters;
      card.classList.toggle('locked', locked);
      card.disabled = locked;
      card.setAttribute('aria-disabled', String(locked));
    }
  });
}



/* Для хаба с подразделами (если используешь): карточки #hub-card-<N>.
   1-я всегда открыта, N-я открывается после прохождения (N-1)-й. */
function applyHubLocks() {
  const cards = document.querySelectorAll('.hub-card');
  cards.forEach((card, i) => {
    card.classList.toggle('done', !!hubDone[i]);
    card.classList.toggle('locked', i === 0 ? false : !hubDone[i - 1]);
  });
}

/* Вызывается кнопкой «Готово» внутри подраздела */
function completeSection(n) {
  hubDone[n - 1] = true;
  saveProgress();
  applyHubLocks();
}


/* ════════════════════════════════════════════════════════════════════════
   5. ГАЛЕРЕЯ / КАРУСЕЛЬ
   Лента #gallery-track сдвигается через translateX. Точки — .gallery-dot.
   ════════════════════════════════════════════════════════════════════════ */
let galleryIdx = 0;
const GALLERY_COUNT = 5;   // число слайдов

function initGallery() { galleryIdx = 0; renderGallery(); }
function renderGallery() {
  const track = document.getElementById('gallery-track');
  if (!track) return;
  track.style.transform = `translateX(-${galleryIdx * 100}%)`;
  document.querySelectorAll('.gallery-dot').forEach((d, i) => d.classList.toggle('active', i === galleryIdx));
}
function galleryMove(dir) {
  galleryIdx = (galleryIdx + dir + GALLERY_COUNT) % GALLERY_COUNT; // зацикленно
  renderGallery();
}


/* ════════════════════════════════════════════════════════════════════════
   6. АККОРДЕОН FAQ
   Класс .open ставится одновременно на кнопку (.faq-q) и тело (.faq-body).
   Высоту разворачивает CSS (max-height), JS только переключает класс.
   ════════════════════════════════════════════════════════════════════════ */
function toggleFaq(btn) {
  const body = btn.nextElementSibling;
  const isOpen = body.classList.contains('open');
  btn.classList.toggle('open', !isOpen);
  body.classList.toggle('open', !isOpen);
  btn.setAttribute('aria-expanded', String(!isOpen));
}



/* ════════════════════════════════════════════════════════════════════════
   7. СОРТИРОВКА СПИСКА (drag-and-drop по вертикали)
   Поддерживает мышь (HTML5 DnD) и тач (ручной расчёт позиции вставки).
   У каждого .sort-item должен быть data-idx. Контейнер — #sortable-list.
   ════════════════════════════════════════════════════════════════════════ */
const CORRECT_ORDER = [0, 1, 2, 3, 4, 5, 6];   // эталонный порядок data-idx

function initSortable() {
  const list = document.getElementById('sortable-list');
  if (!list) return;
  let dragEl = null;

  list.querySelectorAll('.sort-item').forEach(item => {
    // — мышь —
    item.addEventListener('dragstart', () => { dragEl = item; setTimeout(() => item.classList.add('dragging'), 0); });
    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
      list.querySelectorAll('.sort-item').forEach(i => i.classList.remove('drag-over-top', 'drag-over-bottom'));
      dragEl = null;
    });
    // — тач —
    item.addEventListener('touchstart', () => { dragEl = item; item.classList.add('dragging'); }, { passive: true });
    item.addEventListener('touchmove', e => { markInsertPoint(list, e.touches[0].clientY); }, { passive: true });
    item.addEventListener('touchend', e => {
      if (!dragEl) return;
      const tgt = insertTarget(list, e.changedTouches[0].clientY);
      if (tgt.el) { tgt.before ? list.insertBefore(dragEl, tgt.el) : tgt.el.insertAdjacentElement('afterend', dragEl); }
      dragEl.classList.remove('dragging');
      list.querySelectorAll('.sort-item').forEach(i => i.classList.remove('drag-over-top', 'drag-over-bottom'));
      dragEl = null;
    });
  });

  // — зона приёма (мышь) —
  list.addEventListener('dragover', e => {
    e.preventDefault();
    if (!dragEl) return;
    const after = getDragAfterEl(list, e.clientY);
    list.querySelectorAll('.sort-item').forEach(i => i.classList.remove('drag-over-top', 'drag-over-bottom'));
    if (after) after.classList.add('drag-over-top');
    else { const last = list.querySelector('.sort-item:last-child'); if (last && last !== dragEl) last.classList.add('drag-over-bottom'); }
  });
  list.addEventListener('drop', e => {
    e.preventDefault();
    if (!dragEl) return;
    const after = getDragAfterEl(list, e.clientY);
    after ? list.insertBefore(dragEl, after) : list.appendChild(dragEl);
  });

  // вспомогательные расчёты позиции вставки для тача
  function insertTarget(list, y) {
    const els = [...list.querySelectorAll('.sort-item:not(.dragging)')];
    let target = null, before = true;
    for (const el of els) { const r = el.getBoundingClientRect(); if (y < r.top + r.height / 2) { target = el; before = true; break; } target = el; before = false; }
    return { el: target, before };
  }
  function markInsertPoint(list, y) {
    const t = insertTarget(list, y);
    list.querySelectorAll('.sort-item').forEach(i => i.classList.remove('drag-over-top', 'drag-over-bottom'));
    if (t.el) t.el.classList.add(t.before ? 'drag-over-top' : 'drag-over-bottom');
  }
}

/* Куда вставлять при перетаскивании мышью (ближайший элемент ниже курсора) */
function getDragAfterEl(container, y) {
  const items = [...container.querySelectorAll('.sort-item:not(.dragging)')];
  return items.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) return { offset, el: child };
    return closest;
  }, { offset: -Infinity, el: null }).el;
}

/* Проверка порядка: сравниваем текущие data-idx с эталоном */


/* ════════════════════════════════════════════════════════════════════════
   8. ДВА КОНТЕЙНЕРА DRAG-AND-DROP (чипы → зоны)
   initZoneSort связывает пул и две зоны. Поддержка тача — через клон,
   следующий за пальцем. Защита от повторной привязки через data-атрибуты,
   чтобы при повторном входе на страницу обработчики не дублировались.
   ════════════════════════════════════════════════════════════════════════ */
function initZoneSort(poolId, zone1Id, zone2Id) {
  const pool = document.getElementById(poolId);
  const z1 = document.getElementById(zone1Id);
  const z2 = document.getElementById(zone2Id);
  if (!pool || !z1 || !z2) return;

  [pool, z1, z2].forEach(c => c.querySelectorAll('.drag-chip').forEach(chip => {
    if (!chip.dataset.chipBound) { bindChip(chip, pool, z1, z2); chip.dataset.chipBound = '1'; }
  }));
  [pool, z1, z2].forEach(zone => {
    if (zone.dataset.zoneBound) return;
    zone.dataset.zoneBound = '1';
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', e => {
      e.preventDefault(); zone.classList.remove('drag-over');
      const chip = document.getElementById(e.dataTransfer.getData('text/plain'));
      if (chip) zone.appendChild(chip);
    });
  });
}

function bindChip(chip, pool, z1, z2) {
  // — мышь —
  chip.setAttribute('draggable', true);
  chip.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', chip.id); chip.classList.add('dragging'); });
  chip.addEventListener('dragend', () => chip.classList.remove('dragging'));

  // — тач: создаём клон, который «летит» за пальцем —
  let clone = null;
  chip.addEventListener('touchstart', () => {
    chip.classList.add('dragging');
    clone = chip.cloneNode(true);
    clone.style.cssText = 'position:fixed;pointer-events:none;opacity:0.75;z-index:9999;';
    document.body.appendChild(clone);
  }, { passive: true });
  chip.addEventListener('touchmove', e => {
    const t = e.touches[0];
    if (clone) { clone.style.left = (t.clientX - 40) + 'px'; clone.style.top = (t.clientY - 20) + 'px'; }
    [pool, z1, z2].forEach(z => { const r = z.getBoundingClientRect(); z.classList.toggle('drag-over', inRect(t, r)); });
  }, { passive: true });
  chip.addEventListener('touchend', e => {
    chip.classList.remove('dragging');
    if (clone) { clone.remove(); clone = null; }
    const t = e.changedTouches[0];
    [pool, z1, z2].forEach(z => { z.classList.remove('drag-over'); if (inRect(t, z.getBoundingClientRect())) z.appendChild(chip); });
  });
}
function inRect(p, r) { return p.clientX >= r.left && p.clientX <= r.right && p.clientY >= r.top && p.clientY <= r.bottom; }

/* Проверка распределения по зонам через сравнение множеств data-key */
function checkZoneSort(zone1Id, zone2Id, correctZ1, correctZ2, feedbackId) {
  const keys = id => [...document.getElementById(id).querySelectorAll('.drag-chip')].map(c => c.dataset.key);
  const ok = setEq(keys(zone1Id), correctZ1) && setEq(keys(zone2Id), correctZ2);
  const fb = document.getElementById(feedbackId);
  fb.className = 'feedback-box show ' + (ok ? 'correct' : 'incorrect');
  fb.innerHTML = ok ? '<strong>Верно!</strong>' : '<strong>Неверно.</strong> Распредели заново.';
}


/* ════════════════════════════════════════════════════════════════════════
   9. ВЫБОР ВАРИАНТА (matching / викторина из нескольких вопросов)
   У каждого вопроса свой индекс. Правильный — зелёный, неверный — «мигает».
   ════════════════════════════════════════════════════════════════════════ */
const MATCH_ANSWERS = ['b', 'c'];        // эталонные ответы по вопросам
let matchSolved = [false, false];
let matchAnswered = [false, false];
const MATCH_EXPLANATIONS = [
  {
    a: 'Повторение повышает риск, но цепочку может запустить уже одно пропущенное нарушение.',
    b: 'Верно: если нарушение не остановить сразу, оно может перейти в цепочку последствий.',
    c: 'Жалоба — уже заметный итог. Цепочка начинается раньше, с самого пропущенного нарушения.',
  },
  {
    a: 'Снижение скорости — лишь один из возможных эффектов. Диапазон последствий гораздо шире.',
    b: 'Это часть диапазона, но он начинается с реакции Гостя и может закончиться серьёзным риском для здоровья.',
    c: 'Верно: одно пропущенное нарушение может привести от огорчения Гостя до больницы и смерти.',
  },
];

function showMatchFeedback(feedback, type, message) {
  if (!feedback) return;
  feedback.hidden = false;
  feedback.className = 'feedback-box match-question-feedback show ' + type;
  feedback.innerHTML = message;
}



/* ════════════════════════════════════════════════════════════════════════
   10. ПОШАГОВАЯ ВИДЕОВИКТОРИНА
   N шагов (.video-quiz-step), показываем по одному. На верный ответ —
   показываем обратную связь и кнопку «Далее» (НЕ автопереход), чтобы
   пользователь успел прочитать фидбэк. Кнопка вызывает nextVideoStep().
   Разметка кнопки: <button id="vq-next-<i>" class="vq-next" onclick="nextVideoStep()">
   ════════════════════════════════════════════════════════════════════════ */
let videoStep = 0;
const VIDEO_ANSWERS = ['b', 'b', 'a'];
const VIDEO_FEEDBACK = [
  'Верно — деталь становится полезной, когда её удаётся заметить и назвать.',
  'Верно — свежий взгляд нужен ещё до того, как черновик станет «идеальным».',
  'Верно — маленькое действие помогает идее перейти из заметки в опыт.',
];

function initVideoQuiz() {
  videoStep = 0;
  document.querySelectorAll('.answer-btn').forEach(b => { b.disabled = false; b.classList.remove('correct', 'wrong'); });
  document.querySelectorAll('.vq-feedback').forEach(f => { f.classList.remove('show'); f.textContent = ''; });
  document.querySelectorAll('.vq-next').forEach(b => b.style.display = 'none');
  showVideoStep(0);
}
function showVideoStep(n) {
  document.querySelectorAll('.video-quiz-step').forEach((el, i) => el.classList.toggle('active', i === n));
  if (n >= VIDEO_ANSWERS.length) document.getElementById('video-quiz-done')?.classList.remove('hidden');
}
function answerVideo(btn, stepIdx, answer) {
  if (btn.classList.contains('correct')) return;
  if (answer === VIDEO_ANSWERS[stepIdx]) {
    btn.classList.add('correct');
    btn.closest('.answer-choices').querySelectorAll('.answer-btn').forEach(b => b.disabled = true);
    const fb = document.getElementById('vq-fb-' + stepIdx);
    if (fb) { fb.textContent = VIDEO_FEEDBACK[stepIdx]; fb.classList.add('show'); }
    document.getElementById('vq-next-' + stepIdx)?.style.setProperty('display', 'inline-flex'); // кнопка «Далее»
  } else {
    btn.classList.add('wrong');
    setTimeout(() => btn.classList.remove('wrong'), 600);
  }
}
function nextVideoStep() {
  videoStep++;
  showVideoStep(videoStep);
  (document.querySelector('.video-quiz-step.active') || document.getElementById('video-quiz-done'))
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}


/* ════════════════════════════════════════════════════════════════════════
   11. МОДАЛЬНОЕ ОКНО
   Контент окна задаём данными по ключу. Открытие/закрытие — класс .open.
   Разметка: оверлей #modal-overlay > .modal (с stopPropagation на клике).
   ════════════════════════════════════════════════════════════════════════ */
const MODAL_DATA = {
  spark: { title: 'Случайная мысль', text: 'Случайные идеи любят собираться в маленькие действия: заметить, выбрать, попробовать и обсудить.' },
  compass: { title: 'Точка внимания', text: 'Здесь могла быть важная деталь. Откройте карточку, чтобы увидеть короткий пример и продолжить маршрут.' },
  pulse: { title: 'Небольшой импульс', text: 'Пара фраз, немного воображения и готовность нажать на следующую кнопку — этого достаточно для учебного эксперимента.' },
};
function openModal(key) {
  const d = MODAL_DATA[key]; if (!d) return;
  document.getElementById('modal-title').textContent = d.title;
  document.getElementById('modal-text').textContent = d.text;
  document.getElementById('modal-overlay').classList.add('open');
}
function closeModal() { document.getElementById('modal-overlay').classList.remove('open'); }
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); }); // Esc


/* ════════════════════════════════════════════════════════════════════════
   12. УТИЛИТЫ
   ════════════════════════════════════════════════════════════════════════ */
// Сравнение двух массивов как множеств (порядок не важен)
function setEq(a, b) { return a.length === b.length && a.every(v => b.includes(v)); }

// Перемешать детей контейнера (напр. чтобы чипы не шли заранее сгруппированы)
function shuffleChildren(el) {
  if (!el) return;
  const kids = [...el.children];
  for (let i = kids.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [kids[i], kids[j]] = [kids[j], kids[i]]; }
  kids.forEach(k => el.appendChild(k));
}

// Вернуть все чипы из зон обратно в пул и перемешать (сброс drag-упражнения)
function resetZonePool(poolId, ...zoneIds) {
  const pool = document.getElementById(poolId);
  if (!pool) return;
  zoneIds.forEach(z => { const el = document.getElementById(z); if (el) [...el.querySelectorAll('.drag-chip')].forEach(c => pool.appendChild(c)); });
  shuffleChildren(pool);
}

/* Финальный шаг курса. Явно отправляем SCORM 1.2-статус passed и сохраняем
   локальный флаг, чтобы результат был виден и при локальном открытии. */
function completeCourse() {
  if (!Object.keys(chapterDone).every(id => chapterReady(id))) return;
  try { localStorage.setItem(PROGRESS_KEY + '_completed', 'passed'); } catch (e) {}
  try {
    if (window.SCORM && typeof SCORM.complete === 'function') {
      SCORM.complete();
    } else if (window.SCORM && typeof SCORM.set === 'function') {
      SCORM.set('cmi.core.lesson_status', 'passed');
      if (typeof SCORM.commit === 'function') SCORM.commit();
    }
  } catch (e) {}

  const button = document.querySelector('#page-conclusion .finish-card .btn-next');
  if (button) {
    button.textContent = 'Курс завершён';
    button.disabled = true;
    button.setAttribute('aria-disabled', 'true');
  }

  setTimeout(() => {
    try {
      window.open('', '_self');
      window.close();
    } catch (e) {}
  }, 350);
}


/* ════════════════════════════════════════════════════════════════════════
   13. ИНТЕРАКТИВЫ КУРСА
   ════════════════════════════════════════════════════════════════════════ */
function startCourse() {
  const challenge = document.getElementById('challenge-card');
  if (!challenge) return;
  challenge.scrollIntoView({ behavior: 'smooth', block: 'center' });
  setTimeout(() => challenge.focus({ preventScroll: true }), 450);
}



let fprUtterance = null;
function toggleFprSpeech() {
  const btn = document.getElementById('voice-play');
  if (!('speechSynthesis' in window)) {
    btn.textContent = 'Недоступно';
    btn.disabled = true;
    return;
  }
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    btn.textContent = 'Включить';
    btn.classList.remove('playing');
    return;
  }
  const text = document.getElementById('fpr-transcript').textContent.trim();
  fprUtterance = new SpeechSynthesisUtterance(text);
  fprUtterance.lang = 'ru-RU';
  fprUtterance.rate = 0.96;
  fprUtterance.onend = fprUtterance.onerror = () => {
    btn.textContent = 'Включить';
    btn.classList.remove('playing');
  };
  btn.textContent = 'Остановить';
  btn.classList.add('playing');
  window.speechSynthesis.speak(fprUtterance);
}

function initFprAudio() {
  const audio = document.getElementById('fpr-audio');
  const btn = document.getElementById('voice-play');
  if (!audio || !btn) return;
  audio.addEventListener('play', () => {
    btn.textContent = '▶';
    btn.classList.add('playing');
    btn.setAttribute('aria-label', 'Поставить пример обратной связи на паузу');
  });
  audio.addEventListener('pause', () => {
    btn.textContent = '▶';
    btn.classList.remove('playing');
    btn.setAttribute('aria-label', 'Воспроизвести пример обратной связи');
  });
  audio.addEventListener('ended', () => {
    btn.textContent = '▶';
    btn.classList.remove('playing');
  });
  audio.addEventListener('error', () => {
    btn.textContent = '!';
    btn.setAttribute('aria-label', 'Аудио недоступно');
    btn.disabled = true;
  });
}

function toggleFprAudio() {
  const audio = document.getElementById('fpr-audio');
  const btn = document.getElementById('voice-play');
  if (!audio || !btn) return;
  if (audio.paused) {
    const playRequest = audio.play();
    if (playRequest && typeof playRequest.catch === 'function') {
      playRequest.catch(() => {
        btn.textContent = 'Аудио недоступно';
        btn.disabled = true;
      });
    }
  } else {
    audio.pause();
  }
}

function toggleClosedChoice(btn) {
  btn.classList.toggle('selected');
}




/* ════════════════════════════════════════════════════════════════════════
   13. ИНИЦИАЛИЗАЦИЯ
   navigateTo('home') — на DOMContentLoaded (DOM готов).
   loadProgress()     — на 'load', потому что SCORM API LMS инициализируется
                        именно тогда (см. scorm_api.js из scorm_pack.py).
   ════════════════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  navigateTo('home');
  applyHomeLocks();
  initSortable();
  initFprAudio();
});
window.addEventListener('load', () => loadProgress());

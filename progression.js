/* Обязательный просмотр, две попытки и практика на смене. */
const MAX_ATTEMPTS = 2;
const TRAINING_STEPS = [
  { title: 'Заметь нарушение', question: 'Час пик. Ты видишь, как сотрудник достаёт картошку за 10 секунд до сигнала. На что обратишь внимание?', options: ['Проверю цвет и внешний вид порции: если они обычные, отмечу только отклонение по времени.', 'Картошку достали до сигнала: процедура приготовления нарушена.', 'Сначала уточню у сотрудника, почему он достал порцию раньше: от причины зависит, считать ли это нарушением.'], right: 1, hint: 'Отдели наблюдаемый факт от оценки человека и показателей скорости.', explanation: 'Ты заметил конкретное действие: продукт достали раньше сигнала. С этим фактом можно работать.' },
  { title: 'Останови риск и отреагируй сразу', question: 'Сотрудник собирается передать эту порцию на сборку. Что сделаешь сейчас?', options: ['Остановлю передачу порции и сразу обращу внимание сотрудника на нарушение.', 'Остановлю передачу порции, а обратную связь дам после часа пик, чтобы сотрудник спокойно её воспринял.', 'Попрошу сотрудника следующую порцию готовить до сигнала, а эту проверю по внешнему виду перед передачей.'], right: 0, hint: 'Пока ты ждёшь, продукт уже может попасть к Гостю. Начни с прекращения неправильного действия.', explanation: 'Сначала останови передачу порции, приготовленной с нарушением, и действуй по процедурам ресторана. Обратную связь дай сразу.' },
  { title: 'Дай обратную связь по ФПР', question: 'Как скажешь сотруднику о нарушении? Выбери фразу с фактом, последствием и правильной рекомендацией.', options: ['Ты достал картошку за 10 секунд до сигнала. Доставай её после сигнала готовности, а в час пик заранее рассчитывай загрузку станции.', 'Если доставать картошку раньше времени, она может остаться сырой. Следи за качеством каждой порции и учитывай загрузку станции.', 'Ты достал картошку за 10 секунд до сигнала. Она может остаться сырой и не хрустеть. Доставай её только после сигнала готовности.'], right: 2, hint: 'Нужны все три части: что произошло, к чему это приводит и какое действие требуется. Без обвинений и общих пожеланий.', explanation: 'Факт — достал за 10 секунд до сигнала. Последствие — картошка может остаться сырой и не хрустеть. Рекомендация — доставать только после сигнала.' },
  { title: 'Покажи правильное действие', question: 'Сотрудник отвечает: «Понял, больше не буду». Что дальше?', options: ['Попрошу сотрудника объяснить порядок приготовления своими словами и уточню пропущенные детали.', 'На следующем цикле покажу выполнение процедуры: дождусь сигнала и затем достану картошку.', 'Открою с сотрудником стандарт, вместе найдём нужный пункт и обсудим, как соблюдать его в час пик.'], right: 1, hint: 'На этом шаге сотруднику нужно увидеть, как правильно выполнить процедуру.', explanation: 'Покажи процедуру в работе, чтобы правильное действие было понятно и его можно было повторить.' },
  { title: 'Дай потренироваться', question: 'Ты показал процедуру. Как убедишься, что сотрудник способен повторить её?', options: ['Попрошу повторить процедуру под наблюдением; если не получается, подключу Тренера-наставника.', 'Попрошу назвать сигнал готовности и объяснить последствия раннего извлечения; по ответу оценю усвоение.', 'Приготовлю ещё несколько порций сам, комментируя действия, а самостоятельную отработку оставлю на следующую смену.'], right: 0, hint: 'Понимать объяснение и самостоятельно выполнять действие — разные вещи. Нужна практика.', explanation: 'Дай сотруднику выполнить процедуру самому. Если трудность сохраняется, организуй обучение с Тренером-наставником.' },
  { title: 'Передай информацию коллегам', question: 'Что сообщишь коллегам, которые будут контролировать работу сотрудника?', options: ['«На станции было нарушение времени приготовления. Напомните всей команде стандарт на 5-минутке, чтобы ошибка не повторялась».', '«Сегодня сотрудник достал картошку раньше сигнала. Я провёл разбор и показал процедуру; если возникнут жалобы на качество, вернитесь к этому вопросу».', '«Сегодня он достал картошку раньше сигнала. Я дал ОС по ФПР, показал процедуру и проверил повторение. Понаблюдайте за соблюдением времени приготовления».'], right: 2, hint: 'Передай факт, предпринятые действия и предмет дальнейшего наблюдения. Коллегам важно знать, что произошло, что уже сделано и за чем наблюдать дальше.', explanation: 'Коллегам нужны конкретные сведения о нарушении и обучении, чтобы поддерживать единый стандарт и продолжать наблюдение.' },
  { title: 'Вернись и проверь', question: 'Через несколько дней ты снова работаешь с этим сотрудником. Чем завершишь цикл?', options: ['Попрошу сотрудника снова описать процедуру и последствия нарушения; если ответит верно, отмечу навык как закреплённый.', 'Понаблюдаю за приготовлением: дожидается ли он сигнала. Если ошибка повторится, снова отреагирую и организую отработку.', 'Сверю отзывы о качестве за последние смены и уточню у коллег, были ли замечания; при отсутствии сигналов закрою вопрос.'], right: 1, hint: 'Проверь действие в реальной работе. Воспоминание о разговоре и отсутствие жалоб не подтверждают соблюдение процедуры.', explanation: 'Цикл завершает проверка поведения на станции. Если ошибка повторилась, нужно снова остановить нарушение и помочь закрепить правильное действие.' }
];
const FINAL_QUESTIONS = [
  { right: 1, hint: 'Опасность зависит не от количества повторений, а от того, было ли нарушение вовремя остановлено.', explanation: 'Даже одно неостановленное нарушение может запустить цепочку последствий.' },
  { right: 1, hint: 'Просроченное средство нельзя продолжать использовать, даже если внешне оно не изменилось.', explanation: 'Нужно прекратить использование просроченного мыла и сразу действовать по установленной процедуре.' },
  { right: 0, hint: 'Эта модель помогает назвать наблюдаемое действие, объяснить его последствия и сказать, как действовать правильно.', explanation: 'ФПР расшифровывается как «Факт — Последствие — Рекомендация».' },
  { right: 1, hint: 'Внешний вид продукта не заменяет показание исправного термометра.', explanation: 'Продукт с температурным отклонением нельзя использовать: нужно сразу действовать по установленной процедуре.' },
  { right: 1, hint: 'Слова сотрудника не подтверждают, что правильное действие закрепилось в реальной работе.', explanation: 'Через несколько дней нужно вернуться и проверить выполнение процедуры на станции.' }
];
let learning = freshLearning();
function freshLearning() {
  // Исключаем одинаковую позицию верного ответа во всех трёх группах.
  const pattern = 1 + Math.floor(Math.random() * 6);
  return { seen: [], answers: {}, shift: [], order: [], trainerStep: 0, systemOrder: Array.from({length: 3}, (_, i) => pattern & (1 << i) ? ['right', 'wrong'] : ['wrong', 'right']) };
}
const WRONG_REASONS = {
  intro: { 0: 'Незначительные последствия — только часть возможных исходов. Нарушение может затронуть здоровье и жизнь Гостя.' },
  'match-0': { 0: 'Повторение повышает риск, но не является обязательным условием: опасную цепочку может запустить уже одно нарушение.', 2: 'Задержка заказа — возможное последствие. Опасная цепочка может начаться раньше и вообще не сопровождаться задержкой.' },
  'match-1': { 0: 'Скорость работы и жалоба не охватывают последствия для здоровья и жизни Гостя.', 1: 'Этот вариант описывает часть последствий, но не весь диапазон: от недовольства Гостя до больницы и смерти.' },
  'trainer-0': { 0: 'Внешний вид порции не подтверждает соблюдение времени приготовления. Уже замеченное извлечение до сигнала является нарушением.', 2: 'Причину полезно выяснить для дальнейшего обучения, но она не меняет факт нарушения процедуры.' },
  'trainer-1': { 1: 'Ты остановил передачу порции, но отложил объяснение. До разговора сотрудник может повторить то же действие со следующей порцией.', 2: 'Просьба правильно приготовить следующую порцию не останавливает передачу текущей. Внешний вид не заменяет соблюдение процедуры приготовления.' },
  'trainer-2': { 0: 'В этой фразе есть факт и требуемое действие, но нет последствия: сотруднику не объяснили, как нарушение влияет на продукт.', 1: 'В этой фразе есть последствие, но нет конкретного наблюдаемого факта и точного действия. «Следи за качеством» не объясняет, когда доставать картошку.' },
  'trainer-3': { 0: 'Пересказ показывает понимание слов, но не заменяет демонстрацию правильного действия на станции.', 2: 'Чтение и обсуждение стандарта полезны, но сотрудник ещё не увидел, как выполнить процедуру в работе.' },
  'trainer-4': { 1: 'Правильный устный ответ проверяет знания, а не способность выполнить процедуру. Нужна самостоятельная практика под наблюдением.', 2: 'Повторный показ оставляет сотрудника наблюдателем. Пока он сам не повторит действие, нельзя оценить, освоил ли он его.' },
  'trainer-5': { 0: 'Общее напоминание команде не передаёт, с кем уже провели обучение и какое действие этого сотрудника нужно проверить.', 1: 'Информация об обучении передана, но проверка поставлена в зависимость от жалоб. Наблюдать за соблюдением процедуры нужно и без жалоб.' },
  'trainer-6': { 0: 'Сотрудник может правильно пересказать процедуру и всё ещё нарушать её в час пик. Проверять нужно действие на станции.', 2: 'Отзывы и сообщения коллег дают косвенные сведения. Отсутствие замечаний не подтверждает, что сотрудник теперь соблюдает процедуру.' },
  'final-0': { 0: 'Опасную цепочку может запустить уже первое нарушение, если его не остановить.', 2: 'Жалоба — возможное последствие. Цепочка начинается раньше, с нарушения стандарта.' },
  'final-1': { 0: 'До конца часа пик сотрудники продолжат использовать просроченное средство, поэтому откладывать реакцию нельзя.', 2: 'Количество пены не подтверждает, что просроченное мыло подходит для соблюдения процедуры мытья рук.' },
  'final-2': { 1: 'Проверка и реакция входят в систему контроля, но не являются расшифровкой ФПР.', 2: 'Такая расшифровка не помогает построить обратную связь из конкретного факта, последствия и правильного действия.' },
  'final-3': { 0: 'Внешний вид не подтверждает безопасную температуру продукта.', 2: 'Если отклонение уже обнаружено, откладывать реакцию нельзя.' },
  'final-4': { 0: 'Подтверждение понимания не доказывает, что сотрудник применяет правильное действие в работе.', 2: 'Ждать жалобы опасно: контроль должен предупреждать повторение нарушения.' }
};
const CORRECT_REASONS = {
  intro: 'нарушения стандартов могут угрожать здоровью и жизни Гостя',
  'match-0': 'опасная цепочка начинается с нарушения, которое не остановили вовремя, даже если оно произошло один раз',
  'match-1': 'этот вариант охватывает весь диапазон последствий — от недовольства до угрозы жизни',
  'trainer-0': 'он описывает наблюдаемое нарушение процедуры, а не предполагаемую причину или внешний вид продукта',
  'trainer-1': 'нужно остановить передачу порции с нарушением и сразу объяснить сотруднику, что исправить',
  'trainer-2': 'в этой фразе есть все три части ФПР: конкретный факт, последствие для продукта и точное требуемое действие',
  'trainer-3': 'демонстрация на станции позволяет сотруднику увидеть правильное выполнение процедуры',
  'trainer-4': 'только самостоятельное выполнение под наблюдением покажет, освоил ли сотрудник действие и нужна ли помощь наставника',
  'trainer-5': 'коллеги узнают о конкретном нарушении, проведённом обучении и о том, за каким действием нужно наблюдать',
  'trainer-6': 'проверка действий на станции показывает, сохраняется ли навык в реальной работе',
  'final-0': 'опасная цепочка может начаться уже с одного нарушения, которое не остановили вовремя',
  'final-1': 'просроченное мыло нужно сразу вывести из использования и действовать по установленной процедуре',
  'final-2': 'эта формула последовательно называет факт, последствие и рекомендацию',
  'final-3': 'температура ниже установленного значения требует немедленной реакции по процедуре',
  'final-4': 'только наблюдение за работой через несколько дней подтверждает, что навык закрепился'
};
function answerState(id) { return learning.answers[id] || { tries: 0, done: false }; }
function quizConfig(id) {
  if (id.startsWith('trainer-')) {
    const s = TRAINING_STEPS[Number(id.slice(8))];
    return { ...s, selector: '#trainer-options button', feedback: 'trainer-feedback' };
  }
  if (id.startsWith('final-')) {
    const index = Number(id.slice(6));
    const question = FINAL_QUESTIONS[index];
    return { ...question, selector: '[data-final-question="' + index + '"] .match-btn', feedback: 'final-feedback-' + index };
  }
  const configs = {
    intro: { selector: '#intro-choice .choice-row button', feedback: 'intro-feedback', right: 1, hint: 'Подумай не только о впечатлении Гостя, но и о его здоровье и жизни.', explanation: 'Даже одно пропущенное нарушение может привести к угрозе жизни.' },
    'match-0': { selector: '#page-consequences .match-question:nth-child(1) .match-btn', feedback: 'match-feedback-0', right: 1, hint: 'Для запуска цепочки не обязательно ждать повторения или заметных последствий.', explanation: 'Даже одно пропущенное нарушение может запустить опасную цепочку.' },
    'match-1': { selector: '#page-consequences .match-question:nth-child(2) .match-btn', feedback: 'match-feedback-1', right: 2, hint: 'Найди самый полный диапазон: от реакции Гостя до крайнего последствия для его жизни.', explanation: 'Последствия могут быть от недовольства Гостя до больницы и смерти.' }
  };
  return configs[id];
}
function submitChoice(id, choice) {
  if (answerState(id).done) return;
  const cfg = quizConfig(id);
  const correct = choice === cfg.right;
  const tries = answerState(id).tries + 1;
  learning.answers[id] = { tries, choice, correct, done: correct || tries >= MAX_ATTEMPTS };
  renderChoice(id);
  refreshLearning();
}
function renderChoice(id) {
  const cfg = quizConfig(id), state = answerState(id);
  const options = [...document.querySelectorAll(cfg.selector)];
  options.forEach((btn, i) => {
    btn.disabled = state.done;
    btn.classList.toggle('correct-pick', state.done && i === cfg.right);
    btn.classList.toggle('wrong-pick', state.tries > 0 && !state.correct && i === state.choice);
    btn.setAttribute('aria-pressed', String(state.choice === i));
  });
  const fb = document.getElementById(cfg.feedback);
  if (!state.tries) { fb.className = 'feedback-box'; fb.textContent = ''; return; }
  fb.className = 'feedback-box show ' + (state.done ? 'correct' : 'incorrect');
  fb.textContent = state.correct ? 'Верно. ' + cfg.explanation
    : state.done ? 'Неверно. ' + WRONG_REASONS[id][state.choice] + ' Верный вариант — «' + options[cfg.right].textContent.trim().replace(/[.!?]+$/, '').replace(/^«|»$/g, '') + '», потому что ' + CORRECT_REASONS[id] + '.'
    : 'Пока неверно. Подсказка: ' + cfg.hint;
}
function revealIntro(btn, isCorrect) { submitChoice('intro', isCorrect ? 1 : 0); }
function pickMatch(btn, index, answer) { submitChoice('match-' + index, ['a', 'b', 'c'].indexOf(answer)); }
function recordReveal(btn) {
  const id = btn.dataset.revealId;
  if (id && !learning.seen.includes(id)) learning.seen.push(id);
  btn.classList.add('was-read');
  refreshLearning();
}
function selectConsequence(btn, text) {
  document.querySelectorAll('.pyramid-level').forEach(el => el.classList.remove('selected'));
  btn.classList.add('selected');
  document.getElementById('pyramid-detail').textContent = text;
  recordReveal(btn);
}
function toggleChain(btn) {
  const open = btn.getAttribute('aria-expanded') !== 'true';
  btn.classList.toggle('open', open);
  btn.nextElementSibling.classList.toggle('open', open);
  btn.setAttribute('aria-expanded', String(open));
  if (open) recordReveal(btn);
}
function revealRequirements(chapter) {
  return [...document.querySelectorAll('#page-' + chapter + ' .pyramid-level, #page-' + chapter + ' .chain-toggle')];
}
function chapterReady(chapter) {
  if (!revealRequirements(chapter).every(btn => learning.seen.includes(btn.dataset.revealId))) return false;
  if (chapter === 'intro') return answerState('intro').done;
  if (chapter === 'consequences') return answerState('match-0').done && answerState('match-1').done;
  if (chapter === 'control') return learning.shift.length > 0;
  if (chapter === 'algorithm') return answerState('sort').done && TRAINING_STEPS.every((_, i) => answerState('trainer-' + i).done);
  if (chapter === 'system') return answerState('system').done;
  return false;
}
function refreshLearning(persist = true) {
  Object.keys(chapterDone).forEach(id => { chapterDone[id] = !!chapterReady(id); });
  const first = CHAPTER_ORDER.findIndex(id => !chapterDone[id]);
  unlockedChapters = first < 0 ? CHAPTER_ORDER.length : first + 1;
  applyHomeLocks();
  Object.keys(chapterDone).forEach(id => {
    const page = document.getElementById('page-' + id);
    const btn = page.querySelector('.next-row .btn-next');
    const status = page.querySelector('.chapter-gate');
    const reveals = revealRequirements(id);
    const read = reveals.filter(el => learning.seen.includes(el.dataset.revealId)).length;
    btn.disabled = !chapterDone[id];
    btn.setAttribute('aria-disabled', String(btn.disabled));
    let text = chapterDone[id] ? '' : 'Пройди тест выше.';
    status.hidden = chapterDone[id];
    if (read < reveals.length) {
      text = 'Изучи все примеры и пройди тест.';
    }
    if (id === 'algorithm' && !chapterDone[id]) text = 'Собери порядок действий и пройди тренажёр: завершено ' + TRAINING_STEPS.filter((_, i) => answerState('trainer-' + i).done).length + ' из 7 шагов.';
    if (id === 'control' && !chapterDone[id]) text = 'Отметь нарушения, которые встречаются на твоей смене, и сохрани выбор.';
    status.textContent = text;
  });
  if (persist) saveProgress();
}
function completeChapter() { refreshLearning(); }
function goNext(from, to) {
  refreshLearning();
  if (!chapterReady(from)) return;
  navigateTo(to);
}
function collectState() {
  return { version: PROGRESS_VERSION, learning };
}
function loadProgress() {
  let json = '';
  try { if (window.SCORM) json = SCORM.get('cmi.suspend_data') || ''; } catch (e) {}
  try { if (!json) json = localStorage.getItem(PROGRESS_KEY) || ''; } catch (e) {}
  try {
    const s = JSON.parse(json || '{}');
    if (s.version === PROGRESS_VERSION && s.learning && Array.isArray(s.learning.seen) && Array.isArray(s.learning.shift) && Array.isArray(s.learning.order) && s.learning.answers && typeof s.learning.answers === 'object') {
      learning = s.learning;
      learning.trainerStep = Math.max(0, Math.min(6, Number(learning.trainerStep) || 0));
      const firstPending = TRAINING_STEPS.findIndex((_, i) => !answerState('trainer-' + i).done);
      if (firstPending >= 0) learning.trainerStep = Math.min(learning.trainerStep, firstPending);
    } else {
      learning = freshLearning();
      try { localStorage.removeItem(PROGRESS_KEY + '_completed'); } catch (e) {}
      saveProgress();
    }
  } catch (e) {
    learning = freshLearning();
    try { localStorage.removeItem(PROGRESS_KEY + '_completed'); } catch (storageError) {}
    saveProgress();
  }
  ['intro', 'match-0', 'match-1'].forEach(renderChoice);
  document.querySelectorAll('[data-reveal-id]').forEach(btn => btn.classList.toggle('was-read', learning.seen.includes(btn.dataset.revealId)));
  document.querySelectorAll('#shift-practice .closed-choice').forEach(btn => btn.classList.toggle('selected', learning.shift.includes(btn.dataset.key)));
  if (learning.shift.length) showShiftFeedback();
  restoreSort();
  restoreSystem();
  renderTrainer();
  updateFinalQuiz();
  refreshLearning(false);
}
function resetProgressForNewAttempt() {
  learning = freshLearning();
  try { localStorage.removeItem(PROGRESS_KEY + '_completed'); } catch (e) {}
  refreshLearning();
  loadProgress();
}
function showShiftFeedback() {
  const fb = document.getElementById('shift-feedback');
  fb.className = 'feedback-box show correct';
  fb.textContent = 'Выбор сохранён. Используй его, чтобы определить, за чем наблюдать на смене.';
}
function checkShiftChoices() {
  const selected = [...document.querySelectorAll('#shift-practice .closed-choice.selected')];
  if (!selected.length) {
    const fb = document.getElementById('shift-feedback');
    fb.className = 'feedback-box show incorrect';
    fb.textContent = 'Выбери хотя бы один вариант. Здесь нет правильных или неправильных ответов.';
    return;
  }
  learning.shift = selected.map(btn => btn.dataset.key);
  showShiftFeedback();
  refreshLearning();
}
function sortOrder() { return [...document.querySelectorAll('#sortable-list .sort-item')].map(el => Number(el.dataset.idx)); }
function checkSortOrder() {
  if (answerState('sort').done) return;
  learning.order = sortOrder();
  const correct = CORRECT_ORDER.every((v, i) => v === learning.order[i]);
  const tries = answerState('sort').tries + 1;
  const mismatch = learning.order.findIndex((value, index) => value !== CORRECT_ORDER[index]);
  const labels = [...document.querySelectorAll('#sortable-list .sort-item')];
  const reason = correct ? '' : 'На позиции ' + (mismatch + 1) + ' стоит «' + labels.find(el => Number(el.dataset.idx) === learning.order[mismatch]).children[1].textContent + '», хотя здесь нужно «' + labels.find(el => Number(el.dataset.idx) === CORRECT_ORDER[mismatch]).children[1].textContent + '». Действия должны идти от остановки нарушения к обучению и последующей проверке. ';
  learning.answers.sort = { tries, correct, done: correct || tries >= MAX_ATTEMPTS, reason };
  if (answerState('sort').done) learning.order = CORRECT_ORDER.slice();
  restoreSort();
  refreshLearning();
}
function restoreSort() {
  const list = document.getElementById('sortable-list'), state = answerState('sort');
  learning.order.forEach(id => { const el = list.querySelector('[data-idx="' + id + '"]'); if (el) list.appendChild(el); });
  list.classList.toggle('exercise-done', !!state.done);
  list.querySelectorAll('.sort-item').forEach(el => { el.draggable = !state.done; });
  list.querySelectorAll('button').forEach(btn => { btn.disabled = !!state.done; });
  document.querySelector('[onclick="checkSortOrder()"]').disabled = !!state.done;
  const fb = document.getElementById('sort-feedback');
  if (!state.tries) return;
  fb.className = 'feedback-box show ' + (state.done ? 'correct' : 'incorrect');
  fb.textContent = state.correct ? 'Верно. Теперь примени эти семь шагов в тренажёре ниже.' : state.done ? 'Неверно. ' + state.reason + 'Верный порядок — заметь → останови риск → дай ОС по ФПР → покажи → потренируй → передай информацию → проверь через несколько дней, потому что сначала нужно прекратить нарушение, затем обучить сотрудника и убедиться, что правильное действие закрепилось.' : 'Подсказка: сначала обнаружь нарушение и останови риск; после объяснения нужны показ и практика. Цикл заканчивается проверкой через несколько дней.';
}
function moveSort(item, direction) {
  if (answerState('sort').done) return;
  const sibling = direction < 0 ? item.previousElementSibling : item.nextElementSibling;
  if (sibling) direction < 0 ? sibling.before(item) : sibling.after(item);
  learning.order = sortOrder();
  saveProgress();
}
function pickSystemChoice(btn) {
  if (answerState('system').done) return;
  btn.closest('.control-choice-group').querySelectorAll('.system-choice').forEach(el => el.classList.remove('selected'));
  btn.classList.add('selected');
}
function checkControlCycle() {
  if (answerState('system').done) return;
  const selected = [...document.querySelectorAll('#control-practice .system-choice.selected')];
  const fb = document.getElementById('control-feedback');
  if (selected.length !== 3) {
    fb.className = 'feedback-box show incorrect';
    fb.textContent = 'Выбери действие для каждого из трёх этапов. Попытка ещё не использована.';
    return;
  }
  const correct = selected.every(btn => btn.dataset.choice === 'right');
  const tries = answerState('system').tries + 1;
  learning.answers.system = { tries, correct, done: correct || tries >= MAX_ATTEMPTS, choice: selected.map(btn => btn.dataset.choice) };
  restoreSystem();
  refreshLearning();
}
function restoreSystem() {
  const state = answerState('system');
  document.querySelectorAll('#control-practice .control-choice-group').forEach((group, i) => {
    learning.systemOrder[i].forEach(choice => group.appendChild(group.querySelector('[data-choice="' + choice + '"]')));
    group.querySelectorAll('button').forEach(btn => {
      btn.disabled = !!state.done;
      btn.classList.toggle('selected', state.choice?.[i] === btn.dataset.choice);
      btn.classList.toggle('correct-pick', !!state.done && btn.dataset.choice === 'right');
    });
  });
  document.querySelector('[onclick="checkControlCycle()"]').disabled = !!state.done;
  const fb = document.getElementById('control-feedback');
  if (!state.tries) return;
  const reasons = [
    'Наблюдение: проверка только в начале смены и отчёт старшего не заменяют регулярное наблюдение за соблюдением стандарта в работе.',
    'Реакция: разбор в конце смены не останавливает нарушение в момент, когда оно происходит.',
    'Проверка: подтверждение понимания не доказывает, что сотрудник выполняет процедуру правильно. Нужно вернуться и посмотреть на его работу.'
  ].filter((_, i) => state.choice[i] === 'wrong').join(' ');
  fb.className = 'feedback-box show ' + (state.done ? 'correct' : 'incorrect');
  fb.textContent = state.correct ? 'Верно. Наблюдение, реакция и проверка работают как единый цикл.' : state.done ? 'Неверно. ' + reasons + ' Верные действия — регулярно проверять соблюдение стандартов, сразу давать ОС по ФПР и возвращаться через несколько дней для проверки, потому что контроль должен включать обнаружение нарушения, своевременную реакцию и проверку усвоенного навыка.' : 'Подсказка: наблюдай в течение смены, реагируй в момент нарушения, а усвоение процедуры проверяй в работе через несколько дней.';
}
function renderTrainer() {
  const i = learning.trainerStep, step = TRAINING_STEPS[i];
  const stepper = document.getElementById('trainer-stepper');
  if (stepper) {
    stepper.replaceChildren();
    TRAINING_STEPS.forEach((item, index) => {
      const state = answerState('trainer-' + index);
      const li = document.createElement('li');
      li.className = 'trainer-stepper__item ' + (index === i ? 'is-current' : state.done ? 'is-complete' : 'is-upcoming') + (state.done ? ' is-done' : '');
      if (index === i) li.setAttribute('aria-current', 'step');
      const marker = document.createElement('span');
      marker.className = 'trainer-stepper__marker';
      marker.textContent = state.done && index !== i ? '✓' : String(index + 1);
      const label = document.createElement('span');
      label.className = 'trainer-stepper__label';
      label.textContent = item.title;
      li.append(marker, label);
      stepper.appendChild(li);
    });
  }
  document.getElementById('trainer-progress').textContent = 'Шаг ' + (i + 1) + ' из 7 · ' + step.title;
  document.getElementById('trainer-question').textContent = step.question;
  const options = document.getElementById('trainer-options');
  options.replaceChildren();
  step.options.forEach((text, choice) => {
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'match-btn'; btn.textContent = text;
    btn.addEventListener('click', () => { submitChoice('trainer-' + i, choice); updateTrainerNext(); });
    options.appendChild(btn);
  });
  renderChoice('trainer-' + i);
  updateTrainerNext();
}
function updateTrainerNext() {
  const currentItem = document.querySelectorAll('#trainer-stepper .trainer-stepper__item')[learning.trainerStep];
  const currentDone = answerState('trainer-' + learning.trainerStep).done;
  if (currentItem) {
    currentItem.classList.toggle('is-done', currentDone);
    const marker = currentItem.querySelector('.trainer-stepper__marker');
    if (marker) marker.textContent = currentDone ? '✓' : String(learning.trainerStep + 1);
  }
  const btn = document.getElementById('trainer-next');
  btn.disabled = !currentDone;
  btn.hidden = learning.trainerStep === 6;
  document.getElementById('trainer-back').hidden = learning.trainerStep === 0;
  document.getElementById('trainer-summary').hidden = !TRAINING_STEPS.every((_, i) => answerState('trainer-' + i).done);
}
function nextTrainerStep() {
  if (!answerState('trainer-' + learning.trainerStep).done || learning.trainerStep >= 6) return;
  learning.trainerStep++;
  renderTrainer(); saveProgress();
  document.getElementById('trainer-question').focus({ preventScroll: true });
  document.getElementById('shift-trainer').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function previousTrainerStep() {
  if (learning.trainerStep === 0) return;
  learning.trainerStep--;
  renderTrainer(); saveProgress();
  document.getElementById('trainer-question').focus({ preventScroll: true });
}
function finalQuizReady() {
  return FINAL_QUESTIONS.every((_, index) => answerState('final-' + index).done);
}
function answerFinal(index, choice) {
  submitChoice('final-' + index, choice);
  updateFinalQuiz();
}
function updateFinalQuiz() {
  FINAL_QUESTIONS.forEach((_, index) => renderChoice('final-' + index));
  const completed = FINAL_QUESTIONS.filter((_, index) => answerState('final-' + index).done).length;
  const status = document.getElementById('final-quiz-status');
  const finish = document.querySelector('#page-conclusion .finish-card .btn-next');
  if (status) status.textContent = finalQuizReady() ? 'Тест завершён. Можно завершить курс.' : 'Завершено вопросов: ' + completed + ' из ' + FINAL_QUESTIONS.length + '.';
  if (finish && finish.textContent !== 'Курс завершён') {
    finish.disabled = !finalQuizReady();
    finish.setAttribute('aria-disabled', String(finish.disabled));
  }
}
document.addEventListener('DOMContentLoaded', () => {
  CHAPTER_ORDER.forEach((id, i) => {
    const back = document.createElement('button');
    back.type = 'button'; back.className = 'btn-secondary course-back';
    back.textContent = i === 0 ? '← К оглавлению' : '← Назад';
    back.addEventListener('click', () => navigateTo(i === 0 ? 'home' : CHAPTER_ORDER[i - 1]));
    const row = document.querySelector('#page-' + id + ' .next-row');
    row.classList.add('course-navigation');
    row.prepend(back);
  });
  document.querySelectorAll('.pyramid-level, .chain-toggle').forEach((btn, i) => { btn.dataset.revealId = 'text-' + i; });
  Object.keys(chapterDone).forEach(id => {
    const row = document.querySelector('#page-' + id + ' .next-row');
    const status = document.createElement('p');
    status.className = 'chapter-gate'; status.id = 'gate-' + id; status.setAttribute('role', 'status');
    row.before(status);
    row.querySelector('.btn-next').setAttribute('aria-describedby', status.id);
  });
  document.querySelectorAll('#sortable-list .sort-item').forEach(item => {
    const controls = document.createElement('span'); controls.className = 'sort-controls';
    [-1, 1].forEach(dir => {
      const btn = document.createElement('button'); btn.type = 'button'; btn.textContent = dir < 0 ? '↑' : '↓';
      btn.setAttribute('aria-label', (dir < 0 ? 'Выше: ' : 'Ниже: ') + item.children[1].textContent);
      btn.addEventListener('click', () => moveSort(item, dir)); controls.appendChild(btn);
    });
    item.appendChild(controls);
  });
  const list = document.getElementById('sortable-list');
  ['dragstart', 'touchstart', 'touchend', 'drop'].forEach(type => list.addEventListener(type, event => {
    if (answerState('sort').done) { event.preventDefault(); event.stopImmediatePropagation(); }
  }, true));
  ['drop', 'touchend'].forEach(type => list.addEventListener(type, () => { learning.order = sortOrder(); saveProgress(); }));
  renderTrainer();
  updateFinalQuiz();
  refreshLearning(false);
});

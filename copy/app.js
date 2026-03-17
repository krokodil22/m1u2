const levels = [
  {
    sourceHtml:
      'Штаб: Перед стартом проверьте статус маяка. Код для копирования: <span class="highlight-copy">СТАРТ-01</span>.',
    target: 'СТАРТ-01',
    hint: 'Скопируй текст, выделенный цветом.'
  },
  {
    sourceHtml:
      'Штаб: Для связи с орбитой используйте канал <span class="highlight-copy">ВОЛНА-7</span> и ждите ответ.',
    target: 'ВОЛНА-7',
    hint: 'Скопируй цветной фрагмент без изменений.'
  },
  {
    sourceHtml:
      'Штаб: Контрольная метка посадки — <span class="highlight-copy">ЛУНА-А</span>. Передай её экипажу.',
    target: 'ЛУНА-А',
    hint: 'Скопируй подсвеченный текст.'
  },
  {
    source:
      'Штаб: Перед выходом из модуля убедитесь, что перчатки надеты, а страховка закреплена.',
    target: 'перчатки надеты',
    hint: 'Скопируй фразу: «перчатки надеты».'
  },
  {
    source:
      'Штаб: Перед стартом убедитесь, что шлем надет, ремни пристёгнуты, а связь со станцией установлена.',
    target: 'шлем надет',
    hint: 'Скопируй фразу: «шлем надет».'
  },
  {
    source:
      'Штаб: Для выхода на орбиту необходимо включить главный двигатель ровно на 12 секунд.',
    target: 'включить главный двигатель ровно на 12 секунд',
    hint: 'Скопируй действие и время включения двигателя.'
  },
  {
    source:
      'Штаб: На подлёте к модулю стыковки держите скорость 7 м/с и курс северо-восток 45 градусов.',
    target: 'скорость 7 м/с и курс северо-восток 45 градусов',
    hint: 'Скопируй параметры скорости и курса полностью.'
  },
  {
    source:
      'Штаб: В секторе наблюдается метеоритный поток, поэтому экипажу нужно закрыть внешние панели и активировать защитный щит на 3 минуты.',
    target: 'закрыть внешние панели и активировать защитный щит на 3 минуты',
    hint: 'Скопируй инструкцию по защите от метеоритов.'
  },
  {
    source:
      'Штаб: После посадки на Луну командир должен передать в журнал координаты точки высадки: кратер Артемида, квадрат B-17, модуль Луна-3.',
    target: 'кратер Артемида, квадрат B-17, модуль Луна-3',
    hint: 'Скопируй координаты точки высадки без ошибок.'
  },
  {
    source:
      'Штаб: Финальная проверка — отправьте в центр строку подтверждения: миссия выполнена, экипаж стабилен, топливо 64%.',
    target: 'миссия выполнена, экипаж стабилен, топливо 64%',
    hint: 'Финал! Скопируй строку подтверждения полностью.'
  }
];

const sourceTextEl = document.getElementById('sourceText');
const copyHintEl = document.getElementById('copyHint');
const levelNumberEl = document.getElementById('levelNumber');
const totalLevelsEl = document.getElementById('totalLevels');
const selectionStatusEl = document.getElementById('selectionStatus');
const pasteAreaEl = document.getElementById('pasteArea');
const pasteStatusEl = document.getElementById('pasteStatus');
const nextLevelBtn = document.getElementById('nextLevelBtn');
const guideButtons = document.querySelectorAll('.guide-btn');
const guideModalEl = document.getElementById('guideModal');
const guideModalTitleEl = document.getElementById('guideModalTitle');
const guideModalTextEl = document.getElementById('guideModalText');
const guideModalImageEl = document.getElementById('guideModalImage');
const closeGuideModalBtn = document.getElementById('closeGuideModal');

const guideContent = {
  keyboard: {
    title: 'Как копировать с помощью клавиш',
    image: 'keyboard-copy-hint.svg'
  },
  mouse: {
    title: 'Как копировать с помощью мыши',
    image: 'mouse-copy-hint.svg'
  }
};

let levelIndex = 0;
let isCorrectSelection = false;

function setStatus(element, text, isGood) {
  element.textContent = text;
  element.classList.remove('good', 'bad');
  if (text) {
    element.classList.add(isGood ? 'good' : 'bad');
  }
}

function normalize(value) {
  return value.trim().replace(/\s+/g, ' ');
}

function renderLevel() {
  const level = levels[levelIndex];
  if (level.sourceHtml) {
    sourceTextEl.innerHTML = level.sourceHtml;
  } else {
    sourceTextEl.textContent = level.source;
  }
  copyHintEl.textContent = level.hint;
  levelNumberEl.textContent = String(levelIndex + 1);
  totalLevelsEl.textContent = String(levels.length);
  pasteAreaEl.value = '';
  isCorrectSelection = false;
  setStatus(selectionStatusEl, 'Выдели нужный фрагмент в тексте слева.', false);
  setStatus(pasteStatusEl, 'Сначала правильно выдели текст, потом скопируй и вставь его сюда.', false);
  nextLevelBtn.hidden = true;
}

function checkSelection() {
  const selection = window.getSelection();
  const selectedText = normalize(selection ? selection.toString() : '');

  if (!selectedText) {
    isCorrectSelection = false;
    setStatus(selectionStatusEl, 'Пока ничего не выделено. Попробуй ещё!', false);
    return;
  }

  const target = normalize(levels[levelIndex].target);
  if (selectedText === target) {
    isCorrectSelection = true;
    setStatus(
      selectionStatusEl,
      '✅ Отлично! Фрагмент выделен верно. Теперь скопируй его через правую кнопку мыши или Ctrl+C.',
      true
    );
    if (!pasteAreaEl.value.trim()) {
      setStatus(pasteStatusEl, 'Теперь вставь текст в поле справа (Ctrl+V или через меню).', false);
    }
  } else {
    isCorrectSelection = false;
    setStatus(selectionStatusEl, '❌ Выделен не тот текст. Сверься с подсказкой и попробуй снова.', false);
  }
}

function checkPaste() {
  if (!isCorrectSelection) {
    setStatus(pasteStatusEl, 'Сначала нужно правильно выделить нужный фрагмент слева.', false);
    return;
  }

  const pasted = normalize(pasteAreaEl.value);
  const target = normalize(levels[levelIndex].target);

  if (!pasted) {
    setStatus(pasteStatusEl, 'Поле пустое. Вставь скопированный текст.', false);
    return;
  }

  if (pasted === target) {
    setStatus(pasteStatusEl, 'Отлично! Необходимая информация получена!', true);
    nextLevelBtn.hidden = false;
    nextLevelBtn.textContent =
      levelIndex === levels.length - 1 ? 'Пройти миссию заново' : 'Перейти на следующий уровень';
  } else {
    nextLevelBtn.hidden = true;
    setStatus(pasteStatusEl, 'Пока неверно. Убедись, что вставлен точный фрагмент без изменений.', false);
  }
}

function openGuideModal(type) {
  const guide = guideContent[type];
  if (!guide) return;

  guideModalTitleEl.textContent = guide.title;
  guideModalTextEl.textContent = guide.text;
  guideModalImageEl.src = guide.image;
  guideModalEl.hidden = false;
}

function closeGuideModal() {
  guideModalEl.hidden = true;
}

sourceTextEl.addEventListener('mouseup', checkSelection);
sourceTextEl.addEventListener('keyup', checkSelection);
document.addEventListener('selectionchange', () => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  const anchorNode = selection.anchorNode;
  if (anchorNode && sourceTextEl.contains(anchorNode)) {
    checkSelection();
  }
});

pasteAreaEl.addEventListener('input', checkPaste);
pasteAreaEl.addEventListener('paste', () => setTimeout(checkPaste, 0));

nextLevelBtn.addEventListener('click', () => {
  levelIndex = (levelIndex + 1) % levels.length;
  renderLevel();
});

for (const button of guideButtons) {
  button.addEventListener('click', () => {
    openGuideModal(button.dataset.guide);
  });
}

closeGuideModalBtn.addEventListener('click', closeGuideModal);
guideModalEl.addEventListener('click', (event) => {
  if (event.target === guideModalEl) {
    closeGuideModal();
  }
});

renderLevel();

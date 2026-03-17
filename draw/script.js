const wordsByDifficulty = {
  easy: [
    'Солнце', 'облако', 'радуга', 'дождик', 'снежинка', 'звезда', 'луна', 'дом', 'окно', 'дверь', 'дерево', 'цветок', 'гриб', 'яблоко', 'груша', 'арбуз', 'морковка', 'тыква', 'мяч', 'шар', 'флажок', 'кубик', 'книга', 'чашка', 'ложка', 'тарелка', 'зонт', 'шапка', 'шарф', 'подарок', 'торт', 'мороженое', 'свеча'
  ],
  medium: [
    'Замок', 'машина', 'автобус', 'поезд', 'кораблик', 'ракета', 'самолёт', 'велосипед', 'самокат', 'робот', 'кукла', 'барабан', 'пианино', 'телефон', 'телевизор', 'компьютер', 'клавиатура', 'лампа', 'стул', 'стол', 'шкаф', 'диван', 'кровать', 'рюкзак', 'чемодан', 'часы', 'чайник', 'ваза', 'аквариум', 'горка', 'качели', 'лестница', 'мост'
  ],
  hard: [
    'Фонарь', 'карусель', 'башня', 'дворец', 'лабиринт', 'карта', 'глобус', 'корона', 'трон', 'доспехи', 'маска', 'витрина', 'сцена', 'фейерверк', 'салют', 'праздник', 'веселье', 'грусть', 'радость', 'дружба', 'мечта', 'фантазия', 'тишина', 'музыка', 'танец', 'скорость', 'движение', 'зима', 'лето', 'ночь', 'утро', 'космос', 'волшебство'
  ]
};

const rulesScreen = document.getElementById('rules-screen');
const drawScreen = document.getElementById('draw-screen');
const resultScreen = document.getElementById('result-screen');

const getWordBtn = document.getElementById('get-word-btn');
const generatedWordElement = document.getElementById('generated-word');
const wordBox = document.getElementById('word-box');
const startBtn = document.getElementById('start-btn');
const doneBtn = document.getElementById('done-btn');
const restartBtn = document.getElementById('restart-btn');
const resultWord = document.getElementById('result-word');
const resultImage = document.getElementById('result-image');
const clearBtn = document.getElementById('clear-btn');

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const toolButtons = document.querySelectorAll('.tool[data-tool]');
const undoBtn = document.getElementById('undo-btn');
const colorPicker = document.getElementById('color-picker');
const sizeRange = document.getElementById('size-range');

let currentWord = '';
let currentTool = 'pencil';
let isDrawing = false;
let startX = 0;
let startY = 0;
let snapshot = null;
const undoStack = [];
const MAX_UNDO_STEPS = 20;

function switchScreen(showScreen) {
  [rulesScreen, drawScreen, resultScreen].forEach((screen) => {
    const active = screen === showScreen;
    screen.classList.toggle('active', active);
    screen.setAttribute('aria-hidden', String(!active));
  });
}

function randomWordFromDifficulty(difficulty) {
  const list = wordsByDifficulty[difficulty];
  const index = Math.floor(Math.random() * list.length);
  return list[index];
}

function getSelectedDifficulty() {
  const selected = document.querySelector('input[name="difficulty"]:checked');
  return selected ? selected.value : 'easy';
}

function setupCanvas(resetHistory = false) {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (resetHistory) {
    undoStack.length = 0;
  }
}

function saveStateForUndo() {
  undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  if (undoStack.length > MAX_UNDO_STEPS) {
    undoStack.shift();
  }
}

function undoLastAction() {
  const previousState = undoStack.pop();
  if (!previousState) {
    return;
  }
  ctx.putImageData(previousState, 0, 0);
}

function getPointerPosition(event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY
  };
}

function drawShape(x, y) {
  const width = x - startX;
  const height = y - startY;

  if (currentTool === 'line') {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  if (currentTool === 'rect') {
    ctx.strokeRect(startX, startY, width, height);
  }

  if (currentTool === 'circle') {
    const radius = Math.sqrt(width ** 2 + height ** 2);
    ctx.beginPath();
    ctx.arc(startX, startY, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (currentTool === 'triangle') {
    ctx.beginPath();
    ctx.moveTo(startX + width / 2, startY);
    ctx.lineTo(startX, startY + height);
    ctx.lineTo(startX + width, startY + height);
    ctx.closePath();
    ctx.stroke();
  }
}

function hexToRgb(hex) {
  const value = hex.replace('#', '');
  const bigint = parseInt(value, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
    a: 255
  };
}

function colorsMatch(data, index, color) {
  return (
    data[index] === color.r &&
    data[index + 1] === color.g &&
    data[index + 2] === color.b &&
    data[index + 3] === color.a
  );
}

function floodFill(x, y, fillHex) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const targetIndex = (Math.floor(y) * canvas.width + Math.floor(x)) * 4;
  const targetColor = {
    r: data[targetIndex],
    g: data[targetIndex + 1],
    b: data[targetIndex + 2],
    a: data[targetIndex + 3]
  };
  const fillColor = hexToRgb(fillHex);

  if (
    targetColor.r === fillColor.r &&
    targetColor.g === fillColor.g &&
    targetColor.b === fillColor.b &&
    targetColor.a === fillColor.a
  ) {
    return;
  }

  const stack = [[Math.floor(x), Math.floor(y)]];
  while (stack.length > 0) {
    const [currentX, currentY] = stack.pop();
    if (
      currentX < 0 ||
      currentY < 0 ||
      currentX >= canvas.width ||
      currentY >= canvas.height
    ) {
      continue;
    }

    const idx = (currentY * canvas.width + currentX) * 4;
    if (!colorsMatch(data, idx, targetColor)) {
      continue;
    }

    data[idx] = fillColor.r;
    data[idx + 1] = fillColor.g;
    data[idx + 2] = fillColor.b;
    data[idx + 3] = fillColor.a;

    stack.push([currentX + 1, currentY]);
    stack.push([currentX - 1, currentY]);
    stack.push([currentX, currentY + 1]);
    stack.push([currentX, currentY - 1]);
  }

  ctx.putImageData(imageData, 0, 0);
}

function beginDraw(event) {
  const { x, y } = getPointerPosition(event);

  if (currentTool === 'fill') {
    saveStateForUndo();
    floodFill(x, y, colorPicker.value);
    return;
  }

  saveStateForUndo();
  isDrawing = true;
  startX = x;
  startY = y;

  ctx.strokeStyle = currentTool === 'eraser' ? '#ffffff' : colorPicker.value;
  ctx.lineWidth = Number(sizeRange.value);

  if (currentTool === 'pencil' || currentTool === 'eraser') {
    ctx.beginPath();
    ctx.moveTo(x, y);
  } else {
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
  }
}

function draw(event) {
  if (!isDrawing) {
    return;
  }

  const { x, y } = getPointerPosition(event);

  if (currentTool === 'pencil' || currentTool === 'eraser') {
    ctx.lineTo(x, y);
    ctx.stroke();
    return;
  }

  if (snapshot) {
    ctx.putImageData(snapshot, 0, 0);
  }
  drawShape(x, y);
}

function finishDraw(event) {
  if (!isDrawing) {
    return;
  }

  if (currentTool !== 'pencil' && currentTool !== 'eraser') {
    const { x, y } = getPointerPosition(event);
    if (snapshot) {
      ctx.putImageData(snapshot, 0, 0);
    }
    drawShape(x, y);
  }

  isDrawing = false;
  snapshot = null;
}

getWordBtn.addEventListener('click', () => {
  currentWord = randomWordFromDifficulty(getSelectedDifficulty());
  generatedWordElement.textContent = currentWord;
  wordBox.hidden = false;
});

startBtn.addEventListener('click', () => {
  if (!currentWord) {
    return;
  }
  switchScreen(drawScreen);
});

toolButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentTool = button.dataset.tool;
    toolButtons.forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');
  });
});

clearBtn.addEventListener('click', () => {
  saveStateForUndo();
  setupCanvas();
});

undoBtn.addEventListener('click', undoLastAction);

doneBtn.addEventListener('click', () => {
  resultWord.textContent = currentWord;
  resultImage.src = canvas.toDataURL('image/png');
  switchScreen(resultScreen);
});

restartBtn.addEventListener('click', () => {
  currentWord = '';
  generatedWordElement.textContent = '';
  wordBox.hidden = true;
  switchScreen(rulesScreen);
  setupCanvas(true);
});

canvas.addEventListener('pointerdown', beginDraw);
canvas.addEventListener('pointermove', draw);
canvas.addEventListener('pointerup', finishDraw);
canvas.addEventListener('pointerleave', finishDraw);

setupCanvas(true);

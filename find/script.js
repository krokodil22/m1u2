const game = document.querySelector('.game');
const draggableProps = document.querySelectorAll('.draggable');
const dinos = document.querySelectorAll('.dino');
const foundCount = document.getElementById('found-count');
const totalCount = document.getElementById('total-count');
const winMessage = document.getElementById('win-message');
const resetButton = document.getElementById('reset-game');

const codeWords = ['экран', 'мышка', 'кнопка', 'файл', 'робот', 'код', 'игра', 'цифра', 'диск'];

let found = 0;
totalCount.textContent = String(dinos.length);

let topZ = 6;

const initialPropPositions = Array.from(draggableProps, (item) => ({
  item,
  left: item.style.left,
  top: item.style.top,
  zIndex: item.style.zIndex,
}));

const toPercent = (value, max) => `${(value / max) * 100}%`;

const resetGame = () => {
  found = 0;
  foundCount.textContent = '0';
  winMessage.classList.remove('visible');

  dinos.forEach((dino) => {
    dino.classList.remove('found');
  });

  initialPropPositions.forEach(({ item, left, top, zIndex }) => {
    item.style.left = left;
    item.style.top = top;
    item.style.zIndex = zIndex;
    item.classList.remove('dragging');
  });

  topZ = 6;
};

resetButton.addEventListener('click', resetGame);

draggableProps.forEach((item) => {
  item.addEventListener('pointerdown', (event) => {
    event.preventDefault();

    const gameRect = game.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const shiftX = event.clientX - itemRect.left;
    const shiftY = event.clientY - itemRect.top;

    item.classList.add('dragging');
    item.style.zIndex = String(++topZ);
    item.setPointerCapture(event.pointerId);

    const onMove = (moveEvent) => {
      let leftPx = moveEvent.clientX - gameRect.left - shiftX;
      let topPx = moveEvent.clientY - gameRect.top - shiftY;

      leftPx = Math.max(0, Math.min(leftPx, gameRect.width - itemRect.width));
      topPx = Math.max(0, Math.min(topPx, gameRect.height - itemRect.height));

      item.style.left = toPercent(leftPx, gameRect.width);
      item.style.top = toPercent(topPx, gameRect.height);
    };

    const onEnd = () => {
      item.classList.remove('dragging');
      item.removeEventListener('pointermove', onMove);
      item.removeEventListener('pointerup', onEnd);
      item.removeEventListener('pointercancel', onEnd);
    };

    item.addEventListener('pointermove', onMove);
    item.addEventListener('pointerup', onEnd);
    item.addEventListener('pointercancel', onEnd);
  });
});

dinos.forEach((dino) => {
  dino.addEventListener('dblclick', () => {
    if (dino.classList.contains('found')) {
      return;
    }

    dino.classList.add('found');
    found += 1;
    foundCount.textContent = String(found);

    if (found === dinos.length) {
      const randomWord = codeWords[Math.floor(Math.random() * codeWords.length)];
      winMessage.innerHTML = 'Отлично! Все друзья Гриши найдены!<br>Твое кодовое слово: <span class="code-word">' + randomWord + '</span>';
      winMessage.classList.add('visible');
    }
  });
});

const gameArea = document.getElementById('game-area');
const player = document.getElementById('player');
const startOverlay = document.getElementById('start-overlay');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const modal = document.getElementById('game-over-modal');
const gameOverMessage = document.getElementById('game-over-message');

const GOOD_ITEMS = ['apple.png','banana.png', 'berry.png', 'cake.png'];
const BAD_ITEMS = ['bulb.png', 'rock.png', 'wood.png', 'ball.png'];
const PLAYER_STEP = 38;
const PLAYER_SIZE = 84;
const ITEM_SIZE = 54;
const SPAWN_INTERVAL = 700;

let score = 0;
let lives = 3;
let playing = false;
let playerY = 240;
let animationId;
let spawnTimer;
let gameStartTime = 0;
const items = [];
const LIFE_ICON = '❤️';

function renderLives() {
  livesEl.innerHTML = '';
  for (let i = 0; i < lives; i += 1) {
    const icon = document.createElement('span');
    icon.className = 'life-icon';
    icon.textContent = LIFE_ICON;
    icon.setAttribute('aria-hidden', 'true');
    livesEl.appendChild(icon);
  }
  livesEl.setAttribute('aria-label', `Оставшиеся жизни: ${lives}`);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function setPlayerY(y) {
  const maxY = gameArea.clientHeight - PLAYER_SIZE;
  playerY = clamp(y, 0, maxY);
  player.style.top = `${playerY}px`;
}

function showFloatingScore(text, type) {
  const scoreFlash = document.createElement('span');
  scoreFlash.className = `floating-score ${type}`;
  scoreFlash.textContent = text;

  const flashTop = clamp(playerY + PLAYER_SIZE / 2 - 18, 4, gameArea.clientHeight - 36);
  scoreFlash.style.top = `${flashTop}px`;

  gameArea.appendChild(scoreFlash);
  setTimeout(() => {
    scoreFlash.remove();
  }, 760);
}

function resetGame() {
  score = 0;
  lives = 3;
  scoreEl.textContent = String(score);
  renderLives();
  modal.classList.add('hidden');
  clearItems();
  setPlayerY((gameArea.clientHeight - PLAYER_SIZE) / 2);
}

function clearItems() {
  while (items.length) {
    const item = items.pop();
    item.el.remove();
  }
}

function createItem() {
  const isBad = Math.random() < 0.45;
  const imageList = isBad ? BAD_ITEMS : GOOD_ITEMS;
  const src = imageList[Math.floor(Math.random() * imageList.length)];
  const y = Math.random() * (gameArea.clientHeight - ITEM_SIZE);

  const el = document.createElement('img');
  el.src = src;
  el.alt = isBad ? 'Опасный предмет' : 'Полезный предмет';
  el.className = 'item';
  const x = gameArea.clientWidth + ITEM_SIZE;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;

  gameArea.appendChild(el);
  items.push({
    x,
    y,
    el,
    isBad,
    src,
    speedBase: 2.6 + Math.random() * 1.0,
  });
}

function intersects(item) {
  const playerLeft = 42;
  const playerRight = playerLeft + PLAYER_SIZE;
  const playerTop = playerY;
  const playerBottom = playerY + PLAYER_SIZE;

  const itemLeft = item.x;
  const itemRight = item.x + ITEM_SIZE;
  const itemTop = item.y;
  const itemBottom = item.y + ITEM_SIZE;

  return (
    playerLeft < itemRight &&
    playerRight > itemLeft &&
    playerTop < itemBottom &&
    playerBottom > itemTop
  );
}

function endGame() {
  playing = false;
  clearInterval(spawnTimer);
  cancelAnimationFrame(animationId);
  gameOverMessage.textContent = `Игра окончена! Твой счет: ${score}`;
  modal.classList.remove('hidden');
}

function update() {
  if (!playing) return;

  const elapsedSeconds = (performance.now() - gameStartTime) / 1000;
  const speedBoost = 1 + elapsedSeconds * 0.04;

  for (let i = items.length - 1; i >= 0; i -= 1) {
    const item = items[i];
    item.x -= item.speedBase * speedBoost;
    item.el.style.left = `${item.x}px`;

    if (intersects(item)) {
      if (item.isBad) {
        lives -= 1;
        renderLives();
        showFloatingScore('-1', 'minus');
      } else if (item.src === 'ball.png') {
        score -= 1;
        scoreEl.textContent = String(score);
        showFloatingScore('-1', 'minus');
      } else {
        score += 1;
        scoreEl.textContent = String(score);
        showFloatingScore('+1', 'plus');
      }
      item.el.remove();
      items.splice(i, 1);

      if (lives <= 0) {
        endGame();
        return;
      }
      continue;
    }

    if (item.x < -ITEM_SIZE * 1.5) {
      item.el.remove();
      items.splice(i, 1);
    }
  }

  animationId = requestAnimationFrame(update);
}

function startGame() {
  resetGame();
  playing = true;
  gameStartTime = performance.now();
  startOverlay.classList.add('hidden');

  spawnTimer = setInterval(() => {
    if (playing) createItem();
  }, SPAWN_INTERVAL);

  animationId = requestAnimationFrame(update);
}

window.addEventListener(
  'wheel',
  (event) => {
    if (!playing) return;
    event.preventDefault();

    if (event.deltaY < 0) {
      setPlayerY(playerY - PLAYER_STEP);
    } else if (event.deltaY > 0) {
      setPlayerY(playerY + PLAYER_STEP);
    }
  },
  { passive: false },
);

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

resetGame();

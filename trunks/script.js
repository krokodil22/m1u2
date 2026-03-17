const PIECE_TYPES = ["empty", "straight", "corner", "tee", "cross"];

const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const menuEl = document.getElementById("context-menu");
const rotateLeftBtn = document.getElementById("rotate-left");
const rotateRightBtn = document.getElementById("rotate-right");
const levelWinModalEl = document.getElementById("level-win-modal");
const levelWinMessageEl = document.getElementById("level-win-message");
const nextLevelBtn = document.getElementById("next-level-btn");

let selectedCell = null;
let menuCell = null;
let solvedPath = [];
let currentLevelIndex = 0;
let board = [];
let currentLevel = null;
let pendingNextLevelIndex = null;

const levels = buildLevels();
loadLevel(0);

function buildLevels() {
  return [
    {
      name: "Уровень 1",
      rows: 6,
      cols: 10,
      start: { row: 5, col: 9 },
      end: { row: 1, col: 0 },
      layout: [
        ["empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty"],
        ["end-h", "straight-v", "straight-v", "straight-h", "corner-ne", "empty", "empty", "empty", "empty", "empty"],
        ["empty", "empty", "empty", "empty", "straight-h", "empty", "empty", "empty", "empty", "empty"],
        ["empty", "empty", "empty", "empty", "straight-v", "empty", "empty", "empty", "empty", "empty"],
        ["empty", "empty", "empty", "empty", "straight-h", "empty", "empty", "empty", "empty", "empty"],
        ["empty", "empty", "empty", "empty", "corner-es", "straight-v", "straight-h", "straight-v", "straight-h", "start-h"],
      ],
    },
    {
      name: "Уровень 2",
      rows: 6,
      cols: 10,
      start: { row: 5, col: 9 },
      end: { row: 0, col: 0 },
      layout: [
        ["end-h", "straight-v", "corner-sw", "empty", "empty", "empty", "empty", "empty", "empty", "empty"],
        ["empty", "empty", "straight-v", "corner-ne", "straight-h", "corner-sw", "empty", "empty", "empty", "empty"],
        ["empty", "empty", "corner-es", "corner-sw", "empty", "straight-v", "empty", "empty", "empty", "empty"],
        ["empty", "empty", "empty", "tee-r", "empty", "corner-es", "straight-h", "corner-sw", "empty", "empty"],
        ["empty", "empty", "empty", "empty", "empty", "empty", "empty", "straight-v", "empty", "empty"],
        ["empty", "empty", "empty", "empty", "empty", "empty", "empty", "tee-r", "straight-h", "start-h"],
      ],
    },
    {
      name: "Уровень 3",
      rows: 6,
      cols: 10,
      start: { row: 5, col: 9 },
      end: { row: 0, col: 0 },
      layout: [
        ["end-h", "straight-v", "corner-sw", "empty", "empty", "empty", "empty", "empty", "empty", "empty"],
        ["empty", "empty", "tee-r", "corner-ne", "straight-h", "corner-sw", "empty", "empty", "empty", "empty"],
        ["empty", "empty", "corner-es", "tee-d", "cross", "straight-v", "empty", "empty", "empty", "empty"],
        ["empty", "empty", "empty", "tee-r", "empty", "corner-es", "straight-h", "corner-sw", "empty", "empty"],
        ["empty", "empty", "empty", "empty", "empty", "empty", "empty", "tee-l", "corner-ne", "empty"],
        ["empty", "empty", "empty", "empty", "empty", "empty", "empty", "tee-r", "straight-h", "start-h"],
      ],
    },
    {
      name: "Уровень 4",
      rows: 6,
      cols: 10,
      start: { row: 5, col: 9 },
      end: { row: 0, col: 0 },
      layout: [
        ["end-h", "corner-ne", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty"],
        ["empty", "tee-l", "straight-v", "corner-ne", "empty", "empty", "empty", "empty", "empty", "empty"],
        ["empty", "corner-es", "corner-nw", "tee-u", "corner-ne", "empty", "empty", "empty", "empty", "empty"],
        ["empty", "empty", "empty", "corner-es", "corner-sw", "corner-ne", "corner-sw", "empty", "empty", "empty"],
        ["empty", "empty", "empty", "empty", "empty", "corner-sw", "tee-l", "corner-es", "empty", "empty"],
        ["empty", "empty", "empty", "empty", "empty", "empty", "corner-sw", "corner-ne", "straight-v", "start-h"],
      ],
    },
    {
      name: "Уровень 5",
      rows: 6,
      cols: 10,
      start: { row: 5, col: 9 },
      end: { row: 0, col: 0 },
      layout: [
        ["end-h", "corner-ne", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty"],
        ["corner-es", "tee-u", "corner-sw", "corner-es", "straight-h", "tee-d", "corner-sw", "empty", "empty", "empty"],
        ["tee-r", "corner-sw", "corner-ne", "tee-l", "empty", "corner-ne", "tee-u", "corner-sw", "empty", "empty"],
        ["corner-ne", "tee-u", "corner-sw", "corner-ne", "straight-h", "tee-d", "corner-sw", "corner-ne", "corner-sw", "empty"],
        ["empty", "corner-es", "tee-u", "straight-h", "corner-sw", "empty", "corner-ne", "tee-u", "corner-nw", "empty"],
        ["empty", "empty", "empty", "empty", "corner-ne", "straight-h", "corner-sw", "corner-ne", "corner-es", "start-h"],
      ],
    },
  ];
}



function tokenToCell(token, row, col, level) {
  const fixed = token.startsWith("start") || token.startsWith("end");
  if (token === "empty") return { type: "empty", rotation: 0 };

  const map = {
    "straight-h": { type: "straight", rotation: 1 },
    "straight-v": { type: "straight", rotation: 0 },
    "corner-ne": { type: "corner", rotation: 0 },
    "corner-es": { type: "corner", rotation: 1 },
    "corner-sw": { type: "corner", rotation: 2 },
    "corner-nw": { type: "corner", rotation: 3 },
    "tee-u": { type: "tee", rotation: 0 },
    "tee-r": { type: "tee", rotation: 1 },
    "tee-d": { type: "tee", rotation: 2 },
    "tee-l": { type: "tee", rotation: 3 },
    cross: { type: "cross", rotation: 0 },
    "start-h": { type: "straight", rotation: 1, start: true, fixed: true },
    "end-h": { type: "straight", rotation: 1, end: true, fixed: true },
    "start-v": { type: "straight", rotation: 0, start: true, fixed: true },
    "end-v": { type: "straight", rotation: 0, end: true, fixed: true },
  };

  const base = map[token];
  if (!base) {
    return {
      type: PIECE_TYPES[Math.floor(Math.random() * (PIECE_TYPES.length - 1)) + 1],
      rotation: Math.floor(Math.random() * 4),
    };
  }

  return {
    type: base.type,
    rotation: base.rotation,
    fixed,
    start: row === level.start.row && col === level.start.col,
    end: row === level.end.row && col === level.end.col,
  };
}

function loadLevel(index) {
  currentLevelIndex = index;
  currentLevel = levels[index];
  solvedPath = [];
  selectedCell = null;
  menuCell = null;
  hideLevelWinModal();

  board = currentLevel.layout.map((row, r) =>
    row.map((token, c) => tokenToCell(token, r, c, currentLevel))
  );

  boardEl.style.setProperty("--cols", String(currentLevel.cols));
  renderBoard();
  updateSolvedPath();
}

function renderBoard() {
  boardEl.innerHTML = "";
  board.forEach((row, r) => {
    row.forEach((cell, c) => {
      const tile = document.createElement("button");
      tile.className = "tile";
      tile.type = "button";
      tile.dataset.row = String(r);
      tile.dataset.col = String(c);

      if (cell.start) tile.classList.add("start");
      if (cell.end) tile.classList.add("end");
      if (selectedCell && selectedCell.row === r && selectedCell.col === c) {
        tile.classList.add("selected");
      }

      tile.addEventListener("click", () => {
        selectCell(r, c);
        hideMenu();
      });

      tile.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        if (!selectedCell || selectedCell.row !== r || selectedCell.col !== c) {
          selectedCell = { row: r, col: c };
          renderBoard();
        }
        openMenu(r, c, event.clientX, event.clientY);
      });

      tile.innerHTML = pieceSvg(cell);
      boardEl.appendChild(tile);
    });
  });

  drawSolvedPath();
}

function selectCell(row, col) {
  const selectionChanged =
    !selectedCell || selectedCell.row !== row || selectedCell.col !== col;

  if (
    selectionChanged &&
    menuCell &&
    (menuCell.row !== row || menuCell.col !== col)
  ) {
    hideMenu();
  }

  selectedCell = { row, col };
  renderBoard();
}

function openMenu(row, col, x, y) {
  menuCell = { row, col };
  menuEl.style.left = `${x}px`;
  menuEl.style.top = `${y}px`;
  menuEl.classList.add("visible");
  menuEl.setAttribute("aria-hidden", "false");
}

function hideMenu() {
  menuEl.classList.remove("visible");
  menuEl.setAttribute("aria-hidden", "true");
  menuCell = null;
}

function showLevelWinModal(message, nextLevelIndex = null) {
  if (!levelWinModalEl || !levelWinMessageEl || !nextLevelBtn) return;

  pendingNextLevelIndex = nextLevelIndex;
  levelWinMessageEl.textContent = message;
  const isFinalLevel = nextLevelIndex === null;

  nextLevelBtn.textContent = "Следующий уровень";
  nextLevelBtn.hidden = isFinalLevel;
  nextLevelBtn.disabled = isFinalLevel;
  levelWinModalEl.hidden = false;
}

function hideLevelWinModal() {
  if (!levelWinModalEl) return;
  pendingNextLevelIndex = null;
  levelWinModalEl.hidden = true;
}

function rotateCell(delta) {
  const targetCell = menuCell || selectedCell;
  if (!targetCell) return;

  const cell = board[targetCell.row][targetCell.col];
  if (cell.fixed || cell.type === "empty") return;

  const tile = boardEl.querySelector(
    `[data-row="${targetCell.row}"][data-col="${targetCell.col}"]`
  );
  const piece = tile?.querySelector("svg");
  const finalizeRotation = () => {
    cell.rotation = (cell.rotation + delta + 4) % 4;
    hideMenu();
    renderBoard();
    updateSolvedPath();
  };

  if (!piece) {
    finalizeRotation();
    return;
  }

  piece.animate(
    [
      { transform: "rotate(0deg)" },
      { transform: `rotate(${delta * 90}deg)` },
    ],
    {
      duration: 200,
      easing: "ease-in-out",
    }
  ).onfinish = finalizeRotation;
}

function handleRotateAction(event, delta) {
  event.preventDefault();
  event.stopPropagation();
  rotateCell(delta);
}

rotateLeftBtn.addEventListener("click", (event) => handleRotateAction(event, -1));
rotateRightBtn.addEventListener("click", (event) => handleRotateAction(event, 1));

nextLevelBtn?.addEventListener("click", () => {
  const nextLevelIndex = pendingNextLevelIndex;
  hideLevelWinModal();

  if (nextLevelIndex !== null) {
    loadLevel(nextLevelIndex);
  }
});

menuEl.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const button = target.closest("button");
  if (!button) return;

  if (button.id === "rotate-left") {
    handleRotateAction(event, -1);
  }

  if (button.id === "rotate-right") {
    handleRotateAction(event, 1);
  }
});

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (!menuEl.contains(target)) {
    hideMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    hideMenu();
    return;
  }

  if (!selectedCell) return;
  if (event.key.toLowerCase() === "r") {
    const delta = event.shiftKey ? -1 : 1;
    rotateCell(delta);
  }
});

function connectors(cell) {
  const base = {
    empty: [0, 0, 0, 0],
    straight: [1, 0, 1, 0],
    corner: [1, 1, 0, 0],
    tee: [1, 1, 1, 0],
    cross: [1, 1, 1, 1],
  }[cell.type];

  const rotation = ((cell.rotation % 4) + 4) % 4;
  const out = [...base];
  for (let i = 0; i < rotation; i += 1) {
    out.unshift(out.pop());
  }
  return {
    n: Boolean(out[0]),
    e: Boolean(out[1]),
    s: Boolean(out[2]),
    w: Boolean(out[3]),
  };
}

function neighbors(row, col) {
  return [
    { dir: "n", opposite: "s", row: row - 1, col },
    { dir: "e", opposite: "w", row, col: col + 1 },
    { dir: "s", opposite: "n", row: row + 1, col },
    { dir: "w", opposite: "e", row, col: col - 1 },
  ];
}

function updateSolvedPath() {
  const queue = [{ row: currentLevel.start.row, col: currentLevel.start.col }];
  const visited = new Set([`${currentLevel.start.row}:${currentLevel.start.col}`]);
  const parent = new Map();

  while (queue.length) {
    const current = queue.shift();
    const key = `${current.row}:${current.col}`;
    const currentConn = connectors(board[current.row][current.col]);

    for (const next of neighbors(current.row, current.col)) {
      if (
        next.row < 0 ||
        next.col < 0 ||
        next.row >= currentLevel.rows ||
        next.col >= currentLevel.cols ||
        !currentConn[next.dir]
      ) {
        continue;
      }

      const target = board[next.row][next.col];
      const targetConn = connectors(target);
      if (!targetConn[next.opposite]) continue;

      const nextKey = `${next.row}:${next.col}`;
      if (visited.has(nextKey)) continue;
      visited.add(nextKey);
      parent.set(nextKey, key);
      queue.push({ row: next.row, col: next.col });
    }
  }

  const endKey = `${currentLevel.end.row}:${currentLevel.end.col}`;
  if (!visited.has(endKey)) {
    solvedPath = [];
    statusEl.textContent = `${currentLevel.name}: пока нет цельного пути.`;
    drawSolvedPath();
    return;
  }

  const chain = [];
  let cursor = endKey;
  while (cursor) {
    const [row, col] = cursor.split(":").map(Number);
    chain.push({ row, col });
    cursor = parent.get(cursor);
  }
  solvedPath = chain;

  const levelNumber = currentLevelIndex + 1;
  const nextLevelIndex = currentLevelIndex < levels.length - 1 ? currentLevelIndex + 1 : null;

  if (nextLevelIndex !== null) {
    statusEl.textContent = `${currentLevel.name} пройден!`;
  } else {
    statusEl.textContent = `Уровень ${levelNumber} пройден! Все маршруты собраны 🦕`;
  }

  const modalMessage =
    nextLevelIndex === null
      ? "Отлично! Ты прошел все уровни!"
      : `Ты прошел уровень ${levelNumber}!`;

  showLevelWinModal(modalMessage, nextLevelIndex);

  drawSolvedPath();
}

function drawSolvedPath() {
  const pathKeys = new Set(solvedPath.map((c) => `${c.row}:${c.col}`));
  document.querySelectorAll(".tile").forEach((tile) => {
    const key = `${tile.dataset.row}:${tile.dataset.col}`;
    tile.classList.toggle("path", pathKeys.has(key));
  });
}

function pieceSvg(cell) {
  const conn = connectors(cell);
  const lines = [];
  const style =
    "stroke:var(--branch); stroke-width:18; stroke-linecap:round; fill:none;";
  const edge =
    "stroke:var(--branch-edge); stroke-width:3; stroke-linecap:round; fill:none;";

  if (conn.n) {
    lines.push(`<line x1="50" y1="50" x2="50" y2="5" style="${style}"/>`);
    lines.push(`<line x1="50" y1="50" x2="50" y2="5" style="${edge}"/>`);
  }
  if (conn.e) {
    lines.push(`<line x1="50" y1="50" x2="95" y2="50" style="${style}"/>`);
    lines.push(`<line x1="50" y1="50" x2="95" y2="50" style="${edge}"/>`);
  }
  if (conn.s) {
    lines.push(`<line x1="50" y1="50" x2="50" y2="95" style="${style}"/>`);
    lines.push(`<line x1="50" y1="50" x2="50" y2="95" style="${edge}"/>`);
  }
  if (conn.w) {
    lines.push(`<line x1="50" y1="50" x2="5" y2="50" style="${style}"/>`);
    lines.push(`<line x1="50" y1="50" x2="5" y2="50" style="${edge}"/>`);
  }

  if (cell.type !== "empty") {
    lines.push('<circle cx="50" cy="50" r="9" fill="rgb(101 67 33 / 0.45)"/>');
  }

  return `<svg viewBox="0 0 100 100" aria-hidden="true">${lines.join("")}</svg>`;
}

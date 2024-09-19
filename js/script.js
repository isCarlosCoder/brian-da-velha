const board = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const status = document.getElementById('status');
const startResetButton = document.getElementById('startReset');
const difficultySelect = document.getElementById('difficulty');
const startingPlayerSelect = document.getElementById('startingPlayer');
const playerScoreElement = document.getElementById('playerScore');
const brianScoreElement = document.getElementById('brianScore');
const drawScoreElement = document.getElementById('drawScore');

let currentPlayer = 'X';
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let gameActive = false;
let playerScore = 0;
let brianScore = 0;
let drawScore = 0;
let lastStarter = '';

const winningCombinations = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

function updateScore() {
  playerScoreElement.textContent = playerScore;
  brianScoreElement.textContent = brianScore;
  drawScoreElement.textContent = drawScore;
}

function handleCellClick(e) {
  const cellIndex = parseInt(e.target.getAttribute('data-index'));

  if (gameBoard[cellIndex] !== '' || !gameActive || currentPlayer === 'O') return;

  gameBoard[cellIndex] = currentPlayer;
  e.target.textContent = currentPlayer;
  e.target.classList.add(currentPlayer === 'X' ? 'text-blue-400' : 'text-red-400', 'fade-in');

  if (checkWin(gameBoard, currentPlayer)) {
    status.textContent = `Jogador venceu!`;
    gameActive = false;
    playerScore++;
    updateScore();
    startResetButton.textContent = 'Começar';
    return;
  }

  if (checkDraw(gameBoard)) {
    status.textContent = 'Empate!';
    gameActive = false;
    drawScore++;
    updateScore();
    startResetButton.textContent = 'Começar';
    return;
  }

  currentPlayer = 'O';
  status.textContent = `Vez de Brian`;

  setTimeout(computerMove, 500);
}

function computerMove() {
  if (!gameActive) return;

  const difficulty = parseInt(difficultySelect.value);
  let move;

  switch(difficulty) {
    case 0: // Super Fácil
      move = getRandomMove();
      break;
    case 1: // Fácil
      move = Math.random() < 0.3 ? getBestMove() : getRandomMove();
      break;
    case 2: // Médio
      move = Math.random() < 0.5 ? getBestMove() : getRandomMove();
      break;
    case 3: // Difícil
      move = Math.random() < 0.7 ? getBestMove() : getRandomMove();
      break;
    case 4: // Super Difícil
      move = Math.random() < 0.9 ? getBestMove() : getRandomMove();
      break;
    default: // Supremo
      move = getBestMove();
  }

  gameBoard[move] = 'O';
  cells[move].textContent = 'O';
  cells[move].classList.add('text-red-400', 'fade-in');

  if (checkWin(gameBoard, 'O')) {
    status.textContent = 'Brian venceu!';
    gameActive = false;
    brianScore++;
    updateScore();
    startResetButton.textContent = 'Começar';
    return;
  }

  if (checkDraw(gameBoard)) {
    status.textContent = 'Empate!';
    gameActive = false;
    drawScore++;
    updateScore();
    startResetButton.textContent = 'Começar';
    return;
  }

  currentPlayer = 'X';
  status.textContent = 'Sua vez';
}

function getRandomMove() {
  const availableMoves = gameBoard.reduce((acc, cell, index) => {
    if (cell === '') acc.push(index);
    return acc;
  }, []);
  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

function getBestMove() {
  let bestScore = -Infinity;
  let bestMove;

  for (let i = 0; i < 9; i++) {
    if (gameBoard[i] === '') {
      gameBoard[i] = 'O';
      let score = minimax(gameBoard, 0, false);
      gameBoard[i] = '';
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }

  return bestMove;
}

function minimax(board, depth, isMaximizing) {
  if (checkWin(board, 'O')) return 10 - depth;
  if (checkWin(board, 'X')) return depth - 10;
  if (checkDraw(board)) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === '') {
        board[i] = 'O';
        let score = minimax(board, depth + 1, false);
        board[i] = '';
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === '') {
        board[i] = 'X';
          let score = minimax(board, depth + 1, true);
          board[i] = '';
          bestScore = Math.min(score, bestScore);
        }
    }

    return bestScore;
  }
}

function checkWin(board, player) {
  return winningCombinations.some(combination => {
    return combination.every(index => {
      return board[index] === player;
    });
  });
}

function checkDraw(board) {
  return board.every(cell => cell !== '');
}

function startResetGame() {
  if (gameActive) {
    // Reset the game
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    gameActive = false;
    currentPlayer = 'X';
    lastStarter = '';
    status.textContent = 'Clique em Começar para jogar';
    cells.forEach(cell => {
      cell.textContent = '';
        cell.classList.remove('text-blue-400', 'text-red-400', 'fade-in');
      });
    startResetButton.textContent = 'Começar';
  } else {
    // Start a new game
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
                
    const startingPlayer = startingPlayerSelect.value;
    if (startingPlayer === 'player') {
      currentPlayer = 'X';
    } else if (startingPlayer === 'brian') {
      currentPlayer = 'O';
    } else if (startingPlayer === 'alternate') {
      currentPlayer = lastStarter === 'X' ? 'O' : 'X';
      lastStarter = currentPlayer;
    } else {
      currentPlayer = Math.random() < 0.5 ? 'X' : 'O';
    }

    status.textContent = currentPlayer === 'X' ? 'Sua vez' : 'Vez de Brian';
    cells.forEach(cell => {
      cell.textContent = '';
      cell.classList.remove('text-blue-400', 'text-red-400', 'fade-in');
    });

    if (currentPlayer === 'O') {
      setTimeout(computerMove, 500);
    }

    startResetButton.textContent = 'Reiniciar';
  }
}

cells.forEach((cell, index) => {
  cell.addEventListener('click', handleCellClick);
    cell.setAttribute('data-index', index);
});

startResetButton.addEventListener('click', startResetGame);
difficultySelect.addEventListener('change', () => {
  if (gameActive) {
    startResetGame();
  }
});

startingPlayerSelect.addEventListener('change', () => {
  if (gameActive) {
    startResetGame();
  }
});

// Inicializar o jogo
status.textContent = 'Clique em Começar para jogar';
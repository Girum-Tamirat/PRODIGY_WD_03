const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');
const restartBtn = document.getElementById('restart');
const single = document.getElementById("single");
const multi = document.getElementById("multi");
const container = document.getElementById("container");
const settingsBtn = document.getElementById('settings');
const settingsModal = document.getElementById('settingsModal');
const saveSettingsBtn = document.getElementById('saveSettings');
const closeSettingsBtn = document.getElementById('closeSettings');
const soundCheckbox = document.getElementById('sound');
const difficultySelect = document.getElementById('difficulty');
const clickSound = new Audio('assets/sounds/click.mp3');
const winSound = new Audio('assets/sounds/win.mp3');
let isSoundEnabled = true;

container.style.display = 'none';
settingsModal.style.display = 'none';

let currentPlayer = 'X';
let board = ['', '', '', '', '', '', '', '', ''];
let isGameActive = true;
let isSinglePlayer = false;
let soundOn = true;
let difficulty = 'easy';

const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

single.addEventListener('click', () => {
    isSinglePlayer = true;
    container.style.display = 'block';
    resetGame();
    single.classList.add('glow');
    multi.classList.remove('glow');
});


multi.addEventListener('click', () => {
    isSinglePlayer = false;
    container.style.display = 'block';
    resetGame();
    multi.classList.add('glow');
    single.classList.remove('glow');
});

settingsBtn.addEventListener('click', () => {
    settingsModal.style.display = 'block';
});
closeSettingsBtn.addEventListener('click', () => {
    settingsModal.style.display = 'none';
});

saveSettingsBtn.addEventListener('click', () => {
    soundOn = soundCheckbox.checked;
    difficulty = difficultySelect.value;
    settingsModal.style.display = 'none';
    console.log(`Settings saved: Sound - ${soundOn}, Difficulty - ${difficulty}`);
});

function handleCellClick(e) {
    const index = e.target.getAttribute('data-index');
    if (board[index] !== '' || !isGameActive) return;

    board[index] = currentPlayer;
    e.target.textContent = currentPlayer;

    playSound(clickSound);

    if (checkWinner()) {
        statusText.textContent = `Player ${currentPlayer} Wins!`;
        isGameActive = false;
        playSound(winSound);
    } else if (board.every(cell => cell !== '')) {
        statusText.textContent = 'Draw!';
        isGameActive = false;
        playSound();
    } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        statusText.textContent = `Player ${currentPlayer}'s Turn`;

        if (isSinglePlayer && currentPlayer === 'O') {
            setTimeout(() => {
                aiMove();
            }, 1000);
        }
    }
}

function aiMove() {
    let availableCells = board.map((cell, index) => cell === '' ? index : null).filter(index => index !== null);

    if (availableCells.length > 0) {
        let aiIndex;
        
        if (difficulty === 'easy') {
            aiIndex = availableCells[Math.floor(Math.random() * availableCells.length)];
        } else if (difficulty === 'medium') {
            aiIndex = mediumDifficultyAI(availableCells);
        } else {
            aiIndex = hardDifficultyAI(availableCells);
        }

        board[aiIndex] = 'O';
        cells[aiIndex].textContent = 'O';

        if (checkWinner()) {
            statusText.textContent = `Player O Wins!`;
            isGameActive = false;
        } else if (board.every(cell => cell !== '')) {
            statusText.textContent = 'Draw!';
            isGameActive = false;
        } else {
            currentPlayer = 'X';
            statusText.textContent = `Player ${currentPlayer}'s Turn`;
        }
    }
}

function mediumDifficultyAI(availableCells) {
    
    let blockingMove = findBlockingMove('X');
    if (blockingMove !== null) {
        return blockingMove;
    }

    
    return availableCells[Math.floor(Math.random() * availableCells.length)];
}

function findBlockingMove(player) {
    for (let condition of winningConditions) {
        const [a, b, c] = condition;
        if (board[a] === player && board[b] === player && board[c] === '') return c;
        if (board[a] === player && board[c] === player && board[b] === '') return b;
        if (board[b] === player && board[c] === player && board[a] === '') return a;
    }
    return null;
}


function hardDifficultyAI() {
    return minimax(board, 'O').index;
}

function minimax(newBoard, player) {
    const availableCells = newBoard.map((cell, index) => cell === '' ? index : null).filter(index => index !== null);
    
    
    if (checkWinnerForMinimax(newBoard, 'X')) return { score: -10 };
    if (checkWinnerForMinimax(newBoard, 'O')) return { score: 10 };
    if (availableCells.length === 0) return { score: 0 }; // Draw
    
    
    const moves = [];
    
    for (let i = 0; i < availableCells.length; i++) {
        const move = {};
        move.index = availableCells[i];
        

        newBoard[availableCells[i]] = player;
        

        if (player === 'O') {
            const result = minimax(newBoard, 'X');
            move.score = result.score;
        } else {
            const result = minimax(newBoard, 'O');
            move.score = result.score;
        }
        

        newBoard[availableCells[i]] = '';

        moves.push(move);
    }
    
    let bestMove;
    if (player === 'O') {
        let bestScore = -Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = moves[i];
            }
        }
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = moves[i];
            }
        }
    }
    
    return bestMove;
}

function checkWinnerForMinimax(board, player) {
    
    return winningConditions.some(condition => {
        return condition.every(index => board[index] === player);
    });
}


function checkWinner() {
    return winningConditions.some(condition => {
        return condition.every(index => board[index] === currentPlayer);
    });
}

function resetGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    cells.forEach(cell => cell.textContent = '');
    currentPlayer = 'X';
    isGameActive = true;
    statusText.textContent = `Player ${currentPlayer}'s Turn`;
}

function playSound(sound) {
    if (isSoundEnabled) {
        sound.play();
    }
}
document.getElementById('sound').addEventListener('change', (e) => {
    isSoundEnabled = e.target.checked;
});
document.getElementById('settings').addEventListener('click', () => {
    document.getElementById('settingsModal').style.display = 'block';
});


document.getElementById('closeSettings').addEventListener('click', () => {
    document.getElementById('settingsModal').style.display = 'none';
});


restartBtn.addEventListener('click', resetGame);


cells.forEach(cell => cell.addEventListener('click', handleCellClick));

statusText.textContent = `Player ${currentPlayer}'s Turn`;
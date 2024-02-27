import {
    PLAYFIELD_COLUMNS,
    PLAYFIELD_ROWS,
    TETROMINO_NAMES,
    TETROMINOES,
    gameOverBlock,
    btnRestart,
    arrowLeft,
    arrowRotate,
    arrowRight,
    arrowDrop,
    arrowDown,
} from './constants.js';

const deleteRowAudio = new Audio('./sounds/deleterow1.mp3');
const dropAudio = new Audio('./sounds/drop.mp3');
const moveAudio = new Audio('./sounds/move2.mp3');
const pauseAudio = new Audio('./sounds/pause.mp3');
const gameOverAudio = new Audio('./sounds/gameover.mp3');

let playfield,
    tetromino,
    cells,
    timeoutId,
    requestId,
    score,
    lines,
    speed,
    message,
    isPaused = false,
    isGameOver = false

init();

function init() {
    // gameOverBlock.style.display = 'none';
    isGameOver = false;
    generatePlayField();
    generateTetromino();
    startLoop();
    cells = document.querySelectorAll('.tetris div');
    score = 0;
    lines = 0;
    countScore(null);
}

function convertPositionToIndex(row, column) {
    return row * PLAYFIELD_COLUMNS + column;
}

function getRandomElement(array) {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}

function generatePlayField() {
    document.querySelector('.tetris').innerHTML = '';
    for (let i = 0; i < PLAYFIELD_ROWS * PLAYFIELD_COLUMNS; i++) {
        const div = document.createElement('div');
        document.querySelector('.tetris').append(div);
    }

    playfield = new Array(PLAYFIELD_ROWS).fill()
        .map(() => new Array(PLAYFIELD_COLUMNS).fill(0))
}

function generateTetromino() {
    const nameTetro = getRandomElement(TETROMINO_NAMES);
    const matrixTetro = TETROMINOES[nameTetro];
    const columnTetro = PLAYFIELD_COLUMNS / 2 - Math.floor(matrixTetro.length / 2);
    const rowTetro = -2;

    tetromino = {
        name: nameTetro,
        matrix: matrixTetro,
        row: rowTetro,
        column: columnTetro,
    }
}

function drawPlayField() {
    for (let row = 0; row < PLAYFIELD_ROWS; row++) {
        for (let column = 0; column < PLAYFIELD_COLUMNS; column++) {
            if (playfield[row][column] == 0) continue;
            const name = playfield[row][column];
            const cellIndex = convertPositionToIndex(row, column);
            cells[cellIndex].classList.add(name);
        }
    }
}

function drawTetromino() {
    const name = tetromino.name;
    const tetrominoMatrixSize = tetromino.matrix.length;

    for (let row = 0; row < tetrominoMatrixSize; row++) {
        for (let column = 0; column < tetrominoMatrixSize; column++) {
            if (isOutsideTopBoard(row)) continue;
            if (!tetromino.matrix[row][column]) continue;
            const cellIndex = convertPositionToIndex(
                tetromino.row + row,
                tetromino.column + column
            );
            cells[cellIndex].classList.add(name);
        }
    }
}

function draw() {
    cells.forEach(cell => cell.removeAttribute("class"));
    drawPlayField();
    drawTetromino();
}

// Tetromino moving & rows removing

function isOutsideTopBoard(row) {
    return tetromino.row + row < 0;
}

function placeTetromino() {
    const matrixSize = tetromino.matrix.length;
    for (let row = 0; row < matrixSize; row++) {
        for (let column = 0; column < matrixSize; column++) {
            if (!tetromino.matrix[row][column]) continue;
            if (isOutsideTopBoard(row)) {
                isGameOver = true;
                return;
            }
            playfield[tetromino.row + row][tetromino.column + column] = tetromino.name;
        }
    }
    const filledRows = findFilledRows();
    removeFilledRows(filledRows);
    generateTetromino();
}

function removeFilledRows(filledRows) {
    for (let i = 0; i < filledRows.length; i++) {
        const row = filledRows[i];
        dropRowsAbove(row);
        lines++;
    }
    countScore(filledRows.length);
}

function dropRowsAbove(rowToDelete) {
    deleteRowAudio.play();
    for (let row = rowToDelete; row > 0; row--) {
        playfield[row] = playfield[row - 1];
    }

    playfield[0] = new Array(PLAYFIELD_COLUMNS).fill(0);
}

function findFilledRows() {
    const filledRows = [];
    for (let row = 0; row < PLAYFIELD_ROWS; row++) {
        let filledColumns = 0;
        for (let column = 0; column < PLAYFIELD_COLUMNS; column++) {
            if (playfield[row][column] != 0) {
                filledColumns++;
            }
        }
        if (PLAYFIELD_COLUMNS == filledColumns) {
            filledRows.push(row);
        }
    }
    return filledRows;
}

function moveDown() {
    moveTetrominoDown();
    draw();
    stopLoop();
    startLoop();
    if (isGameOver) {
        gameOver();
        document.querySelector('.restart_btn').innerHTML = 'GAME OVER';
    }
}

// Score Counter

function countScore(destroyRows) {
    switch (destroyRows) {
        case 1:
            score += 10;
            message = `${destroyRows} line destroyed`;
            break;
        case 2:
            score += 30;
            message = `${destroyRows} lines destroyed`;
            break;
        case 3:
            score += 50;
            message = `${destroyRows} lines destroyed`;
            break;
        case 4:
            score += 100;
            message = `TETRIS!`;
            break;
        default:
            score += 0;
            message = "";
    }
    document.querySelector('.score_counter').innerHTML = score;
    document.querySelector('.lines_counter').innerHTML = lines;
    document.querySelector('.lines_destroyed').innerHTML = message;
}

function startLoop() {
    timeoutId = setTimeout(function () {
        requestId = requestAnimationFrame(moveDown);
        speedUp(speed);
    }, speed);
}

// Increase speed

function speedUp() {
    if (lines > 2 && lines < 4) {
        speed = 600;
    } else if (lines > 4 && lines < 6) {
        speed = 500;
    } else if (lines >= 6) {
        speed = 400;
    } else {
        speed = 700;
    }
}

function stopLoop() {
    cancelAnimationFrame(requestId);
    timeoutId = clearTimeout(timeoutId);
}

function gameOver() {
    stopLoop();
    gameOverBlock.style.display = 'flex';
    gameOverAudio.play();
    document.querySelector('.lines_destroyed').innerHTML = `You've destroyed ${lines} lines, total score is ${score} points`;
}

// Keydown events

document.addEventListener('keydown', onKeyDown);
btnRestart.addEventListener('click', function () {
    init();
})

function togglePauseGame() {
    isPaused = !isPaused;
    isPaused ? stopLoop() : startLoop();
    pauseAudio.play();
    isPaused ? document.querySelector('.score_counter').innerHTML = 'PAUSE' :
        document.querySelector('.score_counter').innerHTML = score;
}

function onKeyDown(event) {
    if (event.key == 'Escape') {
        togglePauseGame();
    }
    if (isPaused) {
        return
    }
    switch (event.key) {
        case 'ArrowLeft':
            moveTetrominoLeft();
            moveAudio.play();
            break;
        case 'ArrowRight':
            moveTetrominoRight();
            moveAudio.play();
            break;
        case 'ArrowDown':
            moveTetrominoDown();
            moveAudio.play();
            arrowDown.classList.add('arrow_down:hover');
            arrowDown.classList.remove('arrow_down');
            setTimeout(function () {
                arrowDown.classList.remove('arrow_down:hover'),
                    arrowDown.classList.add('arrow_down');
            }, 200);
            break;
        case ' ':
            dropTetrominoDown();
            dropAudio.play();
            break;
        case 'ArrowUp':
            rotateTetromino();
            moveAudio.play();
            break;
    }
    draw();
}

function moveTetrominoLeft() {
    tetromino.column -= 1;
    if (isValid()) {
        tetromino.column += 1;
    }
    arrowLeft.classList.add('arrow_left:hover');
    arrowLeft.classList.remove('arrow_left');
    setTimeout(function () {
        arrowLeft.classList.remove('arrow_left:hover'),
            arrowLeft.classList.add('arrow_left');
    }, 200);
}
arrowLeft.addEventListener('click', moveTetrominoLeft);

function moveTetrominoRight() {
    tetromino.column += 1;
    if (isValid()) {
        tetromino.column -= 1;
    }
    arrowRight.classList.add('arrow_right:hover');
    arrowRight.classList.remove('arrow_right');
    setTimeout(function () {
        arrowRight.classList.remove('arrow_right:hover'),
            arrowRight.classList.add('arrow_right');
    }, 200);
}
arrowRight.addEventListener('click', moveTetrominoRight);

function moveTetrominoDown() {
    tetromino.row += 1;
    if (isValid()) {
        tetromino.row -= 1;
        placeTetromino();
    }
}
arrowDown.addEventListener('click', moveTetrominoDown);

function dropTetrominoDown() {
    while (!isValid()) {
        tetromino.row++;
    }
    tetromino.row--;
    arrowDrop.classList.add('arrow_drop:hover');
    arrowDrop.classList.remove('arrow_drop');
    setTimeout(function () {
        arrowDrop.classList.remove('arrow_drop:hover'),
            arrowDrop.classList.add('arrow_drop');
    }, 200);
}
arrowDrop.addEventListener('click', dropTetrominoDown);

function rotateTetromino() {
    const oldMatrix = tetromino.matrix;
    const rotatedMatrix = rotateMatrix(tetromino.matrix);
    tetromino.matrix = rotatedMatrix;
    if (isValid()) {
        tetromino.matrix = oldMatrix;
    }
    arrowRotate.classList.add('arrow_rotate:hover');
    arrowRotate.classList.remove('arrow_rotate');
    setTimeout(function () {
        arrowRotate.classList.remove('arrow_rotate:hover'),
            arrowRotate.classList.add('arrow_rotate');
    }, 200);
}
arrowRotate.addEventListener('click', rotateTetromino);

function rotateMatrix(matrixTetromino) {
    const N = matrixTetromino.length;
    const rotateMatrix = [];
    for (let i = 0; i < N; i++) {
        rotateMatrix[i] = [];
        for (let j = 0; j < N; j++) {
            rotateMatrix[i][j] = matrixTetromino[N - j - 1][i];
        }
    }
    return rotateMatrix;
}

// Validation and Collisions

function isValid() {
    const matrixSize = tetromino.matrix.length;
    for (let row = 0; row < matrixSize; row++) {
        for (let column = 0; column < matrixSize; column++) {
            if (!tetromino.matrix[row][column]) continue;
            if (isOutsideOfGameboard(row, column)) { return true }
            if (hasCollisions(row, column)) { return true }
        }
    }
    return false;
}

function isOutsideOfGameboard(row, column) {
    return tetromino.matrix[row][column] &&
        (
            tetromino.column + column < 0
            || tetromino.column + column >= PLAYFIELD_COLUMNS
            || tetromino.row + row >= PLAYFIELD_ROWS
        );
}

function hasCollisions(row, column) {
    return playfield[tetromino.row + row]?.[tetromino.column + column]
}

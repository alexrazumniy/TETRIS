import {
    PLAYFIELD_COLUMNS,
    PLAYFIELD_ROWS,
    TETROMINO_NAMES,
    TETROMINOES,
    startScreen,
    btnStartGame,
    btnRestartGame,
    btnPlayAgain,
    btnResetHiscore,
    btnToggleMusic,
    btnToggleSound,
    overlay,
    arrowLeft,
    arrowRotate,
    arrowRight,
    arrowDrop,
    arrowDown
} from './constants.js';

const deleteRowAudio = new Audio('./sounds/deleterow1.mp3');
const dropAudio = new Audio('./sounds/drop.mp3');
const moveAudio = new Audio('./sounds/move2.mp3');
const pauseAudio = new Audio('./sounds/pause.mp3');
const gameOverAudio = new Audio('./sounds/gameover.mp3');
const allSounds = [deleteRowAudio, dropAudio, moveAudio, pauseAudio, gameOverAudio];
const gameMusic = document.getElementById('game_music');


let playfield,
    tetromino,
    // nextTetromino,
    cells,
    timeoutId,
    requestId,
    score,
    hiscore,
    lines,
    speed,
    level,
    message,
    isPaused = false,
    isGameOver = false

document.addEventListener('DOMContentLoaded', function () {
    startScreen.style.display = 'flex';
    generatePlayField();
});

btnStartGame.addEventListener('click', function () {
    init();
});

function init() {
    isGameOver = false;
    generatePlayField();
    generateTetromino();
    startLoop();

    startScreen.style.display = 'none';
    overlay.style.display = 'none';
    gameMusic.play();

    cells = document.querySelectorAll('.tetris div');
    score = 0;
    lines = 0;
    level = 0;
    countScore(null);

    hiscore = parseInt(localStorage.getItem('hiscore') || 0);
    document.querySelector('.hiscore').innerHTML = hiscore;
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
    const rowTetro = -1;

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

function drawNextTetromino() {
    // document.querySelector('.next_tetromino');
    const nextTetromino = document.querySelector('.next_tetromino');

    const tetrominoMatrixSize = tetromino.length;
    for (let row = 0; row < tetrominoMatrixSize; row++) {
        for (let column = 0; column < tetrominoMatrixSize; column++) {
            if (nextTetromino[row][column]) {
                const div = document.createElement('div');
                nextTetromino.appendChild(div);
                div.classList.add(nextTetromino.name);
            }
            console.log(nextTetromino.name);
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

    drawNextTetromino()
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

function moveDown() {
    moveTetrominoDown();
    draw();
    stopLoop();
    startLoop();
    if (isGameOver) {
        gameOver();
    }
}

// Score Counter

function countScore(destroyRows) {
    switch (destroyRows) {
        case 1:
            score += 10;
            message = `${destroyRows} line destroyed
            <br> You can do it`;
            break;
        case 2:
            score += 30;
            message = `${destroyRows} lines destroyed
            <br> Not bad`;
            break;
        case 3:
            score += 50;
            message = `${destroyRows} lines destroyed
            <br> Excellent`;
            break;
        case 4:
            score += 100;
            message = `WOW! it's TETRIS!`;
            break;
        default:
            score += 0;
            message = "";
    }
    document.querySelector('.score_counter').innerHTML = score;
    document.querySelector('.lines_counter').innerHTML = lines;
    document.querySelector('.current_message').innerHTML = message;
}

function startLoop() {
    timeoutId = setTimeout(function () {
        requestId = requestAnimationFrame(moveDown);
        speedUp(speed);
    }, speed);
}

// Increase speed and level counter

function speedUp() {
    if (lines > 2 && lines < 4) {
        speed = 600;
        level = 1;
    } else if (lines > 4 && lines < 6) {
        speed = 500;
        level = 2;
    } else if (lines >= 6) {
        speed = 400;
        level = 3;
    } else {
        speed = 700;
        // level = 1;
    }
    document.querySelector('.level_counter').innerHTML = level;
}

function stopLoop() {
    cancelAnimationFrame(requestId);
    timeoutId = clearTimeout(timeoutId);
}

function gameOver() {
    stopLoop();
    gameMusic.pause();
    gameOverAudio.play();
    gameMusic.currentTime = 0;

    overlay.style.display = 'flex';
    document.querySelector('.result_message').innerHTML = `You've destroyed <br> ${lines} lines <br> Total score is <br> ${score} points`;

    hiscore = Math.max(hiscore, score); // Recording hiscore to localStorage
    localStorage.setItem('hiscore', hiscore);
    document.querySelector('.hiscore').innerHTML = hiscore;
}

// Hiscore resetting

btnResetHiscore.addEventListener('click', function () {
    resetHiscore();
});

function resetHiscore() {
    document.querySelector('.hiscore').innerHTML = 0;
    localStorage.removeItem('hiscore');
}

// Keydown events

document.addEventListener('keydown', onKeyDown);
btnRestartGame.addEventListener('click', function () {
    init();
})
btnPlayAgain.addEventListener('click', function () {
    init();
})

function togglePauseGame() {
    isPaused = !isPaused;
    isPaused ? stopLoop() : startLoop();
    isPaused ? gameMusic.pause() : gameMusic.play();
    isPaused ? pauseAudio.play() : pauseAudio.stop();
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

// Next tetromimo

document.querySelector('.next_tetromino_container');

// Toggle music and sound

btnToggleMusic.addEventListener('click', toggleMusic);
const musicIcon = document.getElementById('music_icon');

function toggleMusic() {
    // gameMusic.paused ? (gameMusic.play(), musicIcon.setAttribute('src', './img/music_mute_red.svg')) : (gameMusic.pause(), musicIcon.setAttribute('src', './img/music_unmute_green.svg'));


    gameMusic.paused ? (gameMusic.play(), musicIcon.src = './img/music_on.svg') : (gameMusic.pause(), musicIcon.src = './img/music_off.svg');
}

btnToggleSound.addEventListener('click', toggleSounds);
const soundIcon = document.getElementById('sound_icon');

function toggleSounds() {
    allSounds.forEach(sound => sound.muted = !sound.muted);
    const isMuted = allSounds.some(sound => sound.muted);
    soundIcon.src = !isMuted ? './img/sound_unmute.svg' : './img/sound_mute.svg';
    console.log("bbbb");
}
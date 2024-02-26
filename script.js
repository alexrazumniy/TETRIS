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
} from './utils.js';

// const moveAudio = new Audio("./sounds/move.mp3");
const deleteAudio = new Audio("./sounds/deleterow1.mp3");
const dropAudio = new Audio("./sounds/drop.mp3");
// const moveAudio = new Audio("./sounds/move2.mp3");
// const moveAudio = new Audio("./sounds/move3.mp3");
const moveAudio = new Audio("./sounds/move2.mp3");

// ДЗ №1
// 1. Додати інші фігури
// 2. Стилізувати нові фігури на свій погляд
// 3. Додати функцію рандому котра буде видавати випадкову фігуру
// 4. Центрування фігури коли вона з'являється
// 5. Додати функцію ранромних кольорів для кожної нової фігури

// ДЗ №2
// 1. Поставити const rowTetro = -2; прописати код щоб працювало коректно
// 2. Зверстати поле для розрахунку балів гри
// 3. Прописати логіку і код розрахунку балів гри (1 ряд = 10; 2 ряди = 30; 3 ряди = 50; 4 = 100)
// 4. Реалізувати самостійний рух фігур до низу

// ДЗ №3
// 1. Зробити розмітку висновків гри по її завершенню
// 2. Зверстати окрему кнопку Рестарт, що перезапускатиме гру посеред гри
// 3. Додати клавіатуру на екрані браузеру для руху фігур

// 4. Створити секцію, що відображатиме наступну фігуру, що випадатиме
// 5. Дожати рівні гри при котрих збільшується швидкість падіння фігур та виводити їх на екран
// 6. Зберігати і виводити найкращий власний результат


let playfield,
    tetromino,
    timeoutId,
    requestId,
    cells,
    score,
    lines,
    speed,
    message,
    isPaused = false,
    isGameOver = false

init();

function init() {
    gameOverBlock.style.display = 'none';
    isGameOver = false;
    generatePlayfield();
    generateTetromino();
    startLoop();
    cells = document.querySelectorAll('.tetris div');
    score = 0;
    lines = 0;
    countScore(null);
}

// Generate playfield and tetromino

function generatePlayfield() {
    document.querySelector('.tetris').innerHTML = '';
    for (let i = 0; i < PLAYFIELD_ROWS * PLAYFIELD_COLUMNS; i++) {
        const div = document.createElement('div');
        document.querySelector('.tetris').append(div);
    }
    playfield = new Array(PLAYFIELD_ROWS).fill()
        .map(() => new Array(PLAYFIELD_COLUMNS).fill(0))
}

function generateTetromino() {
    let nameTetro;
    const shouldGenerateLongTetromino = Math.random() < 1 / 12; //Шанс появи довгої фігури (1 з 12)
    if (shouldGenerateLongTetromino) {
        nameTetro = 'I';
    } else {
        nameTetro = getRandomElement(TETROMINO_NAMES.filter(name => name !== 'I')); // Вибираємо випадкову фігуру, крім довгої
    }

    // const nameTetro = getRandomElement(TETROMINO_NAMES);

    const matrixTetro = TETROMINOES[nameTetro];
    // Начальна позиція та центрування фігури
    // const rowTetro = 0;
    const rowTetro = -1;
    const columnTetro = Math.floor(PLAYFIELD_COLUMNS / 2 - matrixTetro.length / 2);

    tetromino = {
        name: nameTetro,
        matrix: matrixTetro,
        row: rowTetro,
        column: columnTetro,
    }
    console.log(shouldGenerateLongTetromino);
}

// Keydown events

document.addEventListener('keydown', onKeyDown);
btnRestart.addEventListener('click', function () {
    init();
})

function togglePauseGame() {
    isPaused = !isPaused;
    isPaused ? stopLoop() : startLoop();
    isPaused ? document.querySelector('.score').innerHTML = 'PAUSE' :
        document.querySelector('.score').innerHTML = score;
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

function moveTetrominoDown() {
    tetromino.row += 1;
    if (isValid()) {
        tetromino.row -= 1;
        placeTetromino();
    }
}

function rotateTetromino() {
    const oldMatrix = tetromino.matrix;
    const rotatedMatrix = rotateMatrix(tetromino.matrix);
    // array = rotateMatrix(array);
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

arrowLeft.addEventListener("click", moveTetrominoLeft);
arrowRight.addEventListener("click", moveTetrominoRight);
arrowRotate.addEventListener("click", rotateTetromino);
arrowDrop.addEventListener("click", dropTetrominoDown);
arrowDown.addEventListener("click", moveTetrominoDown);

//////////////////////

// Генерация следующей случайной фигуры
// function generateNextTetromino() {
//     const nextTetrominoIndex = Math.floor(Math.random() * TETROMINOES.length);
//     const nextTetromino = TETROMINOES[nextTetrominoIndex];

//     // Отображение следующей фигуры в контейнере
//     displayTetrominoInContainer(nextTetromino, 'nextTetrominoContainer');
// }

// // Отображение фигуры в указанном контейнере
// function displayTetrominoInContainer(TETROMINOES, containerId) {
//     const container = document.querySelector('.next_tetromino');
//     container.innerHTML = '';

//     TETROMINOES.forEach(row => {
//         row = document.createElement('div');
//         row.classList.add('.next_tetromino');

//         row.forEach(cell => {
//             const cellDiv = document.createElement('div');
//             cellDiv.classList.add('.next_tetromino');
//             cellDiv.style.backgroundColor = cell ? 'blue' : 'transparent';
//             // Настройте цвета по вашему усмотрению
//             rowDiv.appendChild(cellDiv);
//         });

//         container.appendChild(rowDiv);
//     });
// }
// console.log(TETROMINOES);

// generateNextTetromino();

////////////////////////

// Draw playfield and tetromino

function drawPlayField() {
    for (let row = 0; row < PLAYFIELD_ROWS; row++) {
        for (let column = 0; column < PLAYFIELD_COLUMNS; column++) {
            if (playfield[row][column] == 0) { continue };
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
            // cells[cellIndex].innerHTML = array[row][column];            
            if (isOutsideTopBoard(row)) { continue }
            if (tetromino.matrix[row][column] == 0) { continue }
            const cellIndex = convertPositionToIndex(tetromino.row + row, tetromino.column + column);
            cells[cellIndex].classList.add(name);
        }
    }
}

function draw() {
    cells.forEach(cell => cell.removeAttribute('class'));
    drawPlayField();
    drawTetromino();
}

function getRandomElement(array) {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}

function convertPositionToIndex(row, column) {
    return row * PLAYFIELD_COLUMNS + column;
}

// Tetromino moving & rows operations

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
    // filledRows.forEach(row => {
    //     dropRowsAbove(row);
    // })

    for (let i = 0; i < filledRows.length; i++) {
        const row = filledRows[i];
        dropRowsAbove(row);
        lines++;
    }
    countScore(filledRows.length);
}

function dropRowsAbove(rowToDelete) {
    deleteAudio.play(); ///////
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
    }
}

// Counter
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
    document.querySelector('.score').innerHTML = score;
    document.querySelector('.lines_counter').innerHTML = lines;
    document.querySelector('.lines_destroyed').innerHTML = message;
}

function startLoop() {
    timeoutId = setTimeout(function () {
        requestId = requestAnimationFrame(moveDown);
        speedUp(speed);
    }, speed);
    // console.log(`speed = ${speed}`);
    // console.log(`lines = ${lines}`);
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
    document.querySelector('.lines_destroyed').innerHTML = `You've destroyed ${lines} lines, total score is ${score} points`;
}

// Collisions

function isValid() {
    const matrixSize = tetromino.matrix.length;
    for (let row = 0; row < matrixSize; row++) {
        for (let column = 0; column < matrixSize; column++) {
            if (!tetromino.matrix[row][column]) { continue; }
            // if (tetromino.matrix[row][column] == 0) { continue; }
            if (isOutsideOfGameBoard(row, column)) { return true }
            if (hasCollisions(row, column)) { return true }
        }
    }
    return false;
}

// Перевірка чи фігура не виходить за поле
function isOutsideOfGameBoard(row, column) {
    return tetromino.column + column < 0 ||
        tetromino.column + column >= PLAYFIELD_COLUMNS ||
        tetromino.row + row >= playfield.length
}

// Взаємодія фігур
function hasCollisions(row, column) {
    return playfield[tetromino.row + row]?.[tetromino.column + column]
}


export const PLAYFIELD_COLUMNS = 10;
export const PLAYFIELD_ROWS = 20;
export const TETROMINO_NAMES = ['O', 'L', 'J', 'S', 'Z', 'T', 'I'];
export const TETROMINOES = {
    O: [
        [1, 1],
        [1, 1]
    ],
    L: [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0],
    ],
    J: [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0],
    ],
    S: [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0],
    ],
    Z: [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0],
    ],
    T: [
        [1, 1, 1],
        [0, 1, 0],
        [0, 0, 0],
    ],
    I: [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ]
};

export const startScreen = document.querySelector('.start_screen');
export const btnStartGame = document.querySelector('.btn_start');
export const btnPlayAgain = document.querySelector('.btn_play_again');
export const btnRestartGame = document.querySelector('.btn_restart_game');
export const btnResetHiscore = document.querySelector('.reset_hiscore_btn');
export const btnToggleMusic = document.querySelector('.toggle_music_btn');
export const btnToggleSound = document.querySelector('.toggle_sound_btn');

export const overlay = document.querySelector(".overlay");
export const resultMessage = document.querySelector('.result_message');

export const arrowLeft = document.querySelector('.arrow_left');
export const arrowRotate = document.querySelector('.arrow_rotate');
export const arrowRight = document.querySelector('.arrow_right');
export const arrowDrop = document.querySelector('.arrow_drop');
export const arrowDown = document.querySelector('.arrow_down');
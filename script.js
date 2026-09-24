/* =========================================
   ELEMENTS
========================================= */

const board = document.getElementById("board");
const statusText = document.getElementById("status");

const resetBtn = document.getElementById("resetBtn");
const undoBtn = document.getElementById("undoBtn");

const moveHistory = document.getElementById("moveHistory");

const whiteCaptured =
    document.getElementById("whiteCaptured");

const blackCaptured =
    document.getElementById("blackCaptured");

const whiteTimer =
    document.getElementById("whiteTimer");

const blackTimer =
    document.getElementById("blackTimer");


/* =========================================
   CHESS GAME
========================================= */

const game = new Chess();

let selectedSquare = null;


/* =========================================
   TIMER
========================================= */

const INITIAL_TIME = 10 * 60;

let whiteTime = INITIAL_TIME;
let blackTime = INITIAL_TIME;

let timerInterval = null;


/* =========================================
   CHESS PIECES
========================================= */

const pieces = {
    w: {
        p: "https://raw.githubusercontent.com/ornicar/lila/master/public/piece/cburnett/wP.svg",
        r: "https://raw.githubusercontent.com/ornicar/lila/master/public/piece/cburnett/wR.svg",
        n: "https://raw.githubusercontent.com/ornicar/lila/master/public/piece/cburnett/wN.svg",
        b: "https://raw.githubusercontent.com/ornicar/lila/master/public/piece/cburnett/wB.svg",
        q: "https://raw.githubusercontent.com/ornicar/lila/master/public/piece/cburnett/wQ.svg",
        k: "https://raw.githubusercontent.com/ornicar/lila/master/public/piece/cburnett/wK.svg"
    },

    b: {
        p: "https://raw.githubusercontent.com/ornicar/lila/master/public/piece/cburnett/bP.svg",
        r: "https://raw.githubusercontent.com/ornicar/lila/master/public/piece/cburnett/bR.svg",
        n: "https://raw.githubusercontent.com/ornicar/lila/master/public/piece/cburnett/bN.svg",
        b: "https://raw.githubusercontent.com/ornicar/lila/master/public/piece/cburnett/bB.svg",
        q: "https://raw.githubusercontent.com/ornicar/lila/master/public/piece/cburnett/bQ.svg",
        k: "https://raw.githubusercontent.com/ornicar/lila/master/public/piece/cburnett/bK.svg"
    }
};


/* =========================================
   BOARD COORDINATES
========================================= */

const files = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h"
];

const ranks = [
    "8",
    "7",
    "6",
    "5",
    "4",
    "3",
    "2",
    "1"
];


/* =========================================
   CREATE BOARD
========================================= */

function createBoard() {

    board.innerHTML = "";

    const boardState = game.board();

    for (let row = 0; row < 8; row++) {

        for (let col = 0; col < 8; col++) {

            const square =
                document.createElement("div");

            const squareName =
                files[col] + ranks[row];

            square.dataset.square = squareName;


            /* Board colors */

            if ((row + col) % 2 === 0) {

                square.classList.add("light");

            } else {

                square.classList.add("dark");

            }


            /* =================================
               PIECE
            ================================= */

            const piece =
                boardState[row][col];

            if (piece) {

                const img =
                    document.createElement("img");

                img.src =
                    pieces[piece.color][piece.type];

                img.alt =
                    `${piece.color === "w" ? "White" : "Black"} ${piece.type}`;

                img.classList.add("chess-piece");

                square.appendChild(img);

                square.classList.add(
                    piece.color === "w"
                        ? "white-piece"
                        : "black-piece"
                );

            }


            /* =================================
               CLICK EVENT
            ================================= */

            square.addEventListener(
                "click",
                () => handleSquareClick(squareName)
            );

            board.appendChild(square);

        }

    }


    highlightCheck();

}


/* =========================================
   HANDLE SQUARE CLICK
========================================= */

function handleSquareClick(square) {

    if (game.game_over()) {
        return;
    }


    const piece =
        game.get(square);


    /* =================================
       NOTHING SELECTED
    ================================= */

    if (!selectedSquare) {

        if (!piece) {
            return;
        }


        /* Only current player's piece */

        if (piece.color !== game.turn()) {
            return;
        }


        selectedSquare = square;

        highlightSelectedSquare();

        return;
    }


    /* =================================
       CLICK SAME PIECE
    ================================= */

    if (selectedSquare === square) {

        selectedSquare = null;

        createBoard();

        return;
    }


    /* =================================
       TRY TO MAKE MOVE
    ================================= */

    const move =
        makeMove(
            selectedSquare,
            square
        );


    if (move) {

        selectedSquare = null;

        createBoard();

        updateGameStatus();

        updateMoveHistory();

        updateCapturedPieces();

        updateTimerDisplay();

    } else {

        /* Select another own piece */

        if (
            piece &&
            piece.color === game.turn()
        ) {

            selectedSquare = square;

            highlightSelectedSquare();

        }

    }

}


/* =========================================
   MAKE MOVE
========================================= */

function makeMove(from, to) {

    try {

        const move = game.move({

            from: from,

            to: to,

            /* Automatic queen promotion */

            promotion: "q"

        });

        return move;

    } catch (error) {

        return null;

    }

}


/* =========================================
   HIGHLIGHT SELECTED SQUARE
========================================= */

function highlightSelectedSquare() {

    createBoard();


    const selected =
        document.querySelector(
            `[data-square="${selectedSquare}"]`
        );


    if (selected) {

        selected.classList.add("selected");

    }


    highlightLegalMoves();

}


/* =========================================
   HIGHLIGHT LEGAL MOVES
========================================= */

function highlightLegalMoves() {

    if (!selectedSquare) {
        return;
    }


    const moves =
        game.moves({
            square: selectedSquare,
            verbose: true
        });


    moves.forEach(move => {

        const target =
            document.querySelector(
                `[data-square="${move.to}"]`
            );


        if (!target) {
            return;
        }


        if (move.captured) {

            target.classList.add(
                "capture-move"
            );

        } else {

            target.classList.add(
                "legal-move"
            );

        }

    });

}


/* =========================================
   CHECK DETECTION
========================================= */

function highlightCheck() {

    if (!game.in_check()) {
        return;
    }


    const kingColor =
        game.turn();

    const boardState =
        game.board();


    for (let row = 0; row < 8; row++) {

        for (let col = 0; col < 8; col++) {

            const piece =
                boardState[row][col];


            if (
                piece &&
                piece.type === "k" &&
                piece.color === kingColor
            ) {

                const square =
                    files[col] + ranks[row];


                const kingElement =
                    document.querySelector(
                        `[data-square="${square}"]`
                    );


                if (kingElement) {

                    kingElement.classList.add(
                        "check"
                    );

                }

            }

        }

    }

}


/* =========================================
   GAME STATUS
========================================= */

function updateGameStatus() {

    /* Checkmate */

    if (game.in_checkmate()) {

        stopTimer();


        const winner =
            game.turn() === "w"
                ? "Black"
                : "White";


        statusText.textContent =
            `♚ Checkmate! ${winner} wins.`;

        return;
    }


    /* Stalemate */

    if (game.in_stalemate()) {

        stopTimer();

        statusText.textContent =
            "Draw — Stalemate.";

        return;
    }


    /* Threefold repetition */

    if (game.in_threefold_repetition()) {

        stopTimer();

        statusText.textContent =
            "Draw — Threefold repetition.";

        return;
    }


    /* Insufficient material */

    if (game.insufficient_material()) {

        stopTimer();

        statusText.textContent =
            "Draw — Insufficient material.";

        return;
    }


    /* Check */

    if (game.in_check()) {

        const player =
            game.turn() === "w"
                ? "White"
                : "Black";


        statusText.textContent =
            `⚠ ${player} is in check!`;

        return;
    }


    /* Normal turn */

    const player =
        game.turn() === "w"
            ? "White"
            : "Black";


    statusText.textContent =
        `${player}'s turn`;

}


/* =========================================
   CAPTURED PIECES
========================================= */

function updateCapturedPieces() {

    const history =
        game.history({
            verbose: true
        });


    /* Clear old captured pieces */

    whiteCaptured.innerHTML = "";
    blackCaptured.innerHTML = "";


    let whiteLost = [];
    let blackLost = [];


    /* =================================
       FIND CAPTURED PIECES
    ================================= */

    history.forEach(move => {

        if (!move.captured) {
            return;
        }


        /*
            White moves -> Black piece captured
            Black moves -> White piece captured
        */

        const capturedColor =
            move.color === "w"
                ? "b"
                : "w";


        const capturedPiece =
            pieces[capturedColor][move.captured];


        if (capturedColor === "w") {

            whiteLost.push(capturedPiece);

        } else {

            blackLost.push(capturedPiece);

        }

    });


    /* =================================
       WHITE LOST PIECES
    ================================= */

    if (whiteLost.length === 0) {

        whiteCaptured.innerHTML =
            '<span class="empty-message">None</span>';

    } else {

        whiteLost.forEach(piece => {

            const element =
                document.createElement("img");

            element.className =
                "captured-piece";

            element.src =
                piece;

            element.alt =
                "Captured white piece";

            whiteCaptured.appendChild(
                element
            );

        });

    }


    /* =================================
       BLACK LOST PIECES
    ================================= */

    if (blackLost.length === 0) {

        blackCaptured.innerHTML =
            '<span class="empty-message">None</span>';

    } else {

        blackLost.forEach(piece => {

            const element =
                document.createElement("img");

            element.className =
                "captured-piece";

            element.src =
                piece;

            element.alt =
                "Captured black piece";

            blackCaptured.appendChild(
                element
            );

        });

    }

}


/* =========================================
   MOVE HISTORY
========================================= */

function updateMoveHistory() {

    const history =
        game.history();


    moveHistory.innerHTML = "";


    if (history.length === 0) {

        moveHistory.textContent =
            "No moves yet.";

        return;
    }


    for (
        let i = 0;
        i < history.length;
        i += 2
    ) {

        const moveNumber =
            Math.floor(i / 2) + 1;


        const whiteMove =
            history[i] || "";


        const blackMove =
            history[i + 1] || "";


        const moveElement =
            document.createElement("span");


        moveElement.className =
            "move";


        moveElement.textContent =
            `${moveNumber}. ${whiteMove} ${blackMove}`;


        moveHistory.appendChild(
            moveElement
        );

    }

}


/* =========================================
   TIMER
========================================= */

function startTimer() {

    /* Prevent multiple timers */

    if (timerInterval !== null) {
        return;
    }


    timerInterval =
        setInterval(() => {

            /* Stop if game has ended */

            if (game.game_over()) {

                stopTimer();

                return;
            }


            /* White's turn */

            if (game.turn() === "w") {

                whiteTime--;

            }


            /* Black's turn */

            else {

                blackTime--;

            }


            updateTimerDisplay();


            /* Time reached zero */

            if (
                whiteTime <= 0 ||
                blackTime <= 0
            ) {

                handleTimeOut();

            }

        }, 1000);

}


/* =========================================
   STOP TIMER
========================================= */

function stopTimer() {

    clearInterval(timerInterval);

    timerInterval = null;

}


/* =========================================
   FORMAT TIME
========================================= */

function formatTime(seconds) {

    const minutes =
        Math.floor(seconds / 60);


    const remainingSeconds =
        seconds % 60;


    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(remainingSeconds).padStart(2, "0")
    );

}


/* =========================================
   UPDATE TIMER DISPLAY
========================================= */

function updateTimerDisplay() {

    whiteTimer.textContent =
        formatTime(whiteTime);


    blackTimer.textContent =
        formatTime(blackTime);


    /* Remove previous styles */

    whiteTimer.classList.remove(
        "active-timer",
        "timer-warning",
        "timer-danger"
    );


    blackTimer.classList.remove(
        "active-timer",
        "timer-warning",
        "timer-danger"
    );


    /* Determine active player */

    if (game.turn() === "w") {

        whiteTimer.classList.add(
            "active-timer"
        );

    } else {

        blackTimer.classList.add(
            "active-timer"
        );

    }


    /* Warning below 60 seconds */

    if (
        whiteTime <= 60 &&
        whiteTime > 10
    ) {

        whiteTimer.classList.add(
            "timer-warning"
        );

    }


    if (
        blackTime <= 60 &&
        blackTime > 10
    ) {

        blackTimer.classList.add(
            "timer-warning"
        );

    }


    /* Danger below 10 seconds */

    if (whiteTime <= 10) {

        whiteTimer.classList.add(
            "timer-danger"
        );

    }


    if (blackTime <= 10) {

        blackTimer.classList.add(
            "timer-danger"
        );

    }

}


/* =========================================
   TIME OUT
========================================= */

function handleTimeOut() {

    stopTimer();


    let winner;


    if (whiteTime <= 0) {

        winner = "Black";

        whiteTime = 0;

    } else {

        winner = "White";

        blackTime = 0;

    }


    updateTimerDisplay();


    statusText.textContent =
        `⏰ Time's up! ${winner} wins.`;

}


/* =========================================
   UNDO
========================================= */

undoBtn.addEventListener(
    "click",
    () => {

        /*
            Don't undo after timeout
        */

        if (
            whiteTime <= 0 ||
            blackTime <= 0
        ) {

            return;

        }


        /* Don't call undo if there are no moves */

        if (game.history().length === 0) {
            return;
        }


        game.undo();


        selectedSquare = null;


        createBoard();

        updateGameStatus();

        updateMoveHistory();

        updateCapturedPieces();

        updateTimerDisplay();

    }
);


/* =========================================
   NEW GAME
========================================= */

resetBtn.addEventListener(
    "click",
    () => {

        game.reset();


        selectedSquare = null;


        /* Reset timers */

        whiteTime =
            INITIAL_TIME;

        blackTime =
            INITIAL_TIME;


        createBoard();

        updateGameStatus();

        updateMoveHistory();

        updateCapturedPieces();

        updateTimerDisplay();


        /* Make sure timer is running */

        if (timerInterval === null) {
            startTimer();
        }

    }
);


/* =========================================
   START GAME
========================================= */

createBoard();

updateGameStatus();

updateMoveHistory();

updateCapturedPieces();

updateTimerDisplay();

startTimer();
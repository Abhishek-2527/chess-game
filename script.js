const board = document.getElementById("board");
const statusText = document.getElementById("status");
const resetBtn = document.getElementById("resetBtn");
const undoBtn = document.getElementById("undoBtn");
const moveHistory = document.getElementById("moveHistory");

// Create chess game
const game = new Chess();

let selectedSquare = null;

// Unicode chess pieces
const pieces = {
    w: {
        p: "♙",
        r: "♖",
        n: "♘",
        b: "♗",
        q: "♕",
        k: "♔"
    },

    b: {
        p: "♟",
        r: "♜",
        n: "♞",
        b: "♝",
        q: "♛",
        k: "♚"
    }
};

// Board coordinates
const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];


/* =========================
   CREATE BOARD
========================= */

function createBoard() {

    board.innerHTML = "";

    const boardState = game.board();

    for (let row = 0; row < 8; row++) {

        for (let col = 0; col < 8; col++) {

            const square = document.createElement("div");

            const squareName =
                files[col] + ranks[row];

            square.dataset.square = squareName;

            // Color square
            if ((row + col) % 2 === 0) {
                square.classList.add("light");
            } else {
                square.classList.add("dark");
            }

            const piece = boardState[row][col];

            if (piece) {

                square.textContent =
                    pieces[piece.color][piece.type];
                square.classList.add(
                    piece.color === "w" ? "white-piece" : "black-piece"
                );
            }

            square.addEventListener(
                "click",
                () => handleSquareClick(squareName)
            );

            board.appendChild(square);
        }
    }

    highlightCheck();
}


/* =========================
   HANDLE CLICK
========================= */

function handleSquareClick(square) {

    // If game has ended
    if (game.game_over()) {
        return;
    }

    const piece = game.get(square);

    // No square selected
    if (!selectedSquare) {

        if (!piece) {
            return;
        }

        // Only allow current player's piece
        if (piece.color !== game.turn()) {
            return;
        }

        selectedSquare = square;

        highlightSelectedSquare();

        return;
    }

    // Clicking same square
    if (selectedSquare === square) {

        selectedSquare = null;

        createBoard();

        return;
    }

    // Try move
    const move = makeMove(
        selectedSquare,
        square
    );

    if (move) {

        selectedSquare = null;

        createBoard();

        updateGameStatus();

        updateMoveHistory();

    } else {

        // If clicked another own piece,
        // select that piece instead
        if (
            piece &&
            piece.color === game.turn()
        ) {

            selectedSquare = square;

            highlightSelectedSquare();

        }
    }
}


/* =========================
   MAKE MOVE
========================= */

function makeMove(from, to) {

    try {

        const move = game.move({
            from: from,
            to: to,

            // Automatically promote pawn to queen
            promotion: "q"
        });

        return move;

    } catch (error) {

        return null;
    }
}


/* =========================
   HIGHLIGHT SELECTED
========================= */

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


/* =========================
   LEGAL MOVES
========================= */

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
            target.classList.add("capture-move");
        } else {
            target.classList.add("legal-move");
        }
    });
}


/* =========================
   CHECK DETECTION
========================= */

function highlightCheck() {

    if (!game.in_check()) {
        return;
    }

    const kingColor = game.turn();

    const boardState = game.board();

    for (let row = 0; row < 8; row++) {

        for (let col = 0; col < 8; col++) {

            const piece = boardState[row][col];

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
                    kingElement.classList.add("check");
                }
            }
        }
    }
}


/* =========================
   GAME STATUS
========================= */

function updateGameStatus() {

    if (game.in_checkmate()) {

        const winner =
            game.turn() === "w"
                ? "Black"
                : "White";

        statusText.textContent =
            `Checkmate! ${winner} wins.`;

        return;
    }

    if (game.in_stalemate()) {

        statusText.textContent =
            "Draw — Stalemate.";

        return;
    }

    if (game.in_threefold_repetition()) {

        statusText.textContent =
            "Draw — Threefold repetition.";

        return;
    }

    if (game.insufficient_material()) {

        statusText.textContent =
            "Draw — Insufficient material.";

        return;
    }

    if (game.in_check()) {

        const player =
            game.turn() === "w"
                ? "White"
                : "Black";

        statusText.textContent =
            `${player} is in check!`;

        return;
    }

    const player =
        game.turn() === "w"
            ? "White"
            : "Black";

    statusText.textContent =
        `${player}'s turn`;
}


/* =========================
   MOVE HISTORY
========================= */

function updateMoveHistory() {

    const history = game.history();

    moveHistory.innerHTML = "";

    for (let i = 0; i < history.length; i += 2) {

        const moveNumber =
            Math.floor(i / 2) + 1;

        const whiteMove =
            history[i] || "";

        const blackMove =
            history[i + 1] || "";

        const moveElement =
            document.createElement("div");

        moveElement.classList.add("move");

        moveElement.textContent =
            `${moveNumber}. ${whiteMove} ${blackMove}`;

        moveHistory.appendChild(moveElement);
    }
}


/* =========================
   UNDO
========================= */

undoBtn.addEventListener(
    "click",
    () => {

        game.undo();

        selectedSquare = null;

        createBoard();

        updateGameStatus();

        updateMoveHistory();
    }
);


/* =========================
   RESET GAME
========================= */

resetBtn.addEventListener(
    "click",
    () => {

        game.reset();

        selectedSquare = null;

        createBoard();

        updateGameStatus();

        updateMoveHistory();
    }
);


/* =========================
   START GAME
========================= */

createBoard();
updateGameStatus();
updateMoveHistory();
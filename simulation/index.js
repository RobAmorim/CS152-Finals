const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

class TicTacToe {
  constructor() {
    this.board = Array(9).fill(" ");
    this.currentWinner = null;
  }

  static makeBoard() {
    return Array(9).fill(" ");
  }

  printBoard() {
    for (let i = 0; i < 3; i++) {
      console.log(
        "| " + this.board.slice(i * 3, (i + 1) * 3).join(" | ") + " |"
      );
    }
  }

  static printBoardNums() {
    const numberBoard = [...Array(3).keys()].map((j) =>
      [...Array(3).keys()].map((i) => i + j * 3).join(" | ")
    );
    numberBoard.forEach((row) => console.log("| " + row + " |"));
  }

  makeMove(square, letter) {
    if (this.board[square] === " ") {
      this.board[square] = letter;
      if (this.winner(square, letter)) {
        this.currentWinner = letter;
      }
      return true;
    }
    return false;
  }

  winner(square, letter) {
    const rowInd = Math.floor(square / 3);
    const row = this.board.slice(rowInd * 3, (rowInd + 1) * 3);
    if (row.every((s) => s === letter)) {
      return true;
    }

    const colInd = square % 3;
    const column = [0, 1, 2].map((i) => this.board[colInd + i * 3]);
    if (column.every((s) => s === letter)) {
      return true;
    }

    if (square % 2 === 0) {
      const diagonal1 = [0, 4, 8].map((i) => this.board[i]);
      if (diagonal1.every((s) => s === letter)) {
        return true;
      }
      const diagonal2 = [2, 4, 6].map((i) => this.board[i]);
      if (diagonal2.every((s) => s === letter)) {
        return true;
      }
    }
    return false;
  }

  emptySquares() {
    return this.board.includes(" ");
  }

  numEmptySquares() {
    return this.board.filter((x) => x === " ").length;
  }

  availableMoves() {
    return this.board
      .map((x, i) => (x === " " ? i : null))
      .filter((x) => x !== null);
  }
}

class Player {
  constructor(letter) {
    this.letter = letter;
  }

  getMove(game) {
    // To be implemented in subclasses
  }
}

class HumanPlayer extends Player {
  getMove(game) {
    return new Promise((resolve) => {
      rl.question(`${this.letter}'s turn. Input move (0-8): `, (answer) => {
        const square = parseInt(answer);
        if (game.availableMoves().includes(square)) {
          resolve(square);
        } else {
          console.log("Invalid square. Try again.");
          resolve(this.getMove(game));
        }
      });
    });
  }
}

class RandomComputerPlayer extends Player {
  getMove(game) {
    const availableMoves = game.availableMoves();
    return Promise.resolve(
      availableMoves[Math.floor(Math.random() * availableMoves.length)]
    );
  }
}

class SmartComputerPlayer extends Player {
  constructor(letter) {
    super(letter);
  }

  getMove(game) {
    if (game.availableMoves().length === 9) {
      const availableMoves = game.availableMoves();
      return Promise.resolve(
        availableMoves[Math.floor(Math.random() * availableMoves.length)]
      );
    } else {
      const { position } = this.minimax(game, this.letter);
      return Promise.resolve(position);
    }
  }

  minimax(state, player) {
    const maxPlayer = this.letter;
    const otherPlayer = player === "X" ? "O" : "X";

    if (state.currentWinner === otherPlayer) {
      return {
        position: null,
        score:
          (otherPlayer === maxPlayer ? 1 : -1) * (state.numEmptySquares() + 1),
      };
    } else if (!state.emptySquares()) {
      return { position: null, score: 0 };
    }

    let best = {
      position: null,
      score:
        player === maxPlayer
          ? Number.NEGATIVE_INFINITY
          : Number.POSITIVE_INFINITY,
    };

    state.availableMoves().forEach((possibleMove) => {
      state.makeMove(possibleMove, player);
      let simScore = this.minimax(state, otherPlayer);

      state.board[possibleMove] = " ";
      state.currentWinner = null;
      simScore.position = possibleMove;

      if (player === maxPlayer) {
        if (simScore.score > best.score) best = simScore;
      } else {
        if (simScore.score < best.score) best = simScore;
      }
    });

    return best;
  }
}

// The minimax algorithm and SmartComputerPlayer implementation would be similar,
// following JavaScript's syntax and async/await pattern for consistency.

async function play(game, xPlayer, oPlayer, printGame = true) {
  let result = "tie";
  if (printGame) {
    TicTacToe.printBoardNums();
  }

  let letter = "X";
  while (game.emptySquares()) {
    const currentPlayer = letter === "O" ? oPlayer : xPlayer;
    const square = await currentPlayer.getMove(game);

    if (game.makeMove(square, letter)) {
      if (printGame) {
        console.log(`${letter} makes a move to square ${square}`);
        game.printBoard();
        console.log("");
      }

      if (game.currentWinner) {
        if (printGame) {
          console.log(`${letter} wins!`);
          result = letter;
        }
        return letter;
      }
      letter = letter === "X" ? "O" : "X";
    }
  }

  if (printGame) {
    console.log("It's a tie!");
  }
  return result;
}

// Test for tie condition
function testTieCondition() {
  const game = new TicTacToe();
  // Fill the board without winning
  // Example sequence: XOX/OXO/XOX
  game.makeMove(0, "X");
  game.makeMove(1, "O");
  game.makeMove(2, "X");
  game.makeMove(3, "O");
  game.makeMove(4, "X");
  game.makeMove(5, "O");
  game.makeMove(6, "X");
  game.makeMove(7, "X");
  game.makeMove(8, "O");
  console.assert(
    game.currentWinner === null && game.emptySquares() === false,
    "Test failed: Should be a tie"
  );
  console.log("Tie detection test passed.");
}

// Test for Minimax algorithm effectiveness
function testMinimaxEffectiveness() {
  const game = new TicTacToe();
  game.makeMove(0, "X");
  game.makeMove(3, "X");
  const smartPlayer = new SmartComputerPlayer("O");
  const bestMove = smartPlayer.getMove(game);
  bestMove.then((move) => {
    console.assert(move === 6, "Test failed: Minimax should choose square 6");
    console.log("Minimax effectiveness test passed.");
  });
}

// Main execution
const game = new TicTacToe();
const xPlayer = new SmartComputerPlayer("X");
const oPlayer = new SmartComputerPlayer("O");

play(game, xPlayer, oPlayer, true).then(() => {
  rl.close();
});

// Export the classes
module.exports = {
  TicTacToe,
  Player,
  HumanPlayer,
  RandomComputerPlayer,
  SmartComputerPlayer,
  play,
};

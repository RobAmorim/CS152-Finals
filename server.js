// Import necessary modules and set up the Express app
const express = require("express");
const cors = require("cors");
const app = express();
const port = 5200;

// Enable CORS middleware to allow cross-origin requests
app.use(cors());

// Define the TicTacToe class to represent the game state
class TicTacToe {
  // Initialize the game board and winner status
  constructor() {
    this.board = Array(9).fill(" ");
    this.currentWinner = null;
  }

  // Static method to create a new game board
  static makeBoard() {
    return Array(9).fill(" ");
  }

  // Get the current game board
  getBoard() {
    return this.board;
  }

  // Make a move on the board, check for a winner, and update the current winner
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

  // Check if the player with 'letter' has won after making a move in 'square'
  winner(square, letter) {
    // Check row
    const rowInd = Math.floor(square / 3);
    const row = this.board.slice(rowInd * 3, (rowInd + 1) * 3);
    if (row.every((s) => s === letter)) {
      return true;
    }

    // Check column
    const colInd = square % 3;
    const column = [0, 1, 2].map((i) => this.board[colInd + i * 3]);
    if (column.every((s) => s === letter)) {
      return true;
    }

    // Check diagonals if the move is on an even-indexed square
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

  // Check if there are empty squares on the board
  emptySquares() {
    return this.board.includes(" ");
  }

  // Count the number of empty squares on the board
  numEmptySquares() {
    return this.board.filter((x) => x === " ").length;
  }

  // Get an array of available (empty) moves on the board
  availableMoves() {
    return this.board
      .map((x, i) => (x === " " ? i : null))
      .filter((x) => x !== null);
  }
}

// Define the Player class with a placeholder method to be implemented by subclasses
class Player {
  constructor(letter) {
    this.letter = letter;
  }

  // Placeholder method for getting a move
  getMove(game) {
    // To be implemented in subclasses
  }
}

// Define a RandomComputerPlayer class that extends the Player class
class RandomComputerPlayer extends Player {
  // Generate a random move from the available moves
  getMove(game) {
    const availableMoves = game.availableMoves();
    return Promise.resolve(
      availableMoves[Math.floor(Math.random() * availableMoves.length)]
    );
  }
}

// Define a SmartComputerPlayer class that extends the Player class
class SmartComputerPlayer extends Player {
  constructor(letter) {
    super(letter);
  }

  // Implement the minimax algorithm to make smart moves
  getMove(game) {
    if (game.availableMoves().length === 9) {
      // Make a random move for the first turn
      const availableMoves = game.availableMoves();
      return Promise.resolve(
        availableMoves[Math.floor(Math.random() * availableMoves.length)]
      );
    } else {
      // Use minimax for subsequent turns
      const { position } = this.minimax(game, this.letter);
      return Promise.resolve(position);
    }
  }

  // Minimax algorithm implementation to determine the best move
  minimax(state, player) {
    // Define players
    const maxPlayer = this.letter;
    const otherPlayer = player === "X" ? "O" : "X";

    // Check if the other player has won
    if (state.currentWinner === otherPlayer) {
      return {
        position: null,
        score:
          (otherPlayer === maxPlayer ? 1 : -1) * (state.numEmptySquares() + 1),
      };
    } else if (!state.emptySquares()) {
      // Check for a tie
      return { position: null, score: 0 };
    }

    // Initialize the best move with extreme values
    let best = {
      position: null,
      score:
        player === maxPlayer
          ? Number.NEGATIVE_INFINITY
          : Number.POSITIVE_INFINITY,
    };

    // Iterate through available moves
    state.availableMoves().forEach((possibleMove) => {
      // Make the move and recursively call minimax
      state.makeMove(possibleMove, player);
      let simScore = this.minimax(state, otherPlayer);

      // Undo the move
      state.board[possibleMove] = " ";
      state.currentWinner = null;
      simScore.position = possibleMove;

      // Update the best move based on the player's turn
      if (player === maxPlayer) {
        if (simScore.score > best.score) best = simScore;
      } else {
        if (simScore.score < best.score) best = simScore;
      }
    });

    return best;
  }
}

// Initialize a new TicTacToe game
let game = new TicTacToe();

// Reset the game state when a reset request is received
app.post("/reset", async (req, res) => {
  game = new TicTacToe();
  res.status(200).send("ok");
});

// Handle the next move based on the player type (Random or Smart Computer)
app.post("/nextMove", async (req, res) => {
  const { kind, letter } = req.query;

  // Map player kinds to their respective classes
  const playersStrategyByKind = {
    SmartComputer: SmartComputerPlayer,
    RandomComputer: RandomComputerPlayer,
  };

  // Create an instance of the selected player type
  const playerStrategy = new playersStrategyByKind[kind](letter);

  // Get the player's move and update the game state
  const playerSquare = await playerStrategy.getMove(game);
  game.makeMove(playerSquare, letter);

  // Return the updated game state
  res.json({
    board: game.getBoard(),
    winner: game.currentWinner,
    tie: game.availableMoves().length === 0,
  });
});

// Handle a human player's move
app.post("/makeHumanMove", async (req, res) => {
  const { index, letter } = req.query;

  // Make the human player's move and update the game state
  game.makeMove(index, letter);

  // Return the updated game state
  res.json({
    board: game.getBoard(),
    winner: game.currentWinner,
    tie: game.availableMoves().length === 0,
  });
});

// Handle a move request (typically used for playing against a smart computer)
app.post("/move", async (req, res) => {
  const { square, letter } = req.query;

  // Create an instance of the SmartComputerPlayer for the opponent
  const oPlayer = new SmartComputerPlayer("O");

  // Make the player's move and the opponent's move
  if (game.makeMove(square, letter)) {
    const oPlayerSquare = await oPlayer.getMove(game);
    game.makeMove(oPlayerSquare, "O");

    // Get the updated game board
    const board = game.getBoard();

    // Return the updated game state
    res.json({ board, winner: game.currentWinner });

    // Reset the game if there's a winner
    if (game.currentWinner) {
      game = new TicTacToe();
    }
  } else {
    // Return an error for an invalid move
    res.status(400).send("Invalid move");
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

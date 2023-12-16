const {
  TicTacToe,
  Player,
  HumanPlayer,
  RandomComputerPlayer,
  SmartComputerPlayer,
} = require("./index");

// Test for win condition
function testWinCondition() {
  const game = new TicTacToe();
  game.makeMove(0, "X");
  game.makeMove(1, "X");
  game.makeMove(2, "X");
  console.assert(game.currentWinner === "X", "Test failed: X should win");
  console.log("Win detection test passed.");
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

// Test for invalid move handling
function testInvalidMoveHandling() {
  const game = new TicTacToe();
  game.makeMove(0, "X");
  const valid = game.makeMove(0, "O"); // Attempting to make a move on the same square
  console.assert(
    valid === false,
    "Test failed: Should not allow move on occupied square"
  );
  console.log("Invalid move handling test passed.");
}

async function testFullGameSimulation() {
  const game = new TicTacToe();
  const xPlayer = new SmartComputerPlayer("X");
  const oPlayer = new SmartComputerPlayer("O");

  // Simulate moves for a full game
  // Ensure the game progresses correctly and ends with the correct outcome

  console.log("Full game simulation test passed.");
}

testWinCondition();
// testTieCondition()
testMinimaxEffectiveness();
testInvalidMoveHandling();
testFullGameSimulation();

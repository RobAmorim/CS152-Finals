const {
  TicTacToe,
  Player,
  HumanPlayer,
  RandomComputerPlayer,
  SmartComputerPlayer,
  play,
} = require("./index");

async function AI_vs_AI() {
  const results = {
    X: 0,
    O: 0,
    tie: 0,
  };
  const totalSimulations = 100; // Adjust this number for more or fewer simulations
  for (let i = 0; i < totalSimulations; i++) {
    const game = new TicTacToe();
    const xPlayer = new SmartComputerPlayer("X");
    const oPlayer = new SmartComputerPlayer("O");

    const result = await play(game, xPlayer, oPlayer, false); // Set printGame to false for simulations
    results[result]++;
    // Reset the game state if necessary
  }

  console.log("Simulation (AI VS AI):", results);
  // rl.close(); // Uncomment this if you are using readline interface
}

async function AI_vs_Random() {
  const results = {
    X: 0,
    O: 0,
    tie: 0,
  };
  const totalSimulations = 100; // Adjust this number for more or fewer simulations
  for (let i = 0; i < totalSimulations; i++) {
    const game = new TicTacToe();
    const xPlayer = new SmartComputerPlayer("X");
    const oPlayer = new RandomComputerPlayer("O");

    const result = await play(game, xPlayer, oPlayer, false); // Set printGame to false for simulations
    results[result]++;
    // Reset the game state if necessary
  }

  console.log("Simulation (AI VS Random):", results);
  // rl.close(); // Uncomment this if you are using readline interface
}

async function Random_vs_AI() {
  const results = {
    X: 0,
    O: 0,
    tie: 0,
  };
  const totalSimulations = 100; // Adjust this number for more or fewer simulations
  for (let i = 0; i < totalSimulations; i++) {
    const game = new TicTacToe();
    const xPlayer = new RandomComputerPlayer("X");
    const oPlayer = new SmartComputerPlayer("O");

    const result = await play(game, xPlayer, oPlayer, false); // Set printGame to false for simulations
    results[result]++;
    // Reset the game state if necessary
  }

  console.log("Random_vs_AI:", results);
  // rl.close(); // Uncomment this if you are using readline interface
}

async function Random_vs_Random() {
  const results = {
    X: 0,
    O: 0,
    tie: 0,
  };
  const totalSimulations = 100; // Adjust this number for more or fewer simulations
  for (let i = 0; i < totalSimulations; i++) {
    const game = new TicTacToe();
    const xPlayer = new RandomComputerPlayer("X");
    const oPlayer = new RandomComputerPlayer("O");

    const result = await play(game, xPlayer, oPlayer, false); // Set printGame to false for simulations
    results[result]++;
    // Reset the game state if necessary
  }

  console.log("Simulation (Random VS Random)):", results);
  // rl.close(); // Uncomment this if you are using readline interface
}

//Simulation
async function index() {
  await AI_vs_AI();
  await AI_vs_Random();
  await Random_vs_AI();
  await Random_vs_Random();
  process.exit(0);
}

index();

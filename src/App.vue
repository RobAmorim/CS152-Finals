<template>
  <div>
    <span>Choose player 1</span>
    <select v-model="player1" id="player2">
      <option value="SmartComputer">Smart Computer</option>
      <option value="RandomComputer">Random Computer</option>
      <option value="HumanPlayer">Human Player</option>
    </select>
    <span>Choose player 2</span>
    <select v-model="player2" id="player2">
      <option value="SmartComputer">Smart Computer</option>
      <option value="RandomComputer">Random Computer</option>
      <option value="HumanPlayer">Human Player</option>
    </select>
    <button
      :disabled="!gameIsReadyToInit || gameIsFinished"
      @click="startGame()"
    >
      Start
    </button>
    <button @click="reset()">Reset</button>
    <div class="winner" v-if="winner">Winner: {{ winner }}</div>
    <div class="tied" v-if="tied">Game tied</div>

    <!-- Display the game board -->
    <div class="grid" v-if="gameIsReadyToInit">
      <div v-for="(cell, index) in board" :key="index">
        <button class="button" @click="makeHumanMove(index)">{{ cell }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "App",
  data() {
    return {
      board: [" ", " ", " ", " ", " ", " ", " ", " ", " "],
      player1: null,
      player2: null,
      currentPlayer: null,
      winner: null,
      tied: null,
    };
  },
  async created() {
    await this.reset();
  },

  computed: {
    gameIsReadyToInit() {
      return this.player1 && this.player2;
    },
    players() {
      return [this.player1, this.player2];
    },
    hasRealPlayersOnGame() {
      return this.player1 == "HumanPlayer" || this.player2 == "HumanPlayer";
    },
    gameIsFinished() {
      return this.winner || this.tied;
    },
  },

  methods: {
    async wait(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },

    async reset() {
      await axios.post("http://localhost:5200/reset");
      this.player1 = null;
      this.player2 = null;
      this.board = [" ", " ", " ", " ", " ", " ", " ", " ", " "];
      this.winner = null;
      this.tied = null;
    },

    async makeHumanMove(index) {
      if (this.gameIsFinished) {
        return;
      }

      const currentPlayerIsHuman =
        this.players[this.currentPlayer] === "HumanPlayer";
      if (!currentPlayerIsHuman) {
        return;
      }

      const response = await axios.post(
        "http://localhost:5200/makeHumanMove",
        null,
        {
          params: {
            index,
            letter: this.currentPlayer === 0 ? "X" : "O",
          },
        }
      );

      this.board = response.data.board;

      if (response.data.winner) {
        this.winner = response.data.winner;
        return;
      }

      if (response.data.tie) {
        this.tied = true;
        return;
      }

      await this.nextMove();
    },

    async startGame() {
      this.currentPlayer = 0;

      const currentPlayerIsHuman =
        this.players[this.currentPlayer] === "HumanPlayer";

      if (currentPlayerIsHuman) {
        // Just return because we waiting for the click
        return;
      } else {
        const response = await axios.post(
          "http://localhost:5200/nextMove",
          null,
          {
            params: {
              kind: this.players[0],
              letter: this.currentPlayer === 0 ? "X" : "O",
            },
          }
        );
        this.board = response.data.board;
        await this.nextMove();
      }
    },

    async nextMove() {
      this.currentPlayer = this.currentPlayer === 0 ? 1 : 0;

      const currentPlayerIsHuman =
        this.players[this.currentPlayer] === "HumanPlayer";

      if (currentPlayerIsHuman) {
        // Just return because we waiting for the click
        return;
      } else {
        await this.wait(300);

        const response = await axios.post(
          "http://localhost:5200/nextMove",
          null,
          {
            params: {
              kind: this.players[this.currentPlayer],
              letter: this.currentPlayer === 0 ? "X" : "O",
            },
          }
        );

        this.board = response.data.board;

        if (response.data.winner) {
          this.winner = response.data.winner;
          return;
        }

        if (response.data.tie) {
          this.tied = true;
          return;
        }

        await this.nextMove();
      }
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.button {
  width: 200px;
  height: 200px;
  border: 1px solid #000;
  font-size: 56px;
  font-weight: bold;
}
.grid {
  display: flex;
  width: 600px;
  flex-wrap: wrap;
  margin-top: 20px;
}

.winner {
  color: green;
  font-size: 20px;
  margin-top: 10px;
}

.tied {
  color: #8b8000;
  font-size: 20px;
  margin-top: 10px;
}
</style>

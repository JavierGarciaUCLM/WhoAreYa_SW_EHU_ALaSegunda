import { folder, leftArrow } from "./fragments.js";
import { fetchJSON } from "./loaders.js";
import { setupRows } from "./rows.js";
import { autocomplete } from "./autocomplete.js";

function differenceInDays(base1) {
  const start = new Date(
    base1.getFullYear(),
    base1.getMonth(),
    base1.getDate()
  );
  const today = new Date();
  const end = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  ); // normalizo ambas fechas a medianoche

  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const diffMs = end - start;
  return Math.floor(diffMs / MS_PER_DAY) + 1; // +1 día, como pide el enunciado
}

let difference_In_Days = differenceInDays(new Date("01-10-2025"));

window.onload = function () {
  document.getElementById( "gamenumber").innerText = difference_In_Days.toString();
  document.getElementById("back-icon").innerHTML = folder + leftArrow;
};

let game = {
  guesses: [],
  solution: {},
  players: [],
  leagues: []
};

function getSolution(players, solutionArray, difference_In_Days) {
  const index = (difference_In_Days - 1) % solutionArray.length; // índice circular
  const solutionId = solutionArray[index]; // ID del jugador para hoy
  const player = players.find((p) => p.id === Number(solutionId)); // buscamos el jugador completo (convertimos a número, NO STRING)
  return player;
}

Promise.all([fetchJSON("fullplayers25"), fetchJSON("solution25")]).then(
  (values) => {

    let solutionRaw;
    
    [game.players, solutionRaw] = values;

    // solution25.json es un array de strings, se pasa a números para poder usarlo como array de números
    const solutionArray = solutionRaw.map(id => Number(id));

    game.solution = getSolution(game.players, solutionArray, difference_In_Days);
    
    console.log(game.solution);

    if (game.solution) {
      document.getElementById("mistery").src = `https://playfootball.games/media/players/${game.solution.id % 32}/${game.solution.id}.png`;
    }

    let addRow = setupRows(game);  // pasamos el estado del juego

    const input = document.getElementById("myInput");
    autocomplete(input, game);
    input.addEventListener("keyup", (e) => {
      if (e.key === "Enter") {
        const playerId = parseInt(input.value, 10);
        if (!isNaN(playerId)) {
          addRow(playerId);   // añade una nueva fila
          input.value = "";   // limpia el input
        }
      }
    });

  }
);

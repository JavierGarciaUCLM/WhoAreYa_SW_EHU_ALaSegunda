import { folder, leftArrow } from "./fragments.js";
import { fetchJSON } from "./loaders.js";

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

    let solution;
    
    [game.players, solution] = values;

    game.solution = getSolution(game.players, solution, difference_In_Days);
    
    console.log(game.solution);

    if (game.solution) {
      document.getElementById("mistery").src = `https://playfootball.games/media/players/${game.solution.id % 32}/${game.solution.id}.png`;
    }


      // YOUR CODE HERE
    let addRow = setupRows( /* THIS NEEDS A PARAMETER */ );
    // get myInput object...
      // when the user types a number an press the Enter key:
        addRow( /* the ID of the player, where is it? */);
    //  


  }
);

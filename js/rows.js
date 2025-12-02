import { stringToHTML } from "./fragments.js";

// From: https://stackoverflow.com/a/7254108/243532
function pad(a, b){
    return(1e15 + a + '').slice(-b);
}


const delay = 350;
const attribs = ['nationality', 'leagueId', 'teamId', 'position', 'birthdate']

function initState(storageKey, solutionId) {
  const state = { key: storageKey, solutionId, guesses: [] };
  function updateState(guessId) {
    state.guesses.push(guessId);
  }
  return [state, updateState];
}

let setupRows = function (game) {

    let [state, updateState] = initState('WAYgameState', game.solution.id)


    function leagueToFlag(leagueId) {
        const leagueMap = {
            564: "es1", // España
            8:   "en1", // Inglaterra
            82:  "de1", // Alemania
            384: "it1", // Italia
            301: "fr1"  // Francia
        };
        return leagueMap[leagueId] ?? "unknown";
    }


    function getAge(dateString) {
        const birth = new Date(dateString);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const hasBirthdayPassed =
            today.getMonth() > birth.getMonth() ||
            (today.getMonth() === birth.getMonth() &&
             today.getDate() >= birth.getDate());
        if (!hasBirthdayPassed) age--;
        return age;
    }
    
    let check = function (theKey, theValue) {
        const target = game.solution; // jugador misterioso
        if (theKey === "birthdate") {
            const guessedAge = getAge(theValue);
            const targetAge  = getAge(target.birthdate);
            if (guessedAge === targetAge) return "correct";
            // si el jugador elegido es más joven que el misterioso, busco más edad
            return guessedAge < targetAge ? "higher" : "lower";
        }
        // resto de atributos por comparación directa
        return target[theKey] === theValue ? "correct" : "incorrect";
    }

        function unblur(outcome) {
        return new Promise( (resolve, reject) =>  {
            setTimeout(() => {
                document.getElementById("mistery").classList.remove("hue-rotate-180", "blur")
                document.getElementById("combobox").remove()
                let color, text
                if (outcome=='success'){
                    color =  "bg-blue-500"
                    text = "Awesome"
                } else {
                    color =  "bg-rose-500"
                    text = "The player was " + game.solution.name
                }
                document.getElementById("picbox").innerHTML += `<div class="animate-pulse fixed z-20 top-14 left-1/2 transform -translate-x-1/2 max-w-sm shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden ${color} text-white"><div class="p-4"><p class="text-sm text-center font-medium">${text}</p></div></div>`
                resolve();
            }, "2000")
        })
    }


    function showStats(timeout) {
        return new Promise( (resolve, reject) =>  {
            setTimeout(() => {
                document.body.appendChild(stringToHTML(headless(stats())));
                document.getElementById("showHide").onclick = toggle;
                bindClose();
                resolve();
            }, timeout)
        })
    }

    function bindClose() {
        document.getElementById("closedialog").onclick = function () {
            document.body.removeChild(document.body.lastChild)
            document.getElementById("mistery").classList.remove("hue-rotate-180", "blur")
        }
    }


    function setContent(guess) {
        const ageCheck = check('birthdate', guess.birthdate);
        let ageDisplay = `${getAge(guess.birthdate)}`;
        //flecha si la edad no coincide
        if (ageCheck === 'higher') {
            ageDisplay += ' ↑'; //edad + más
        } else if (ageCheck === 'lower') {
            ageDisplay += ' ↓';//edad + menos
        }
        
        return [
            `<img src="https://playfootball.games/media/nations/${guess.nationality.toLowerCase()}.svg" alt="" style="width: 60%;">`,
            `<img src="https://playfootball.games/media/competitions/${leagueToFlag(guess.leagueId)}.png" alt="" style="width: 60%;">`,
            `<img src="https://cdn.sportmonks.com/images/soccer/teams/${guess.teamId % 32}/${guess.teamId}.png" alt="" style="width: 60%;">`,
            `${guess.position}`,
            ageDisplay
        ]
    }

    function showContent(content, guess) {
        let fragments = '', s = '';
        for (let j = 0; j < content.length; j++) {
            s = "".concat(((j + 1) * delay).toString(), "ms")
            const checkResult = check(attribs[j], guess[attribs[j]]);
            fragments += `<div class="w-1/5 shrink-0 flex justify-center ">
                            <div class="mx-1 overflow-hidden w-full max-w-2 shadowed font-bold text-xl flex aspect-square rounded-full justify-center items-center bg-slate-400 text-white ${checkResult == 'correct' ? 'bg-green-500' : ''} opacity-0 fadeInDown" style="max-width: 60px; animation-delay: ${s};">
                                ${content[j]}
                            </div>
                         </div>`
        }

        let child = `<div class="flex w-full flex-wrap text-l py-2">
                        <div class=" w-full grow text-center pb-2">
                            <div class="mx-1 overflow-hidden h-full flex items-center justify-center sm:text-right px-4 uppercase font-bold text-lg opacity-0 fadeInDown " style="animation-delay: 0ms;">
                                ${guess.name}
                            </div>
                        </div>
                        ${fragments}`

        let playersNode = document.getElementById('players')
        playersNode.prepend(stringToHTML(child))
    }


    function resetInput(){
        const input = document.getElementById("myInput");
        const currentAttempt = game.guesses.length + 1;
        input.placeholder = `Guess ${currentAttempt} of 8`;
    }

    let getPlayer = function (playerId) {
        return game.players.find(p => p.id === playerId);
    }

    function gameEnded(lastGuess){
        //El juego acaba si se pasa una de estas cosas, se acierta o se alcanzan 8 intentos
        return lastGuess === game.solution.id || game.guesses.length >= 8;
    }

    function success() {
        unblur('success').then(() => {
            // showStats se llamará en milestone 5
        });
    }

    function gameOver() {
        unblur('failure').then(() => {
            // showStats se llamará en milestone 5
        });
    }

    resetInput();

    return /* addRow */ function (playerId) {

        let guess = getPlayer(playerId)
        console.log(guess)

        let content = setContent(guess)

        game.guesses.push(playerId)
        updateState(playerId)

        resetInput();

         if (gameEnded(playerId)) {
            // updateStats(game.guesses.length);

            if (playerId == game.solution.id) {
                success();
            } else if (game.guesses.length >= 8) {
                gameOver();
            }


                  let interval = 0; //pa el futuro


         }


        showContent(content, guess)
    }
}

export { setupRows };

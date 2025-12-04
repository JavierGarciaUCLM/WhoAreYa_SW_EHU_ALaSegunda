import { stringToHTML, statsDialog } from "./fragments.js"; 
import { updateStats, getStats } from "./stats.js";

// --- CAMBIO CLAVE: Definimos showStats AQUÍ FUERA para que siempre exista ---
function showStats(timeout = 0) {
    //LÓGICA DE TOGGLE
    const existing = document.getElementById('statsModal');
    if (existing) {
        existing.remove(); 
        return;            
    }

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Obtener datos
            const data = getStats('gameStats');
            
            // Crear HTML
            const dialogHTML = statsDialog(data);
            const dialogNode = stringToHTML(dialogHTML);
            
            // Mostrar en pantalla
            document.body.appendChild(dialogNode);

            // ACTIVAR EL BOTÓN DE LA CRUZ (X)
            const closeBtn = document.getElementById("closedialog");
            if (closeBtn) {
                closeBtn.onclick = function() {
                    const modal = document.getElementById('statsModal');
                    if (modal) modal.remove();
                };
            }

            resolve();
        }, timeout);
    });
}

// Hacemos la función global INMEDIATAMENTE para que el botón funcione
window.showStats = () => showStats(0);


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
        const target = game.solution; 
        if (theKey === "birthdate") {
            const guessedAge = getAge(theValue);
            const targetAge  = getAge(target.birthdate);
            if (guessedAge === targetAge) return "correct";
            return guessedAge < targetAge ? "higher" : "lower";
        }
        return target[theKey] === theValue ? "correct" : "incorrect";
    }

    function unblur(outcome) {
        return new Promise( (resolve, reject) =>  {
            setTimeout(() => {
                const mistery = document.getElementById("mistery");
                if(mistery){
                    mistery.classList.remove("hue-rotate-180", "blur");
                    mistery.style.filter = "none"; 
                }
                
                const combo = document.getElementById("combobox");
                if(combo) combo.remove();
                
                let color, text;
                if (outcome=='success'){
                    color =  "bg-blue-500";
                    text = "Awesome";
                } else {
                    color =  "bg-rose-500";
                    text = "The player was " + game.solution.name;
                }
                
                const picbox = document.getElementById("picbox");
                if(picbox) {
                    picbox.innerHTML += `<div class="animate-pulse fixed z-20 top-14 left-1/2 transform -translate-x-1/2 max-w-sm shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden ${color} text-white"><div class="p-4"><p class="text-sm text-center font-medium">${text}</p></div></div>`;
                }
                resolve();
            }, 2000);
        });
    }

    function resetInput(){
        const input = document.getElementById("myInput");
        if(input) {
            const currentAttempt = game.guesses.length + 1;
            input.placeholder = `Guess ${currentAttempt} of 8`;
        }
    }

    let getPlayer = function (playerId) {
        return game.players.find(p => p.id === playerId);
    }

    function gameEnded(lastGuess){
        return lastGuess === game.solution.id || game.guesses.length >= 8;
    }

    function success() {
        updateStats(game.guesses.length);
        unblur('success').then(() => {
            // Llamamos a la función global
            showStats(1000);
        });
    }

    function gameOver() {
        updateStats(9); // 9 indica fallo
        unblur('failure').then(() => {
            // Llamamos a la función global
            showStats(1000);
        });
    }

    resetInput();

    return function (playerId) {
        let guess = getPlayer(playerId);
        console.log(guess);

        let content = setContent(guess);

        game.guesses.push(playerId);
        updateState(playerId);

        resetInput();

        if (gameEnded(playerId)) {
            if (playerId == game.solution.id) {
                success();
            } else if (game.guesses.length >= 8) {
                gameOver();
            }
        }
        showContent(content, guess);
    }
    
    function setContent(guess) {
        const ageCheck = check('birthdate', guess.birthdate);
        let ageDisplay = `${getAge(guess.birthdate)}`;
        if (ageCheck === 'higher') {
            ageDisplay += ' ↑'; 
        } else if (ageCheck === 'lower') {
            ageDisplay += ' ↓';
        }
        
        return [
            `<img src="https://playfootball.games/media/nations/${guess.nationality.toLowerCase()}.svg" alt="" style="width: 60%;">`,
            `<img src="https://playfootball.games/media/competitions/${leagueToFlag(guess.leagueId)}.png" alt="" style="width: 60%;">`,
            `<img src="https://cdn.sportmonks.com/images/soccer/teams/${guess.teamId % 32}/${guess.teamId}.png" alt="" style="width: 60%;">`,
            `${guess.position}`,
            ageDisplay
        ];
    }

    function showContent(content, guess) {
        let fragments = '', s = '';
        for (let j = 0; j < content.length; j++) {
            s = "".concat(((j + 1) * delay).toString(), "ms");
            const checkResult = check(attribs[j], guess[attribs[j]]);
            fragments += `<div class="w-1/5 shrink-0 flex justify-center ">
                            <div class="mx-1 overflow-hidden w-full max-w-2 shadowed font-bold text-xl flex aspect-square rounded-full justify-center items-center bg-slate-400 text-white ${checkResult == 'correct' ? 'bg-green-500' : ''} opacity-0 fadeInDown" style="max-width: 60px; animation-delay: ${s};">
                                ${content[j]}
                            </div>
                         </div>`;
        }

        let child = `<div class="flex w-full flex-wrap text-l py-2">
                        <div class=" w-full grow text-center pb-2">
                            <div class="mx-1 overflow-hidden h-full flex items-center justify-center sm:text-right px-4 uppercase font-bold text-lg opacity-0 fadeInDown " style="animation-delay: 0ms;">
                                ${guess.name}
                            </div>
                        </div>
                        ${fragments}`;

        let playersNode = document.getElementById('players');
        playersNode.prepend(stringToHTML(child));
    }
}

export { setupRows };
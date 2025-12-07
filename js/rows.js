import { stringToHTML, statsDialog } from "./fragments.js"; 
import { updateStats, getStats } from "./stats.js";

// --- FUNCIÓN GLOBAL showStats (Igual que antes) ---
function showStats(timeout = 0) {
    const existing = document.getElementById('statsModal');
    if (existing) {
        existing.remove(); 
        return;            
    }

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const data = getStats('gameStats');
            const dialogHTML = statsDialog(data);
            const dialogNode = stringToHTML(dialogHTML);
            document.body.appendChild(dialogNode);

            setTimeout(() => {
                const closeBtn = document.getElementById("closedialog");
                if (closeBtn) {
                    closeBtn.onclick = function() {
                        const modal = document.getElementById('statsModal');
                        if (modal) modal.remove();
                    };
                }
            }, 50);

            resolve();
        }, timeout);
    });
}

window.showStats = () => showStats(0);

// -------------------------------------------------------------------

function pad(a, b){
    return(1e15 + a + '').slice(-b);
}

const delay = 350;
const attribs = ['nationality', 'leagueId', 'teamId', 'position', 'birthdate', 'number'] //aquí habría que añadir para añadir más parámetros

// --- MILESTONE 7: initState lee del LocalStorage ---
function initState(storageKey, solutionId) {
    // Creamos una clave única usando el ID de la solución (ej: WAYgameState-329)
    // Así, mañana (solución 330) la partida empezará de cero automáticamente.
    const fullKey = storageKey + '-' + solutionId; 
    
    const storedState = localStorage.getItem(fullKey);

    let state;
    if (storedState) {
        state = JSON.parse(storedState); // Recuperar partida
    } else {
        state = { key: fullKey, solutionId, guesses: [] }; // Nueva partida
    }

    function updateState(guessId) {
        state.guesses.push(guessId);
        // Guardar cada vez que adivinamos
        localStorage.setItem(fullKey, JSON.stringify(state));
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
        if (theKey === "number") {
            if (theValue === target.number) return "correct";
            return theValue < target.number ? "higher" : "lower";
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
                
                // Evitar duplicar el mensaje si recargamos la página ya terminada
                const existingMsg = document.querySelector('.fixed.z-20');
                if (!existingMsg) {
                    const picbox = document.getElementById("picbox");
                    if(picbox) {
                        picbox.innerHTML += `<div class="animate-pulse fixed z-20 top-14 left-1/2 transform -translate-x-1/2 max-w-sm shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden ${color} text-white"><div class="p-4"><p class="text-sm text-center font-medium">${text}</p></div></div>`;
                    }
                }
                resolve();
            }, 2000);
        });
    }

    function resetInput(){
        const input = document.getElementById("myInput");
        if(input) {
            // MILESTONE 7: Si ya acabamos (está en guesses o son 8), bloqueamos
            const isGameOver = game.guesses.includes(game.solution.id) || game.guesses.length >= 8;
            
            if (isGameOver) {
                input.placeholder = "Game Over";
                input.disabled = true;
            } else {
                const currentAttempt = game.guesses.length + 1;
                input.placeholder = `Guess ${currentAttempt} of 8`;
            }
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
            showStats(1000);
        });
    }

    function gameOver() {
        updateStats(9); 
        unblur('failure').then(() => {
            showStats(1000);
        });
    }
    
    // --- MILESTONE 7: RESTAURAR PARTIDA AL CARGAR ---
    if (state.guesses.length > 0) {
        // 1. Sincronizar array del juego con lo guardado
        game.guesses = [...state.guesses];

        // 2. Repintar las filas guardadas
        state.guesses.forEach(playerId => {
            let guess = getPlayer(playerId);
            if (guess) {
                let content = setContent(guess);
                showContent(content, guess);
            }
        });

        // 3. Chequear si el juego ya había terminado para mostrar el final
        const lastId = state.guesses[state.guesses.length - 1];
        if (gameEnded(lastId)) {
            const outcome = (lastId === game.solution.id) ? 'success' : 'failure';
            unblur(outcome); // Muestra foto sin blur
        }
    }

    resetInput();

    // Función principal que se llama al adivinar
    return function (playerId) {
        let guess = getPlayer(playerId);
        console.log(guess);

        let content = setContent(guess);

        game.guesses.push(playerId);
        updateState(playerId); // Guarda en localStorage

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
        
        const numberCheck = check('number', guess.number);
        let numberDisplay = ` ${guess.number || ''} `;
        if (numberCheck === 'higher') {
            numberDisplay += ' ↑';
        } else if (numberCheck === 'lower') {
            numberDisplay += ' ↓';
        }
        
        return [
            `<img src="https://playfootball.games/media/nations/${guess.nationality.toLowerCase()}.svg" alt="" style="width: 60%;">`,
            `<img src="https://playfootball.games/media/competitions/${leagueToFlag(guess.leagueId)}.png" alt="" style="width: 60%;">`,
            `<img src="https://cdn.sportmonks.com/images/soccer/teams/${guess.teamId % 32}/${guess.teamId}.png" alt="" style="width: 60%;">`,
            `${guess.position}`,
            ageDisplay,
            numberDisplay
        ]; //acordarse para añadir más parámetros, hay que retornar el array con los parámetros
    }

    function showContent(content, guess) {
        let fragments = '', s = '';
        for (let j = 0; j < content.length; j++) {
            s = "".concat(((j + 1) * delay).toString(), "ms");
            const checkResult = check(attribs[j], guess[attribs[j]]);
            fragments += `<div class="w-1/6 shrink-0 flex justify-center ">
                            <div class="mx-1 overflow-hidden shadowed font-bold text-xl flex aspect-square rounded-full justify-center items-center bg-slate-400 text-white ${checkResult == 'correct' ? 'bg-green-500' : ''} opacity-0 fadeInDown" style="width: 60px; height: 60px; min-width: 60px; min-height: 60px; animation-delay: ${s};"> 
                                ${content[j]}
                            </div>
                         </div>`;
        } //arreglado el tema circular por el chatgpt, ni a palos lo sacaba yo

        let child = `<div class="flex w-full flex-col text-l py-2">
                        <div class=" w-full grow text-center pb-2">
                            <div class="mx-1 overflow-hidden h-full flex items-center justify-center sm:text-right px-4 uppercase font-bold text-lg opacity-0 fadeInDown " style="animation-delay: 0ms;">
                                ${guess.name}
                            </div>
                        </div>
                        <div class="flex w-full flex-nowrap justify-center">
                            ${fragments}
                        </div>`;

        let playersNode = document.getElementById('players');
        playersNode.prepend(stringToHTML(child));
    }
}

export { setupRows };
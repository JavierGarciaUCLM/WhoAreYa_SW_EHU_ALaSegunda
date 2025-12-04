export const folder = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" class="h-6 w-6" name="folder"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path></svg>`;
export const leftArrow = `<svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" class="h-4 w-4 absolute right-0 -bottom-0.5" name="leftArrowInCircle"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z"></path></svg>`;

export function stringToHTML(str) {
  const template = document.createElement("template");
  template.innerHTML = str.trim();
  return template.content.firstElementChild;
}

export const statsDialog = (stats) => {
    // 1. LIMPIEZA DE DATOS: Si algo viene vacío, ponemos 0 para que no salga "undefined"
    const s = stats || {};
    const total = s.totalGames || 0;
    const rate = s.successRate || 0;
    const current = s.currentStreak || 0;
    const best = s.bestStreak || 0;
    const dist = s.winDistribution || [0, 0, 0, 0, 0, 0, 0, 0];

    const maxVal = Math.max(...dist, 1);
    
    // Generar barras
    let bars = dist.map((count, i) => {
        let width = (count / maxVal) * 100;
        let color = count > 0 ? 'bg-green-500' : 'bg-gray-600'; 
        // Forzar un mínimo de ancho si hay valor para que se vea
        if(count > 0 && width < 10) width = 10;

        return `<div class="flex items-center mb-1 gap-2" style="margin-bottom: 4px;">
            <span class="w-4 text-xs font-bold text-white">${i + 1}</span>
            <div class="flex-1 h-5 bg-gray-700 rounded overflow-hidden">
                <div class="${color} h-full text-xs text-right pr-1 text-white font-bold flex items-center justify-end" style="width: ${width}%; background-color: ${count > 0 ? '#22c55e' : '#4b5563'};">
                    ${count > 0 ? count : ''}
                </div>
            </div>
        </div>`;
    }).join('');

    // HTML del Modal de stats
    return `
    <div id="statsModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm p-4" style="background-color: rgba(0,0,0,0.8);">
        
        <div class="bg-gray-900 border border-gray-600 p-6 rounded-xl max-w-sm w-full text-white shadow-2xl relative" style="background-color: #111827; border: 1px solid #4b5563;">
            
            <button id="closedialog" class="absolute top-3 right-3 text-gray-400 hover:text-white p-2">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            <h2 class="text-2xl font-bold text-center mb-6 uppercase tracking-wider border-b border-gray-700 pb-2">Estadísticas</h2>
            
            <div class="grid grid-cols-4 gap-2 text-center mb-6" style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.5rem; margin-bottom: 1.5rem;">
                <div class="flex flex-col items-center">
                    <span class="text-2xl font-bold">${total}</span>
                    <span class="text-[10px] uppercase text-gray-400">Jugados</span>
                </div>
                <div class="flex flex-col items-center">
                    <span class="text-2xl font-bold">${rate}%</span>
                    <span class="text-[10px] uppercase text-gray-400">% Gana</span>
                </div>
                <div class="flex flex-col items-center">
                    <span class="text-2xl font-bold">${current}</span>
                    <span class="text-[10px] uppercase text-gray-400">Racha</span>
                </div>
                <div class="flex flex-col items-center">
                    <span class="text-2xl font-bold">${best}</span>
                    <span class="text-[10px] uppercase text-gray-400">Max</span>
                </div>
            </div>

            <h3 class="font-bold text-sm mb-3 uppercase text-gray-300">Distribución</h3>
            <div class="mb-4 space-y-2">
                ${bars}
            </div>

            <div class="mt-6 pt-4 border-t border-gray-700 text-center">
                 <p class="text-xs text-gray-500 uppercase">Próximo Jugador</p>
                 <p class="text-lg font-mono font-bold text-gray-300" id="nextPlayerTimer">--:--:--</p>
            </div>
        </div>
    </div>`;
};
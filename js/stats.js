export { updateStats, getStats };

// Estructura inicial
const initialStats = {
    winDistribution: [0, 0, 0, 0, 0, 0, 0, 0],
    gamesFailed: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalGames: 0,
    successRate: 0
};

function getStats(what) {
    let stats = localStorage.getItem(what);
    if (!stats) return initialStats;
    return JSON.parse(stats);
}

function updateStats(t) {
    let stats = getStats('gameStats');
    stats.totalGames++;

    // Si t <= 8 es victoria. Si es 9 (nuestro código de derrota) es fallo.
    if (t <= 8) {
        stats.currentStreak++;
        if (stats.currentStreak > stats.bestStreak) stats.bestStreak = stats.currentStreak;
        if (stats.winDistribution[t - 1] !== undefined) stats.winDistribution[t - 1]++;
    } else {
        stats.gamesFailed++;
        stats.currentStreak = 0;
    }

    // Calcular Success Rate
    let wins = stats.totalGames - stats.gamesFailed;
    stats.successRate = Math.round((wins / stats.totalGames) * 100);

    localStorage.setItem('gameStats', JSON.stringify(stats));
}
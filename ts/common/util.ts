/**
 * Fisher-Yates shuffle.
 */
function shuffle<T>(array: T[], random: () => number = Math.random): T[] {
    const result = array.slice();
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

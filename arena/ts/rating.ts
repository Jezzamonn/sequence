import { Player as Glicko2Player } from "glicko2";

export interface AIInfoAndRating {
    name: String;
    glickoPlayer: Glicko2Player;
    totalMatches: number;
    winRate: number;
    tieRate: number;
}

// Print out all the ratings in a nice ASCII table.
export function printRankingsTable(players: AIInfoAndRating[]) {
    const rankingLength = 'Rank'.length;
    const nameLength = players
        .map((p) => p.name.length)
        .reduce((a, b) => Math.max(a, b), 0);
    const ratingLength = 6;
    const rdLength = 6;
    const winRateLength = 'Win Rate'.length;
    const tieRateLength = 'Tie Rate'.length;
    const totalMatchesLength = players
        .map((p) => p.totalMatches.toString().length)
        .reduce((a, b) => Math.max(a, b), 'Matches'.length);

    const header = [
        'Rank'.padEnd(rankingLength),
        'Name'.padEnd(nameLength),
        'Rating'.padEnd(ratingLength),
        'RD'.padEnd(rdLength),
        'Win Rate'.padEnd(winRateLength),
        'Tie Rate'.padEnd(tieRateLength),
        'Matches'.padEnd(totalMatchesLength),
    ].join(' | ');

    const divider = '-'.repeat(header.length);

    // Clear the console.
    console.clear();

    console.log('Ratings:');
    console.log(divider);
    console.log(header);
    console.log(divider);

    const aisByRating = players
        .slice()
        .sort((a, b) => b.winRate - a.winRate);
    for (const [i, { name, glickoPlayer, totalMatches, winRate, tieRate }] of aisByRating.entries()) {
        console.log(
            [
                (i + 1).toString().padStart(rankingLength),
                name.padEnd(nameLength),
                glickoPlayer.getRating().toFixed(0).padStart(ratingLength),
                glickoPlayer.getRd().toFixed(1).padStart(rdLength),
                ((winRate * 100).toFixed(3) + '%').padStart(winRateLength),
                ((tieRate * 100).toFixed(3) + '%').padStart(tieRateLength),
                totalMatches.toString().padStart(totalMatchesLength),
            ].join(' | ')
        );
    }
    console.log(divider);
}

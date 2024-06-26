import { Color } from './board';

const validPlayerCounts = [2, 3, 4, 6, 8, 9, 10, 12];
const validTeamCounts = [2, 3];

export const handSizes: Map<number, number> = new Map([
    [2, 7],
    [3, 6],
    [4, 6],
    [6, 5],
    [8, 4],
    [9, 4],
    [10, 3],
    [12, 3],
]);

export const numSequencesToWin: Map<number, number> = new Map([
    [2, 2],
    [3, 1],
]);

export interface Player {
    id: string;
    name: string;
    quest?: string;
    color: Color;
}

export function validatePlayerColors(colors: Color[], allowAI = false) {
    const colorCounts = new Map<Color, number>();
    for (const color of colors) {
        colorCounts.set(color, (colorCounts.get(color) || 0) + 1);
    }

    if (allowAI) {
        let numTeams = colorCounts.size;
        // If there's just one player, default to a 2-team game.
        if (numTeams === 1) {
            numTeams = 2;
        }

        if (!validTeamCounts.includes(numTeams)) {
            throw new Error(`Invalid number of teams: ${numTeams}`);
        }
        return;
    }

    // If we can't create new AI players to fill the teams, then we must have the correct number of players.
    const numTeams = colorCounts.size;
    const numPlayers = colors.length;
    const expectedTeamSize = colors.length / colorCounts.size;

    if (
        ![...colorCounts.values()].every(
            (count) => count === expectedTeamSize
        )
    ) {
        throw new Error('Each team must have the same number of players');
    }

    if (!validPlayerCounts.includes(numPlayers)) {
        throw new Error(`Invalid number of players: ${numPlayers}`);
    }
    if (!validTeamCounts.includes(numTeams)) {
        throw new Error(`Invalid number of teams: ${numTeams}`);
    }
    if (numPlayers % numTeams != 0) {
        throw new Error(
            `Number of players must be divisible by number of teams. Got ${numPlayers} players and ${numTeams} teams`
        );
    }
}

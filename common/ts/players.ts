import { Color } from "./board";

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
    name: String;
    color: Color;
}

export function validatePlayers(numPlayers: number, numTeams: number) {
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
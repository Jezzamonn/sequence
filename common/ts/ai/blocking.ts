import { Move, allPossibleSequences, boardSize } from "../board";
import { PlayerVisibleGameState } from "../game";
import { AIInterface } from "./ai-interface";

export class BlockingAI implements AIInterface {

    constructor(private fallback: AIInterface) {}

    makeMove(moves: Move[], state: PlayerVisibleGameState): Move {
        const color = state.players[state.playerIndex!].color;

        const oneAwayFromSequence: number[][] = new Array(boardSize).fill(0).map(() => new Array(boardSize).fill(0));
        const twoAwayFromSequence: number[][] = new Array(boardSize).fill(0).map(() => new Array(boardSize).fill(0));

        for (const possibleSequence of allPossibleSequences()) {
            const colorCounts = new Map<string, number>();
            for (const pos of possibleSequence) {
                const tokenColor = state.placedTokens[pos.y][pos.x];
                if (tokenColor == undefined) {
                    continue;
                }
                colorCounts.set(tokenColor, (colorCounts.get(tokenColor) || 0) + 1);
            }
            // Already have two colors here, so it can't be a sequence
            if (colorCounts.size != 1) {
                continue;
            }
            const possibleSequenceColor = colorCounts.keys().next().value;
            if (possibleSequenceColor == color) {
                continue;
            }
            // This is a possible sequence! Update the arrays!
            if (colorCounts.get(possibleSequenceColor) == 4) {
                for (const pos of possibleSequence) {
                    oneAwayFromSequence[pos.y][pos.x]++;
                }
            }
            else if (colorCounts.get(possibleSequenceColor) == 3) {
                for (const pos of possibleSequence) {
                    twoAwayFromSequence[pos.y][pos.x]++;
                }
            }
        }

        // We've found what positions block sequences... now to pick the best one of our possible moves.
        let bestMoves: Move[] = [];
        let bestScore = -Infinity;
        for (const move of moves) {
            if (move.position == undefined) {
                continue;
            }

            // Blocking almost victories is a lot more important.
            const score = oneAwayFromSequence[move.position.y][move.position.x] * 10 + twoAwayFromSequence[move.position.y][move.position.x];

            if (score > bestScore) {
                bestMoves = [move];
                bestScore = score;
            }
            else if (score == bestScore) {
                bestMoves.push(move);
            }
        }

        if (bestMoves.length > 0) {
            if (bestScore > 0) {
                console.log(`Blocking AI blocking a sequence! Score = ${bestScore}`);
            }
            return this.fallback.makeMove(bestMoves, state);
        }
        return this.fallback.makeMove(moves, state);
    }

}
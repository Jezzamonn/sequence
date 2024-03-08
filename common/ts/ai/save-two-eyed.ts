import { Move, countSequences } from "../board";
import { isTwoEyedJack } from "../cards";
import { PlayerVisibleGameState } from "../game";
import { AIInterface } from "./ai-interface";

// Only plays the two eyed jack when it completes a sequence.
export class SaveTwoEyedJackAI implements AIInterface {

    constructor(private fallback: AIInterface) {}

    makeMove(moves: Move[], state: PlayerVisibleGameState): Move {
        const initialSequences = countSequences(state.placedTokens);
        const color = state.players[state.playerIndex!].color;
        const mySequences = initialSequences.get(color) ?? 0;

        const twoEyedJackMoves = moves.filter(move => isTwoEyedJack(move.card));
        const nonTwoEyedJackMoves = moves.filter(move => !isTwoEyedJack(move.card));

        const bestMoves: Move[] = [];
        let bestMySequences = mySequences;
        for (const move of twoEyedJackMoves) {
            if (move.position == undefined) {
                // Don't discard the two eyed jack.
                continue;
            }
            const placedTokensCopy = state.placedTokens.map((row) => row.slice());
            placedTokensCopy[move.position!.y][move.position!.x] = color;
            const sequences = countSequences(placedTokensCopy).get(color) ?? 0;
            if (sequences > bestMySequences) {
                bestMoves.length = 0;
                bestMoves.push(move);
                bestMySequences = sequences;
            } else if (sequences == bestMySequences) {
                bestMoves.push(move);
            }
        }

        if (bestMoves.length > 0) {
            return this.fallback.makeMove(bestMoves, state);
        }
        if (nonTwoEyedJackMoves.length > 0) {
            return this.fallback.makeMove(nonTwoEyedJackMoves, state);
        }
        return this.fallback.makeMove(moves, state);
    }

}
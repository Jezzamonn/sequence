import { Move, allPossibleSequences } from "../board";
import { isOneEyedJack } from "../cards";
import { PlayerVisibleGameState } from "../game";
import { AIInterface } from "./ai-interface";

export class BlockingAI implements AIInterface {

    constructor(private fallback: AIInterface) {}

    makeMove(moves: Move[], state: PlayerVisibleGameState): Move {
        const color = state.players[state.playerIndex!].color;

        let bestMoves: Move[] = [];
        let leastPossibleEnemySequences = Infinity;

        for (const move of moves) {
            if (move.position == undefined) {
                continue;
            }

            const placedTokensCopy = state.placedTokens.map((row) => row.slice());
            if (isOneEyedJack(move.card)) {
                placedTokensCopy[move.position.y][move.position.x] = undefined;
            }
            else {
                placedTokensCopy[move.position.y][move.position.x] = color;
            }

            let possibleEnemySequences = 0;
            sequenceLoop: for (const possibleSequence of allPossibleSequences()) {
                let opponentColor: string | undefined = undefined;
                for (const pos of possibleSequence) {
                    const tokenColor = placedTokensCopy[pos.y][pos.x];

                    if (tokenColor == undefined) {
                        continue;
                    }
                    if (tokenColor == color) {
                        continue sequenceLoop;
                    }
                    if (opponentColor == undefined) {
                        opponentColor = tokenColor;
                    }
                    else if (opponentColor != tokenColor) {
                        continue sequenceLoop;
                    }
                }
                possibleEnemySequences++;
            }

            if (possibleEnemySequences < leastPossibleEnemySequences) {
                bestMoves = [move];
                leastPossibleEnemySequences = possibleEnemySequences;
            }
            else if (possibleEnemySequences == leastPossibleEnemySequences) {
                bestMoves.push(move);
            }
        }

        if (bestMoves.length > 0) {
            return this.fallback.makeMove(bestMoves, state);
        }
        return this.fallback.makeMove(moves, state);
    }

}
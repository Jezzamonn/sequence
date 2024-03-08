import { Color, Move, allPossibleSequences } from "../board";
import { isOneEyedJack } from "../cards";
import { PlayerVisibleGameState } from "../game";
import { Point, Points } from "../point";
import { AIInterface } from "./ai-interface";

// Only plays the one eyed jack when it breaks an opponent's in progress sequence.
export class SaveOneEyedJackAI implements AIInterface {

    constructor(private fallback: AIInterface) {}

    makeMove(moves: Move[], state: PlayerVisibleGameState): Move {
        // First, do we even have any one eyed jacks?
        if (state.hand!.some(card => isOneEyedJack(card)) == false) {
            return this.fallback.makeMove(moves, state);
        }

        // We do. Check the board for almost complete sequences.
        const color = state.players[state.playerIndex!].color;
        const sequenceBlockingPositions: Point[] = [];

        sequenceLoop: for (const possibleSequence of allPossibleSequences()) {
            let opponentColor: Color | undefined = undefined;
            const opponentTokenPositions: Point[] = [];
            for (const pos of possibleSequence) {
                const tokenColor = state.placedTokens[pos.y][pos.x];
                if (tokenColor == undefined) {
                    continue;
                }

                if (tokenColor == color) {
                    // We've blocked this sequence
                    continue sequenceLoop;
                }
                if (opponentColor == undefined) {
                    opponentColor = tokenColor;
                }
                else if (opponentColor != tokenColor) {
                    // A different opponent has blocked this sequence.
                    continue sequenceLoop;
                }
                opponentTokenPositions.push(pos);
            }

            if (opponentTokenPositions.length == possibleSequence.length - 1) {
                sequenceBlockingPositions.push(...opponentTokenPositions);
            }
        }

        const possibleRemovals = moves.filter(move => isOneEyedJack(move.card) && sequenceBlockingPositions.some(pos => Points.equal(pos, move.position)));
        if (possibleRemovals.length > 0) {
            return this.fallback.makeMove(possibleRemovals, state);
        }

        const nonOneEyedJackMoves = moves.filter(move => !isOneEyedJack(move.card));
        if (nonOneEyedJackMoves.length > 0) {
            return this.fallback.makeMove(nonOneEyedJackMoves, state);
        }
        return this.fallback.makeMove(moves, state);
    }

}
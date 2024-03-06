import { Color, Move, Token, allRows } from "../board";
import { isOneEyedJack } from "../cards";
import { PlayerVisibleGameState } from "../game";
import { AIInterface } from "./ai-interface";

export class MakeLinesAI implements AIInterface {

    constructor(private fallback: AIInterface) { }

    makeMove(moves: Move[], state: PlayerVisibleGameState): Move {
        let bestMoves: Move[] = [];
        let bestLinesStr: string | undefined;

        const color = state.players[state.playerIndex!].color;

        // Always discard if we can.
        for (const move of moves) {
            if (move.position == undefined) {
                return move;
            }
        }

        for (const move of moves) {
            if (isOneEyedJack(move.card)) {
                // Just skip one-eyed jacks for now.
                continue;
            }
            if (move.position == undefined) {
                // Should be impossible thanks to be above but this helps the type checker.
                continue;
            }
            const placedTokensCopy = state.placedTokens.map((row) => row.slice());
            placedTokensCopy[move.position.y][move.position.x] = color;

            const lines = countPlayerLines(color, placedTokensCopy);
            const linesStr = playerLinesToComparableString(lines);

            if (bestLinesStr == undefined || linesStr > bestLinesStr) {
                bestMoves = [move];
                bestLinesStr = linesStr;
            }
            else if (linesStr == bestLinesStr) {
                bestMoves.push(move);
            }
        }

        if (bestMoves.length > 0) {
            return this.fallback.makeMove(bestMoves, state);
        }

        return this.fallback.makeMove(moves, state);
    }
}

function countPlayerLines(color: Color, placedTokens: Token[][]): Map<number, number> {
    const numLinesOfLength = new Map<number, number>();

    function increment(num: number) {
        // Don't count lines of length 1 or 0.
        if (num <= 1) {
            return;
        }

        // Lines of length > 5 are split into into multiple lines. Examples:
        // 6 becomes 5 and 2 (because we share one token)
        // 7 becomes 5 and 3
        // 8 becomes 5 and 4
        // 9 becomes 5 and 5
        // 10 is just 5 and 5 (rather than 6 because there's not enough space for a 3rd sequence).
        if (num > 5) {
            increment(5);
            increment(Math.min(num - 4, 5));
            return;
        }
        numLinesOfLength.set(num, (numLinesOfLength.get(num) ?? 0) + 1);
    }

    for (const row of allRows()) {
        let numInRow = 0;
        for (const point of row) {
            const token = placedTokens[point.y][point.x];
            if (token === color) {
                numInRow++;
            } else {
                increment(numInRow);
                numInRow = 0;
            }
        }
        increment(numInRow);
    }

    return numLinesOfLength;
}

function playerLinesToComparableString(lines: Map<number, number>): string {
    const parts = [];
    for (let i = 5; i >= 2; i--) {
        parts.push(lines.get(i) ?? 0);
    }
    return parts.map(n => n.toString().padStart(3, '0')).join('-');
}
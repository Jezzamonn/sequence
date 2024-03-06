import { Move, boardSize } from "../board";
import { PlayerVisibleGameState } from "../game";
import { AIInterface } from "./ai-interface";

export class PreferCornersAI implements AIInterface {

    makeMove(moves: Move[], state: PlayerVisibleGameState): Move {
        let furthestDist = 0;
        let furthestMove = moves[0];
        const middleX = (boardSize - 1) / 2;
        const middleY = (boardSize - 1) / 2;
        for (let move of moves) {
            const { position } = move;
            if (position == undefined) {
                continue;
            }
            const xDist = Math.abs(position.x - middleX);
            const yDist = Math.abs(position.y - middleY);

            // Eucledian distance doesn't really make sense here, so use a
            // distance function that prefers corners (diamond iso-lines).
            const dist = xDist + yDist;
            if (dist > furthestDist) {
                furthestDist = dist;
                furthestMove = move;
            }
        }

        return furthestMove;
    }

}
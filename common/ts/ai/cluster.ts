import { Move } from "../board";
import { PlayerVisibleGameState } from "../game";
import { AIInterface } from "./ai-interface";

export class ClusterAI implements AIInterface {

    makeMove(moves: Move[], state: PlayerVisibleGameState): Move {
        const existingTokens = state.placedTokens
            .flatMap((row, y) => row.map((token, x) => ({color: token!, position: { x, y }}))
        ).filter(token => token.color == state.players[state.playerIndex!].color);

        const centerX = existingTokens.reduce((acc, token) => acc + token.position.x, 0) / existingTokens.length;
        const centerY = existingTokens.reduce((acc, token) => acc + token.position.y, 0) / existingTokens.length;

        let closestDist = Infinity;
        let closestMove = moves[0];
        for (let move of moves) {
            const { position } = move;
            if (position == undefined) {
                continue;
            }
            const xDist = Math.abs(position.x - centerX);
            const yDist = Math.abs(position.y - centerY);

            // Eucledian distance doesn't really make sense here, so use a distance function with square iso-lines.
            const dist = Math.max(xDist, yDist);
            if (dist < closestDist) {
                closestDist = dist;
                closestMove = move;
            }
        }

        return closestMove;
    }

}
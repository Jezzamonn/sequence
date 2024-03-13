import { Move } from "../board";
import { PlayerVisibleGameState } from "../game";
import { AIInterface } from "./ai-interface";

export class FirstMoveAI implements AIInterface {
    makeMove(moves: Move[], state: PlayerVisibleGameState): Move {
        return moves[0];
    }
}
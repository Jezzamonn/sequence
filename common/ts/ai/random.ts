// AI that makes a random move.
import { Move } from "../board";
import { PlayerVisibleGameState } from "../game";
import { choose } from "../util";
import { AIInterface } from "./ai-interface";

export class RandomAI implements AIInterface {

    makeMove(moves: Move[], state: PlayerVisibleGameState): Move {
        return choose(moves, Math.random)
    }

}
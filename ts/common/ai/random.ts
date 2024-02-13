// AI that makes a random move.

import { Card } from "../cards";
import { PlayerVisibleGameState } from "../game";
import { Point } from "../point";
import { choose } from "../util";
import { AIInterface } from "./ai-interface";

export class RandomAI implements AIInterface {

    makeMove(moves: [Card, Point | undefined][], state: PlayerVisibleGameState): [Card, Point | undefined] {
        return choose(moves, Math.random)
    }

}
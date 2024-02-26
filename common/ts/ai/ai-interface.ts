import { Card } from "../cards";
import { PlayerVisibleGameState } from "../game";
import { Player } from "../players";
import { Point } from "../point";

export interface AIInterface {

    makeMove(moves: [Card, Point | undefined][], state: PlayerVisibleGameState): [Card, Point | undefined];

}

export interface AIPlayer extends Player {
    ai: AIInterface;
}

export interface PlayerOrAI extends Player {
    ai?: AIInterface;
}
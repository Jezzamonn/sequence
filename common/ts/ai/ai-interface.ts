import { Card } from "../cards";
import { PlayerVisibleGameState } from "../game";
import { Point } from "../point";

export interface AIInterface {

    makeMove(moves: [Card, Point | undefined][], state: PlayerVisibleGameState): [Card, Point | undefined];

}
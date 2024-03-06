import { Move } from "../board";
import { PlayerVisibleGameState } from "../game";
import { Player } from "../players";

export interface AIInterface {

    makeMove(moves: Move[], state: PlayerVisibleGameState): Move;

}

export interface AIPlayer extends Player {
    ai: AIInterface;
}

export interface PlayerOrAI extends Player {
    ai?: AIInterface;
}
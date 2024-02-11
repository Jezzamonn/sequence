import './components/game-board';
import './components/board-card';
import { GameManager } from '../common/game';
import { allPositions } from '../common/board';
import { choose } from '../common/util';
import { GameBoardElement } from './components/game-board';

console.log("Client <( Hello World! )");

const gameManager = new GameManager(3, 3, Math.random);
// For testing, add random tokens to the board
for (const {x, y} of allPositions) {
    gameManager.state.placedTokens[y][x] = choose(['Red', 'Blue', 'Green', undefined]);
}

const boardElem = document.querySelector('game-board') as GameBoardElement;
boardElem.placedTokens = gameManager.state.placedTokens;
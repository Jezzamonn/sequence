import { boardToString, getMovesForPlayer } from "../common/board";
import { GameManager } from "../common/game";

console.log('Server <( Hello World! )');

const gameManager = new GameManager(4, 2, () => 0);
console.log(boardToString(gameManager.state.placedTokens));

// Make some moves
for (let i = 0; i < 10; i++) {
    const moves = gameManager.getMovesForPlayer(gameManager.state.nextPlayerIndex);
    const move = moves[Math.floor(Math.random() * moves.length)];
    console.log('Player', gameManager.state.nextPlayerIndex, 'plays', move);
    gameManager.makeMove(gameManager.state.nextPlayerIndex, move[0], move[1]);
}

console.log(boardToString(gameManager.state.placedTokens));

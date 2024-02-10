import { boardToString, getMovesForPlayer } from "../common/board";
import { GameManager } from "../common/game";

console.log('Server <( Hello World! )');

const gameManager = new GameManager(3, 3, Math.random);

// Make some moves
while (gameManager.state.gameWinner === undefined) {
    const moves = gameManager.getMovesForPlayer(gameManager.state.nextPlayerIndex);
    const move = moves[Math.floor(Math.random() * moves.length)];
    // console.log('Player', gameManager.state.nextPlayerIndex, 'plays', move);
    gameManager.makeMove(gameManager.state.nextPlayerIndex, move[0], move[1]);
}

console.log('Winner:', gameManager.state.gameWinner);
console.log(boardToString(gameManager.state.placedTokens));

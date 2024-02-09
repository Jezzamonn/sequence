import { boardToString } from "../common/board";
import { GameManager } from "../common/game";

console.log('Server <( Hello World! )');

const gameManager = new GameManager(4, 2, () => 0);
console.log(boardToString(gameManager.state.placedTokens));

import './components/game-board';
import './components/board-card';
import './components/player-hand';

import { GameManager } from '../common/game';
import { allPositions } from '../common/board';
import { choose } from '../common/util';
import { GameBoardElement } from './components/game-board';
import { PlayerHandElement } from './components/player-hand';
import { Card } from '../common/cards';
import { Point } from '../common/point';

console.log("Client <( Hello World! )");

const gameManager = new GameManager(2, 2, Math.random);

const boardElem = document.querySelector('game-board') as GameBoardElement;
boardElem.placedTokens = gameManager.state.placedTokens;

const handElem = document.querySelector('player-hand') as PlayerHandElement;
handElem.hand = gameManager.getStateForPlayer(gameManager.state.nextPlayerIndex).hand;

let selectedCard: Card | undefined = undefined;

handElem.addEventListener('card-click', (e: CustomEvent<Card>) => {
    console.log('Card clicked:', e.detail);
    selectedCard = e.detail;
});

boardElem.addEventListener('board-position-click', (e: CustomEvent<Point>) => {
    console.log('Board position clicked:', e.detail);
    if (selectedCard !== undefined) {
        console.log('Making move:', selectedCard, e.detail);

        makeMove(selectedCard, e.detail);
    }
});

function makeMove(card: Card, position: Point) {
    gameManager.makeMove(gameManager.state.nextPlayerIndex, card, position);
    boardElem.placedTokens = gameManager.state.placedTokens.slice();

    handElem.hand = gameManager.getStateForPlayer(gameManager.state.nextPlayerIndex).hand;
}
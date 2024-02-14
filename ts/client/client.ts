import './components/game-board';
import './components/board-card';
import './components/player-hand';
import './components/deck-discard';

import { GameManager } from '../common/game';
import { GameBoardElement } from './components/game-board';
import { PlayerHandElement } from './components/player-hand';
import { Card } from '../common/cards';
import { Point } from '../common/point';
import { RandomAI } from '../common/ai/random';
import { wait } from '../common/util';
import { DeckAndDiscardElement } from './components/deck-discard';

console.log("Client <( Hello World! )");

const playerIndex = 0;

const gameManager = new GameManager(2, 2, Math.random);

const boardElem = document.querySelector('game-board') as GameBoardElement;
boardElem.placedTokens = gameManager.state.placedTokens;

const handElem = document.querySelector('player-hand') as PlayerHandElement;
handElem.hand = gameManager.getStateForPlayer(playerIndex).hand;

const deckDiscardElem = document.querySelector('deck-discard') as DeckAndDiscardElement;

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

deckDiscardElem.addEventListener('click', () => {
    console.log('Deck clicked');
    if (selectedCard !== undefined) {
        console.log('Making move:', selectedCard, undefined);

        makeMove(selectedCard, undefined);
    }
});

function updateUI() {
    const gameState = gameManager.getStateForPlayer(playerIndex);

    boardElem.placedTokens = gameState.placedTokens.slice();
    handElem.hand = gameState.hand.slice();
    deckDiscardElem.deckSize = gameState.deckSize;
    deckDiscardElem.rank = gameState.lastCardPlayed?.rank || 'Joker';
    deckDiscardElem.suit = gameState.lastCardPlayed?.suit || 'Joker'
}

async function makeMove(card: Card, position: Point | undefined) {
    // Will throw if the move is invalid.
    gameManager.makeMove(gameManager.state.nextPlayerIndex, card, position);
    selectedCard = undefined;
    updateUI();

    simulateOtherPlayers();
}

async function simulateOtherPlayers() {
    const randomAI = new RandomAI();
    while (gameManager.state.nextPlayerIndex != playerIndex) {
        await wait(1);

        const move = randomAI.makeMove(
            gameManager.getMovesForPlayer(gameManager.state.nextPlayerIndex),
            gameManager.getStateForPlayer(gameManager.state.nextPlayerIndex)
        );
        gameManager.makeMove(gameManager.state.nextPlayerIndex, move[0], move[1]);
        updateUI();
    }
}

function init() {
    simulateOtherPlayers();
}

window.onload = init;
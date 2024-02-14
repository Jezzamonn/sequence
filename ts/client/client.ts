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
import { countSequences, getMovesForCard } from '../common/board';
import { BoardClickEventParams, HandClickEventParams } from './components/events';

console.log("Client <( Hello World! )");

const playerIndex = 0;

let gameManager: GameManager;

const boardElem = document.querySelector('game-board') as GameBoardElement;
const handElem = document.querySelector('player-hand') as PlayerHandElement;
const deckDiscardElem = document.querySelector('deck-discard') as DeckAndDiscardElement;

let selectedCard: Card | undefined = undefined;
let selectedCardIndex: number | undefined = undefined;

handElem.addEventListener('card-click', (e: CustomEvent<HandClickEventParams>) => {
    console.log('Card clicked:', e.detail.card);
    selectedCard = e.detail.card;
    selectedCardIndex = e.detail.index;

    updateUI();
    e.stopPropagation();
    e.detail.sourceEvent.stopPropagation();
});

boardElem.addEventListener('board-position-click', (e: CustomEvent<BoardClickEventParams>) => {
    console.log('Board position clicked:', e.detail.position);
    if (selectedCard !== undefined) {
        console.log('Making move:', selectedCard, e.detail.position);

        makeMove(selectedCard, e.detail.position);
    }
    e.stopPropagation();
    e.detail.sourceEvent.stopPropagation();
});

deckDiscardElem.addEventListener('discard-click', (e: CustomEvent<MouseEvent>) => {
    console.log('Deck clicked');
    if (selectedCard !== undefined) {
        console.log('Making move:', selectedCard, undefined);

        makeMove(selectedCard, undefined);
    }
    e.stopPropagation();
    e.detail.stopPropagation();
});

window.addEventListener('click', () => {
    console.log('Window clicked');
    selectedCard = undefined;
    selectedCardIndex = undefined;
    updateUI();
});

window.addEventListener('keydown', (e: KeyboardEvent) => {
    switch (e.key) {
        // Restart
        case 'r':
            startGame();
            break;
        // Make a random move on space
        case ' ':
            if (gameManager.state.nextPlayerIndex == playerIndex) {
                const moves = gameManager.getMovesForPlayer(playerIndex);
                if (moves.length > 0) {
                    const move = moves[Math.floor(Math.random() * moves.length)];
                    makeMove(move[0], move[1]);
                }
            }
            break;
    }
});

function updateUI() {
    const gameState = gameManager.getStateForPlayer(playerIndex);

    boardElem.placedTokens = gameState.placedTokens.slice();

    if (selectedCard !== undefined) {
        const sequences = countSequences(gameState.placedTokens);
        const sequenceCount = [...sequences.values()].reduce(
            (a, b) => a + b,
            0
        );
        const validPositions = getMovesForCard(gameState.placedTokens, sequenceCount, gameState.players[playerIndex].color, selectedCard);
        boardElem.validPositions = validPositions;
        deckDiscardElem.canDiscard = validPositions.length === 0 && !gameState.lastActionWasDiscard;
    } else {
        boardElem.validPositions = undefined;
        deckDiscardElem.canDiscard = undefined;
    }

    handElem.hand = gameState.hand.slice();
    handElem.selectedCardIndex = selectedCardIndex;

    deckDiscardElem.deckSize = gameState.deckSize;
    deckDiscardElem.rank = gameState.lastCardPlayed?.rank || 'Joker';
    deckDiscardElem.suit = gameState.lastCardPlayed?.suit || 'Joker'
}

async function makeMove(card: Card, position: Point | undefined) {
    // Will throw if the move is invalid.
    gameManager.makeMove(playerIndex, card, position);
    selectedCard = undefined;
    selectedCardIndex = undefined;
    updateUI();

    simulateOtherPlayers();
}

async function simulateOtherPlayers() {
    const randomAI = new RandomAI();
    while (gameManager.state.nextPlayerIndex != playerIndex) {
        await wait(0.1);

        const move = randomAI.makeMove(
            gameManager.getMovesForPlayer(gameManager.state.nextPlayerIndex),
            gameManager.getStateForPlayer(gameManager.state.nextPlayerIndex)
        );
        gameManager.makeMove(gameManager.state.nextPlayerIndex, move[0], move[1]);
        updateUI();
    }
}

function startGame() {
    gameManager = new GameManager(12, 3, Math.random);
    updateUI();
    simulateOtherPlayers();
}

function init() {
    startGame();
}

window.onload = init;
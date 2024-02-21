import './components/game-board';
import './components/board-card';
import './components/player-hand';
import './components/deck-discard';
import './components/game-notification';
import './components/game-display';

import { PlayerVisibleGameState } from '../../common/ts/game';
import { Card } from '../../common/ts/cards';
import { Point } from '../../common/ts/point';
import { wait } from '../../common/ts/util';
import { Connection } from './connection';
import { GameDisplay } from './components/game-display';
import { MakeMoveEventParams } from './components/events';

console.log('Client <( Hello World! )');

const gameElem = document.querySelector('game-display') as GameDisplay;
const notificationContainer = document.querySelector(
    '.notification-container'
)!;

// Just start up the connection straight away.
const connection = new Connection();

connection.onGameState = (state) => {
    console.log('Received game state:', state);
    gameElem.gameState = state;

    if (state.gameWinner != undefined) {
        console.log('Game winner:', state.gameWinner);
        notify(`${state.gameWinner} wins!`);
    }
};

gameElem.addEventListener(
    'make-move',
    (event: CustomEvent<MakeMoveEventParams>) => {
        makeMove(event.detail.card, event.detail.position);
    }
);

function notify(message: string) {
    const notification = document.createElement('game-notification');
    notification.innerText = message;
    notificationContainer.appendChild(notification);
}

async function makeMove(card: Card, position: Point | undefined) {
    if (connection.requestInProgress) {
        return;
    }

    const moveResult = await connection.makeMove(card, position);
    gameElem.selectedCard = undefined;
    gameElem.selectedCardIndex = undefined;

    if (moveResult.error != undefined) {
        notify(moveResult.error);
        return;
    }
}

wait(1).then(() => {
    connection.startGame(4, 2);
});

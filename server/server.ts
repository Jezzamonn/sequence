import { boardToString, getMovesForPlayer } from '../common/ts/board';
import { Card, cardToDescription } from '../common/ts/cards';
import { GameManager } from '../common/ts/game';
import { Server, Socket } from 'socket.io';
import { Point, Points } from '../common/ts/point';
import { Command, MoveResult } from '../common/ts/interface/interface';
import { validatePlayers } from '../common/ts/players';
import { AIInterface } from '../common/ts/ai/ai-interface';
import { RandomAI } from '../common/ts/ai/random';
import { wait } from '../common/ts/util';

console.log('Server <( Hello World! )');

const io = new Server({
    cors: {
        origin: 'http://localhost:8080',
    },
});

type GameState = 'joining' | 'game';

let gameState: GameState = 'joining';
let players: Socket[] = [];
let gameManager: GameManager | undefined = undefined;
let aiPlayers: (AIInterface | undefined)[] = [];

io.on('connection', async (socket: Socket) => {
    console.log('A client has connected');

    if (gameState !== 'joining') {
        socket.emit('error', 'Game already started');
        socket.disconnect();
        return;
    }

    // For the moment, just have one player.
    const playerIndex = 0;
    players[0] = socket;
    aiPlayers[0] = undefined;

    // ----- Pre-joining commands -----

    function start(numPlayers: number, numTeams: number): MoveResult {
        console.log(`Start: ${numPlayers} players, ${numTeams} teams`);
        // if (gameState !== 'joining') {
        //     console.error('Received start command when game already started');
        //     return { error: 'Game already started' };
        // }
        try {
            validatePlayers(numPlayers, numTeams);
            while (aiPlayers.length < numPlayers) {
                aiPlayers.push(new RandomAI());
            }
            gameManager = new GameManager(numPlayers, numTeams, Math.random);
            gameState = 'game';

            wait(0).then(() => {
                sendGameState();
                // Not awaited.
                simulateAIPlayer();
            });
        } catch (e) {
            if (e instanceof Error) {
                return { error: e.message };
            } else {
                console.error(e);
                return { error: 'An unknown error occurred' };
            }
        }
        return {};
    }

    socket.on(
        Command.startGame,
        (
            numPlayers: number,
            numTeams: number,
            callback: (result: MoveResult) => null
        ) => {
            callback(logIfError(start(numPlayers, numTeams)));
        }
    );

    // TODO: Allow players to choose who is on what team.

    // TODO: Allow players to set their names.

    // In a separate function so we guarantee that MoveResult is returned.
    function makeMove(card: Card, position: Point | undefined): MoveResult {
        console.log(
            `Player ${playerIndex} making move: ${cardToDescription(
                card
            )} at ${position}`
        );
        if (gameState !== 'game') {
            return { error: 'Game not started' };
        }
        if (gameManager === undefined) {
            return { error: 'Internal error: game manager not initialized' };
        }

        try {
            gameManager.makeMove(playerIndex, card, position);
        } catch (e) {
            if (e instanceof Error) {
                return { error: e.message };
            }
            console.error(e);
            return { error: 'An unknown error occurred' };
        }
        console.log(boardToString(gameManager.state.placedTokens));

        // Do these asynchronously so that the result of the move is sent to the player first.
        wait(0).then(() => {
            sendGameState();
            // Not awaited.
            simulateAIPlayer();
        });

        return {};
    }

    socket.on(
        Command.makeMove,
        (
            card: Card,
            position: Point | undefined,
            callback: (result: MoveResult) => void
        ) => {
            callback(logIfError(makeMove(card, position)));
        }
    );
});

function logIfError(result: MoveResult): MoveResult {
    if (result.error !== undefined) {
        console.warn(result.error);
    }
    return result;
}

function sendGameState() {
    console.log('Sending game state');
    if (gameManager === undefined) {
        throw new Error('Internal error: game manager not initialized');
    }
    for (let i = 0; i < players.length; i++) {
        const player = players[i];
        const state = gameManager.getStateForPlayer(i);
        console.log(`Sending game state to player ${i}`);
        player.emit(Command.gameState, state);
    }
}

async function simulateAIPlayer() {
    if (gameManager === undefined) {
        throw new Error('Internal error: game manager not initialized');
    }

    const playerIndex = gameManager.state.nextPlayerIndex;
    const ai = aiPlayers[playerIndex];
    if (ai === undefined) {
        return;
    }

    console.log(`Simulating AI player ${playerIndex}`);

    await wait(1);

    const moves = gameManager.getMovesForPlayer(playerIndex);
    const state = gameManager.getStateForPlayer(playerIndex);
    const move = ai.makeMove(moves, state);
    gameManager.makeMove(playerIndex, move[0], move[1]);
    sendGameState();

    // Not awaited.
    simulateAIPlayer();
}

io.listen(3000);
console.log('Socket.io server listening on port 3000');

import { Server, Socket } from 'socket.io';
import { Command, CommandCallback } from '../common/ts/interface/interface';
import { Player } from '../common/ts/players';
import { wait } from '../common/ts/util';
import { logIfError } from './server-common';
import { ServerGameManager } from './server-game-manager';
import { ServerPlayerManager } from './server-player-manager';

console.log('Server <( Hello World! )');

const io = new Server({
    cors: {
        origin: 'http://localhost:8080',
    },
});

const playerManager = new ServerPlayerManager();
let gameManager: ServerGameManager | undefined;

io.on('connection', (socket: Socket) => {
    console.log('A client has connected');

    // When a client connects, wait for it to send a join command with the player information.
    // The player manager will add events to the socket to handle the rest of the game.
    socket.on(
        Command.join,
        (player: Player, callback: CommandCallback) => {
            callback(
                logIfError(playerManager.addOrUpdatePlayer(player, socket))
            );

            if (gameManager !== undefined) {
                gameManager.sendGameState();
            }
        }
    );
});

playerManager.onStart = () => {
    const allowAI = true;
    if (gameManager !== undefined) {
        console.warn('Replacing existing game.');
    } else {
        console.log('Starting new game');
    }
    try {
        const players = playerManager.getValidatedPlayers(allowAI);
        gameManager = ServerGameManager.fromPartialPlayers(io, players, allowAI);
    } catch (e) {
        if (e instanceof Error) {
            return { error: e.message };
        }
        console.error(e);
        return { error: 'An unknown error occurred' };
    }

    wait(0).then(() => {
        gameManager?.sendGameState();
        gameManager?.possiblySimulateAIPlayer();
    });

    return {};
}

playerManager.onMakeMove = (playerName, card, position) => {
    if (gameManager === undefined) {
        return { error: 'No game has been started' };
    }
    return gameManager.makeMove(playerName, card, position);
}

io.listen(3000);
console.log('Socket.io server listening on port 3000');

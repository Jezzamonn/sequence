import { Server, Socket } from 'socket.io';
import { defaultServerPort } from '../common/ts/interface/defaults';
import { Command, CommandCallback } from '../common/ts/interface/interface';
import { Player } from '../common/ts/players';
import { wait } from '../common/ts/util';
import { logIfError } from './server-common';
import { ServerGameManager } from './server-game-manager';
import { ServerPlayerManager } from './server-player-manager';

console.log('Server <( Hello World! )');

const io = new Server({
    cors: {
        origin: '*',
    },
});

const playerManager = new ServerPlayerManager();
let gameManager: ServerGameManager | undefined;

io.on('connection', (socket: Socket) => {
    console.log('A client has connected');

    playerManager.sendPlayersState(socket);
    gameManager?.sendBaseGameState(socket);

    // When a client connects, wait for it to send a join command with the player information.
    // The player manager will add events to the socket to handle the rest of the game.
    socket.on(
        Command.join,
        (player: Player, callback: CommandCallback) => {
            const result = playerManager.addOrUpdatePlayer(
                player,
                socket
            );
            callback(logIfError(result));

            if (result.error != undefined) {
                return;
            }

            // Notify all players of the current players.
            playerManager.sendPlayersState(io);
            gameManager?.sendGameState(io);
        }
    );
});

playerManager.onStart = (allowAI: boolean) => {
    if (gameManager !== undefined) {
        console.warn('Replacing existing game.');
    } else {
        console.log('Starting new game');
    }

    try {
        const players = playerManager.getValidatedPlayers(allowAI);
        gameManager = ServerGameManager.fromPartialPlayers(players, allowAI);
    } catch (e) {
        if (e instanceof Error) {
            return { error: e.message };
        }
        console.error(e);
        return { error: 'An unknown error occurred' };
    }

    wait(0).then(() => {
        gameManager?.sendGameState(io);
        gameManager?.possiblySimulateAIPlayer();
    });

    return {};
}

playerManager.onMakeMove = (playerName, card, position) => {
    if (gameManager === undefined) {
        return { error: 'No game has been started' };
    }

    try {
        gameManager.makeMove(playerName, card, position);
    } catch (e) {
        if (e instanceof Error) {
            return { error: e.message };
        }
        console.error(e);
        return { error: 'An unknown error occurred' };
    }

    wait(0).then(() => {
        gameManager?.sendGameState(io);
        gameManager?.possiblySimulateAIPlayer();
    });

    return {};
}

io.listen(defaultServerPort);
console.log(`Socket.io server listening on port ${defaultServerPort}`);

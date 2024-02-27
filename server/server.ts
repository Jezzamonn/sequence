import { Server } from 'socket.io';
import { wait } from '../common/ts/util';
import { ServerGameManager } from './server-game-manager';
import { ServerPlayerManager } from './server-player-manager';

console.log('Server <( Hello World! )');

const io = new Server({
    cors: {
        origin: 'http://localhost:8080',
    },
});

const playerManager = new ServerPlayerManager(io);
let gameManager: ServerGameManager | undefined;

playerManager.onJoin = () => {
    gameManager?.sendGameState();
}

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

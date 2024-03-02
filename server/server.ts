import express from 'express';
import fs from 'fs';
import https from 'https';
import { Server, Socket } from 'socket.io';
import { Command, CommandCallback } from '../common/ts/interface/interface';
import { Player } from '../common/ts/players';
import { logIfError } from './server-common';
import { ServerGameManager } from './server-game-manager';
import { ServerPlayerManager } from './server-player-manager';

console.log('Server <( Hello World! )');

const port = 443;

const sslDir = '/etc/letsencrypt/live/seq.jezzamon.com/'
const cert = fs.readFileSync(sslDir + 'fullchain.pem');
const key = fs.readFileSync(sslDir + 'privkey.pem');

// Placeholder express app.
const app = express();
app.use(express.static('../client/build'));

const server = https.createServer({ cert, key }, app);

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"]
    },
});

const playerManager = new ServerPlayerManager();
let gameManager: ServerGameManager | undefined;

io.on('connection', (socket: Socket) => {
    console.log('A client has connected');

    playerManager.sendPlayersState(socket);
    socket.emit(Command.gameState, gameManager?.getBaseGameState());

    // When a client connects, wait for it to send a join command with the player information.
    // The player manager will add events to the socket to handle the rest of the game.
    socket.on(Command.join, (player: Player, callback: CommandCallback) => {
        const result = playerManager.addOrUpdatePlayer(player, socket);
        callback(logIfError(result));

        if (result.error != undefined) {
            return;
        }

        // Notify all players of the current players.
        playerManager.sendPlayersState(io);
        gameManager?.sendGameState();
    });
});

playerManager.onStart = (allowAI: boolean) => {
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

    return {};
};

playerManager.onMakeMove = (playerName, card, position) => {
    if (gameManager == undefined) {
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

    return {};
};

server.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

import { program } from 'commander';
import express from 'express';
import fs from 'fs';
import http from 'http';
import https from 'https';
import { Server, Socket } from 'socket.io';
import { Command, CommandCallback } from '../common/ts/interface/interface';
import { Player } from '../common/ts/players';
import { wait } from '../common/ts/util';
import { logIfError } from './server-common';
import { ServerGameManager } from './server-game-manager';
import { ServerPlayerManager } from './server-player-manager';

console.log('Server <( Hello World! )');

program
    .option('--minPlayers <players>', 'Minimum number of players in a game. The rest will be filled with AI players', '2')
    .parse(process.argv);

const options = program.opts();

const minPlayers = parseInt(options.minPlayers);

let port: number;

const buildDir = '../client/build';

// Placeholder express app.
const app = express();
app.use(express.static(buildDir));

let server: http.Server | https.Server;

if (process.env.NODE_ENV === 'production') {
    port = 443;

    const sslDir = '/etc/letsencrypt/live/seq.jezzamon.com/'
    const cert = fs.readFileSync(sslDir + 'fullchain.pem');
    const key = fs.readFileSync(sslDir + 'privkey.pem');

    server = https.createServer({ cert, key }, app);
} else {
    port = 8080;
    server = http.createServer(app);
}

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
    if (gameManager != undefined) {
        console.warn('Replacing existing game.');
    } else {
        console.log('Starting new game');
    }

    try {
        const players = playerManager.getValidatedPlayers(allowAI);
        gameManager = ServerGameManager.fromPartialPlayers(io, players, allowAI, minPlayers);
        playerManager.clearPlayers();
    } catch (e) {
        if (e instanceof Error) {
            return { error: e.message };
        }
        console.error(e);
        return { error: 'An unknown error occurred' };
    }

    wait(0).then(() => {
        playerManager.sendPlayersState(io);
    });

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

// Watch the build directory for changes and tell clients to refresh when it
// changes.

// Also want to debounce this so that we don't spam the clients with refreshes
// and so that we wait for all the building to finish.
try {
    let refreshTimeout: NodeJS.Timeout | undefined;
    const refreshDebounceTimeSec = 1;

    fs.watch(buildDir, { recursive: true }, (event, filename) => {
        console.log('File change detected:', event, filename)
        if (refreshTimeout != undefined) {
            clearTimeout(refreshTimeout);
        }

        refreshTimeout = setTimeout(() => {
            console.log('Refreshing clients');
            io.emit(Command.refresh);
            refreshTimeout = undefined;
        }, refreshDebounceTimeSec * 1000);
    });
} catch (e) {
    console.error('Failed to watch build directory for changes:', e);
    console.log('No worries :)')
}

server.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

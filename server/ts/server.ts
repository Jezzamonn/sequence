import { program } from 'commander';
import express from 'express';
import fs from 'fs';
import http from 'http';
import https from 'https';
import { AddressInfo } from 'net';
import { Server, Socket } from 'socket.io';
import {
    ClientCommand,
    CommandCallback
} from '../../common/ts/interface/interface';
import { logIfError } from './server-common';
import { ResettableTimeout, shutdownVm, stopServer, watchForChangesToBuildDir } from './server-functions';
import { ServerRoomManager } from './server-room-manager';

console.log('Server <( Hello World! )');

program
    .option(
        '--minPlayers <players>',
        'Minimum number of players in a game. The rest will be filled with AI players',
        '2'
    )
    .option('--port <port>', 'Port to listen on', '')
    .option('--randomSeed <seed>', 'Seed for generating random numbers', '')
    .parse(process.argv);

const options = program.opts();

let port: number | undefined;

if (options.port != '') {
    port = parseInt(options.port);
}

const buildDir = '../client/build';

// Placeholder express app.
const app = express();
app.use(express.static(buildDir));

let server: http.Server | https.Server;

if (process.env.NODE_ENV === 'production') {
    if (port == undefined) {
        port = 443;
    }

    const sslDir = '/etc/letsencrypt/live/seq.jezzamon.com/';
    const cert = fs.readFileSync(sslDir + 'fullchain.pem');
    const key = fs.readFileSync(sslDir + 'privkey.pem');

    server = https.createServer({ cert, key }, app);
} else {
    if (port == undefined) {
        port = 8080;
    }
    server = http.createServer(app);
}

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

const roomManager = new ServerRoomManager(
    "roomio-da-fabio",
    io,
    parseInt(options.minPlayers),
    (options.randomSeed as string) || undefined,
);

const shutdownTimeoutDuration = 60 * 60 * 1000;
const shutdownTimeout: ResettableTimeout = new ResettableTimeout(async () => {
    console.log('Shutting down server due to inactivity');
    await stopServer(server);
    await shutdownVm();
    // End process
    process.exit(0);
}, shutdownTimeoutDuration);

io.on('connection', (socket: Socket) => {
    console.log('A client has connected');

    // Don't do anything with the connection until we receive the subsequent joinRoom command.
    socket.once(
        ClientCommand.joinRoom,
        (roomName: string, playerId: string, callback: CommandCallback) => {
            // Ignore room name for now as there's only one room.
            const result = roomManager.addOrUpdatePlayer(playerId, socket);
            callback(logIfError(result));
        }
    );

    socket.onAny(() => {
        // Reset the timer.
        shutdownTimeout.reset();
    });
});

try {
    watchForChangesToBuildDir(io);
} catch (e) {
    console.error('Failed to watch build directory for changes:', e);
    console.log('No worries :)');
}

server.listen(port, () => {
    console.log(`Listening on port ${(server.address() as AddressInfo).port}`);
});

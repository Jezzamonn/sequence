import { Socket, io } from 'socket.io-client';
import { Card } from '../../common/ts/cards';
import { Point } from '../../common/ts/point';
import { MoveResult } from '../../common/ts/move-result';
import { PlayerVisibleGameState } from '../../common/ts/game';

export class Connection {
    private socket: Socket;

    requestInProgress = false;

    onGameState: (state: PlayerVisibleGameState) => void = () => {};

    constructor() {
        this.socket = io('http://localhost:3000');

        this.socket.on('connect', () => {
            console.log('Connected to server');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });

        this.socket.on('gameState', this.onGameState);
    }

    async startGame(numPlayers: number, numTeams: number): Promise<MoveResult> {
        if (this.requestInProgress) {
            return { error: 'Request already in progress' };
        }

        this.requestInProgress = true;

        try {
            const result = await this.socket.emitWithAck('start', numPlayers, numTeams);
            return result;
        } finally {
            this.requestInProgress = false;
        }
    }

    async makeMove(card: Card, position: Point | undefined): Promise<MoveResult> {
        if (this.requestInProgress) {
            return { error: 'Request already in progress' };
        }

        this.requestInProgress = true;

        try {
            const result = await this.socket.emitWithAck('move', card, position);
            return result;
        } finally {
            this.requestInProgress = false;
        }
    }
}

// Connect to the server
const socket = io('http://localhost:3000');

// Function to connect to the server
function connectToServer() {
    socket.on('connect', () => {
        console.log('Connected to server');
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from server');
    });
}

// Function to make a move
function makeMove(move: string) {
    socket.emit('move', move);
}

// Example usage
connectToServer();
makeMove('left');

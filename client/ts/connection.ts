import { Socket, io } from 'socket.io-client';
import { Card, cardToDescription } from '../../common/ts/cards';
import { Point, Points } from '../../common/ts/point';
import { Command, MoveResult } from '../../common/ts/interface/interface';
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

        this.socket.on(Command.gameState, (state: PlayerVisibleGameState) => {
            this.onGameState(state);
        });
    }

    async startGame(numPlayers: number, numTeams: number): Promise<MoveResult> {
        console.log(`Starting game with ${numPlayers} players and ${numTeams} teams`);
        if (this.requestInProgress) {
            return { error: 'Request already in progress' };
        }

        this.requestInProgress = true;

        try {
            const result = await this.socket.emitWithAck(Command.startGame, numPlayers, numTeams);
            return result;
        } finally {
            this.requestInProgress = false;
        }
    }

    async makeMove(card: Card, position: Point | undefined): Promise<MoveResult> {
        console.log(`Making move: ${cardToDescription(card)} to ${Points.toString(position)}`);
        if (this.requestInProgress) {
            return { error: 'Request already in progress' };
        }

        this.requestInProgress = true;

        try {
            const result = await this.socket.emitWithAck(Command.makeMove, card, position);
            return result;
        } finally {
            this.requestInProgress = false;
        }
    }
}

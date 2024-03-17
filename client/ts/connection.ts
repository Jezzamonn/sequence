import { Socket, io } from 'socket.io-client';
import { Card, cardToDescription } from '../../common/ts/cards';
import { PlayerVisibleGameState } from '../../common/ts/game';
import { Command, CommandResult } from '../../common/ts/interface/interface';
import { Player } from '../../common/ts/players';
import { Point, Points } from '../../common/ts/point';

export class Connection {
    private socket: Socket;

    requestInProgress = false;

    onGameState: ((state: PlayerVisibleGameState) => void) | undefined;
    onPlayersState: ((players: Player[]) => void) | undefined;

    constructor() {
        this.socket = io(location.origin);

        this.socket.on('connect', () => {
            console.log('Connected to server');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });

        this.socket.on(Command.gameState, (state: PlayerVisibleGameState) => {
            this.onGameState?.(state);
        });

        this.socket.on(Command.playersState, (players: Player[]) => {
            this.onPlayersState?.(players);
        });

        this.socket.on(Command.refresh, () => {
            // Just reload the page without caring about the current state of the game.
            window.location.reload();
        });
    }

    async join(player: Player): Promise<CommandResult> {
        console.log(`Joining as ${player.name}`);
        if (this.requestInProgress) {
            return { error: 'Request already in progress' };
        }

        this.requestInProgress = true;

        try {
            const result = await this.socket.emitWithAck(Command.join, player);
            return result;
        } finally {
            this.requestInProgress = false;
        }
    }

    async startGame(allowAI = false): Promise<CommandResult> {
        console.log(`Starting game!`);
        if (this.requestInProgress) {
            return { error: 'Request already in progress' };
        }

        this.requestInProgress = true;

        try {
            const result = await this.socket.emitWithAck(Command.start, allowAI);
            return result;
        } finally {
            this.requestInProgress = false;
        }
    }

    async makeMove(card: Card, position: Point | undefined): Promise<CommandResult> {
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

export const connection = new Connection();
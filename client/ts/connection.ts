import { Socket, io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import { Card, cardToDescription } from '../../common/ts/cards';
import { PlayerVisibleGameState } from '../../common/ts/game';
import { ClientCommand, CommandResult, ServerCommand } from '../../common/ts/interface/interface';
import { Player } from '../../common/ts/players';
import { Point, Points } from '../../common/ts/point';

export const localStoragePrefix = 'sequence';

export class Connection {
    private socket: Socket;
    id: string;

    requestInProgress = false;
    joinedRoom = false;

    onGameState: ((state: PlayerVisibleGameState) => void) | undefined;
    onPlayersState: ((players: Player[]) => void) | undefined;

    constructor() {
        this.socket = io(location.origin);

        let id = localStorage.getItem(localStoragePrefix + '-uuid');
        if (id == undefined) {
            id = uuidv4();
            localStorage.setItem(localStoragePrefix + '-uuid', id);
        }
        this.id = id;

        this.socket.on('connect', () => {
            console.log('Connected to server');
            // Join room.
            // Not sure what to do if this fails.
            this.socket.emitWithAck(ClientCommand.joinRoom, 'room', this.id).then(() => {
                console.log(`Joined room as ${this.id}`);
                this.joinedRoom = true;
            });
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
            this.joinedRoom = false;
        });

        this.socket.on(ServerCommand.gameState, (state: PlayerVisibleGameState) => {
            this.onGameState?.(state);
        });

        this.socket.on(ServerCommand.playersState, (players: Player[]) => {
            this.onPlayersState?.(players);
        });

        this.socket.on(ServerCommand.refresh, () => {
            // Just reload the page without caring about the current state of the game.
            window.location.reload();
        });
    }

    async joinGame(player: Player): Promise<CommandResult> {
        console.log(`Joining as ${player.name}`);
        if (this.requestInProgress) {
            return { error: 'Request already in progress' };
        }

        try {
            const result = await this.socket.emitWithAck(ClientCommand.joinGame, player);
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
            const result = await this.socket.emitWithAck(ClientCommand.start, allowAI);
            return result;
        } finally {
            this.requestInProgress = false;
        }
    }

    async endGame(): Promise<CommandResult> {
        console.log(`Ending game!`);
        if (this.requestInProgress) {
            return { error: 'Request already in progress' };
        }

        this.requestInProgress = true;

        try {
            const result = await this.socket.emitWithAck(ClientCommand.endGame);
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
            const result = await this.socket.emitWithAck(ClientCommand.makeMove, card, position);
            return result;
        } finally {
            this.requestInProgress = false;
        }
    }

    async removePlayer(playerName: string): Promise<CommandResult> {
        console.log(`Removing player: ${playerName}`);
        if (this.requestInProgress) {
            return { error: 'Request already in progress' };
        }

        this.requestInProgress = true;

        try {
            const result = await this.socket.emitWithAck(ClientCommand.removePlayer, playerName);
            return result;
        } finally {
            this.requestInProgress = false;
        }
    }
}

export const connection = new Connection();
import { Server, Socket } from 'socket.io';
import { Card } from '../../common/ts/cards';
import {
    ClientCommand,
    CommandCallback,
    CommandResult,
    ServerCommand,
} from '../../common/ts/interface/interface';
import { Player, validatePlayerColors } from '../../common/ts/players';
import { Point } from '../../common/ts/point';
import { wait } from '../../common/ts/util';
import { handleThrownError } from './server-common';
import { ServerGameManager } from './server-game-manager';

export class ServerRoomManager {
    // Map of player ID to the socket.
    joinedSockets: Map<string, Socket> = new Map();

    game: ServerGameManager | undefined;
    // Map of players in the game. Anyone not in this is still in the room, but a spectator.
    joinedPlayers: Map<string, Player> = new Map();

    roomName: string;
    io: Server;
    minPlayers: number;
    randomSeed: string | undefined;

    constructor(
        roomName: string,
        io: Server,
        minPlayers: number,
        randomSeed?: string
    ) {
        this.roomName = roomName;
        this.io = io;
        this.minPlayers = minPlayers;
        this.randomSeed = randomSeed;
    }

    addOrUpdatePlayer(playerId: string | undefined, socket: Socket): CommandResult {
        if (playerId == undefined) {
            throw new Error('Player ID must be provided.');
        }
        console.log(`Player ${JSON.stringify(playerId)} joining room.`);

        this.joinedSockets.set(playerId, socket);
        socket.join(this.roomName);

        // Send the player state and game state to the newly joined player. But do it after this function to ensure the callback finishes first.
        wait(0).then(() => {
            this.sendPlayersState();
            this.sendGameState();
        });

        // TODO: Add listeners for the other events in this game.
        socket.on(
            ClientCommand.joinGame,
            (player: Player, callback: CommandCallback) => {
                // Ignore potential new player ID from the client.
                player.id = playerId;
                // Overwrite any existing player with this ID. But allow players with the same name.
                this.joinedPlayers.set(playerId, player);
                callback({});
                this.sendPlayersState();
            }
        );

        socket.on(
            ClientCommand.start,
            (allowAI: boolean, callback: CommandCallback) => {
                if (this.game != undefined) {
                    // TODO: Maybe this should fail given the new game flow.
                    console.warn('Replacing existing game.');
                } else {
                    console.log('Starting new game');
                }

                try {
                    const players = this.getValidatedPlayers(allowAI);
                    this.game = ServerGameManager.fromPartialPlayers(
                        players,
                        allowAI,
                        this.minPlayers,
                        this.randomSeed
                    );
                    this.game.onGameStateChange = () => this.sendGameState();
                } catch (e) {
                    handleThrownError(e, callback);
                    return;
                }

                callback({});

                this.sendPlayersState();
            }
        );

        socket.on(
            ClientCommand.makeMove,
            (
                card: Card,
                position: Point | undefined,
                callback: CommandCallback
            ) => {
                if (this.game == undefined) {
                    callback({ error: 'No game has been started' });
                    return;
                }
                try {
                    this.game.makeMove(playerId, card, position);
                } catch (e) {
                    handleThrownError(e, callback);
                    return;
                }

                callback({});
            }
        );

        socket.on(ClientCommand.endGame, (callback: CommandCallback) => {
            if (this.game == undefined) {
                callback({ error: 'No game is running' });
                return;
            }

            this.game = undefined;
            callback({});

            this.sendGameState();
        });

        socket.on(
            ClientCommand.removePlayer,
            (playerId: string, callback: CommandCallback) => {
                try {
                    this.removePlayer(playerId);
                } catch (e) {
                    handleThrownError(e, callback);
                    return;
                }

                callback({});

                this.sendPlayersState();
            }
        );

        return {};
    }

    sendPlayersState(): void {
        const players = [...this.joinedPlayers.values()];
        // Sort by name to be consistent
        players.sort((a, b) => a.name.localeCompare(b.name));

        this.io.to(this.roomName).emit(ServerCommand.playersState, players);
    }

    sendGameState() {
        console.log('Sending game state');
        for (const playerId of this.joinedSockets.keys()) {
            const state = this.game?.getStateForPlayer(playerId);
            console.log(`Sending game state to player ${playerId}`);

            this.joinedSockets
                .get(playerId)
                ?.emit(ServerCommand.gameState, state);
        }
    }

    validatePlayers(allowAI = false): void {
        validatePlayerColors(
            [...this.joinedPlayers.values()].map((player) => player.color),
            allowAI
        );
    }

    getValidatedPlayers(allowAI = false): Player[] {
        this.validatePlayers(allowAI);
        return [...this.joinedPlayers.values()];
    }

    removePlayer(playerId: string): void {
        if (this.game != undefined) {
            throw new Error('Cannot remove player while game is in progress.');
        }
        if (!this.joinedPlayers.has(playerId)) {
            throw new Error(`Player ${playerId} not found.`);
        }
        this.joinedPlayers.delete(playerId);
    }
}

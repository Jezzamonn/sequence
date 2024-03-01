import { Server, Socket } from 'socket.io';
import { Card } from '../common/ts/cards';
import {
    Command,
    CommandCallback,
    CommandResult,
} from '../common/ts/interface/interface';
import { Player, validatePlayerColors } from '../common/ts/players';
import { Point } from '../common/ts/point';
import { logIfError } from './server-common';

export class ServerPlayerManager {
    io: Server;
    // Map of player name to player.
    joinedPlayers: Map<string, Player> = new Map();

    onJoin: (() => void) | undefined;
    onStart: ((allowAI: boolean) => CommandResult) | undefined;
    onMakeMove:
        | ((
              playerName: string,
              card: Card,
              position: Point | undefined
          ) => CommandResult)
        | undefined;

    constructor(io: Server) {
        this.io = io;
        io.on('connection', (socket: Socket) => {
            console.log('A client has connected');

            this.sendPlayersState();

            // When a client connects, wait for it to send a join command with the player information.
            // The player manager will add events to the socket to handle the rest of the game.
            socket.on(
                Command.join,
                (player: Player, callback: CommandCallback) => {
                    const addPlayerResult = this.addOrUpdatePlayer(player, socket);
                    callback(logIfError(addPlayerResult));

                    if (addPlayerResult.error != undefined) {
                        return;
                    }

                    // Notify all players of the current players.
                    this.sendPlayersState();

                    this.onJoin?.();
                }
            );
        });
    }

    sendPlayersState() {
        const players = [...this.joinedPlayers.values()];
        // Sort by name to be consistent
        players.sort((a, b) => a.name.localeCompare(b.name));

        // Broadcast so that it goes to players that haven't joined yet.
        this.io.emit(
            Command.playersState,
            players
        );
    }

    addOrUpdatePlayer(player: Player, socket: Socket): CommandResult {
        console.log(`Adding or updating player: ${JSON.stringify(player)}`);
        // For now, overwrite an existing player information.
        // This could be a player switching device, etc. But also could just be a player changing settings.
        // In the future, we could send a notification to the first connection.
        this.joinedPlayers.set(player.name, player);
        // Join the room for the player.
        socket.join(player.name);

        socket.on(Command.start, (allowAI: boolean, callback: CommandCallback) => {
            if (this.onStart === undefined) {
                callback({ error: 'No start handler set' });
                return;
            }
            callback(logIfError(this.onStart(allowAI)));
        });
        socket.on(
            Command.makeMove,
            (
                card: Card,
                position: Point | undefined,
                callback: CommandCallback
            ) => {
                if (this.onMakeMove === undefined) {
                    callback({ error: 'No makeMove handler set' });
                    return;
                }
                callback(
                    logIfError(this.onMakeMove(player.name, card, position))
                );
            }
        );

        return {};
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
}

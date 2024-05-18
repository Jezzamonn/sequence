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
    // Map of player name to player.
    joinedPlayers: Map<string, Player> = new Map();
    allowPlayerChanges = true;

    // onJoin: (() => void) | undefined;
    onStart: ((allowAI: boolean) => CommandResult) | undefined;
    onMakeMove:
        | ((
              playerName: string,
              card: Card,
              position: Point | undefined
          ) => CommandResult)
        | undefined;
    onEndGame: (() => CommandResult) | undefined;
    onRemovePlayer: ((playerName: string) => CommandResult) | undefined;

    sendPlayersState(target: Server | Socket): void {
        const players = [...this.joinedPlayers.values()];
        // Sort by name to be consistent
        players.sort((a, b) => a.name.localeCompare(b.name));

        // Broadcast so that it goes to players that haven't joined yet.
        target.emit(Command.playersState, players);
    }

    addOrUpdatePlayer(player: Player, socket: Socket): CommandResult {
        console.log(`Adding or updating player: ${JSON.stringify(player)}`);

        if (this.allowPlayerChanges) {
            this.joinedPlayers.set(player.name, player);
        } else {
            const existingPlayer = this.joinedPlayers.get(player.name);
            if (existingPlayer == undefined) {
                return {
                    error: 'Cannot add new player while game is in progress.',
                };
            }
            // Ignore changes to the player's color / quest.
        }

        // Join the room for the player.
        socket.join(player.name);

        socket.on(
            Command.start,
            (allowAI: boolean, callback: CommandCallback) => {
                if (this.onStart == undefined) {
                    callback({ error: 'No start handler set' });
                    return;
                }
                callback(logIfError(this.onStart(allowAI)));
            }
        );
        socket.on(
            Command.makeMove,
            (
                card: Card,
                position: Point | undefined,
                callback: CommandCallback
            ) => {
                if (this.onMakeMove == undefined) {
                    callback({ error: 'No makeMove handler set' });
                    return;
                }
                callback(
                    logIfError(this.onMakeMove(player.name, card, position))
                );
            }
        );

        socket.on(Command.endGame, (callback: CommandCallback) => {
            if (this.onEndGame == undefined) {
                callback({ error: 'No endGame handler set' });
                return;
            }
            callback(
                logIfError(this.onEndGame())
            );
        });

        socket.on(Command.removePlayer, (playerName: string, callback: CommandCallback) => {
            if (this.onRemovePlayer == undefined) {
                callback({ error: 'No removePlayer handler set' });
                return;
            }
            callback(
                logIfError(this.onRemovePlayer(playerName))
            );
        });

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

    clearPlayers(): void {
        this.joinedPlayers.clear();
    }

    removePlayer(playerName: string): void {
        if (!this.joinedPlayers.has(playerName)) {
            throw new Error(`Player ${playerName} not found.`);
        }
        this.joinedPlayers.delete(playerName);

        // TODO: I suppose this should remove the socket stuff?
    }
}

import { Server } from "socket.io";
import { PlayerOrAI } from "../common/ts/ai/ai-interface";
import { RandomAI } from "../common/ts/ai/random";
import { Card, cardToDescription } from "../common/ts/cards";
import { GameManager } from "../common/ts/game";
import { Command, CommandResult } from "../common/ts/interface/interface";
import { Player } from "../common/ts/players";
import { Point } from "../common/ts/point";
import { choose, wait } from "../common/ts/util";

export class ServerGameManager {
    io: Server;
    players: PlayerOrAI[] = [];
    gameManager: GameManager;

    constructor(io: Server, players: PlayerOrAI[]) {
        this.io = io;
        this.players = players;

        const numColors = new Set(players.map((p) => p.color)).size;
        this.gameManager = new GameManager(players.length, numColors, Math.random);
    }

    static fromPartialPlayers(io: Server, players: Player[], allowAI = false): ServerGameManager {
        return new ServerGameManager(io, makeAllPlayersFromPartialPlayers(players, allowAI));
    }

    makeMove(playerName: string, card: Card, position: Point | undefined): CommandResult {
        console.log(
            `Player ${playerName} making move: ${cardToDescription(
                card
            )} at ${position}`
        );

        // Find player index by looking up by their name.
        const playerIndex = this.players.findIndex((p) => p.name === playerName);
        if (playerIndex === -1) {
            return { error: `Player ${playerName} not found.` };
        }

        try {
            this.gameManager.makeMove(playerIndex, card, position);
        } catch (e) {
            if (e instanceof Error) {
                return { error: e.message };
            }
            console.error(e);
            return { error: 'An unknown error occurred' };
        }
        // console.log(boardToString(this.gameManager.state.placedTokens));

        // Do these asynchronously so that the result of the move is sent to the player first.
        wait(0).then(() => {
            this.sendGameState();
            // Not awaited.
            this.possiblySimulateAIPlayer();
        });

        return {};
    }

    sendGameState() {
        console.log('Sending game state');
        for (let i = 0; i < this.players.length; i++) {
            const player = this.players[i];
            const state = this.gameManager.getStateForPlayer(i);
            console.log(`Sending game state to player ${i}`);

            this.io.to(player.name).emit(Command.gameState, state);
        }
    }

    async possiblySimulateAIPlayer() {
        const playerIndex = this.gameManager.state.nextPlayerIndex;
        const player = this.players[playerIndex];

        if (player.ai === undefined) {
            return;
        }

        console.log(`Simulating AI player ${player.name}`);

        await wait(1);

        const moves = this.gameManager.getMovesForPlayer(playerIndex);
        const state = this.gameManager.getStateForPlayer(playerIndex);
        const move = player.ai.makeMove(moves, state);

        this.makeMove(player.name, move[0], move[1]);
    }
}

export function makeAllPlayersFromPartialPlayers(joinedPlayers: Player[], allowAI = false): PlayerOrAI[] {
    const players: PlayerOrAI[] = [];
    const addedHumanPlayerNames = new Set<string>();
    // JS sets actually maintain a consistent order, so we can look up the next color from that.
    const colorsInGame = new Set(
        joinedPlayers.map((p) => p.color)
    );
    let aiPlayerCount = 0;

    while (addedHumanPlayerNames.size < joinedPlayers.length) {
        for (const color of colorsInGame) {
            let player: PlayerOrAI = choose(
                joinedPlayers.filter(
                    (p) =>
                        p.color === color &&
                        !addedHumanPlayerNames.has(p.name)
                )
            );
            if (player === undefined) {
                // No human player for this color, add an AI player.
                if (!allowAI) {
                    throw new Error(
                        'Error creating players. Not enough human players for all colors.'
                    );
                }
                const ai = new RandomAI();
                player = {
                    name: `AI ${++aiPlayerCount}`,
                    quest: 'To make random moves.',
                    color,
                    ai,
                };
            } else {
                addedHumanPlayerNames.add(player.name);
            }

            players.push(player);
        }
    }
    return players;
}
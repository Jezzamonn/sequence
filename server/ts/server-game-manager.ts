import { PlayerOrAI } from '../../common/ts/ai/ai-interface';
import { BlockingAI } from '../../common/ts/ai/blocking';
import { PreferMiddleAI } from '../../common/ts/ai/prefer-middle';
import { allColors } from '../../common/ts/board';
import { Card, cardToDescription } from '../../common/ts/cards';
import { GameManager } from '../../common/ts/game';
import { Player } from '../../common/ts/players';
import { Point, Points } from '../../common/ts/point';
import { choose, seededRandom, wait } from '../../common/ts/util';

export class ServerGameManager {
    players: PlayerOrAI[] = [];
    gameManager: GameManager;

    onGameStateChange: (() => void) | undefined;

    constructor(players: PlayerOrAI[], randomSeed?: string) {
        this.players = players;

        let random: () => number = Math.random;
        if (randomSeed != undefined) {
            random = seededRandom(randomSeed);
        }

        this.gameManager = new GameManager(players, random);

        this.queueNextAction();
    }

    static fromPartialPlayers(
        players: Player[],
        allowAI = false,
        minPlayers: number,
        randomSeed?: string
    ): ServerGameManager {
        return new ServerGameManager(
            makeAllPlayersFromPartialPlayers(players, allowAI, minPlayers),
            randomSeed
        );
    }

    makeMove(playerId: string, card: Card, position: Point | undefined): void {
        console.log(
            `Player ${playerId} making move: ${cardToDescription(
                card
            )} at ${Points.toString(position)}`
        );

        // Find player index by looking up by their name.
        const playerIndex = this.players.findIndex((p) => p.id === playerId);
        if (playerIndex === -1) {
            throw new Error(`Player ${playerId} not found.`);
        }

        this.gameManager.makeMove(playerIndex, card, position);
        this.queueNextAction();
    }

    // Poorly named.
    queueNextAction() {
        wait(0).then(() => {
            this.onGameStateChange?.();
            this.possiblySimulateAIPlayer();
        });
    }

    getStateForPlayer(playerId: string) {
        const playerIndex = this.players.findIndex((p) => p.id === playerId);
        if (playerIndex === -1) {
            return this.gameManager.getStateForPlayer();
        }

        return this.gameManager.getStateForPlayer(playerIndex);
    }

    async possiblySimulateAIPlayer() {
        const playerIndex = this.gameManager.state.nextPlayerIndex;
        const player = this.players[playerIndex];

        if (player.ai == undefined) {
            return;
        }

        // Don't try to do AI if the game is over
        if (this.gameManager.state.gameWinner != undefined) {
            return;
        }

        console.log(`Simulating AI player ${player.id}`);

        await wait(1);

        const moves = this.gameManager.getMovesForPlayer(playerIndex);
        const state = this.gameManager.getStateForPlayer(playerIndex);
        const move = player.ai.makeMove(moves, state);

        try {
            this.makeMove(player.id, move.card, move.position);
        } catch (e) {
            console.error(`AI Player made problematic move?? ${e}`);
        }
    }
}

export function makeAllPlayersFromPartialPlayers(
    joinedPlayers: Player[],
    allowAI: boolean,
    minimumPlayers: number
): PlayerOrAI[] {
    const players: PlayerOrAI[] = [];
    const addedHumanPlayerIds = new Set<string>();
    // JS sets actually maintain a consistent order, so we can look up the next color from that.
    const colorsInGame = new Set(joinedPlayers.map((p) => p.color));
    if (allowAI && colorsInGame.size == 1) {
        // Add an extra color for the AI player.
        colorsInGame.add(choose(allColors.filter((c) => !colorsInGame.has(c))));
    }

    let aiPlayerCount = 0;

    while (
        addedHumanPlayerIds.size < joinedPlayers.length ||
        players.length < minimumPlayers
    ) {
        for (const color of colorsInGame) {
            let player: PlayerOrAI = choose(
                joinedPlayers.filter(
                    (p) => p.color === color && !addedHumanPlayerIds.has(p.id)
                )
            );
            if (player == undefined) {
                // No human player for this color, add an AI player.
                if (!allowAI) {
                    throw new Error(
                        'Error creating players. Not enough human players for all colors.'
                    );
                }
                const ai = new BlockingAI(new PreferMiddleAI());
                player = {
                    id: `AI ${++aiPlayerCount}`,
                    name: `AI ${++aiPlayerCount}`,
                    quest: 'To robotically win └[ ∵ ]┘',
                    color,
                    ai,
                };
            } else {
                addedHumanPlayerIds.add(player.id);
            }

            players.push(player);
        }
    }
    console.log(players);
    return players;
}

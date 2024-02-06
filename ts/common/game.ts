// State of the game

import { Color, Token, allColors, countSequences, isValidDiscard, isValidPlacement, playerHasPossibleMove } from './board';
import {
    Card,
    allCards,
    cardToLabel,
    cardsAreEqual,
    isOneEyedJack,
} from './cards';
import { Point } from './point';
import { shuffle } from './util';

const validPlayerCounts = [2, 3, 4, 6, 8, 9, 10, 12];
const validTeamCounts = [2, 3];

const handSizes: Map<number, number> = new Map([
    [2, 7],
    [3, 6],
    [4, 6],
    [6, 5],
    [8, 4],
    [9, 4],
    [10, 3],
    [12, 3],
]);

const numSequencesToWin: Map<number, number> = new Map([
    [2, 2],
    [3, 1],
]);

interface Player {
    index: number;
    name: String;
    color: Color;
}

interface GameState {
    players: Player[];

    deck: Card[];
    discarded: Card[];
    placedTokens: Token[][];
    isInSequence: boolean[][];
    hands: Card[][];
    lastActionWasDiscard: boolean;

    nextPlayerIndex: number;
    gameWinner: Token;
}

interface PlayerVisibleGameState {
    players: Player[];

    placedTokens: Token[][];
    isInSequence: boolean[][];
    deckSize: number;
    lastCardPlayed: Card | undefined;
    hand: Card[];

    nextPlayerIndex: number;
    gameWinner: Token;
}

export class GameManager {
    state: GameState;
    random: () => number;

    constructor(numPlayers: number, numTeams: number, random: () => number) {
        if (!validPlayerCounts.includes(numPlayers)) {
            throw new Error(`Invalid number of players: ${numPlayers}`);
        }
        if (!validTeamCounts.includes(numTeams)) {
            throw new Error(`Invalid number of teams: ${numTeams}`);
        }
        if (numPlayers % numTeams != 0) {
            throw new Error(
                `Number of players must be divisible by number of teams. Got ${numPlayers} players and ${numTeams} teams`
            );
        }

        this.random = random;

        // Two decks.
        const deck = shuffle(allCards.concat(allCards), this.random);

        const hands: Card[][] = [];
        const handSize = handSizes.get(numPlayers)!;

        const players = [];

        for (let i = 0; i < numPlayers; i++) {
            // To be consistent, we use the end of the deck for each player.
            const hand = deck.splice(deck.length - handSize, handSize);
            const color = allColors[i % numTeams];
            const player = {
                index: i,
                name: `Player ${i + 1}`,
                color,
            };
            players.push(player);
            hands.push(hand);
        }

        this.state = {
            players,

            deck,
            discarded: [],
            placedTokens: [],
            isInSequence: [],
            hands,
            lastActionWasDiscard: false,

            nextPlayerIndex: Math.floor(this.random() * numPlayers),
            gameWinner: undefined,
        };
    }

    getStateForPlayer(playerIndex: number): PlayerVisibleGameState {
        if (playerIndex < 0 || playerIndex >= this.state.players.length) {
            throw new Error(`Invalid player index: ${playerIndex}`);
        }

        return {
            players: this.state.players,

            placedTokens: this.state.placedTokens,
            isInSequence: this.state.isInSequence,
            deckSize: this.state.deck.length,
            lastCardPlayed:
                this.state.discarded[this.state.discarded.length - 1],
            hand: this.state.hands[playerIndex],

            nextPlayerIndex: this.state.nextPlayerIndex,
            gameWinner: this.state.gameWinner,
        };
    }

    // Possible moves:
    // - Play a card
    // - Discard a card
    // - If no moves are possible, end your turn.
    //
    // A secure system should use some secret that only the player has? Maybe later.
    // Or maybe that part will be handled somewhere else.
    //
    // Other small weirdness: If you have two of the same card, this might pull the
    // wrong card out of the player's hand.
    // TODO: Solution to that is to sort the cards.
    //
    // Other game logic to handle: You can't remove from sequences.
    makeMove(playerIndex: number, card: Card, position: Point | undefined) {
        if (this.state.gameWinner !== undefined) {
            throw new Error('Game is already over');
        }
        if (playerIndex != this.state.nextPlayerIndex) {
            throw new Error(`Invalid player index: ${playerIndex}`);
        }

        const player = this.state.players[playerIndex];
        const hand = this.state.hands[playerIndex];

        const index = hand.findIndex((c) => cardsAreEqual(c, card));
        if (index == -1) {
            throw new Error(
                `Player ${player.name} does not have card ${card.rank} of ${card.suit}`
            );
        }

        if (position === undefined) {
            if (this.state.lastActionWasDiscard) {
                throw new Error(
                    `Cannot discard twice in a row.`
                );
            }
            if (!isValidDiscard(this.state.placedTokens, player.color, card)) {
                throw new Error(
                    `Illegal discard: ${cardToLabel(card)}`
                );
            }
        }
        else {
            if (!isValidPlacement(this.state.placedTokens, player.color, card, position)) {
                throw new Error(
                    `Illegal move: ${cardToLabel(card)} at ${position?.x}, ${
                        position?.y
                    }`
                );
            }
        }

        // Make the move!
        hand.splice(index, 1);
        this.state.discarded.push(card);

        if (position !== undefined) {
            if (isOneEyedJack(card)) {
                this.state.placedTokens[position.y][position.x] = undefined;
            } else {
                this.state.placedTokens[position.y][position.x] = player.color;
            }
        }

        // Check if a player has won.
        const numTeams = new Set(this.state.players.map((p) => p.color)).size;
        const sequences = countSequences(this.state.placedTokens);
        for (const [color, count] of sequences.entries()) {
            if (count >= numSequencesToWin.get(numTeams)!) {
                this.state.gameWinner = color;
                // Don't need to do anything else :)
                return;
            }
        }

        // Add a new card to the player's hand.
        hand.push(this.state.deck.pop()!);
        // If that was the last card, shuffle the discarded cards and use them as the new deck.
        if (this.state.deck.length == 0) {
            this.state.deck = shuffle(this.state.discarded, this.random);
            this.state.discarded = [];
        }

        this.state.lastActionWasDiscard = position === undefined;

        // If this wasn't a discard, now it's the next player's turn.
        if (position !== undefined) {
            this.state.nextPlayerIndex =
                (this.state.nextPlayerIndex + 1) % this.state.players.length;
        } else if (!playerHasPossibleMove(this.state.placedTokens, player.color, hand)) {
            console.log(`Player ${player.name} has no moves, ending turn.`);
            this.state.nextPlayerIndex =
                (this.state.nextPlayerIndex + 1) % this.state.players.length;
        }
    }
}

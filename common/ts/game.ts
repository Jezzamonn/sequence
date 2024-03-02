// State of the game

import {
    Token,
    countSequences,
    getMovesForPlayer,
    isValidDiscard,
    isValidPlacement,
    makeEmptyPlacedTokens,
    playerHasPossibleMove,
} from './board';
import {
    Card,
    allCards,
    cardToDescription,
    cardsAreEqual,
    isOneEyedJack,
} from './cards';
import {
    Player,
    handSizes,
    numSequencesToWin,
    validatePlayerColors,
} from './players';
import { Point } from './point';
import { shuffle, toSentenceCase } from './util';

interface GameState {
    players: Player[];

    deck: Card[];
    discarded: Card[];
    placedTokens: Token[][];
    hands: Card[][];
    lastActionWasDiscard: boolean;
    // Used for stopping players from removing from sequences.
    sequenceCount: number;

    turnNumber: number;
    nextPlayerIndex: number;
    gameWinner: Token;
}

export interface PlayerVisibleGameState {
    players: Player[];
    // Index of this player, undefined if this is a spectator or the player hasn't joined.
    playerIndex?: number;

    placedTokens: Token[][];
    deckSize: number;
    lastCardPlayed: Card | undefined;
    // Undefined if this is a spectator.
    hand?: Card[];
    lastActionWasDiscard: boolean;

    turnNumber: number;
    nextPlayerIndex: number;
    gameWinner: Token;
}

export class GameManager {
    state: GameState;
    random: () => number;

    constructor(players: Player[], random: () => number) {
        validatePlayerColors(players.map((p) => p.color));
        const numPlayers = players.length;

        this.random = random;

        // Two decks.
        const deck = shuffle(allCards.concat(allCards), this.random);

        const hands: Card[][] = [];
        const handSize = handSizes.get(numPlayers)!;

        for (let i = 0; i < numPlayers; i++) {
            // To be consistent, we use the end of the deck for each player.
            const hand = deck.splice(deck.length - handSize, handSize);
            hands.push(hand);
        }

        this.state = {
            players,

            deck,
            discarded: [],
            placedTokens: makeEmptyPlacedTokens(),
            hands,
            lastActionWasDiscard: false,
            sequenceCount: 0,

            turnNumber: 0,
            nextPlayerIndex: Math.floor(this.random() * numPlayers),
            gameWinner: undefined,
        };
    }

    getStateForPlayer(
        playerIndex: number | undefined = undefined
    ): PlayerVisibleGameState {
        if (
            playerIndex != undefined &&
            (playerIndex < 0 || playerIndex >= this.state.players.length)
        ) {
            throw new Error(`Invalid player index: ${playerIndex}`);
        }

        const state: PlayerVisibleGameState = {
            players: this.state.players,

            placedTokens: this.state.placedTokens,
            deckSize: this.state.deck.length,
            lastCardPlayed:
                this.state.discarded[this.state.discarded.length - 1],
            lastActionWasDiscard: this.state.lastActionWasDiscard,

            turnNumber: this.state.turnNumber,
            nextPlayerIndex: this.state.nextPlayerIndex,
            gameWinner: this.state.gameWinner,
        };

        if (playerIndex != undefined) {
            state.playerIndex = playerIndex;
            state.hand = this.state.hands[playerIndex];
        }

        return state;
    }

    getMovesForPlayer(playerIndex: number): [Card, Point | undefined][] {
        return getMovesForPlayer(
            this.state.placedTokens,
            this.state.sequenceCount,
            this.state.players[playerIndex].color,
            this.state.hands[playerIndex],
            !this.state.lastActionWasDiscard
        );
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
    makeMove(playerIndex: number, card: Card, position: Point | undefined) {
        if (this.state.gameWinner != undefined) {
            throw new Error(
                `Cannot make a move, the game is over. ${toSentenceCase(
                    this.state.gameWinner
                )} has won.`
            );
        }
        if (playerIndex != this.state.nextPlayerIndex) {
            throw new Error(`It's not your turn yet.`);
        }

        const player = this.state.players[playerIndex];
        const hand = this.state.hands[playerIndex];

        const index = hand.findIndex((c) => cardsAreEqual(c, card));
        if (index == -1) {
            throw new Error(
                `You do not have the card ${cardToDescription(card)}.`
            );
        }

        if (position == undefined) {
            if (this.state.lastActionWasDiscard) {
                throw new Error(`You can't discard twice in a row.`);
            }
            if (
                !isValidDiscard(
                    this.state.placedTokens,
                    this.state.sequenceCount,
                    player.color,
                    card
                )
            ) {
                throw new Error(
                    `You can't discard ${cardToDescription(
                        card
                    )} as there are possible moves for it.`
                );
            }
        } else {
            if (
                !isValidPlacement(
                    this.state.placedTokens,
                    this.state.sequenceCount,
                    player.color,
                    card,
                    position
                )
            ) {
                throw new Error(
                    `You can't place ${cardToDescription(card)} there.`
                );
            }
        }

        // Make the move!
        hand.splice(index, 1);
        this.state.discarded.push(card);

        if (position != undefined) {
            if (isOneEyedJack(card)) {
                this.state.placedTokens[position.y][position.x] = undefined;
            } else {
                this.state.placedTokens[position.y][position.x] = player.color;
            }
        }

        this.state.turnNumber++;

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
        this.state.sequenceCount = [...sequences.values()].reduce(
            (a, b) => a + b,
            0
        );

        // Add a new card to the player's hand.
        hand.push(this.state.deck.pop()!);

        // If that was the last card, shuffle the discarded cards and use them as the new deck.
        if (this.state.deck.length == 0) {
            console.log('Shuffling discards.');
            this.state.deck = shuffle(this.state.discarded, this.random);
            this.state.discarded = [];
        }

        this.state.lastActionWasDiscard = position == undefined;

        // If this wasn't a discard, now it's the next player's turn.
        if (position != undefined) {
            this.state.nextPlayerIndex =
                (this.state.nextPlayerIndex + 1) % this.state.players.length;
        } else if (
            !playerHasPossibleMove(
                this.state.placedTokens,
                this.state.sequenceCount,
                player.color,
                hand
            )
        ) {
            console.log(`Player ${player.name} has no moves, ending turn.`);
            this.state.nextPlayerIndex =
                (this.state.nextPlayerIndex + 1) % this.state.players.length;
            this.state.lastActionWasDiscard = false;
        }
    }
}

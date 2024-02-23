import { css, html, LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
    boardLayout,
    boardSize,
    countSequences,
    getMovesForCard,
    makeEmptyPlacedTokens,
} from '../../../../common/ts/board';
import { Point } from '../../../../common/ts/point';
import {
    BoardClickEventParams,
    HandClickEventParams,
    MakeMoveEventParams,
} from '../events';
import { Card } from '../../../../common/ts/cards';
import { PlayerVisibleGameState } from '../../../../common/ts/game';
import { connection } from '../../connection';

// The board, player hand and discard pile.
@customElement('game-display')
export class GameDisplay extends LitElement {
    // Styles
    static styles = [
        // language=CSS
        css`
            :host {
                display: grid;
                grid-template-columns: 1fr 5fr 1fr;
                grid-template-rows: 5fr 1fr;
                height: 100%;
                width: 100%;
            }

            game-board {
                max-width: 100%;
                max-height: 100%;
                grid-row: 1;
                grid-column: 2;
            }

            player-hand {
                grid-row: 2;
                grid-column: 1 / span 3;
            }

            deck-and-discard {
                grid-row: 1;
                grid-column: 3;
            }
        `,
    ];

    @property({ type: Object })
    accessor gameState: PlayerVisibleGameState | undefined = undefined;

    @property({ type: String })
    accessor selectedCard: Card | undefined = undefined;

    @property({ type: String })
    accessor selectedCardIndex: number | undefined = undefined;

    constructor() {
        super();
        this.handleWindowClick = this.handleWindowClick.bind(this);
    }

    connectedCallback() {
        super.connectedCallback();
        window.addEventListener('click', this.handleWindowClick);
        connection.onGameState = (state) => {
            this.gameState = state;
        };
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener('click', this.handleWindowClick);
        connection.onGameState = undefined;
    }

    private handleWindowClick() {
        this.selectedCard = undefined;
        this.selectedCardIndex = undefined;
    }

    render() {
        let validPositions: Point[] | undefined = undefined;
        let canDiscard: boolean | undefined = undefined;

        if (this.gameState != undefined && this.selectedCard != undefined) {
            const sequences = countSequences(this.gameState.placedTokens);
            const sequenceCount = [...sequences.values()].reduce(
                (a, b) => a + b,
                0
            );
            validPositions = getMovesForCard(
                this.gameState.placedTokens,
                sequenceCount,
                this.gameState.players[this.gameState.playerIndex].color,
                this.selectedCard
            );
            canDiscard =
                validPositions.length === 0 &&
                !this.gameState.lastActionWasDiscard;
        }

        return html`
            <game-board
                @board-position-click=${(
                    e: CustomEvent<BoardClickEventParams>
                ) => {
                    if (this.selectedCard != undefined) {
                        this.makeMove(this.selectedCard, e.detail.position);
                    }
                    e.detail.sourceEvent.stopPropagation();
                }}
                .placedTokens=${this.gameState?.placedTokens}
                .validPositions=${validPositions}
            ></game-board>
            <player-hand
                @card-click=${(e: CustomEvent<HandClickEventParams>) => {
                    this.selectedCard = e.detail.card;
                    this.selectedCardIndex = e.detail.index;

                    e.detail.sourceEvent.stopPropagation();
                }}
                .hand=${this.gameState?.hand}
                .selectedCardIndex=${this.selectedCardIndex}
            ></player-hand>
            <deck-discard
                @discard-click=${(e: CustomEvent<MouseEvent>) => {
                    if (this.selectedCard != undefined) {
                        this.makeMove(this.selectedCard, undefined);
                    }
                    e.detail.stopPropagation();
                }}
                .canDiscard=${canDiscard}
                .deckSize=${this.gameState?.deckSize}
                .rank=${this.gameState?.lastCardPlayed?.rank ?? 'Joker'}
                .suit=${this.gameState?.lastCardPlayed?.suit ?? 'Joker'}
            ></deck-discard>
        `;
    }

    async makeMove(card: Card, position: Point | undefined) {
        if (connection.requestInProgress) {
            return;
        }

        const moveResult = await connection.makeMove(card, position);
        if (moveResult.error != undefined) {
            this.dispatchEvent(
                new CustomEvent<string>('notify', {
                    detail: moveResult.error,
                })
            );
            return;
        }

        this.selectedCard = undefined;
        this.selectedCardIndex = undefined;
    }
}

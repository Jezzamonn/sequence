import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { countSequences, getMovesForCard } from '../../../../common/ts/board';
import { Card } from '../../../../common/ts/cards';
import { PlayerVisibleGameState } from '../../../../common/ts/game';
import { Point } from '../../../../common/ts/point';
import { connection } from '../../connection';
import { BoardClickEventParams, HandClickEventParams } from '../events';

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
                grid-template-rows: 1fr 5fr 1fr;
                height: 100vh;
                height: 100svh;
                width: 100vw;
            }

            .players {
                grid-row: 1;
                grid-column: 1 / span 3;
                gap: 10px;
                margin: 10px;

                display: flex;
                justify-content: space-around;
                align-items: center;
            }

            @keyframes glow {
                0% {
                    outline-color: #000;
                }
                50% {
                    outline-color: #999;
                }
                100% {
                    outline-color: #000;
                }
            }

            .player.active {
                outline: 5px solid black;
                animation: glow 1s infinite;
            }

            game-board {
                max-width: 100%;
                max-height: 100%;
                grid-row: 2;
                grid-column: 2;
            }

            deck-and-discard {
                grid-row: 2;
                grid-column: 3;
            }

            player-hand {
                grid-row: 3;
                grid-column: 1 / span 3;
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
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener('click', this.handleWindowClick);
    }

    private handleWindowClick() {
        this.selectedCard = undefined;
        this.selectedCardIndex = undefined;
    }

    render() {
        let validPositions: Point[] | undefined = undefined;
        let canDiscard: boolean | undefined = undefined;

        if (
            this.gameState != undefined &&
            this.gameState.playerIndex != undefined &&
            this.selectedCard != undefined
        ) {
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

        const players = this.gameState?.players.map((p, i) => {
            return html`<joined-player
                class="player ${i === this.gameState?.nextPlayerIndex
                    ? 'active'
                    : ''}"
                .name=${p.name}
                .quest=${p.quest}
                .color=${p.color}
            ></joined-player>`;
        });

        let thisPlayerTurnNumber = -1;
        if (this.gameState?.playerIndex != undefined) {
            thisPlayerTurnNumber = Math.ceil(
                (this.gameState?.turnNumber - this.gameState.playerIndex) /
                    this.gameState.players.length
            );
        }

        return html`
            <div class="players">${players}</div>
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
                    if (this.selectedCardIndex === e.detail.index) {
                        this.selectedCard = undefined;
                        this.selectedCardIndex = undefined;
                    }
                    else {
                        this.selectedCard = e.detail.card;
                        this.selectedCardIndex = e.detail.index;
                    }

                    e.detail.sourceEvent.stopPropagation();
                }}
                .hand=${this.gameState?.hand}
                .selectedCardIndex=${this.selectedCardIndex}
                .thisPlayerTurnNumber=${thisPlayerTurnNumber}
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

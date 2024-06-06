import { css, html, LitElement, nothing, PropertyValueMap } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
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
                padding: 0 5px;

                display: flex;
                justify-content: space-around;
                align-items: center;

                overflow-y: visible;
                overflow-x: scroll;
                scroll-behavior: smooth;
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

            .player {
                margin: 5px;
                flex-shrink: 0;
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
                z-index: 1;
            }

            deck-discard {
                grid-row: 2;
                grid-column: 1;
            }

            player-hand {
                grid-row: 3;
                grid-column: 1 / span 3;
                z-index: 2;
            }

            .settings-button {
                grid-row: 2;
                grid-column: 1;
                border: none;
                background: none;
                padding: 10%;
                align-self: start;
                max-width: 90px;
                z-index: 1;
            }

            .settings-image {
                width: 100%;
                height: 100%;
                object-fit: contain;
            }

            settings-modal {
                z-index: 10;
            }
        `,
    ];

    @property({ type: Object })
    accessor gameState: PlayerVisibleGameState | undefined = undefined;

    @property({ type: String })
    accessor selectedCard: Card | undefined = undefined;

    @property({ type: String })
    accessor selectedCardIndex: number | undefined = undefined;

    @state()
    private showingSettings = false;

    @state()
    private playersAreCollapsed = false;

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
                !this.gameState.discardedThisTurn;
        }

        const players = this.gameState?.players.map((p, i) => {
            return html`<joined-player
                class="player ${i === this.gameState?.nextPlayerIndex
                    ? 'active'
                    : ''}"
                .name=${p.name}
                .quest=${p.quest}
                .color=${p.color}
                .isCollapsed=${this.playersAreCollapsed}
                @click=${() => {
                    this.playersAreCollapsed = !this.playersAreCollapsed;
                }}
            ></joined-player>`;
        });

        let thisPlayerTurnNumber = -1;
        if (this.gameState?.playerIndex != undefined) {
            thisPlayerTurnNumber = Math.ceil(
                (this.gameState?.turnNumber - this.gameState.playerIndex) /
                    this.gameState.players.length
            );
            console.log('Turn number:', thisPlayerTurnNumber);
        }

        return html`
            <div class="players">${players}</div>
            <game-board
                class="game-board"
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
                .lastMove=${this.gameState?.lastMove}
                .doInitialAnimation=${this.gameState?.turnNumber === 0}
            ></game-board>
            <player-hand
                @card-click=${(e: CustomEvent<HandClickEventParams>) => {
                    if (this.selectedCardIndex === e.detail.index) {
                        this.selectedCard = undefined;
                        this.selectedCardIndex = undefined;
                    } else {
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
                .discardSize=${this.gameState?.discardSize}
                .rank=${this.gameState?.lastCardPlayed?.rank ?? 'Joker'}
                .suit=${this.gameState?.lastCardPlayed?.suit ?? 'Joker'}
            ></deck-discard>
            <button
                class="settings-button"
                aria-label="Settings"
                @click=${() => {
                    this.showingSettings = true;
                }}
            >
                <img class="settings-image" src="/img/settings.svg" />
            </button>
            ${this.showingSettings
                ? html`<settings-modal
                      @close=${() => {
                          this.showingSettings = false;
                      }}
                      @end-game=${() => {
                          connection.endGame();
                      }}
                  ></settings-modal>`
                : nothing}
        `;
    }

    updated(
        _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
    ): void {
        super.updated(_changedProperties);
        const playersElement = this.shadowRoot?.querySelector('.players');
        if (playersElement == undefined) {
            throw new Error('Players element not found???');
        }
        // Scroll active player into view
        const activePlayer = playersElement.querySelector(
            '.player.active'
        ) as HTMLElement;
        if (activePlayer != null) {
            horizontalScrollToCenterOfParent(activePlayer);
        }
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

export function horizontalScrollToCenterOfParent(
    childElement: HTMLElement
): void {
    const parent = childElement.parentElement;
    if (parent == null) {
        throw new Error('Element has no parent');
    }

    const childLeft = childElement.offsetLeft;
    const elementWidth = childElement.offsetWidth;
    const parentWidth = parent.offsetWidth;

    // Calculate distance to scroll with centering
    const scrollDistance = childLeft - (parentWidth - elementWidth) / 2;

    parent.scrollLeft = scrollDistance;

    // Animate scroll smoothly
    parent.scrollTo({
        left: scrollDistance,
        behavior: 'smooth',
    });
}

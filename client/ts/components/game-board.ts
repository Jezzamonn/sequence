import { css, html, LitElement, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import {
    boardLayout,
    boardSize,
    makeEmptyPlacedTokens,
} from '../../../common/ts/board';
import { Rank, Suit } from '../../../common/ts/cards';
import { Point } from '../../../common/ts/point';
import { BoardClickEventParams } from './events';

@customElement('game-board')
export class GameBoardElement extends LitElement {
    // Styles
    static styles = [
        // language=CSS
        css`
            :host {
                container-type: size;
                display: flex;
                flex-direction: column;
                justify-content: center;
            }

            .row {
                display: flex;
                justify-content: center;
            }

            .card {
                position: relative;

                margin: 0.2cqw 0.2cqh;

                max-width: 9.5cqw;
                max-height: 9.5cqh;

                transition: transform 0.2s;
            }

            .card-valid {
                outline: 0.3cqh solid black;
                z-index: 1;
                transform: scale(1.1);
            }

            .card-invalid {
                filter: brightness(0.9);
            }
        `,
    ];

    @property({ type: Array })
    accessor placedTokens: (string | undefined)[][] = makeEmptyPlacedTokens();

    @property({ type: Array })
    accessor validPositions: Point[] | undefined;

    render() {
        let cards = [];
        for (let y = 0; y < boardSize; y++) {
            let rowCards = [];
            for (let x = 0; x < boardSize; x++) {
                const card = boardLayout[y][x];
                const token = this.placedTokens[y][x];
                const valid = this.validPositions?.some(
                    (p) => p.x === x && p.y === y
                );
                const validityClass =
                    this.validPositions != undefined
                        ? valid
                            ? 'card-valid'
                            : 'card-invalid'
                        : '';
                rowCards.push(html`<board-card
                    @click="${(e: MouseEvent) => this.handleCardClick(e, x, y)}"
                    class="card ${validityClass}"
                    rank="${card.rank}"
                    suit="${card.suit}"
                    token="${token || nothing}"
                ></board-card>`);
            }
            cards.push(html`<div class="row">${rowCards}</div>`);
        }
        return cards;
    }

    handleCardClick(e: MouseEvent, x: number, y: number) {
        console.log('Card clicked:', x, y);
        // Dispatch an event to notify the parent component that a card was clicked.
        const eventParams: BoardClickEventParams = {
            position: { x, y },
            sourceEvent: e,
        }
        this.dispatchEvent(
            new CustomEvent('board-position-click', { detail: eventParams })
        );
    }
}

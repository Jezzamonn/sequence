import { css, html, LitElement, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import {
    boardLayout,
    boardSize,
    MoveAndColor
} from '../../../../common/ts/board';
import { isOneEyedJack } from '../../../../common/ts/cards';
import { Point } from '../../../../common/ts/point';
import { BoardClickEventParams } from '../events';

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

            /* a fun visual effect where the cards appear one by one */
            @keyframes card-animate-in {
                0% {
                    transform: scale(0);
                }
                100% {
                    transform: scale(1);
                }
            }

            .card {
                position: relative;

                margin: 0.2cqw 0.2cqh;

                width: 9.5cqw;
                height: 9.5cqh;

                transition: transform 0.2s;

                animation: card-animate-in 0.3s both;
            }

            .card-valid {
                outline: 0.3cqh solid black;
                z-index: 1;
                transform: scale(1.1);
            }

            .card-invalid {
                filter: brightness(0.9);
            }

            .card-animated {
                z-index: 1;
            }
        `,
    ];

    @property({ type: Array })
    accessor placedTokens: ((string | undefined)[][]) | undefined = undefined;

    @property({ type: Array })
    accessor validPositions: Point[] | undefined;

    @property({ type: Object})
    accessor lastMove: MoveAndColor | undefined;

    render() {
        const totalAnimationTime = 0.4;
        const animationDelayPerCard = totalAnimationTime / (boardSize + 2);
        let cards = [];
        for (let y = 0; y < boardSize; y++) {
            let rowCards = [];
            for (let x = 0; x < boardSize; x++) {
                const card = boardLayout[y][x];
                let token = this.placedTokens?.[y]?.[x];

                let animatePlacement = false;
                let animateRemoval = false;

                if (this.lastMove?.position?.x === x && this.lastMove?.position?.y === y) {
                    token = this.lastMove?.color;
                    if (isOneEyedJack(this.lastMove?.card)) {
                        animateRemoval = true;
                    } else {
                        animatePlacement = true;
                    }
                }

                const valid = this.validPositions?.some(
                    (p) => p.x === x && p.y === y
                );
                const validityClass =
                    this.validPositions != undefined
                        ? valid
                            ? 'card-valid'
                            : 'card-invalid'
                        : '';
                const animatedClass = animatePlacement || animateRemoval ? 'card-animated' : '';
                const animationDelay = (x + y) * animationDelayPerCard;
                rowCards.push(html`<board-card
                    @click="${(e: MouseEvent) => this.handleCardClick(e, x, y)}"
                    class="card ${validityClass} ${animatedClass}"
                    style="animation-delay: ${animationDelay}s"
                    rank="${card.rank}"
                    suit="${card.suit}"
                    token="${token || nothing}"
                    .animatePlacement=${animatePlacement}
                    .animateRemoval=${animateRemoval}
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

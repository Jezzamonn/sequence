import { css, html, LitElement, nothing, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import {
    boardLayout,
    boardSize,
    Color,
    getAllSequences,
    MoveAndColor,
    spiralPositionIndices,
    Token
} from '../../../../common/ts/board';
import { isOneEyedJack } from '../../../../common/ts/cards';
import { Point } from '../../../../common/ts/point';
import { BoardClickEventParams } from '../events';
import { colors } from '../token-marker';

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
                    transform: scale(2) translate(-50px, -50px);
                    opacity: 0;
                    z-index: 1;
                    pointer-events: none;
                }
                20% {
                    opacity: 1;
                    z-index: 1;
                    pointer-events: none;
                }
                100% {
                    transform: scale(1) translate(0, 0);
                    opacity: 1;
                    z-index: initial;
                    pointer-events: initial;
                }
            }

            .card {
                position: relative;

                margin: 0.2cqw 0.2cqh;

                width: 9.5cqw;
                height: 9.5cqh;

                transition: transform 0.2s;
            }

            .card-animate-in {
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

            .card-with-token-animation {
                z-index: 1;
            }

            .sequence-lines {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 2;

                pointer-events: none;
            }

            .sequence-line {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
            }
        `,
    ];

    @property({ type: Array })
    accessor placedTokens: ((string | undefined)[][]) | undefined = undefined;

    @property({ type: Array })
    accessor validPositions: Point[] | undefined;

    @property({ type: Object})
    accessor lastMove: MoveAndColor | undefined;

    @property({ type: Boolean})
    accessor doInitialAnimation: boolean = false;

    render() {
        let cards: TemplateResult[] = [];
        for (let y = 0; y < boardSize; y++) {
            let rowCards: TemplateResult[] = [];
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
                const tokenAnimatedClass = animatePlacement || animateRemoval ? 'card-with-token-animation' : '';
                const animateInClass = this.doInitialAnimation ? 'card-animate-in' : '';
                const animationDelay = this.getAnimationDelay(x, y);
                rowCards.push(html`<board-card
                    @click="${(e: MouseEvent) => this.handleCardClick(e, x, y)}"
                    class="card ${validityClass} ${tokenAnimatedClass} ${animateInClass}"
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

        const sequenceLineElems: TemplateResult[] = [];

        const placedTokens = this.placedTokens;
        if (placedTokens != undefined) {
            const sequences = getAllSequences(placedTokens as Token[][]);

            for (const line of sequences) {
                const startX = (line.start.x + 0.5) * boardSize;
                const startY = (line.start.y + 0.5) * boardSize;
                const endX = (line.end.x + 0.5) * boardSize;
                const endY = (line.end.y + 0.5) * boardSize;
                sequenceLineElems.push(html`<svg
                        class="sequence-line"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <g
                            stroke="${colors[line.color as Color]}"
                            stroke-width="3"
                            stroke-linejoin="round"
                        >
                            <path d="M ${startX} ${startY} L ${endX} ${endY} Z" />
                        </g>
                    </svg>`);
            }
        }

        return html`
            ${cards}
            <div class="sequence-lines">${sequenceLineElems}</div>
        `;
    }

    getAnimationDelay(x: number, y: number) {
        // const totalAnimationTime = 0.4;
        // const animationDelayPerCard = totalAnimationTime / (boardSize * 2);
        // return (x + y) * animationDelayPerCard;

        const totalAnimationTime = 5;
        const animationDelayPerCard = totalAnimationTime / (boardSize * boardSize);
        const spiralIndex = spiralPositionIndices[y][x];
        return spiralIndex * animationDelayPerCard;
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

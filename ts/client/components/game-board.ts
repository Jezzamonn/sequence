import { css, html, LitElement, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { allPositions, boardLayout, boardSize, makeEmptyPlacedTokens } from '../../common/board';

@customElement('game-board')
export class GameBoardElement extends LitElement {
    // Styles
    static styles = [
        // language=CSS
        css`
            :host {
                container-type: size;
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
            }
        `,
    ];

    @property({ type: Array })
    accessor placedTokens: (string | undefined)[][] = makeEmptyPlacedTokens();

    render() {
        let cards = [];
        for (let y = 0; y < boardSize; y++) {
            let rowCards = []
            for (let x = 0; x < boardSize; x++) {
                const card = boardLayout[y][x];
                const token = this.placedTokens[y][x];
                rowCards.push(html`<board-card
                    class="card"
                    rank="${card.rank}"
                    suit="${card.suit}"
                    token="${token || nothing}"></board-card>`);
            }
            cards.push(html`<div class="row">${rowCards}</div>`);
        }
        return cards;
    }
}

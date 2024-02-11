import { css, html, LitElement, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { allPositions, boardLayout, makeEmptyPlacedTokens } from '../../common/board';

@customElement('game-board')
export class GameBoardElement extends LitElement {
    // Styles
    static styles = [
        // language=CSS
        css`
            :host {
                max-width: 100%;
                max-height: 100%;

                display: grid;
                grid-template-columns: repeat(10, auto);
            }

            .card {
                position: relative;

                margin: 0.25cqw 0.25cqh;

                max-width: 9.5cqw;
                max-height: 9.5cqh;
            }
        `,
    ];

    @property({ type: Array })
    accessor placedTokens: (string | undefined)[][] = makeEmptyPlacedTokens();

    render() {
        return allPositions.map((position) => {
            const {x, y} = position;
            const card = boardLayout[y][x];
            const token = this.placedTokens[y][x];
            return html`<board-card
                class="card"
                rank="${card.rank}"
                suit="${card.suit}"
                token="${token || nothing}"></board-card>`;
        });
    }
}

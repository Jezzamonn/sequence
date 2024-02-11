import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import {
    cardAssetName,
    cardToShortString,
    Rank,
    Suit,
} from '../../common/cards';

@customElement('board-card')
export class BoardCardElement extends LitElement {
    // Styles
    static styles = [
        // language=CSS
        css`
            :host {
                overflow: hidden;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .card-image {
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
            }

            .card-Spades {
                color: black;
            }

            .card-Hearts {
                color: red;
            }

            .card-Clubs {
                color: black;
            }

            .card-Diamonds {
                color: red;
            }

            .token {
                position: absolute;
                pointer-events: none;
                text-shadow: 0 2px 4px black;
            }

            .token-blue {
                color: blue;
                font-size: 4cqw;
            }

            .token-blue:after {
                content: '⬤';
            }

            .token-green {
                color: #1a3;
                font-size: 7cqw;
            }

            .token-green:after {
                content: '✖';
            }

            .token-red {
                color: #b11;
                font-size: 7cqw;
            }

            .token-red:after {
                content: '▲';
            }

        `,
    ];

    @property({ type: String })
    accessor rank: Rank = 'A';

    @property({ type: String })
    accessor suit: Suit = 'Spades';

    @property({ type: String })
    accessor token: string | undefined;

    get shortString() {
        return cardToShortString({ rank: this.rank, suit: this.suit });
    }

    get assetName() {
        return cardAssetName({ rank: this.rank, suit: this.suit });
    }

    get ariaLabel() {
        return `${this.shortString} of ${this.suit}`;
    }

    render() {
        // language=HTML
        let tokenElem;
        if (this.token !== undefined && this.token !== '') {
            tokenElem = html`<div class="token token-${this.token.toLowerCase()}"></div>`
        }
        return html`
            <img class="card-image card-${this.suit}" src="${this.assetName}" />
            ${tokenElem}
        `;
    }
}

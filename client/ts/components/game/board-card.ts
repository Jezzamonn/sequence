import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import {
    cardAssetName,
    cardToShortString,
    Rank,
    Suit,
    suitToSymbol,
} from '../../../../common/ts/cards';

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
                aspect-ratio: 360 / 540;

                background-color: white;
                border-radius: 0.5cqw;
            }

            .card-image {
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
                opacity: 0;
            }

            .card-image.card-Joker {
                opacity: 1;
            }

            .card-label {
                position: absolute;
                background-color: white;
                top: 0;
                left: 0;
                font-size: 20px;
                text-align: center;
                line-height: 1em;
            }

            .card-label.card-Joker {
                display: none;
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
                width: 90%;
                height: 90%;
                pointer-events: none;
                filter: drop-shadow(0 2px 2px rgba(0,0,0,0.8));
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
        if (this.token != undefined && this.token !== '') {
            tokenElem = html`<token-marker class="token" color="${this.token}"></token-marker>`
        }

        // language=HTML
        return html`
            <img class="card-image card-${this.suit}" src="${this.assetName}" />
            <div class="card-label card-${this.suit}">${this.rank}<br>${suitToSymbol.get(this.suit)}</div>
            ${tokenElem}
        `;
    }
}

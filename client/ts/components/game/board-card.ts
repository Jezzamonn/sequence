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
                display: flex;
                align-items: center;
                justify-content: center;
                aspect-ratio: 360 / 540;

                background-color: white;
                border-radius: 0.5cqw;
                container-type: size;
            }

            .card-image {
                width: 100%;
                height: 100%;
                object-fit: contain;
                opacity: 0;
            }

            .card-image.card-Joker {
                opacity: 1;
                object-fit: cover;
            }

            .card-label {
                position: absolute;
                background-color: white;
                top: 0;
                left: 0;
                font-size: min(40cqh, 60cqw);
                text-align: center;
                line-height: 1em;
                user-select: none;
            }

            .card-label.card-Joker {
                display: none;
            }

            .card-Spades,
            .card-Clubs {
                color: #111;
            }

            .card-Hearts,
            .card-Diamonds {
                color: #a00;
            }

            .token {
                position: absolute;
                width: 90%;
                height: 90%;
                pointer-events: none;
                filter: drop-shadow(0 2px 2px black);
                transition: transform 0.5s;
            }

            @keyframes place-token {
                0% {
                    transform: scale(2);
                    opacity: 0;
                }
                100% {
                    transform: scale(1.3);
                    opacity: 1;
                }
            }

            @keyframes remove-token {
                0% {
                    transform: scale(1);
                    opacity: 1;
                }
                100% {
                    transform: scale(2);
                    opacity: 0.2;
                }
            }

            .token-placed {
                animation: place-token 0.5s forwards;
            }

            .token-removed {
                animation: remove-token 0.5s forwards;
            }
        `,
    ];

    @property({ type: String })
    accessor rank: Rank = 'A';

    @property({ type: String })
    accessor suit: Suit = 'Spades';

    @property({ type: String })
    accessor token: string | undefined;

    @property({ type: Boolean })
    accessor animatePlacement: boolean = false;

    @property({ type: Boolean })
    accessor animateRemoval: boolean = false;

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
            const placedClass = this.animatePlacement ? 'token-placed' : '';
            const removedClass = this.animateRemoval ? 'token-removed' : '';
            tokenElem = html`<token-marker
                class="token ${placedClass} ${removedClass}"
                color="${this.token}"
            ></token-marker>`;
        }

        // language=HTML
        return html`
            <img class="card-image card-${this.suit}" src="${this.assetName}" />
            <div class="card-label card-${this.suit}">
                ${this.rank}<br />${suitToSymbol.get(this.suit)}
            </div>
            ${tokenElem}
        `;
    }
}

import { LitElement, TemplateResult, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import {
    Rank,
    Suit,
    cardAssetName,
    cardBackAssetName
} from '../../../../common/ts/cards';
import { seededRandom } from '../../../../common/ts/util';

@customElement('deck-discard')
export class DeckAndDiscardElement extends LitElement {
    static styles = [
        // language=CSS
        css`
            :host {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                container-type: size;
            }

            .card-pile {
                width: 100%;
                height: 20cqh;
                position: relative;
            }

            .card-image {
                position: absolute;
                height: 100%;
                object-fit: contain;
                background-color: white;
                border-radius: 5cqw;
                aspect-ratio: 360 / 540;
                left: 50%;
            }

            .card-face {
                filter: brightness(0.6) contrast(1.5) brightness(2) saturate(0.5);
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

    @property({ type: String })
    accessor rank: Rank = 'Joker';

    @property({ type: String })
    accessor suit: Suit = 'Joker';

    @property({ type: Number })
    accessor deckSize: number = 0;

    @property({ type: Number })
    accessor discardSize: number = 0;

    @property({ type: Boolean })
    accessor canDiscard: boolean | undefined = undefined;

    render() {
        const discardRng = seededRandom('discard');

        // TODO: Add more cards to represent the size of the deck.
        const validityClass =
        this.canDiscard != undefined
            ? this.canDiscard
                ? 'card-valid'
                : 'card-invalid'
            : '';
        const drawPile: TemplateResult[] = [];
        for (let i = 0; i < this.deckSize; i++) {
            const offset = -i * 0.1;
            drawPile.push(html`<img
                class="card-image"
                style="transform: translate(calc(${offset}cqw - 50%), ${offset}cqw)"
                src="${cardBackAssetName}"
            />`);
        }
        // TODO: Also subtract the cards in the players' hands.
        const discardPile: TemplateResult[] = [];
        for (let i = 0; i < this.discardSize - 1; i++) {
            const offset = -i * 0.1;
            const rotation = discardRng() * 10 - 5;
            discardPile.push(html`<img
                class="card-image"
                style="transform: translate(calc(${offset}cqw - 50%), ${offset}cqw) rotate(${rotation}deg)"
            />`);
        }
        // Add the top discard card to the discard pile.
        // If there are no discarded cards, this will be a blank white card.
        {
            const offset = -(this.discardSize - 1) * 0.1;
            const cardSrc = this.discardSize > 0 ? cardAssetName({ rank: this.rank, suit: this.suit }) : nothing;
            const rotation = this.discardSize > 0 ? discardRng() * 10 - 5 : 0;
            discardPile.push(html`<img
                @click=${this.handleDiscardClick}
                class="card-image card-face ${validityClass}"
                style="transform: translate(calc(${offset}cqw - 50%), ${offset}cqw) rotate(${rotation}deg)"
                src="${cardSrc}"
            />`);
        }
        discardPile.push()


        // language=HTML
        return html`
            <div class="card-pile">
                ${drawPile}
            </div>
            <div class="card-pile">
                ${discardPile}
            </div>
        `;
    }

    handleDiscardClick(e: MouseEvent) {
        this.dispatchEvent(
            new CustomEvent('discard-click', { detail: e })
        );
    }
}

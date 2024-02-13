import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import {
    Rank,
    Suit,
    cardAssetName,
    cardBackAssetName,
} from '../../common/cards';

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
            }

            .card-image {
                max-height: 100%;
                max-width: 100%;
                object-fit: contain;
            }
        `,
    ];

    @property({ type: String })
    accessor rank: Rank = 'Joker';

    @property({ type: String })
    accessor suit: Suit = 'Joker';

    @property({ type: Number })
    accessor deckSize: number = 0;

    render() {
        // TODO: Add more cards to represent the size of the deck.
        // language=HTML
        return html`
            <img class="card-image" src="${cardBackAssetName}" />
            <img
                class="card-image"
                src="${cardAssetName({ rank: this.rank, suit: this.suit })}"
            />
        `;
    }
}

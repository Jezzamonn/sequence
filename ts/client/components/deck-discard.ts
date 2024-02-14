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

    @property({ type: Boolean })
    accessor canDiscard: boolean | undefined = undefined;

    render() {
        // TODO: Add more cards to represent the size of the deck.
        const validityClass =
        this.canDiscard != undefined
            ? this.canDiscard
                ? 'card-valid'
                : 'card-invalid'
            : '';
        // language=HTML
        return html`
            <img class="card-image" src="${cardBackAssetName}" />
            <img
                @click="${(e: MouseEvent) => this.handleDiscardClick(e)}"
                class="card-image ${validityClass}"
                src="${cardAssetName({ rank: this.rank, suit: this.suit })}"
            />
        `;
    }

    handleDiscardClick(e: MouseEvent) {
        this.dispatchEvent(
            new CustomEvent('discard-click', { detail: e })
        );
    }
}

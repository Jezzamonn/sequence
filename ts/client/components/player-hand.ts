import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import {
    Card,
    cardAssetName,
    cardToShortString,
    Rank,
    Suit,
} from '../../common/cards';
import { lerp } from '../../common/util';

@customElement('player-hand')
export class PlayerHandElement extends LitElement {
    // Styles
    static styles = [
        // language=CSS
        css`
            :host {
                container-type: size;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .card-image {
                max-height: 100%;
                object-fit: contain;
                transform-origin: 50% 50%;
                flex-shrink: 1;
            }
        `,
    ];

    @property({ type: Array })
    accessor hand: Card[] = [];

    render() {
        const maxAngle = 2;

        // language=HTML
        return this.hand.map((card, i) => {
            const amt = i / (this.hand.length - 1);
            const angleDeg = lerp(-maxAngle, maxAngle, amt);
            return html`<img
                @click="${() => this.handleCardClick(card)}"
                class="card-image card-${card.suit}"
                style="transform: rotate(${angleDeg}deg)"
                src="${cardAssetName(card)}" />`
            }
        );
    }

    handleCardClick(card: Card) {
        // Dispatch an event to notify the parent component that a card was clicked.
        this.dispatchEvent(new CustomEvent('card-click', { detail: card }));
    }
}

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
                height: 20vmin;
            }

            .card-image {
                max-height: 20vmin;
                object-fit: contain;
                position: absolute;
            }
        `,
    ];

    @property({ type: Array })
    accessor hand: Card[] = [];

    render() {

        const maxAngle = 2;
        const cardSpacing = 13;

        // language=HTML
        return this.hand.map((card, i) => {
            const amt = i / (this.hand.length - 1);
            const angleDeg = lerp(-maxAngle, maxAngle, amt);
            const x = (i - (this.hand.length - 1) / 2) * cardSpacing;
            return html`<img
                class="card-image card-${card.suit}"
                style="transform: translate(-50%, -50%) rotate(${angleDeg}deg) translate(${x}vmin, 0) "
                src="${cardAssetName(card)}" />`
            }
        );
    }
}

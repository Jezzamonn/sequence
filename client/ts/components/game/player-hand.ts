import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import {
    Card,
    cardAssetName
} from '../../../../common/ts/cards';
import { lerp } from '../../../../common/ts/util';
import { HandClickEventParams } from '../events';

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
                transition: transform 0.2s;
                margin: 0 -2cqh;
            }
        `,
    ];

    @property({ type: Array })
    accessor hand: Card[] | undefined = undefined;

    @property({ type: Number })
    accessor selectedCardIndex: number | undefined = undefined;

    render() {
        const maxAngle = 4;

        // language=HTML
        return this.hand?.map((card, i) => {
            const amt = i / (this.hand!.length - 1);
            const angleDeg = lerp(-maxAngle, maxAngle, amt);
            const isSelected = i === this.selectedCardIndex;
            const transform = `rotate(${angleDeg}deg) translateY(${isSelected ? '-10%' : '0'})`;
            const cardMaxWidth = 100 / this.hand!.length;
            return html`<img
                @click="${(e: MouseEvent) => this.handleCardClick(e, card, i)}"
                class="card-image card-${card.suit} ${isSelected
                    ? 'card-selected'
                    : ''}"
                style="transform: ${transform}; max-width: ${cardMaxWidth}%;"
                src="${cardAssetName(card)}"
            />`;
        });
    }

    handleCardClick(e: MouseEvent, card: Card, index: number) {
        // Dispatch an event to notify the parent component that a card was clicked.
        const eventParams: HandClickEventParams = {
            card,
            index,
            sourceEvent: e,
        }
        this.dispatchEvent(
            new CustomEvent('card-click', { detail: eventParams })
        );
    }
}

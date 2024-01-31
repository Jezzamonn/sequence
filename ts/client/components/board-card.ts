import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { cardAssetName, cardToShortString, Rank, Suit, suitToSymbol } from "../../common/cards";

@customElement("board-card")
export class BoardCardElement extends LitElement {
  // Styles
  static styles = [
    // language=CSS
    css`
      :host {
        overflow: hidden;
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
      `
    ];

  @property()
  accessor rank: Rank = "A";

  @property()
  accessor suit: Suit = "Spades";

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
    return html`
      <img class="card-image card-${this.suit}" src="${this.assetName}">
    `;
  }
}

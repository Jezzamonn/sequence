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
        position: relative;

        margin: 0.25cqw 0.25cqh;

        max-width: 9.5cqw;
        max-height: 9.5cqh;

        background-color: white;
        border-radius: 1cqw;

        overflow: hidden;
      }

      .card-image {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        opacity: 0.5;
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
    // return html``;
    // language=HTML
    return html`
      <img class="card-image card-${this.suit}" src="${this.assetName}">
      <div class="card-label card-${this.suit}">${this.rank}<br>${suitToSymbol.get(this.suit)}</div>
    `;
  }
}

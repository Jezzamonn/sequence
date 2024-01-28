import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { cardToShortString, Rank, Suit, suitToSymbol } from "../../common/cards";

@customElement("board-card")
export class BoardCardElement extends LitElement {
  // Styles
  static styles = [
    // language=CSS
    css`
      :host {
        display: flex;
        align-items: center;
        justify-content: center;
        background: #ffffff;
        border: 1px solid black;
        border-radius: 3px;
        margin: 2px;
      }

      .card-Spades {
        color: black;
      }

      .card-Hearts {
        color: red;
      }

      .card-Diamonds {
        color: red;
      }

      .card-Clubs {
        color: black;
      }

      .card-Joker {
        color: #9bf;
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

  render() {
    // language=HTML
    return html`<div class="card card-${this.suit}">${this.shortString}</div>`;
  }
}

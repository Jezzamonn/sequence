import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Rank, Suit, suitToSymbol } from "../../common/cards";

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
        background: #eeeeee;
        border: 1px solid black;
        border-radius: 3px;
        margin: 2px;
      }`
    ];

  @property()
  accessor rank: Rank = "A";

  @property()
  accessor suit: Suit = "Spades";

  get suitSymbol() {
    return suitToSymbol.get(this.suit) ?? "";
  }

  render() {
    return html`<div class="card">${this.rank}${this.suitSymbol}</div>`;
  }
}
